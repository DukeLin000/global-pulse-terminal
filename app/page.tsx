"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/terminal/Sidebar";
import TopHeader from "@/components/terminal/TopHeader";
import RightPanel from "@/components/terminal/RightPanel";
import LiveNewsPopup from "@/components/terminal/LiveNewsPopup";
import SystemFooter from "@/components/terminal/SystemFooter";
import AlertToasts from "@/components/terminal/AlertToasts";
import { useTerminalStore } from "@/components/terminal/store";
import { useShallow } from "zustand/react/shallow";

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

  const {
    activeTab,
    selectedRegion,
    conflictItems,
    liveNewsSources,
    isLivePopupOpen,
    closeLivePopup,
    setGlobalRiskIndex,
    startPolling,
    stopPolling,
    isLeftPanelOpen,
    toggleLeftPanel,
    closeLeftPanel,
    isRightPanelOpen,
    toggleRightPanel,
  } = useTerminalStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      selectedRegion: state.selectedRegion,
      conflictItems: state.conflictItems,
      liveNewsSources: state.liveNewsSources,
      isLivePopupOpen: state.isLivePopupOpen,
      closeLivePopup: state.closeLivePopup,
      setGlobalRiskIndex: state.setGlobalRiskIndex,
      startPolling: state.startPolling,
      stopPolling: state.stopPolling,
      isLeftPanelOpen: state.isLeftPanelOpen,
      toggleLeftPanel: state.toggleLeftPanel,
      closeLeftPanel: state.closeLeftPanel,
      isRightPanelOpen: state.isRightPanelOpen,
      toggleRightPanel: state.toggleRightPanel,
    }))
  );

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
      {isLeftPanelOpen && (
        <button
          type="button"
          aria-label="關閉左側面板遮罩"
          className="xl:hidden fixed inset-0 bg-black/45 z-30"
          onClick={closeLeftPanel}
        />
      )}

      <div className="flex-1 flex flex-col relative min-w-0 bg-[#02040a]">
        <div className="absolute left-3 top-3 z-40 flex gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={toggleLeftPanel}
            className="px-2.5 py-1.5 rounded-md bg-[#0a0e14]/85 border border-white/10 text-[10px] text-white hover:bg-white/10"
          >
            {isLeftPanelOpen ? "隱藏左欄" : "顯示左欄"}
          </button>
          <button
            type="button"
            onClick={toggleRightPanel}
            className="lg:hidden px-2.5 py-1.5 rounded-md bg-[#0a0e14]/85 border border-white/10 text-[10px] text-white hover:bg-white/10"
          >
            {isRightPanelOpen ? "隱藏右欄" : "顯示右欄"}
          </button>
        </div>
        <TopHeader searchInputRef={searchInputRef} />

        <div className="flex-1 relative overflow-hidden flex">
          <div className="absolute inset-0 z-0">
            <GlobeScene />
          </div>
          <AlertToasts />

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
