"use client";

import React from 'react';
import { Canvas } from "@react-three/fiber";
import Globe from "./Globe";

export default function GlobeScene() {
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
        <Globe />
      </Canvas>
    </div>
  );
}