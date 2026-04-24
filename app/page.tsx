"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/terminal/Sidebar";
import TopHeader from "@/components/terminal/TopHeader";
import RightPanel from "@/components/terminal/RightPanel";
import LiveNewsPopup from "@/components/terminal/LiveNewsPopup";
import { CONFLICT_ITEMS, LIVE_NEWS_SOURCES as TERMINAL_LIVE_NEWS_SOURCES } from "@/components/terminal/data";
import { useTerminalStore } from "@/components/terminal/store";

const GlobeScene = dynamic(() => import("@/components/GlobeScene"), { ssr: false });

type NewsItem = {
  source: string;
  title: string;
  time: string;
  tags: string[];
};

type ConflictItem = {
  name: string;
  score: number;
};

const NEWS_ITEMS: NewsItem[] = [
  {
    source: "ARJ News",
    title: "【地緣觀察】台海區域電子作戰干擾強度增加，導航系統穩定性受阻。",
    time: "1h",
    tags: ["地緣政治", "台海", "軍事"],
  },
  {
    source: "WHSR News",
    title: "【能源預報】中東原油產量調整協議達成，預期市場波動率將降至新低。",
    time: "3h",
    tags: ["能源", "中東", "金融市場"],
  },
  {
    source: "Market Pulse",
    title: "【市場監控】美元指數短線走弱，亞太風險資產同步反彈。",
    time: "5h",
    tags: ["金融市場", "美元", "亞太"],
  },
];

const CONFLICT_ITEMS: ConflictItem[] = [
  { name: "Ukraine", score: 23 },
  { name: "Gaza", score: 239 },
  { name: "Red Sea", score: 88 },
  { name: "Taiwan Strait", score: 64 },
];

export default function Terminal() {
  const [timeStr, setTimeStr] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeTab = useTerminalStore((state) => state.activeTab);
  const selectedRegion = useTerminalStore((state) => state.selectedRegion);
  const isLivePopupOpen = useTerminalStore((state) => state.isLivePopupOpen);
  const closeLivePopup = useTerminalStore((state) => state.closeLivePopup);
  const setGlobalRiskIndex = useTerminalStore((state) => state.setGlobalRiskIndex);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleString("zh-TW", { hour12: false }) + " UTC+8");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== searchInputRef.current) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  const selectedLiveNewsSource = useMemo(
    () => TERMINAL_LIVE_NEWS_SOURCES.find((source) => activeTab === `新聞直播/${source.label}`),
    [activeTab]
  );

  useEffect(() => {
    const scopedConflicts =
      selectedRegion === "global"
        ? CONFLICT_ITEMS
        : CONFLICT_ITEMS.filter((item) => item.region === selectedRegion);
    const total = scopedConflicts.reduce((sum, item) => sum + item.score, 0);
    setGlobalRiskIndex(total);
  }, [selectedRegion, setGlobalRiskIndex]);

  return (
    <main className="h-screen w-full bg-[#020408] text-[#e2e8f0] font-sans text-[11px] flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col relative min-w-0 bg-[#02040a]">
        <TopHeader searchInputRef={searchInputRef} />

        <div className="flex-1 relative overflow-hidden flex">
          <div className="absolute inset-0 z-0">
            <GlobeScene />
          </div>

          {selectedLiveNewsSource && isLivePopupOpen && (
            <LiveNewsPopup source={selectedLiveNewsSource} onClose={closeLivePopup} />
          )}

          <RightPanel />
        </div>

        <footer className="h-8 border-t border-white/5 px-4 flex justify-between items-center bg-[#05070a] text-[9px] text-gray-600 shrink-0">
          <div className="flex gap-4">
            <span className="text-green-500 font-black tracking-widest uppercase">● SYSTEM_STABLE</span>
            <span>STATION: TAIPEI_HUB_ALPHA</span>
          </div>
          <div className="font-mono tabular-nums">{timeStr}</div>
        </footer>
      </div>
    </main>
  );
}
