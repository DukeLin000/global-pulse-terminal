"use client";

import { create } from "zustand";
import type { RegionKey } from "./types";

type TransportMode = "default" | "flight" | "shipping" | "allTransport";

type TerminalStore = {
  activeTab: string;
  expandedMenus: string[];
  searchTerm: string;
  selectedRegion: RegionKey;
  globalRiskIndex: number;
  isLivePopupOpen: boolean;
  isRightPanelCollapsed: boolean;
  setActiveTab: (tab: string) => void;
  toggleMenu: (menuName: string) => void;
  setSearchTerm: (value: string) => void;
  setSelectedRegion: (region: RegionKey) => void;
  setGlobalRiskIndex: (value: number) => void;
  openLivePopup: () => void;
  closeLivePopup: () => void;
  toggleRightPanelCollapsed: () => void;
};

const defaultExpanded = ["即時新聞", "交通狀態", "投資中心", "報告中心", "地區焦點"];

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  activeTab: "地緣政治報告",
  expandedMenus: defaultExpanded,
  searchTerm: "",
  selectedRegion: "global",
  globalRiskIndex: 0,
  isLivePopupOpen: false,
  isRightPanelCollapsed: false,
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
}));

export function tabToTransportMode(activeTab: string): TransportMode {
  if (activeTab === "交通狀態/航班分析") return "flight";
  if (activeTab === "交通狀態/海運分析") return "shipping";
  return "allTransport";
}
