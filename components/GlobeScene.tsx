"use client";

import React from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "./Globe";

type GlobeSceneProps = {
  transportMode: "default" | "flight" | "shipping" | "allTransport";
};

export default function GlobeScene({ transportMode }: GlobeSceneProps) {
  const [isInteracting, setIsInteracting] = React.useState(false);

  React.useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      const firstArg = typeof args[0] === "string" ? args[0] : "";
      if (firstArg.includes("THREE.Clock: This module has been deprecated")) return;
      originalWarn(...args);
    };
    return () => {
      console.warn = originalWarn;
    };
  }, []);

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
        <Globe transportMode={transportMode} autoRotate={!isInteracting} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minDistance={6}
          maxDistance={6}
          rotateSpeed={0.7}
          onStart={() => setIsInteracting(true)}
          onEnd={() => setIsInteracting(false)}
        />
      </Canvas>

      <div className="absolute right-3 bottom-3 z-10 bg-black/60 border border-white/10 rounded-md px-2.5 py-2 text-[9px] text-gray-200 backdrop-blur pointer-events-none">
        <div className="font-bold text-[10px] text-white mb-1">3D 地球圖層</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-300" />
          <span className={transportMode === "flight" ? "text-cyan-300" : ""}>航班分析</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rotate-45 bg-amber-400 inline-block" />
          <span className={transportMode === "shipping" ? "text-amber-300" : ""}>海運分析</span>
        </div>
        <div className="mt-1.5 text-[8px] text-gray-400">提示：按住滑鼠可旋轉地球</div>
      </div>
    </div>
  );
}
