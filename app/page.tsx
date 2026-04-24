"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/terminal/Sidebar";
import TopHeader from "@/components/terminal/TopHeader";
import RightPanel from "@/components/terminal/RightPanel";
import LiveNewsPopup from "@/components/terminal/LiveNewsPopup";
import SystemFooter from "@/components/terminal/SystemFooter";
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeTab = useTerminalStore((state) => state.activeTab);
  const selectedRegion = useTerminalStore((state) => state.selectedRegion);
  const conflictItems = useTerminalStore((state) => state.conflictItems);
  const liveNewsSources = useTerminalStore((state) => state.liveNewsSources);
  const isLivePopupOpen = useTerminalStore((state) => state.isLivePopupOpen);
  const closeLivePopup = useTerminalStore((state) => state.closeLivePopup);
  const setGlobalRiskIndex = useTerminalStore((state) => state.setGlobalRiskIndex);
  const startPolling = useTerminalStore((state) => state.startPolling);
  const stopPolling = useTerminalStore((state) => state.stopPolling);

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
    () => liveNewsSources.find((source) => activeTab === `新聞直播/${source.label}`),
    [activeTab, liveNewsSources]
  );

  useEffect(() => {
    startPolling(4000);
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  useEffect(() => {
    const scopedConflicts =
      selectedRegion === "global"
        ? conflictItems
        : conflictItems.filter((item) => item.region === selectedRegion);
    const total = scopedConflicts.reduce((sum, item) => sum + item.score, 0);
    setGlobalRiskIndex(total);
  }, [conflictItems, selectedRegion, setGlobalRiskIndex]);

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

        <SystemFooter />
      </div>
    </main>
  );
}
