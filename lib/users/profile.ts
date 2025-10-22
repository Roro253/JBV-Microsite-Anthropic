import { cache } from "react";

import { normalizeEmail } from "@/lib/airtable";

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  organization?: string | null;
  role?: string | null;
}

type DirectoryEntry = {
  email: string;
  name?: string;
  organization?: string | null;
  role?: string | null;
};

const directory: DirectoryEntry[] = (() => {
  try {
    const raw = process.env.USER_DIRECTORY_JSON;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is DirectoryEntry => typeof item?.email === "string");
    }
    return [];
  } catch (error) {
    console.warn("[users] Failed to parse USER_DIRECTORY_JSON", error);
    return [];
  }
})();

const directoryLookup = cache(() => {
  const map = new Map<string, DirectoryEntry>();
  for (const entry of directory) {
    const email = normalizeEmail(entry.email);
    if (email) {
      map.set(email, entry);
    }
  }
  return map;
});

export function resolveUserProfile({
  email,
  userId
}: {
  email: string;
  userId: string;
}): UserProfile {
  const normalized = normalizeEmail(email);
  const entry = directoryLookup().get(normalized);
  if (entry) {
    return {
      userId,
      email: normalized,
      name: entry.name ?? defaultNameFromEmail(normalized),
      organization: entry.organization ?? null,
      role: entry.role ?? null
    };
  }

  return {
    userId,
    email: normalized,
    name: defaultNameFromEmail(normalized),
    organization: null,
    role: "Guest"
  };
}

function defaultNameFromEmail(email: string): string {
  const handle = email.split("@")[0] ?? "";
  if (!handle) return "Guest";
  const parts = handle
    .replace(/[\._-]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1));
  if (parts.length === 0) return "Guest";
  return parts.join(" ");
}
