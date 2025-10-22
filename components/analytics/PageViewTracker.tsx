"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { useUIStore } from "@/lib/store/ui";

interface UserIdentity {
  userId: string;
  email?: string;
  profile?: {
    name?: string;
    organization?: string | null;
    role?: string | null;
  };
}

interface PendingView {
  viewId: string;
  startedAt: number;
  mode: string | undefined;
  url: string;
  pathname: string;
  pageSlug: string;
  pageTitle?: string;
  referrer?: string | null;
  hasStarted?: boolean;
  hasEnded?: boolean;
  completedDurationMs?: number;
  completedScrollDepth?: number;
}

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = useUIStore((state) => state.mode);

  const identityRef = useRef<UserIdentity | null>(null);
  const [isIdentityLoading, setIdentityLoading] = useState(false);
  const pendingRef = useRef<PendingView | null>(null);

  useEffect(() => {
    if (identityRef.current || isIdentityLoading) return;
    let cancelled = false;
    setIdentityLoading(true);
    void fetchIdentity().then((identity) => {
      if (cancelled) return;
      identityRef.current = identity;
      setIdentityLoading(false);
      if (identity && pendingRef.current) {
        const pending = pendingRef.current;
        if (!pending.hasStarted) {
          sendPageView("start", pending, identity);
          pending.hasStarted = true;
        }
        if (typeof pending.completedDurationMs === "number" && !pending.hasEnded) {
          sendPageView(
            "end",
            {
              ...pending,
              durationMs: pending.completedDurationMs,
              scrollDepthPct: pending.completedScrollDepth
            },
            identity
          );
          pending.hasEnded = true;
          pendingRef.current = null;
          resetScrollDepth();
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isIdentityLoading]);

  useEffect(() => {
    if (!pathname) return;

    const identity = identityRef.current;
    const pending = createPendingView({ pathname, searchParams, mode });
    pendingRef.current = pending;

    if (identity) {
      sendPageView("start", pending, identity);
      pending.hasStarted = true;
    }

    const cleanupListeners = attachLifecycleListeners(() => finalizeView("visibility-hidden"));

    return () => {
      cleanupListeners();
      finalizeView("route-change");
    };
  }, [pathname, searchParams, mode]);

  return null;

  function finalizeView(reason: "route-change" | "visibility-hidden" | "unload") {
    const pending = pendingRef.current;
    const identity = identityRef.current;
    if (!pending) return;

    const durationMs = Date.now() - pending.startedAt;
    const scrollDepthPct = getScrollDepth();

    if (!identity) {
      pendingRef.current = {
        ...pending,
        completedDurationMs: durationMs,
        completedScrollDepth: scrollDepthPct
      };
      return;
    }

    sendPageView(
      "end",
      {
        ...pending,
        durationMs,
        scrollDepthPct
      },
      identity,
      reason === "unload"
    );

    pending.hasEnded = true;
    pendingRef.current = null;
    resetScrollDepth();
  }
}

function createPendingView({
  pathname,
  searchParams,
  mode
}: {
  pathname: string;
  searchParams: URLSearchParams | null;
  mode: string;
}): PendingView {
  const viewId = generateViewId();
  const url = `${pathname}${searchParams?.size ? `?${searchParams.toString()}` : ""}`;
  const slug = pathname.replace(/^\//, "") || "home";
  const pageSlug = searchParams?.get("pane") ? `${slug}__${searchParams.get("pane")}` : slug;
  const pageTitle = document?.title;
  const startedAt = Date.now();

  return {
    viewId,
    startedAt,
    mode,
    url,
    pathname,
    pageSlug,
    pageTitle,
    referrer: document?.referrer ?? null
  };
}

async function fetchIdentity(): Promise<UserIdentity | null> {
  try {
    const response = await fetch("/api/session/identity", {
      method: "GET",
      credentials: "include",
      cache: "no-store"
    });
    if (!response.ok) {
      return null;
    }
    const identity = (await response.json()) as UserIdentity;
    if (typeof window !== "undefined") {
      (window as typeof window & { __jbvIdentityReady?: boolean }).__jbvIdentityReady = true;
    }
    return identity;
  } catch (error) {
    console.warn("[analytics] failed to fetch identity", error);
    return null;
  }
}

function sendPageView(
  phase: "start" | "end",
  view: PendingView & { durationMs?: number; scrollDepthPct?: number },
  identity: UserIdentity,
  keepAlive = false
) {
  const payload = {
    type: "page_view",
    phase,
    timestamp: new Date().toISOString(),
    userId: identity.userId,
    email: identity.email,
    viewId: view.viewId,
    url: view.url,
    pathname: view.pathname,
    pageSlug: view.pageSlug,
    pageTitle: view.pageTitle,
    mode: view.mode,
    sessionUserRole: identity.profile?.role ?? null,
    referrer: view.referrer,
    durationMs: view.durationMs,
    scrollDepthPct: view.scrollDepthPct
  };

  if (keepAlive && "sendBeacon" in navigator) {
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/events", blob);
    return;
  }

  void fetch("/api/analytics/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    keepalive: keepAlive,
    credentials: "include"
  }).catch((error) => {
    console.warn("[analytics] failed to send event", error);
  });
}

let maxScroll = 0;

function attachLifecycleListeners(onHidden: () => void) {
  const handleScroll = () => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollTop = window.scrollY;
    const scrollHeight = (doc?.scrollHeight || body?.scrollHeight || 0) - window.innerHeight;
    if (scrollHeight <= 0) {
      maxScroll = 1;
      return;
    }
    const ratio = Math.min(1, Math.max(0, scrollTop / scrollHeight));
    if (ratio > maxScroll) {
      maxScroll = ratio;
    }
  };

  const throttledScroll = throttle(handleScroll, 200);
  window.addEventListener("scroll", throttledScroll, { passive: true });

  const visibilityHandler = () => {
    if (document.visibilityState === "hidden") {
      onHidden();
    }
  };

  const beforeUnloadHandler = () => {
    onHidden();
  };

  document.addEventListener("visibilitychange", visibilityHandler);
  window.addEventListener("pagehide", beforeUnloadHandler);
  window.addEventListener("beforeunload", beforeUnloadHandler);

  return () => {
    window.removeEventListener("scroll", throttledScroll);
    document.removeEventListener("visibilitychange", visibilityHandler);
    window.removeEventListener("pagehide", beforeUnloadHandler);
    window.removeEventListener("beforeunload", beforeUnloadHandler);
  };
}

function getScrollDepth() {
  return Number((maxScroll * 100).toFixed(2));
}

function resetScrollDepth() {
  maxScroll = 0;
}

function throttle<T extends (...args: never[]) => void>(fn: T, wait: number): T {
  let last = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const throttled = ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      last = now;
      fn(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        last = Date.now();
        timeout = null;
        fn(...args);
      }, remaining);
    }
  }) as T;
  return throttled;
}

function generateViewId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `view_${Math.random().toString(36).slice(2, 12)}`;
}
