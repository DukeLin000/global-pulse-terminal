"use client";

import type { RefObject } from "react";

type TopHeaderProps = {
  activeTab: string;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
};

export default function TopHeader({ activeTab, searchTerm, onSearchTermChange, searchInputRef }: TopHeaderProps) {
  return (
    <header className="h-14 border-b border-white/5 flex items-center px-4 gap-4 z-20 bg-[#05070a]/80 backdrop-blur-xl shrink-0">
      <div className="relative flex-1 max-w-sm">
        <input
          ref={searchInputRef}
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-4 text-[10px] outline-none"
          placeholder="搜尋全球數據...（按 / 快速聚焦）"
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
      </div>
      <div className="hidden md:flex items-center text-[9px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-md">
        模組：{activeTab}
      </div>
      <div className="flex items-center gap-2 overflow-hidden px-2 no-scrollbar">
        <TopTicker label="10Y" val="170.1%" up />
        <TopTicker label="GOLD" val="1.33%" up={false} />
        <TopTicker label="BTC" val="1.38%" up />
      </div>
      <div className="flex gap-4 ml-auto text-gray-500 items-center">
        <span className="text-sm">✉</span>
        <span className="relative text-sm">
          🔔
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-[7px] text-white">8</span>
        </span>
        <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500 font-bold">TAI</div>
      </div>
    </header>
  );
}

type TopTickerProps = {
  label: string;
  val: string;
  up: boolean;
};

function TopTicker({ label, val, up }: TopTickerProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 shrink-0">
      <span className="text-gray-500 font-bold">{label}</span>
      <span className="text-white font-mono">{val}</span>
      <span className={up ? "text-green-500" : "text-red-500"}>{up ? "↗" : "↘"}</span>
    </div>
  );
}
