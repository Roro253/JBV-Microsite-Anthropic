"use client";

import { useEffect, useState } from "react";

interface PaneAnnouncementProps {
  companyName?: string;
  open: boolean;
}

export function PaneAnnouncement({ companyName, open }: PaneAnnouncementProps) {
  const [message, setMessage] = useState("Gateway ready");

  useEffect(() => {
    if (open && companyName) {
      setMessage(`${companyName} details opened`);
      return;
    }
    if (!open) {
      setMessage("Company details closed");
    }
  }, [companyName, open]);

  return (
    <div role="status" aria-live="polite" className="sr-only">
      {message}
    </div>
  );
}
