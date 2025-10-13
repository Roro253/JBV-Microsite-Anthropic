import { randomBytes } from "crypto";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes

type MagicLinkRecord = {
  email: string;
  expiresAt: number;
};

type MagicLinkStore = Map<string, MagicLinkRecord>;

declare global {
  var __jbvMagicLinkStore: MagicLinkStore | undefined;
}

function getStore(): MagicLinkStore {
  if (!globalThis.__jbvMagicLinkStore) {
    globalThis.__jbvMagicLinkStore = new Map();
  }

  return globalThis.__jbvMagicLinkStore;
}

function cleanupExpired(store: MagicLinkStore) {
  const now = Date.now();
  for (const [token, record] of store) {
    if (record.expiresAt <= now) {
      store.delete(token);
    }
  }
}

export function createMagicLinkToken(email: string): string {
  const store = getStore();
  cleanupExpired(store);

  const token = randomBytes(32).toString("hex");
  store.set(token, {
    email,
    expiresAt: Date.now() + MAGIC_LINK_TTL_MS
  });

  return token;
}

export function consumeMagicLinkToken(token: string): string | null {
  const store = getStore();
  cleanupExpired(store);

  const record = store.get(token);
  if (!record) {
    return null;
  }

  store.delete(token);

  if (record.expiresAt <= Date.now()) {
    return null;
  }

  return record.email;
}
