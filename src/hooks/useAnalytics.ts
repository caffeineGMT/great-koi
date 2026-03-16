"use client";

import { useCallback } from "react";

export function useAnalytics() {
  const track = useCallback((event: string, data?: Record<string, string | number>) => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
    }).catch(() => {});
  }, []);

  return { track };
}
