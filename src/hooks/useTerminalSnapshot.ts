"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTerminalSnapshot } from "@/src/lib/api/terminalApi";
import type { TerminalSnapshot } from "@/src/types/terminal";

type UseTerminalSnapshotOptions = {
  region?: string;
  intervalMs?: number;
  enabled?: boolean;
};

export function useTerminalSnapshot(options?: UseTerminalSnapshotOptions) {
  const { region, intervalMs = 4000, enabled = true } = options ?? {};
  const [data, setData] = useState<TerminalSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!enabled || inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading((prev) => prev || !data);
    setError(null);

    try {
      const snapshot = await getTerminalSnapshot(region);
      setData(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Snapshot fetch failed");
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }, [data, enabled, region]);

  useEffect(() => {
    if (!enabled) return;
    const initialTimer = window.setTimeout(() => {
      void refresh();
    }, 0);
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      void refresh();
    }, Math.max(intervalMs, 2500));

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [enabled, intervalMs, refresh]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}
