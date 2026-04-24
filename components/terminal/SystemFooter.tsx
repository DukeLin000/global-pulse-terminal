"use client";

import { useEffect, useState } from "react";

export default function SystemFooter() {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleString("zh-TW", { hour12: false }) + " UTC+8");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="h-8 border-t border-white/5 px-4 flex justify-between items-center bg-[#05070a] text-[9px] text-gray-600 shrink-0">
      <div className="flex gap-4">
        <span className="text-green-500 font-black tracking-widest uppercase">● SYSTEM_STABLE</span>
        <span>STATION: TAIPEI_HUB_ALPHA</span>
      </div>
      <div className="font-mono tabular-nums">{timeStr}</div>
    </footer>
  );
}
