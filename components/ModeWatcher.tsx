"use client";

import { useEffect } from "react";

import { useUIStore } from "@/lib/store/ui";

export function ModeWatcher() {
  const mode = useUIStore((state) => state.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.uiMode = mode;
  }, [mode]);

  return null;
}
