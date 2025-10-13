export type IntegrationService = "airtable" | "sendgrid";

interface IntegrationErrorOptions {
  cause?: unknown;
}

export class IntegrationError extends Error {
  public readonly service: IntegrationService;

  constructor(service: IntegrationService, message: string, options: IntegrationErrorOptions = {}) {
    super(message);
    this.name = "IntegrationError";
    this.service = service;
    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
    Object.setPrototypeOf(this, IntegrationError.prototype);
  }
}

export function isIntegrationError(error: unknown): error is IntegrationError {
  return error instanceof IntegrationError;
}
