"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getStreamUrl } from "@/src/lib/api/terminalApi";
import type { StreamEvent } from "@/src/types/terminal";

type StreamStatus = "idle" | "connecting" | "open" | "error";

type UseTerminalStreamOptions = {
  enabled?: boolean;
  withCredentials?: boolean;
};

export function useTerminalStream(options?: UseTerminalStreamOptions) {
  const { enabled = true, withCredentials = false } = options ?? {};
  const [status, setStatus] = useState<StreamStatus>(enabled ? "connecting" : "idle");
  const [lastEvent, setLastEvent] = useState<StreamEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const streamUrl = getStreamUrl();
    const source = new EventSource(streamUrl, { withCredentials });
    sourceRef.current = source;

    source.onopen = () => {
      setStatus("open");
    };

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as StreamEvent;
        setLastEvent(parsed);
      } catch {
        setLastEvent({ type: "heartbeat", data: event.data });
      }
    };

    source.onerror = () => {
      setStatus("error");
      setError("Terminal stream disconnected");
    };

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [enabled, withCredentials]);

  const close = useMemo(
    () => () => {
      sourceRef.current?.close();
      sourceRef.current = null;
      setStatus("idle");
    },
    []
  );

  return {
    status,
    lastEvent,
    error,
    close,
  };
}
