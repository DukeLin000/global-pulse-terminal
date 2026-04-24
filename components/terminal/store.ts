"use client";

import { create } from "zustand";
import { CONFLICT_ITEMS, LIVE_NEWS_SOURCES, NEWS_ITEMS } from "./data";
import { fetchTerminalSnapshot } from "./api";
import type { AlertToast, ConflictItem, FocusCoordinates, LiveNewsSource, NewsItem, RegionKey } from "./types";

type TransportMode = "default" | "flight" | "shipping" | "allTransport";

type TerminalStore = {
  activeTab: string;
  expandedMenus: string[];
  searchTerm: string;
  selectedRegion: RegionKey;
  globalRiskIndex: number;
  isLivePopupOpen: boolean;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  newsItems: NewsItem[];
  conflictItems: ConflictItem[];
  liveNewsSources: LiveNewsSource[];
  isDataLoading: boolean;
  dataError: string | null;
  lastFetchedAt: number | null;
  focusCoordinates: FocusCoordinates | null;
  alerts: AlertToast[];
  setActiveTab: (tab: string) => void;
  toggleMenu: (menuName: string) => void;
  setSearchTerm: (value: string) => void;
  setSelectedRegion: (region: RegionKey) => void;
  setGlobalRiskIndex: (value: number) => void;
  openLivePopup: () => void;
  closeLivePopup: () => void;
  toggleLeftPanel: () => void;
  closeLeftPanel: () => void;
  toggleRightPanel: () => void;
  refreshTerminalData: () => Promise<void>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
  setFocusCoordinates: (payload: FocusCoordinates | null) => void;
  pushAlert: (payload: Omit<AlertToast, "id" | "createdAt">) => void;
  dismissAlert: (id: string) => void;
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
  isLeftPanelOpen: true,
  isRightPanelOpen: true,
  newsItems: NEWS_ITEMS,
  conflictItems: CONFLICT_ITEMS,
  liveNewsSources: LIVE_NEWS_SOURCES,
  isDataLoading: false,
  dataError: null,
  lastFetchedAt: null,
  focusCoordinates: null,
  alerts: [],
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
  toggleLeftPanel: () => set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),
  closeLeftPanel: () => set({ isLeftPanelOpen: false }),
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),
  refreshTerminalData: async () => {
    if (inflightRequest) return inflightRequest;

    inflightRequest = (async () => {
      const hasCachedData = get().lastFetchedAt !== null;
      set({ isDataLoading: !hasCachedData, dataError: null });

      try {
        const previousConflicts = get().conflictItems;
        const snapshot = await fetchTerminalSnapshot();
        set({
          newsItems: snapshot.newsItems,
          conflictItems: snapshot.conflictItems,
          liveNewsSources: snapshot.liveNewsSources,
          lastFetchedAt: snapshot.fetchedAt,
          isDataLoading: false,
          dataError: null,
        });

        const highestConflict = snapshot.conflictItems.reduce<ConflictItem | null>(
          (max, item) => (!max || item.score > max.score ? item : max),
          null
        );
        if (!highestConflict) return;
        const previousScore = previousConflicts.find((item) => item.name === highestConflict.name)?.score ?? 0;
        if (highestConflict.score >= 200 && highestConflict.score > previousScore) {
          get().pushAlert({
            level: highestConflict.score >= 260 ? "critical" : "warning",
            title: "重大地緣警報",
            message: `${highestConflict.name} 風險指數升至 ${highestConflict.score}`,
          });
        }
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
    const safeInterval = Math.max(intervalMs, 2500);
    void get().refreshTerminalData();
    pollTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      void get().refreshTerminalData();
    }, safeInterval);
  },
  stopPolling: () => {
    if (!pollTimer) return;
    clearInterval(pollTimer);
    pollTimer = null;
  },
  setFocusCoordinates: (payload) => set({ focusCoordinates: payload }),
  pushAlert: (payload) =>
    set((state) => ({
      alerts: [
        ...state.alerts,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: Date.now(),
          ...payload,
        },
      ].slice(-4),
    })),
  dismissAlert: (id) => set((state) => ({ alerts: state.alerts.filter((item) => item.id !== id) })),
}));

export function tabToTransportMode(activeTab: string): TransportMode {
  if (activeTab === "交通狀態/航班分析") return "flight";
  if (activeTab === "交通狀態/海運分析") return "shipping";
  return "allTransport";
}
