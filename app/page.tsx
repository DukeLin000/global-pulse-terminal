"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const GlobeScene = dynamic(() => import("@/components/GlobeScene"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#020408]" />
});

export default function Terminal() {
  const [activeTab, setActiveTab] = useState("地緣政治報告");
  const [expanded, setExpanded] = useState(["投資中心", "報告中心"]);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleString('zh-TW', { hour12: false }) + " UTC+8");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="h-screen w-full bg-[#020408] text-[#e2e8f0] font-sans text-[11px] flex overflow-hidden">
      
      {/* 1. 左側側邊欄 - 深度定制 */}
      <nav className="w-64 h-full bg-[#05070a] border-r border-white/5 flex flex-col z-30 shadow-2xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(245,165,36,0.3)]">
            <span className="text-white font-black text-xs">GP</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-tighter text-sm text-white">GLOBALPULSE</span>
            <span className="text-[9px] text-gray-500 tracking-[0.2em]">TERMINAL</span>
          </div>
        </div>

        <div className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[9px] text-gray-600 px-2 py-3 uppercase tracking-widest font-bold">主要控制</div>
          <NavItem icon="▥" label="控制中心" />
          <NavItem icon="🌍" label="地緣政治" hasChild />
          <NavItem icon="＄" label="金融市場" hasChild />

          <div className="text-[9px] text-gray-600 px-2 py-3 uppercase tracking-widest font-bold">分析與報告</div>
          <CollapsibleItem 
            icon="⊿" label="投資中心" 
            isOpen={expanded.includes("投資中心")}
            active={activeTab.includes("投資")}
          >
            <SubNavItem label="儀表板" icon="▤" />
            <SubNavItem label="宏觀分析" icon="🕒" />
            <SubNavItem label="賽道分析" icon="↝" />
            <SubNavItem label="個股分析" />
          </CollapsibleItem>

          <CollapsibleItem 
            icon="▧" label="報告中心" 
            isOpen={expanded.includes("報告中心")}
            active={true}
          >
            <SubNavItem label="地緣政治報告" active={activeTab === "地緣政治報告"} />
            <SubNavItem label="金融市場報告" />
            <SubNavItem label="投資中心報告" />
          </CollapsibleItem>
        </div>

        <div className="p-4 mt-auto border-t border-white/5">
          <NavItem icon="⚙" label="設定 (API 設定)" />
        </div>
      </nav>

      {/* 2. 右側主區域 */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-[#02040a]">
        
        {/* 頂部功能列 (Header) */}
        <header className="h-14 border-b border-white/5 flex items-center px-4 gap-4 z-20 bg-[#05070a]/80 backdrop-blur-xl">
          <div className="relative flex-1 max-w-md">
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-[10px] focus:border-orange-500/50 outline-none transition-all placeholder:text-gray-600"
              placeholder="搜尋全球動態或數據..."
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-sm">🔍</span>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pr-4">
            <TopTicker label="10Y" val="170.1%" up />
            <TopTicker label="GOLD" val="1.33%" down />
            <TopTicker label="BTC" val="1.38%" up />
            <TopTicker label="OIL" val="2.5%" up />
            <TopTicker label="S&P 500" val="1.18%" up />
          </div>

          <div className="flex items-center gap-4 ml-auto pl-4 border-l border-white/10 text-gray-500">
            <button className="hover:text-white transition-colors text-lg">✉</button>
            <button className="hover:text-white transition-colors text-lg">⚙</button>
            <button className="relative hover:text-white transition-colors text-lg">
               🔔 <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-[8px] text-white flex items-center justify-center rounded-full border-2 border-[#02040a]">8</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center">
              <span className="text-[10px] font-bold text-orange-500">TAI</span>
            </div>
          </div>
        </header>

        {/* 3D 舞台區域 */}
        <div className="flex-1 relative overflow-hidden flex p-4 gap-4">
          
          {/* 背景地球 */}
          <div className="absolute inset-0 z-0">
            <GlobeScene />
          </div>

          {/* 右側資訊面板堆疊 (高度還原圖示) */}
          <div className="w-[380px] z-10 flex flex-col gap-4 ml-auto overflow-y-auto no-scrollbar pointer-events-auto">
            
            {/* 即時情報流 */}
            <DashboardPanel title="即時情報流" tag="LIVE">
              <div className="space-y-3">
                <NewsCard 
                  source="ARJ News" 
                  title="【環球夜觀中國】中國道界太飄逸的模樣，竟被這群投資先開採，擱剩度資源"
                  time="7 小時前"
                />
                <NewsCard 
                  source="WHSR News" 
                  title="【投資預報中】中國海關開採檢索日發湧，融啟各處正"
                  time="7 小時前"
                />
              </div>
            </DashboardPanel>

            {/* 當前衝突點 */}
            <DashboardPanel title="當前衝突點">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-[9px] text-gray-500 uppercase">風險偏向</div>
                  <div className="relative h-20 flex items-center justify-center">
                    {/* Gauge Mockup */}
                    <div className="w-16 h-16 rounded-full border-4 border-dashed border-orange-500/30 flex items-center justify-center">
                       <span className="text-orange-500 font-bold text-xs">風險</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-gray-400">Ukraine</span><span className="text-white">23</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-gray-400">Gaza</span><span className="text-white">239</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[9px] text-gray-500 uppercase">當前風險趨勢</div>
                  <div className="h-20 bg-blue-500/5 rounded border border-white/5 flex items-end p-1">
                    {/* Area Chart Mockup */}
                    <div className="w-full h-1/2 bg-gradient-to-t from-blue-500/20 to-transparent border-t border-blue-500/50 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </DashboardPanel>

            {/* 戰略資源監控 */}
            <DashboardPanel title="戰略資源監控">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[9px] text-gray-500 mb-1">生產規格</div>
                    <div className="text-sm font-bold text-orange-400">1.00 <span className="text-[9px] text-gray-600 font-normal">kW/th</span></div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 mb-1">生產用量</div>
                    <div className="text-sm font-bold text-blue-400">5.9 <span className="text-[9px] text-gray-600 font-normal">mWh</span></div>
                  </div>
                </div>
                <div className="h-24 flex items-end gap-1">
                  {[40, 70, 45, 90, 60, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-orange-500/20 border-t-2 border-orange-500" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </DashboardPanel>

            {/* 全球經濟指標 */}
            <DashboardPanel title="GLOBAL ECONOMIC INDICATORS">
               <div className="space-y-3">
                 <div className="h-24 bg-white/5 rounded relative p-2 overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-500/20 to-transparent border-t border-blue-400/30"></div>
                    <div className="text-[8px] text-gray-500">USD/TWD Trend</div>
                 </div>
                 <table className="w-full text-[8px] text-gray-400 border-t border-white/5">
                   <tbody>
                     <tr className="border-b border-white/5">
                       <td className="py-1">Nov 2023</td>
                       <td className="text-right text-white">15.55</td>
                       <td className="text-right text-red-400">-0.20%</td>
                     </tr>
                     <tr className="border-b border-white/5">
                       <td className="py-1">Dec 2023</td>
                       <td className="text-right text-white">16.65</td>
                       <td className="text-right text-green-400">+1.39%</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </DashboardPanel>
          </div>
        </div>

        {/* Footer */}
        <footer className="h-8 border-t border-white/5 px-4 flex justify-between items-center bg-[#05070a] text-[9px] text-gray-600 z-20">
          <div className="flex gap-4">
            <span className="text-green-500 font-bold tracking-widest">● SYSTEM_ONLINE</span>
            <span>COORD: 23.5°N 121.0°E</span>
          </div>
          <div className="font-mono tabular-nums">{timeStr}</div>
        </footer>
      </div>
    </main>
  );
}

// --- UI Sub-Components ---

function NavItem({ icon, label, hasChild, active }: any) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all ${active ? 'bg-orange-500/10 text-orange-500 border-l-2 border-orange-500 shadow-[inset_10px_0_15px_-10px_rgba(245,165,36,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      <span className="text-sm opacity-70">{icon}</span>
      <span className="font-bold tracking-tight">{label}</span>
      {hasChild && <span className="ml-auto opacity-30 text-[8px]">▼</span>}
    </div>
  );
}

function CollapsibleItem({ icon, label, isOpen, children, active }: any) {
  return (
    <div className="space-y-1">
      <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all ${active ? 'bg-gradient-to-r from-orange-500/20 to-transparent text-orange-500 border-l-2 border-orange-500' : 'text-gray-400 hover:bg-white/5'}`}>
        <span className="text-sm opacity-70">{icon}</span>
        <span className="font-bold tracking-tight">{label}</span>
        <span className="ml-auto opacity-30 text-[8px]">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && <div className="ml-6 border-l border-white/5 space-y-1 pt-1">{children}</div>}
    </div>
  );
}

function SubNavItem({ label, icon, active }: any) {
  return (
    <div className={`flex items-center gap-3 px-4 py-1.5 cursor-pointer text-[10px] transition-colors ${active ? 'text-orange-400 font-bold bg-orange-400/5' : 'text-gray-500 hover:text-white'}`}>
      {icon && <span className="opacity-50">{icon}</span>}
      <span>{label}</span>
    </div>
  );
}

function TopTicker({ label, val, up, down }: any) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 shrink-0">
      <span className="text-gray-500 font-bold tracking-tighter">{label}</span>
      <span className="text-white font-mono">{val}</span>
      <span className={`text-[8px] ${up ? 'text-green-500' : 'text-red-500'}`}>{up ? '↗' : '↘'}</span>
    </div>
  );
}

function DashboardPanel({ title, tag, children }: any) {
  return (
    // 關鍵修正：加入 shrink-0，防止面板被 Flexbox 壓扁導致內容裁切
    <div className="bg-[#0a0e14]/80 border border-white/10 rounded-xl backdrop-blur-xl flex flex-col shadow-2xl overflow-hidden group hover:border-orange-500/30 transition-all shrink-0">
      <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_5px_rgba(245,165,36,1)]"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{title}</span>
        </div>
        {tag && <span className="text-[7px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold">{tag}</span>}
        <span className="text-gray-600 text-xs">...</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function NewsCard({ source, title, time }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg hover:bg-white/[0.05] transition-all cursor-pointer">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">{source}</span>
        <span className="text-[8px] text-gray-600 italic">{time}</span>
      </div>
      <p className="text-[10px] leading-relaxed text-gray-300 line-clamp-2">{title}</p>
    </div>
  );
}