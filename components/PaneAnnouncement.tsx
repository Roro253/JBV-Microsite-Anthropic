"use client";

import { useEffect, useState } from "react";

interface PaneAnnouncementProps {
  message: string;
}

export function PaneAnnouncement({ message }: PaneAnnouncementProps) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setAnnouncement(message);
    const timer = window.setTimeout(() => setAnnouncement(""), 1600);
    return () => window.clearTimeout(timer);
  }, [message]);

  return (
    <div className="sr-only" aria-live="polite">
      {announcement}
    </div>
  );
}
