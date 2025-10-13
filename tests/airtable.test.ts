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
      "LOWER(TRIM({Email}))='investor@example.com'"
    );
  });

  it("uses a sanitized custom field name when provided", async () => {
    process.env.AIRTABLE_EMAIL_FIELD = " {Investor Email} ";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ records: [] })
    });

    vi.stubGlobal("fetch", fetchMock);

    await isAuthorizedEmail("custom@example.com");

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestUrl.searchParams.get("filterByFormula")).toBe(
      "LOWER(TRIM({Investor Email}))='custom@example.com'"
    );
  });
});
