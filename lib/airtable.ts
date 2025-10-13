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

function resolveEmailField(): string {
  const configuredField = process.env.AIRTABLE_EMAIL_FIELD;

  if (!configuredField) {
    return DEFAULT_EMAIL_FIELD;
  }

  const sanitized = configuredField.replace(/[{}]/g, "").trim();

  return sanitized.length > 0 ? sanitized : DEFAULT_EMAIL_FIELD;
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

  const emailField = resolveEmailField();

  const normalizedEmail = normalizeEmail(email);
  const formula = `LOWER(TRIM({${emailField}}))='${escapeFormulaValue(normalizedEmail)}'`;
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
      throw new IntegrationError(
        "airtable",
        "Unable to validate email against Airtable.",
        {
          cause: new Error(`Status ${response.status}`)
        }
      );
    }

    const payload = (await response.json()) as { records?: unknown[] };
    return Array.isArray(payload.records) && payload.records.length > 0;
  } catch (error) {
    if (error instanceof IntegrationError) {
      throw error;
    }

    throw new IntegrationError("airtable", "Unable to validate email against Airtable.", {
      cause: error
    });
  }
}
