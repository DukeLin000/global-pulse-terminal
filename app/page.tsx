"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/terminal/Sidebar";
import TopHeader from "@/components/terminal/TopHeader";
import RightPanel from "@/components/terminal/RightPanel";
import LiveNewsPopup from "@/components/terminal/LiveNewsPopup";
import {
  CONFLICT_ITEMS as TERMINAL_CONFLICT_ITEMS,
  LIVE_NEWS_SOURCES as TERMINAL_LIVE_NEWS_SOURCES,
  NEWS_ITEMS as TERMINAL_NEWS_ITEMS,
} from "@/components/terminal/data";
import type { LiveNewsSource } from "@/components/terminal/types";

const GlobeScene = dynamic(() => import("@/components/GlobeScene"), { ssr: false });

export default function Terminal() {
  const [activeTab, setActiveTab] = useState("地緣政治報告");
  const [expanded, setExpanded] = useState<string[]>(["即時新聞", "投資中心", "報告中心"]);
  const [timeStr, setTimeStr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLivePopupOpen, setIsLivePopupOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const toggleMenu = (menuName: string) => {
    setExpanded((prev) => (prev.includes(menuName) ? prev.filter((m) => m !== menuName) : [...prev, menuName]));
  };

  const filteredNews = useMemo(() => {
    if (!searchTerm.trim()) return TERMINAL_NEWS_ITEMS;
    const query = searchTerm.toLowerCase();
    return TERMINAL_NEWS_ITEMS.filter((item) =>
      [item.source, item.title, ...item.tags].join(" ").toLowerCase().includes(query)
    );
  }, [searchTerm]);

  const filteredConflicts = useMemo(() => {
    if (!searchTerm.trim()) return TERMINAL_CONFLICT_ITEMS;
    const query = searchTerm.toLowerCase();
    return TERMINAL_CONFLICT_ITEMS.filter((item) => item.name.toLowerCase().includes(query));
  }, [searchTerm]);

  const selectedLiveNewsSource = useMemo(
    () => TERMINAL_LIVE_NEWS_SOURCES.find((source) => activeTab === `新聞直播/${source.label}`),
    [activeTab]
  );

  const selectLiveNews = (source: LiveNewsSource) => {
    setActiveTab(`新聞直播/${source.label}`);
    setIsLivePopupOpen(true);
  };

  return (
    <main className="h-screen w-full bg-[#020408] text-[#e2e8f0] font-sans text-[11px] flex overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        expanded={expanded}
        onToggleMenu={toggleMenu}
        onSetActiveTab={setActiveTab}
        liveNewsSources={TERMINAL_LIVE_NEWS_SOURCES}
        onSelectLiveNews={selectLiveNews}
      />

      <div className="flex-1 flex flex-col relative min-w-0 bg-[#02040a]">
        <TopHeader
          activeTab={activeTab}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          searchInputRef={searchInputRef}
        />

        <div className="flex-1 relative overflow-hidden flex">
          <div className="absolute inset-0 z-0">
            <GlobeScene />
          </div>

          {selectedLiveNewsSource && isLivePopupOpen && (
            <LiveNewsPopup source={selectedLiveNewsSource} onClose={() => setIsLivePopupOpen(false)} />
          )}

          <RightPanel
            selectedLiveNewsSource={selectedLiveNewsSource}
            filteredNews={filteredNews}
            filteredConflicts={filteredConflicts}
          />
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
