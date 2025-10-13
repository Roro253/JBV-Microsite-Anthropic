import { ConfigurationError } from "./errors";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new ConfigurationError(`${name} is not configured.`);
  }

  return value;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function escapeFormulaValue(value: string): string {
  return value.replace(/'/g, "\\'");
}

function resolveConfig() {
  const apiKey = assertEnv(process.env.AIRTABLE_API_KEY, "AIRTABLE_API_KEY");
  const baseId = assertEnv(
    process.env.AIRTABLE_BASE_ID ?? "appAswQzYFHzmwqGH",
    "AIRTABLE_BASE_ID"
  );
  const tableId = assertEnv(
    process.env.AIRTABLE_TABLE_ID ?? "tblxmUCsZcHOZiL1K",
    "AIRTABLE_TABLE_ID"
  );

  return { apiKey, baseId, tableId };
}

export function ensureAirtableConfigured() {
  resolveConfig();
}

export async function isAuthorizedEmail(email: string): Promise<boolean> {
  const { apiKey, baseId, tableId } = resolveConfig();

  const normalizedEmail = normalizeEmail(email);
  const formula = `LOWER(TRIM({Email}))='${escapeFormulaValue(normalizedEmail)}'`;
  const url = `${AIRTABLE_API_URL}/${baseId}/${tableId}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    // Airtable responses are cacheable; disable caching for auth checks
    cache: "no-store"
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Airtable lookup failed", response.status, errorText);
    throw new Error("Unable to validate email against Airtable.");
  }

  const payload = (await response.json()) as { records?: unknown[] };
  return Array.isArray(payload.records) && payload.records.length > 0;
}
