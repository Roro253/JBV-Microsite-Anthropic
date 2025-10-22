import { IntegrationError } from "@/lib/errors";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new IntegrationError("airtable", `${name} is not configured.`);
  }
  return value;
}

async function postRecord({
  table,
  fields
}: {
  table: string;
  fields: Record<string, unknown>;
}) {
  const apiKey = getEnv("AIRTABLE_API_KEY");
  const baseId = getEnv("AIRTABLE_ANALYTICS_BASE_ID");

  const response = await fetch(`${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.warn("[analytics-airtable] failed to post record", response.status, text.slice(0, 240));
    throw new IntegrationError("airtable", `Failed to post record (status ${response.status})`);
  }
}

export async function logAnalyticsEvent(fields: Record<string, unknown>) {
  const table = process.env.AIRTABLE_ANALYTICS_EVENTS_TABLE;
  if (!table) return;

  try {
    await postRecord({ table, fields });
  } catch (error) {
    console.warn("[analytics-airtable] unable to log event", error);
  }
}

export async function logAnalyticsSignal(fields: Record<string, unknown>) {
  const table = process.env.AIRTABLE_ANALYTICS_SIGNALS_TABLE;
  if (!table) return;

  try {
    await postRecord({ table, fields });
  } catch (error) {
    console.warn("[analytics-airtable] unable to log signal", error);
  }
}
