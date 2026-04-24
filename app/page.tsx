"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

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
  const [activeTab, setActiveTab] = useState("地緣政治報告");
  const [expanded, setExpanded] = useState<string[]>(["投資中心", "報告中心"]);
  const [timeStr, setTimeStr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleString('zh-TW', { hour12: false }) + " UTC+8");
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

  // 處理選單展開與收合
  const toggleMenu = (menuName: string) => {
    setExpanded(prev => 
      prev.includes(menuName) ? prev.filter(m => m !== menuName) : [...prev, menuName]
    );
  };

  const filteredNews = useMemo(() => {
    if (!searchTerm.trim()) return NEWS_ITEMS;
    const query = searchTerm.toLowerCase();
    return NEWS_ITEMS.filter((item) =>
      [item.source, item.title, ...item.tags].join(" ").toLowerCase().includes(query)
    );
  }, [searchTerm]);

  const filteredConflicts = useMemo(() => {
    if (!searchTerm.trim()) return CONFLICT_ITEMS;
    const query = searchTerm.toLowerCase();
    return CONFLICT_ITEMS.filter((item) => item.name.toLowerCase().includes(query));
  }, [searchTerm]);

  return (
    <main className="h-screen w-full bg-[#020408] text-[#e2e8f0] font-sans text-[11px] flex overflow-hidden">
      
      {/* 1. 左側側邊欄 - 完美還原設計圖 */}
      <nav className="w-64 h-full bg-[#05070a] border-r border-white/5 flex flex-col z-30 shadow-2xl shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-700 flex items-center justify-center">
            <span className="font-black text-xs text-white">GP</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-tighter text-sm text-white">GLOBALPULSE</span>
            <span className="text-[9px] text-gray-500 tracking-[0.2em]">TERMINAL</span>
          </div>
        </div>

        <div className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pb-10">
          
          <NavItem 
            icon="🌐" label="地緣政治" sub="地緣政治動態" 
            active={activeTab === "地緣政治"} onClick={() => setActiveTab("地緣政治")} 
          />
          <NavItem 
            icon="📈" label="金融市場" sub="金融市場追蹤" 
            active={activeTab === "金融市場"} onClick={() => setActiveTab("金融市場")} 
          />
          
          <CollapsibleMenu 
            icon="💼" label="投資中心" sub="智慧投資引擎" 
            isOpen={expanded.includes("投資中心")} onToggle={() => toggleMenu("投資中心")}
            active={activeTab.includes("分析") || activeTab.includes("市場") || activeTab.includes("宇宙") || activeTab.includes("組合")}
          >
            <div className="text-[10px] text-gray-500 px-3 py-1.5 font-bold">儀表板</div>
            <SubNavItem icon="📈" label="宏觀分析" active={activeTab === "宏觀分析"} onClick={() => setActiveTab("宏觀分析")} />
            <SubNavItem icon="📊" label="賽道分析" active={activeTab === "賽道分析"} onClick={() => setActiveTab("賽道分析")} />
            <SubNavItem icon="🔍" label="個股分析" active={activeTab === "個股分析"} onClick={() => setActiveTab("個股分析")} />
            <SubNavItem icon="🔎" label="全市場篩選" active={activeTab === "全市場篩選"} onClick={() => setActiveTab("全市場篩選")} />
            <SubNavItem icon="🌐" label="資產宇宙" active={activeTab === "資產宇宙"} onClick={() => setActiveTab("資產宇宙")} />
            <SubNavItem icon="☯" label="投資組合" active={activeTab === "投資組合"} onClick={() => setActiveTab("投資組合")} />
          </CollapsibleMenu>

          <CollapsibleMenu 
            icon="📄" label="報告中心" sub="情勢分析報告" 
            isOpen={expanded.includes("報告中心")} onToggle={() => toggleMenu("報告中心")}
            active={activeTab.includes("報告")}
          >
            <SubNavItem icon="🌐" label="地緣政治報告" active={activeTab === "地緣政治報告"} onClick={() => setActiveTab("地緣政治報告")} />
            <SubNavItem icon="📈" label="金融市場報告" active={activeTab === "金融市場報告"} onClick={() => setActiveTab("金融市場報告")} />
            <SubNavItem icon="💼" label="投資中心報告" active={activeTab === "投資中心報告"} onClick={() => setActiveTab("投資中心報告")} />
          </CollapsibleMenu>

        </div>
        
        <div className="p-3 border-t border-white/5">
          <NavItem icon="⚙" label="設定" sub="API 設定" onClick={() => setActiveTab("設定")} active={activeTab === "設定"} />
        </div>
      </nav>

      {/* 2. 右側主區域 (保持原樣不變，負責渲染 3D 與面板) */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-[#02040a]">
        
        <header className="h-14 border-b border-white/5 flex items-center px-4 gap-4 z-20 bg-[#05070a]/80 backdrop-blur-xl shrink-0">
          <div className="relative flex-1 max-w-sm">
            <input
              ref={searchInputRef}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
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
            <TopTicker label="GOLD" val="1.33%" down />
            <TopTicker label="BTC" val="1.38%" up />
          </div>
          <div className="flex gap-4 ml-auto text-gray-500 items-center">
            <span className="text-sm">✉</span>
            <span className="relative text-sm">🔔<span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-[7px] text-white">8</span></span>
            <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500 font-bold">TAI</div>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden flex">
          <div className="absolute inset-0 z-0"><GlobeScene /></div>

          <aside className="w-[380px] z-10 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar ml-auto pointer-events-auto h-full">
            <DashboardPanel title="即時情報流" tag="LIVE">
              <div className="space-y-3">
                {filteredNews.length > 0 ? (
                  filteredNews.map((item) => (
                    <NewsCard
                      key={`${item.source}-${item.title}`}
                      source={item.source}
                      title={item.title}
                      time={item.time}
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
                    <div className="w-24 h-24 rounded-full border-[6px] border-gray-800 border-t-orange-500 border-l-orange-500 rotate-45"></div>
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
                   <div><div className="text-[9px] text-gray-500">生產規格</div><div className="text-sm font-bold text-orange-500">1.00 <span className="text-[8px] opacity-40">kW/th</span></div></div>
                   <div><div className="text-[9px] text-gray-500">生產用量</div><div className="text-sm font-bold text-blue-500">5.9 <span className="text-[8px] opacity-40">mWh</span></div></div>
                 </div>
                 <div className="h-16 flex items-end gap-1 px-1">
                   {[40, 70, 45, 90, 60, 80, 55].map((h, i) => (
                     <div key={i} className="flex-1 bg-orange-500/20 border-t-2 border-orange-500" style={{ height: `${h}%` }}></div>
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

// --- 重構的側邊欄 UI 子組件 ---

type BaseClickableProps = {
  icon?: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

type NavItemProps = BaseClickableProps & {
  sub?: string;
};

function NavItem({ icon, label, sub, active = false, onClick }: NavItemProps) {
  return (
    <div onClick={onClick} className={`flex items-center gap-4 px-3 py-2.5 rounded-md cursor-pointer transition-all ${active ? 'bg-orange-500/10 text-orange-500 border-l-2 border-orange-500 shadow-[inset_10px_0_15px_-10px_rgba(245,165,36,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      <span className="text-lg w-5 flex justify-center opacity-80">{icon}</span>
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-[12px]">{label}</span>
        {sub && <span className="text-[9px] text-gray-500 mt-0.5 tracking-wide">{sub}</span>}
      </div>
    </div>
  );
}

type CollapsibleMenuProps = {
  icon: string;
  label: string;
  sub?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  active?: boolean;
};

function CollapsibleMenu({
  icon,
  label,
  sub,
  isOpen,
  onToggle,
  children,
  active = false,
}: CollapsibleMenuProps) {
  return (
    <div className="space-y-1">
      <div onClick={onToggle} className={`flex items-center gap-4 px-3 py-2.5 rounded-md cursor-pointer transition-all ${active ? 'text-orange-500' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        <span className="text-lg w-5 flex justify-center opacity-80">{icon}</span>
        <div className="flex flex-col leading-tight flex-1">
          <span className="font-bold text-[12px]">{label}</span>
          {sub && <span className="text-[9px] text-gray-500 mt-0.5 tracking-wide">{sub}</span>}
        </div>
        <span className={`text-[8px] transition-transform opacity-50 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>▼</span>
      </div>
      {isOpen && (
        <div className="ml-5 border-l border-white/10 pl-2 space-y-0.5 py-1">
          {children}
        </div>
      )}
    </div>
  );
}

function SubNavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-[10px] transition-colors rounded-md ${active ? 'text-orange-400 font-bold bg-orange-400/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon && <span className="opacity-60 text-sm w-4 flex justify-center">{icon}</span>}
      <span>{label}</span>
    </div>
  );
}

// --- 右側面板 UI 子組件 ---

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
      <span className={up ? 'text-green-500' : 'text-red-500'}>{up ? '↗' : '↘'}</span>
    </div>
  );
}

type DashboardPanelProps = {
  title: string;
  tag?: string;
  children: React.ReactNode;
};

function DashboardPanel({ title, tag, children }: DashboardPanelProps) {
  return (
    <div className="bg-[#0a0e14]/85 border border-white/10 rounded-xl backdrop-blur-xl flex flex-col shadow-2xl overflow-hidden shrink-0">
      <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
        <div className="flex items-center gap-2"><span className="w-1 h-1 bg-orange-500 rounded-full" /><span className="text-[9px] font-black uppercase tracking-widest text-gray-300">{title}</span></div>
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
      <div className="flex justify-between items-center mb-1"><span className="text-[8px] bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded font-bold uppercase">{source}</span><span className="text-[8px] text-gray-600 italic">{time}</span></div>
      <p className="text-[10px] leading-relaxed text-gray-300 line-clamp-2">{title}</p>
    </div>
  );
}

type EmptyStateProps = {
  text: string;
};

function EmptyState({ text }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-white/10 rounded-lg px-3 py-2 text-[10px] text-gray-500">
      {text}
    </div>
  );
}
