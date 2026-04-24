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
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const unmountedRef = useRef(false);

  const refetch = useCallback(async () => {
    if (!enabled || inFlightRef.current) return;
    inFlightRef.current = true;
    if (!unmountedRef.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const snapshot = await getTerminalSnapshot(region);
      if (!unmountedRef.current) {
        setData(snapshot);
      }
    } catch (err) {
      if (!unmountedRef.current) {
        setError(err instanceof Error ? err.message : "Snapshot fetch failed");
      }
    } finally {
      inFlightRef.current = false;
      if (!unmountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled, region]);

  useEffect(() => {
    unmountedRef.current = false;
    if (!enabled) return;
    const initialTimer = window.setTimeout(() => {
      void refetch();
    }, 0);
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      void refetch();
    }, Math.max(intervalMs, 2500));

    return () => {
      unmountedRef.current = true;
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [enabled, intervalMs, refetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
