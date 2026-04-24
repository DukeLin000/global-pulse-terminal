"use client";

import { create } from "zustand";
import { CONFLICT_ITEMS, LIVE_NEWS_SOURCES, NEWS_ITEMS } from "./data";
import { fetchTerminalSnapshot } from "./api";
import type { ConflictItem, LiveNewsSource, NewsItem, RegionKey } from "./types";

type TransportMode = "default" | "flight" | "shipping" | "allTransport";

type TerminalStore = {
  activeTab: string;
  expandedMenus: string[];
  searchTerm: string;
  selectedRegion: RegionKey;
  globalRiskIndex: number;
  isLivePopupOpen: boolean;
  isRightPanelCollapsed: boolean;
  newsItems: NewsItem[];
  conflictItems: ConflictItem[];
  liveNewsSources: LiveNewsSource[];
  isDataLoading: boolean;
  dataError: string | null;
  lastFetchedAt: number | null;
  setActiveTab: (tab: string) => void;
  toggleMenu: (menuName: string) => void;
  setSearchTerm: (value: string) => void;
  setSelectedRegion: (region: RegionKey) => void;
  setGlobalRiskIndex: (value: number) => void;
  openLivePopup: () => void;
  closeLivePopup: () => void;
  toggleRightPanelCollapsed: () => void;
  refreshTerminalData: () => Promise<void>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
};

const defaultExpanded = ["即時新聞", "交通狀態", "投資中心", "報告中心", "地區焦點"];

let pollTimer: ReturnType<typeof setInterval> | null = null;
let inflightRequest: Promise<void> | null = null;

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  activeTab: "地緣政治報告",
  expandedMenus: defaultExpanded,
  searchTerm: "",
  selectedRegion: "global",
  globalRiskIndex: 0,
  isLivePopupOpen: false,
  isRightPanelCollapsed: false,
  newsItems: NEWS_ITEMS,
  conflictItems: CONFLICT_ITEMS,
  liveNewsSources: LIVE_NEWS_SOURCES,
  isDataLoading: false,
  dataError: null,
  lastFetchedAt: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleMenu: (menuName) =>
    set((state) => ({
      expandedMenus: state.expandedMenus.includes(menuName)
        ? state.expandedMenus.filter((name) => name !== menuName)
        : [...state.expandedMenus, menuName],
    })),
  setSearchTerm: (value) => set({ searchTerm: value }),
  setSelectedRegion: (region) => {
    const nextTab = get().activeTab.startsWith("地區焦點/") ? `地區焦點/${region}` : get().activeTab;
    set({ selectedRegion: region, activeTab: nextTab });
  },
  setGlobalRiskIndex: (value) => set({ globalRiskIndex: value }),
  openLivePopup: () => set({ isLivePopupOpen: true }),
  closeLivePopup: () => set({ isLivePopupOpen: false }),
  toggleRightPanelCollapsed: () => set((state) => ({ isRightPanelCollapsed: !state.isRightPanelCollapsed })),
  refreshTerminalData: async () => {
    if (inflightRequest) return inflightRequest;

    inflightRequest = (async () => {
      const hasCachedData = get().lastFetchedAt !== null;
      set({ isDataLoading: !hasCachedData, dataError: null });

      try {
        const snapshot = await fetchTerminalSnapshot();
        set({
          newsItems: snapshot.newsItems,
          conflictItems: snapshot.conflictItems,
          liveNewsSources: snapshot.liveNewsSources,
          lastFetchedAt: snapshot.fetchedAt,
          isDataLoading: false,
          dataError: null,
        });
      } catch (error) {
        set({
          isDataLoading: false,
          dataError: error instanceof Error ? error.message : "資料更新失敗",
        });
      } finally {
        inflightRequest = null;
      }
    })();

    return inflightRequest;
  },
  startPolling: (intervalMs = 5000) => {
    if (pollTimer) return;
    void get().refreshTerminalData();
    pollTimer = setInterval(() => {
      void get().refreshTerminalData();
    }, intervalMs);
  },
  stopPolling: () => {
    if (!pollTimer) return;
    clearInterval(pollTimer);
    pollTimer = null;
  },
}));

export function tabToTransportMode(activeTab: string): TransportMode {
  if (activeTab === "交通狀態/航班分析") return "flight";
  if (activeTab === "交通狀態/海運分析") return "shipping";
  return "allTransport";
}
