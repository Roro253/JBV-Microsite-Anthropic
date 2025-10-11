"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "jbv-cookie-consent";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = window.localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        setVisible(true);
      }
    } catch (error) {
      console.warn("[CookieNotice] unable to read localStorage", error);
    }
  }, []);

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "acknowledged");
    } catch (error) {
      console.warn("[CookieNotice] unable to write localStorage", error);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[min(90%,400px)] -translate-x-1/2 rounded-2xl border border-sky-200 bg-white/90 p-4 text-sm text-slate-600 shadow-[0_24px_60px_-40px_rgba(32,118,199,0.45)] backdrop-blur">
      <p>
        JBV Capital uses lightweight analytics to improve this microsite. By continuing, you acknowledge non-identifiable usage tracking.
      </p>
      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="subtle" onClick={handleDismiss}>
          Got it
        </Button>
      </div>
    </div>
  );
}
