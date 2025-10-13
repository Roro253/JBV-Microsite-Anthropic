export interface RetryOptions {
  retries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
}

export async function retry<T>(
  operation: (attempt: number) => Promise<T>,
  { retries = 2, initialDelayMs = 200, backoffFactor = 2 }: RetryOptions = {}
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await operation(attempt + 1);
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        break;
      }

      const delay = initialDelayMs * Math.pow(backoffFactor, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    attempt += 1;
  }

  throw lastError;
}
