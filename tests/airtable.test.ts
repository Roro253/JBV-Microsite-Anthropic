import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isAuthorizedEmail } from "@/lib/airtable";

describe("isAuthorizedEmail", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };

    process.env.AIRTABLE_API_KEY = "test_key";
    process.env.AIRTABLE_BASE_ID = "appBase";
    process.env.AIRTABLE_TABLE_ID = "tblTable";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it("uses the default Email field when no override is provided", async () => {
    delete process.env.AIRTABLE_EMAIL_FIELD_2;
    delete process.env.AIRTABLE_EMAIL_FIELD;
    delete process.env.AIRTABLE_EMAIL_FIELDS;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ records: [] })
    });

    vi.stubGlobal("fetch", fetchMock);

    await isAuthorizedEmail("Investor@example.com");

    expect(fetchMock).toHaveBeenCalledOnce();
    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestUrl.searchParams.get("filterByFormula")).toBe(
      "OR(LOWER(TRIM({Email}))='investor@example.com',SEARCH('investor@example.com',LOWER(ARRAYJOIN({Email},',')))>0)"
    );
  });

  // Deprecated multi-field and custom field tests removed to enforce single {Email} usage.
});
