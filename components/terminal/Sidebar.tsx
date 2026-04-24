"use client";

import type { ReactNode } from "react";
import { REGION_OPTIONS } from "./data";
import { useTerminalStore } from "./store";
import { useShallow } from "zustand/react/shallow";

export default function Sidebar() {
  const {
    activeTab,
    expandedMenus: expanded,
    selectedRegion,
    setActiveTab,
    toggleMenu,
    setSelectedRegion,
    openLivePopup,
    liveNewsSources,
    isLeftPanelOpen,
    closeLeftPanel,
  } = useTerminalStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      expandedMenus: state.expandedMenus,
      selectedRegion: state.selectedRegion,
      setActiveTab: state.setActiveTab,
      toggleMenu: state.toggleMenu,
      setSelectedRegion: state.setSelectedRegion,
      openLivePopup: state.openLivePopup,
      liveNewsSources: state.liveNewsSources,
      isLeftPanelOpen: state.isLeftPanelOpen,
      closeLeftPanel: state.closeLeftPanel,
    }))
  );

  return (
    <nav
      className={`w-56 xl:w-64 h-full bg-[#05070a] border-r border-white/5 flex flex-col z-40 shadow-2xl shrink-0 transition-transform duration-300 ${
        isLeftPanelOpen ? "translate-x-0" : "-translate-x-full"
      } fixed left-0 top-0 xl:relative`}
    >
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
          icon="🌐"
          label="地緣政治"
          sub="地緣政治動態"
          active={activeTab === "地緣政治"}
          onClick={() => setActiveTab("地緣政治")}
        />

        <CollapsibleMenu
          icon="🧭"
          label="地區焦點"
          sub="跨模組同步聯動"
          isOpen={expanded.includes("地區焦點")}
          onToggle={() => toggleMenu("地區焦點")}
          active={activeTab.startsWith("地區焦點/")}
        >
          {REGION_OPTIONS.map((region) => (
            <SubNavItem
              key={region.key}
              icon="📍"
              label={region.label}
              active={selectedRegion === region.key}
              onClick={() => {
                setSelectedRegion(region.key);
                setActiveTab(`地區焦點/${region.key}`);
              }}
            />
          ))}
        </CollapsibleMenu>

        <NavItem
          icon="📈"
          label="金融市場"
          sub="金融市場追蹤"
          active={activeTab === "金融市場"}
          onClick={() => setActiveTab("金融市場")}
        />

        <CollapsibleMenu
          icon="📰"
          label="即時新聞"
          sub="即時快訊監控"
          isOpen={expanded.includes("即時新聞")}
          onToggle={() => toggleMenu("即時新聞")}
          active={activeTab.startsWith("新聞直播/")}
        >
          <div className="text-[10px] text-gray-500 px-3 py-1.5 font-bold">新聞直播</div>
          {liveNewsSources.map((source) => (
            <SubNavItem
              key={source.label}
              icon="📡"
              label={source.label}
              active={activeTab === `新聞直播/${source.label}`}
              onClick={() => {
                setActiveTab(`新聞直播/${source.label}`);
                openLivePopup();
              }}
            />
          ))}
        </CollapsibleMenu>

        <CollapsibleMenu
          icon="💼"
          label="投資中心"
          sub="智慧投資引擎"
          isOpen={expanded.includes("投資中心")}
          onToggle={() => toggleMenu("投資中心")}
          active={
            activeTab.includes("分析") ||
            activeTab.includes("市場") ||
            activeTab.includes("宇宙") ||
            activeTab.includes("組合")
          }
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
          icon="🚦"
          label="交通狀態"
          sub="全球運輸監控"
          isOpen={expanded.includes("交通狀態")}
          onToggle={() => toggleMenu("交通狀態")}
          active={activeTab.startsWith("交通狀態/")}
        >
          <div className="text-[10px] text-gray-500 px-3 py-1.5 font-bold">航空與海運</div>
          <SubNavItem icon="✈️" label="飛航資訊" active={activeTab === "交通狀態/飛航資訊"} onClick={() => setActiveTab("交通狀態/飛航資訊")} />
          <SubNavItem icon="🧭" label="航班分析" active={activeTab === "交通狀態/航班分析"} onClick={() => setActiveTab("交通狀態/航班分析")} />
          <SubNavItem icon="🚢" label="海運資訊" active={activeTab === "交通狀態/海運資訊"} onClick={() => setActiveTab("交通狀態/海運資訊")} />
          <SubNavItem icon="📦" label="海運分析" active={activeTab === "交通狀態/海運分析"} onClick={() => setActiveTab("交通狀態/海運分析")} />
        </CollapsibleMenu>

        <CollapsibleMenu
          icon="📄"
          label="報告中心"
          sub="情勢分析報告"
          isOpen={expanded.includes("報告中心")}
          onToggle={() => toggleMenu("報告中心")}
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
      <button
        type="button"
        onClick={closeLeftPanel}
        className="xl:hidden absolute top-3 right-3 text-xs px-2 py-1 rounded bg-white/10 text-white"
      >
        關閉
      </button>
    </nav>
  );
}

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
    <div
      onClick={onClick}
      className={`flex items-center gap-4 px-3 py-2.5 rounded-md cursor-pointer transition-all ${
        active
          ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500 shadow-[inset_10px_0_15px_-10px_rgba(245,165,36,0.3)]"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
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
  children: ReactNode;
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
      <div
        onClick={onToggle}
        className={`flex items-center gap-4 px-3 py-2.5 rounded-md cursor-pointer transition-all ${
          active ? "text-orange-500" : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        <span className="text-lg w-5 flex justify-center opacity-80">{icon}</span>
        <div className="flex flex-col leading-tight flex-1">
          <span className="font-bold text-[12px]">{label}</span>
          {sub && <span className="text-[9px] text-gray-500 mt-0.5 tracking-wide">{sub}</span>}
        </div>
        <span className={`text-[8px] transition-transform opacity-50 ${isOpen ? "rotate-0" : "-rotate-90"}`}>▼</span>
      </div>
      {isOpen && <div className="ml-5 border-l border-white/10 pl-2 space-y-0.5 py-1">{children}</div>}
    </div>
  );
}

function SubNavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-[10px] transition-colors rounded-md ${
        active ? "text-orange-400 font-bold bg-orange-400/5" : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon && <span className="opacity-60 text-sm w-4 flex justify-center">{icon}</span>}
      <span>{label}</span>
    </div>
  );
}
