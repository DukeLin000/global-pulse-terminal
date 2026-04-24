"use client";

import { useMemo, type ReactNode } from "react";
import { REGION_OPTIONS } from "./data";
import type { NewsItem, RegionKey } from "./types";
import { useTerminalStore } from "./store";
import { EconomicAdvancedChart, RiskTrendAdvancedChart } from "./AdvancedCharts";
import { useShallow } from "zustand/react/shallow";

const FLIGHT_INFO = [
  "Taipei → New York（長程國際線）",
  "London → Dubai（中東轉運樞紐）",
  "Tokyo → Paris（歐亞高頻商務航線）",
];

const SHIPPING_INFO = [
  "Shanghai → Singapore（亞洲主幹海運）",
  "Rotterdam → New York（歐美航運主線）",
  "Hong Kong → Miami（跨洋高價值貨運）",
];

function isInSelectedRegion(region: RegionKey, targetRegions: RegionKey[]) {
  return region === "global" || targetRegions.includes(region);
}

export default function RightPanel() {
  const {
    activeTab,
    searchTerm,
    selectedRegion,
    globalRiskIndex,
    newsItems,
    conflictItems,
    liveNewsSources,
    isDataLoading,
    dataError,
    isRightPanelOpen,
    toggleRightPanel,
    setFocusCoordinates,
  } = useTerminalStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      searchTerm: state.searchTerm,
      selectedRegion: state.selectedRegion,
      globalRiskIndex: state.globalRiskIndex,
      newsItems: state.newsItems,
      conflictItems: state.conflictItems,
      liveNewsSources: state.liveNewsSources,
      isDataLoading: state.isDataLoading,
      dataError: state.dataError,
      isRightPanelOpen: state.isRightPanelOpen,
      toggleRightPanel: state.toggleRightPanel,
      setFocusCoordinates: state.setFocusCoordinates,
    }))
  );

  const selectedLiveNewsSource = useMemo(
    () => liveNewsSources.find((source) => activeTab === `新聞直播/${source.label}`),
    [activeTab, liveNewsSources]
  );

  const filteredNews = useMemo(() => {
    const withRegion = newsItems.filter((item) => isInSelectedRegion(selectedRegion, item.regions));
    if (!searchTerm.trim()) return withRegion;
    const query = searchTerm.toLowerCase();
    return withRegion.filter((item) => [item.source, item.title, ...item.tags].join(" ").toLowerCase().includes(query));
  }, [newsItems, searchTerm, selectedRegion]);

  const filteredConflicts = useMemo(() => {
    const withRegion = conflictItems.filter((item) => selectedRegion === "global" || item.region === selectedRegion);
    if (!searchTerm.trim()) return withRegion;
    const query = searchTerm.toLowerCase();
    return withRegion.filter((item) => item.name.toLowerCase().includes(query));
  }, [conflictItems, searchTerm, selectedRegion]);

  const selectedRegionLabel = REGION_OPTIONS.find((option) => option.key === selectedRegion)?.label ?? "全球總覽";
  const showFlightPanel = activeTab.startsWith("交通狀態/飛航");
  const showShippingPanel = activeTab.startsWith("交通狀態/海運");

  if (!isRightPanelOpen) {
    return (
      <aside className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={toggleRightPanel}
          className="w-9 h-20 rounded-lg bg-[#0a0e14]/90 border border-white/10 hover:bg-white/10 text-white"
          aria-label="展開右側面板"
        >
          ◀◀
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[300px] xl:w-[380px] z-10 p-3 xl:p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar ml-auto pointer-events-auto h-full relative bg-transparent">
      <button
        type="button"
        onClick={toggleRightPanel}
        className="absolute right-4 top-4 z-20 w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white"
        aria-label="收合右側面板"
      >
        ▶▶
      </button>

      <DashboardPanel title="全域同步狀態" tag="STORE">
        <div className="space-y-2 text-[10px] text-gray-300">
          <div className="flex justify-between">
            <span>選中區域</span>
            <span className="text-orange-300 font-semibold">{selectedRegionLabel}</span>
          </div>
          <div className="flex justify-between">
            <span>全球風險指數</span>
            <span className="text-red-300 font-semibold">{globalRiskIndex}</span>
          </div>
          <div className="flex justify-between">
            <span>資料狀態</span>
            <span className={isDataLoading ? "text-amber-300" : dataError ? "text-red-300" : "text-emerald-300"}>
              {isDataLoading ? "同步中" : dataError ? "錯誤" : "已快取"}
            </span>
          </div>
          {dataError && <div className="text-[9px] text-red-300/90 leading-relaxed">{dataError}</div>}
        </div>
      </DashboardPanel>

      {showFlightPanel && (
        <DashboardPanel title="飛航資訊" tag="AIR">
          <InfoList items={FLIGHT_INFO} />
        </DashboardPanel>
      )}

      {showShippingPanel && (
        <DashboardPanel title="海運資訊" tag="SEA">
          <InfoList items={SHIPPING_INFO} />
        </DashboardPanel>
      )}

      {selectedLiveNewsSource && (
        <DashboardPanel title="新聞直播" tag="OPENED">
          <div className="space-y-3">
            <div className="text-[10px] text-gray-400">
              已開啟：<span className="text-white font-semibold">{selectedLiveNewsSource.label}</span>
            </div>
            <p className="text-[10px] text-gray-500">{selectedLiveNewsSource.description}</p>
            <a
              href={selectedLiveNewsSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] px-2.5 py-1.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25 transition-colors"
            >
              前往 {selectedLiveNewsSource.label}
            </a>
          </div>
        </DashboardPanel>
      )}

      <DashboardPanel title="即時情報流" tag="LIVE">
        <div className="space-y-3">
          {filteredNews.length > 0 ? (
            filteredNews.map((item) => (
              <NewsCard
                key={`${item.source}-${item.title}`}
                source={item.source}
                title={item.title}
                time={item.time}
                onClick={() => setFocusCoordinates(item.focusCoordinates ?? null)}
              />
            ))
          ) : (
            <EmptyState text="找不到符合條件的即時情報，請嘗試其他關鍵字。" />
          )}
        </div>
      </DashboardPanel>

      <DashboardPanel title="當前衝突點">
        <div className="flex gap-4">
          <div className="flex-1 text-center">
            <div className="text-[9px] text-gray-500 mb-2 uppercase">風險偏向</div>
            <div className="relative w-24 h-12 mx-auto overflow-hidden shrink-0">
              <div className="w-24 h-24 rounded-full border-[6px] border-gray-800 border-t-orange-500 border-l-orange-500 rotate-45" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-orange-500 font-bold text-[10px]">風險</div>
            </div>
            <div className="mt-4 space-y-1 text-[9px]">
              {filteredConflicts.length > 0 ? (
                filteredConflicts.map((conflict) => (
                  <div key={conflict.name} className="flex justify-between">
                    <span>{conflict.name}</span>
                    <span>{conflict.score}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">無符合衝突點資料</div>
              )}
            </div>
          </div>
          <div className="flex-[1.2] space-y-2">
            <div className="text-[9px] text-gray-500 uppercase">當前風險趨勢</div>
            <div className="h-24 rounded relative overflow-hidden shrink-0">
              <RiskTrendAdvancedChart width={200} height={96} />
            </div>
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel title="戰略資源監控">
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <div className="text-[9px] text-gray-500">生產規格</div>
              <div className="text-sm font-bold text-orange-500">
                1.00 <span className="text-[8px] opacity-40">kW/th</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-gray-500">生產用量</div>
              <div className="text-sm font-bold text-blue-500">
                5.9 <span className="text-[8px] opacity-40">mWh</span>
              </div>
            </div>
          </div>
          <div className="h-16 flex items-end gap-1 px-1">
            {[40, 70, 45, 90, 60, 80, 55].map((h, i) => (
              <div key={i} className="flex-1 bg-orange-500/20 border-t-2 border-orange-500" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel title="GLOBAL ECONOMIC INDICATORS">
        <div className="h-28 rounded mb-2 overflow-hidden relative">
          <EconomicAdvancedChart width={320} height={112} />
        </div>
        <table className="w-full text-[8px] text-gray-500">
          <tbody>
            <tr className="border-b border-white/5">
              <td className="py-1">Nov 2023</td>
              <td className="text-white text-right font-mono">15.55</td>
              <td className="text-red-500 text-right font-bold">-0.20%</td>
            </tr>
            <tr>
              <td className="py-1">Dec 2023</td>
              <td className="text-white text-right font-mono">36.65</td>
              <td className="text-green-500 text-right font-bold">+1.39%</td>
            </tr>
          </tbody>
        </table>
      </DashboardPanel>
    </aside>
  );
}

type DashboardPanelProps = {
  title: string;
  tag?: string;
  children: ReactNode;
};

function DashboardPanel({ title, tag, children }: DashboardPanelProps) {
  return (
    <div className="bg-[#0a0e14]/85 border border-white/10 rounded-xl backdrop-blur-xl flex flex-col shadow-2xl overflow-hidden shrink-0">
      <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 bg-orange-500 rounded-full" />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">{title}</span>
        </div>
        {tag && <span className="text-[7px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold">{tag}</span>}
        <span className="text-gray-600">...</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

type NewsCardProps = Pick<NewsItem, "source" | "title" | "time">;
type NewsCardActionProps = NewsCardProps & {
  onClick: () => void;
};

function NewsCard({ source, title, time, onClick }: NewsCardActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white/5 border border-white/5 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded font-bold uppercase">{source}</span>
        <span className="text-[8px] text-gray-600 italic">{time}</span>
      </div>
      <p className="text-[10px] leading-relaxed text-gray-300 line-clamp-2">{title}</p>
    </button>
  );
}

type EmptyStateProps = {
  text: string;
};

function EmptyState({ text }: EmptyStateProps) {
  return <div className="border border-dashed border-white/10 rounded-lg px-3 py-2 text-[10px] text-gray-500">{text}</div>;
}

type InfoListProps = {
  items: string[];
};

function InfoList({ items }: InfoListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="text-[10px] text-gray-300 px-2.5 py-2 rounded-md bg-white/5 border border-white/5">
          {item}
        </div>
      ))}
    </div>
  );
}
