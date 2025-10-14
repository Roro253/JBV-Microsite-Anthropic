import { IntegrationError } from "./errors";
import { retry } from "./utils/retry";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";
const DEFAULT_EMAIL_FIELD = "Email";

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new IntegrationError("airtable", `${name} is not configured.`);
  }

  return value;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function escapeFormulaValue(value: string): string {
  return value.replace(/'/g, "\\'");
}

export function sanitizeFieldName(name: string): string {
  return name.replace(/[{}]/g, "").trim();
}

export function resolveEmailFields(): string[] {
  // Priority: explicit list variable, else individual vars, else default.
  const listRaw = process.env.AIRTABLE_EMAIL_FIELDS;
  if (listRaw) {
    const parts = listRaw.split(/[,;]/).map((p) => sanitizeFieldName(p)).filter(Boolean);
    if (parts.length > 0) return parts;
  }
  const primaryRaw = process.env.AIRTABLE_EMAIL_FIELD;
  const secondaryRaw = process.env.AIRTABLE_EMAIL_FIELD_2;
  const primary = primaryRaw ? sanitizeFieldName(primaryRaw) : DEFAULT_EMAIL_FIELD;
  const fields = [primary];
  if (secondaryRaw) {
    const secondary = sanitizeFieldName(secondaryRaw);
    if (secondary && !fields.includes(secondary)) fields.push(secondary);
  }
  return fields;
}

export function buildEmailFormula(emailFields: string[], normalizedEmail: string): string {
  const target = escapeFormulaValue(normalizedEmail);
  const perFieldClauses = emailFields.map(f => `OR(LOWER(TRIM({${f}}))='${target}',SEARCH('${target}',LOWER(ARRAYJOIN({${f}},',')))>0)`);
  const formula = perFieldClauses.length > 1 ? `OR(${perFieldClauses.join(',')})` : perFieldClauses[0];
  if (process.env.AIRTABLE_DEBUG === '1') {
    console.log('[airtable] email formula:', formula);
  }
  return formula;
}

export async function isAuthorizedEmail(email: string): Promise<boolean> {
  const apiKey = assertEnv(process.env.AIRTABLE_API_KEY, "AIRTABLE_API_KEY");
  const baseId = assertEnv(
    process.env.AIRTABLE_BASE_ID ?? "appAswQzYFHzmwqGH",
    "AIRTABLE_BASE_ID"
  );
  const tableId = assertEnv(
    process.env.AIRTABLE_TABLE_ID ?? "tblxmUCsZcHOZiL1K",
    "AIRTABLE_TABLE_ID"
  );

  const emailFields = resolveEmailFields();

  const normalizedEmail = normalizeEmail(email);
  // Array-safe matching: for each field attempt direct equality OR a SEARCH on ARRAYJOIN (covers lookup/rollup arrays)
  const formula = buildEmailFormula(emailFields, normalizedEmail);
  const url = `${AIRTABLE_API_URL}/${baseId}/${tableId}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;

  try {
    const response = await retry(async () => {
      try {
  const result = await fetch(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          // Airtable responses are cacheable; disable caching for auth checks
          cache: "no-store"
        });

        if (result.status >= 500 || result.status === 429) {
          const errorText = await result.text().catch(() => "");
          console.error("Airtable transient error", result.status, errorText);
          throw new IntegrationError(
            "airtable",
            "Airtable temporarily unavailable.",
            {
              cause: new Error(`Status ${result.status}`)
            }
          );
        }

        return result;
      } catch (error) {
        throw new IntegrationError("airtable", "Unable to reach Airtable.", {
          cause: error
        });
      }
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Airtable lookup failed", response.status, errorText);
      // Fallback: debug full scan when AIRTABLE_DEBUG=1
      if (process.env.AIRTABLE_DEBUG === '1') {
        try {
          const scanUrl = `${AIRTABLE_API_URL}/${baseId}/${tableId}?maxRecords=100`;
          const scanRes = await fetch(scanUrl, { headers: { Authorization: `Bearer ${apiKey}` }, cache: 'no-store' });
          if (scanRes.ok) {
            const scanJson = await scanRes.json();
            const normalized = normalizedEmail;
            interface ScanRecord { id: string; fields?: Record<string, unknown>; }
            const records: ScanRecord[] = Array.isArray(scanJson.records) ? scanJson.records as ScanRecord[] : [];
            for (const r of records) {
              const fields = r.fields || {};
              for (const [k, v] of Object.entries(fields)) {
                const flat = Array.isArray(v) ? v.join(', ') : String(v);
                if (flat.toLowerCase().includes(normalized)) {
                  console.warn('[airtable] Fallback full scan authorized via field', k, 'record', r.id);
                  return true;
                }
              }
            }
            console.warn('[airtable] Fallback full scan found no match for', normalized);
          } else {
            console.warn('[airtable] Fallback full scan request failed', scanRes.status);
          }
        } catch (scanErr) {
          console.warn('[airtable] Fallback full scan error', scanErr);
        }
      }
      throw new IntegrationError(
        "airtable",
        "Unable to validate email against Airtable.",
        {
          cause: new Error(`Status ${response.status}`)
        }
      );
    }

    interface AirtableRecord<TFields = Record<string, unknown>> {
      id: string;
      createdTime?: string;
      fields: TFields;
    }
    interface AirtableResponse<TFields = Record<string, unknown>> {
      records?: AirtableRecord<TFields>[];
    }
    const payload = (await response.json()) as AirtableResponse;
    const hasRecord = Array.isArray(payload.records) && payload.records.length > 0;
    if (!hasRecord) return false;
    try {
  const recordFields = payload.records?.[0]?.fields || {};
  const toLower = (v: unknown) => typeof v === 'string' ? v.trim().toLowerCase() : null;
  const matchedField = emailFields.find(f => toLower(recordFields[f]) === normalizedEmail) || 'unknown';
      console.log('[auth] matched email field:', matchedField);
    } catch (logErr) {
      console.warn('[auth] unable to determine matched field', logErr);
    }
    return true;
  } catch (error) {
    if (error instanceof IntegrationError) {
      throw error;
    }

    throw new IntegrationError("airtable", "Unable to validate email against Airtable.", {
      cause: error
    });
  }
}

export interface UserFeesResult {
  managementFeePct?: number | null; // expressed as percent (e.g. 2 for 2%)
  carryPct?: number | null; // expressed as percent (e.g. 20 for 20%)
}

export interface UserFeesExtended extends UserFeesResult {
  recordFound: boolean;
  sourceField?: string; // which email field matched
}

export async function getUserFees(email: string): Promise<UserFeesExtended | null> {
  const apiKey = assertEnv(process.env.AIRTABLE_API_KEY, "AIRTABLE_API_KEY");
  const baseId = assertEnv(process.env.AIRTABLE_BASE_ID, "AIRTABLE_BASE_ID");
  const tableId = assertEnv(process.env.AIRTABLE_TABLE_ID, "AIRTABLE_TABLE_ID");
  const emailFields = resolveEmailFields();
  const mgmtField = process.env.AIRTABLE_MGMT_FEE_FIELD || "Mgmt Fee";
  const carryField = process.env.AIRTABLE_CARRY_FIELD || "Carry 1";

  const normalizedEmail = normalizeEmail(email);
  const formula = buildEmailFormula(emailFields, normalizedEmail);
  const url = `${AIRTABLE_API_URL}/${baseId}/${tableId}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });
    if (!response.ok) {
      return { managementFeePct: null, carryPct: null, recordFound: false };
    }
    const json = await response.json();
    const record = Array.isArray(json.records) && json.records.length > 0 ? json.records[0] : null;
    if (!record) {
      return { managementFeePct: null, carryPct: null, recordFound: false };
    }
    const fields = (record as { fields?: Record<string, unknown> }).fields || {};
    const rawMgmt = fields[mgmtField];
    const rawCarry = fields[carryField];
    const parsePct = (val: unknown): number | null => {
      if (val === null || val === undefined) return null;
      const num = typeof val === "number" ? val : Number(String(val).replace(/[^0-9.\-]/g, ""));
      return Number.isFinite(num) ? num : null;
    };
    const toLower = (v: unknown) => typeof v === "string" ? v.trim().toLowerCase() : null;
    const matchedField = emailFields.find(f => toLower(fields[f]) === normalizedEmail);
    return {
      managementFeePct: parsePct(rawMgmt),
      carryPct: parsePct(rawCarry),
      recordFound: true,
      sourceField: matchedField
    };
  } catch {
    return { managementFeePct: null, carryPct: null, recordFound: false };
  }
}
