"use client";

import { useEffect } from "react";
import { useTerminalStore } from "./store";

function playSoftAlarm(level: "warning" | "critical") {
  try {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = level === "critical" ? "square" : "sawtooth";
    oscillator.frequency.value = level === "critical" ? 540 : 440;
    gainNode.gain.value = 0.0001;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const now = audioContext.currentTime;
    gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    oscillator.start(now);
    oscillator.stop(now + 0.72);

    oscillator.onended = () => {
      void audioContext.close();
    };
  } catch {
    // ignore browser autoplay/audio capability failures
  }
}

export default function AlertToasts() {
  const alerts = useTerminalStore((state) => state.alerts);
  const dismissAlert = useTerminalStore((state) => state.dismissAlert);

  useEffect(() => {
    if (alerts.length === 0) return;
    const latest = alerts[alerts.length - 1];
    playSoftAlarm(latest.level);
  }, [alerts]);

  useEffect(() => {
    if (alerts.length === 0) return;
    const timers = alerts.map((alert) =>
      window.setTimeout(() => {
        dismissAlert(alert.id);
      }, alert.level === "critical" ? 7000 : 5000)
    );
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [alerts, dismissAlert]);

  if (alerts.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 w-[280px] pointer-events-none">
      {alerts.map((alert) => {
        const isCritical = alert.level === "critical";
        return (
          <div
            key={alert.id}
            className={`pointer-events-auto rounded-lg border px-3 py-2 shadow-[0_0_28px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all ${
              isCritical
                ? "bg-red-950/85 border-red-400/70 text-red-100"
                : "bg-amber-950/80 border-amber-400/60 text-amber-100"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold tracking-wide">{alert.title}</span>
              <button
                type="button"
                onClick={() => dismissAlert(alert.id)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20"
              >
                關閉
              </button>
            </div>
            <p className="text-[10px] mt-1 leading-relaxed">{alert.message}</p>
          </div>
        );
      })}
    </div>
  );
}
