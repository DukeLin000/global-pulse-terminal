"use client";

import React from 'react';
import { Canvas } from "@react-three/fiber";
import Globe from "./Globe";

type GlobeSceneProps = {
  transportMode: "default" | "flight" | "shipping" | "allTransport";
};

export default function GlobeScene({ transportMode }: GlobeSceneProps) {
  return (
    // 關鍵修正：確保容器是絕對定位且撐滿，並設定 pointer-events-auto 以便操作地球
    <div className="w-full h-full relative z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        // gl 設定優化
        gl={{ 
          antialias: true, 
          alpha: true, // 必須開啟透明度
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        // 確保每幀渲染前正確清除背景，防止殘影或漆黑
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0); // 設定清除顏色為黑色，但透明度為 0
        }}
      >
        {/* 這裡是 3D 世界 */}
        <Globe transportMode={transportMode} />
      </Canvas>

      <div className="absolute right-3 bottom-3 z-10 bg-black/55 border border-white/10 rounded-md px-2.5 py-2 text-[9px] text-gray-200 backdrop-blur pointer-events-none">
        <div className="font-bold text-[10px] text-white mb-1">TRANSPORT LAYERS</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-300" />
          <span className={transportMode === "flight" ? "text-cyan-300" : ""}>航班分析</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rotate-45 bg-amber-400 inline-block" />
          <span className={transportMode === "shipping" ? "text-amber-300" : ""}>海運分析</span>
        </div>
      </div>
    </div>
  );
}
