import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ensureAirtableConfigured } from "@/lib/airtable";
import { ensureSendGridConfigured } from "@/lib/email/sendgrid";
import { ConfigurationError } from "@/lib/errors";

const CONFIG_KEYS = [
  "AIRTABLE_API_KEY",
  "AIRTABLE_BASE_ID",
  "AIRTABLE_TABLE_ID",
  "SENDGRID_API_KEY",
  "SENDGRID_FROM_EMAIL"
] as const;

const ORIGINAL_VALUES: Partial<Record<(typeof CONFIG_KEYS)[number], string>> = {};

beforeEach(() => {
  for (const key of CONFIG_KEYS) {
    ORIGINAL_VALUES[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of CONFIG_KEYS) {
    const originalValue = ORIGINAL_VALUES[key];
    if (typeof originalValue === "string") {
      process.env[key] = originalValue;
    } else {
      delete process.env[key];
    }
  }
});

describe("configuration guards", () => {
  it("throws a configuration error when Airtable credentials are missing", () => {
    delete process.env.AIRTABLE_API_KEY;
    process.env.AIRTABLE_BASE_ID = "base";
    process.env.AIRTABLE_TABLE_ID = "table";

    expect(() => ensureAirtableConfigured()).toThrow(ConfigurationError);
  });

  it("does not throw when Airtable credentials are present", () => {
    process.env.AIRTABLE_API_KEY = "key";
    process.env.AIRTABLE_BASE_ID = "base";
    process.env.AIRTABLE_TABLE_ID = "table";

    expect(() => ensureAirtableConfigured()).not.toThrow();
  });

  it("throws a configuration error when SendGrid credentials are missing", () => {
    delete process.env.SENDGRID_API_KEY;

    expect(() => ensureSendGridConfigured()).toThrow(ConfigurationError);
  });

  it("does not throw when SendGrid credentials are present", () => {
    process.env.SENDGRID_API_KEY = "key";
    process.env.SENDGRID_FROM_EMAIL = "from@example.com";

    expect(() => ensureSendGridConfigured()).not.toThrow();
  });
});
