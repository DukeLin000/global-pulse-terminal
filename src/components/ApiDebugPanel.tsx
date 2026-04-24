"use client";

import { useEffect } from "react";
import { useTerminalSnapshot } from "@/src/hooks/useTerminalSnapshot";

export default function ApiDebugPanel() {
  const { data, isLoading, error, refetch } = useTerminalSnapshot({ region: "global" });

  useEffect(() => {
    if (data) {
      console.log("[ApiDebugPanel] snapshot:", data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.error("[ApiDebugPanel] error:", error);
    }
  }, [error]);

  return (
    <aside className="fixed right-4 bottom-4 z-[100] w-[280px] rounded-lg border border-cyan-400/30 bg-[#050816]/90 text-cyan-100 text-[11px] p-3 shadow-[0_0_20px_rgba(0,229,255,0.2)] backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold tracking-wide">API Debug Panel</span>
        <button
          type="button"
          onClick={() => void refetch()}
          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px]"
        >
          refetch
        </button>
      </div>

      {isLoading && <div className="text-amber-300">loading...</div>}

      {error && <div className="text-red-300 break-words">error: {error}</div>}

      {data && (
        <div className="space-y-1">
          <div>newsItems: {data.newsItems.length}</div>
          <div>conflictItems: {data.conflictItems.length}</div>
          <div>liveNewsSources: {data.liveNewsSources.length}</div>
          <div>alerts: {data.alerts.length}</div>
          <div>routeLayers.flight: {data.routeLayers.flight.length}</div>
          <div>routeLayers.shipping: {data.routeLayers.shipping.length}</div>
          <div>serverTime: {data.serverTime}</div>
          <div>fetchedAt: {data.fetchedAt}</div>
        </div>
      )}
    </aside>
  );
}
