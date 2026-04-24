"use client";

import type { ReactNode } from "react";
import type { ConflictItem, LiveNewsSource, NewsItem } from "./types";

type RightPanelProps = {
  selectedLiveNewsSource?: LiveNewsSource;
  filteredNews: NewsItem[];
  filteredConflicts: ConflictItem[];
};

export default function RightPanel({ selectedLiveNewsSource, filteredNews, filteredConflicts }: RightPanelProps) {
  return (
    <aside className="w-[380px] z-10 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar ml-auto pointer-events-auto h-full">
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
              <NewsCard key={`${item.source}-${item.title}`} source={item.source} title={item.title} time={item.time} />
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
            <div className="h-24 bg-blue-500/5 border border-white/5 rounded relative overflow-hidden shrink-0">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                <path d="M0,45 L20,30 L40,40 L60,15 L80,25 L100,5 L100,50 L0,50 Z" fill="rgba(59,130,246,0.1)" />
                <path d="M0,45 L20,30 L40,40 L60,15 L80,25 L100,5" fill="none" stroke="#3b82f6" strokeWidth="1" />
              </svg>
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
        <div className="h-20 bg-white/5 rounded border border-white/5 mb-2 overflow-hidden relative">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
            <path d="M0,35 L25,25 L50,30 L75,10 L100,5" fill="none" stroke="#3b82f6" strokeWidth="1" />
          </svg>
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

type NewsCardProps = {
  source: string;
  title: string;
  time: string;
};

function NewsCard({ source, title, time }: NewsCardProps) {
  return (
    <div className="bg-white/5 border border-white/5 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded font-bold uppercase">{source}</span>
        <span className="text-[8px] text-gray-600 italic">{time}</span>
      </div>
      <p className="text-[10px] leading-relaxed text-gray-300 line-clamp-2">{title}</p>
    </div>
  );
}

type EmptyStateProps = {
  text: string;
};

function EmptyState({ text }: EmptyStateProps) {
  return <div className="border border-dashed border-white/10 rounded-lg px-3 py-2 text-[10px] text-gray-500">{text}</div>;
}
