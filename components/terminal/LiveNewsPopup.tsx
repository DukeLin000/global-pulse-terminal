"use client";

import type { LiveNewsSource } from "./types";

type LiveNewsPopupProps = {
  source: LiveNewsSource;
  onClose: () => void;
};

export default function LiveNewsPopup({ source, onClose }: LiveNewsPopupProps) {
  return (
    <section className="absolute left-4 bottom-4 z-20 w-[340px] rounded-lg border border-orange-500/30 bg-[#05070a]/95 shadow-2xl backdrop-blur-md overflow-hidden">
      <header className="h-9 px-3 flex items-center justify-between border-b border-white/10 bg-orange-500/10">
        <div className="text-[11px] font-bold text-orange-300">📺 {source.label} LIVE</div>
        <div className="flex items-center gap-2">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-gray-200"
          >
            外部開啟
          </a>
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] text-gray-300 hover:text-white"
            aria-label="關閉直播視窗"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="aspect-video bg-black">
        <iframe
          title={`${source.label} 直播視窗`}
          src={source.embedUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </section>
  );
}
