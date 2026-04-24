"use client";

import React, { memo } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import Globe from "./Globe";
import { tabToTransportMode, useTerminalStore } from "./terminal/store";

const GLOBE_SCENE_REV = "2026-04-24-r2";

function GlobeSceneView() {
  const [isInteracting, setIsInteracting] = React.useState(false);
  const activeTab = useTerminalStore((state) => state.activeTab);
  const transportMode = tabToTransportMode(activeTab);

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
    <div className="w-full h-full relative z-0">
      <Canvas
        key={GLOBE_SCENE_REV}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Globe transportMode={transportMode} autoRotate={!isInteracting} />
        <CameraControls
          makeDefault
          dollySpeed={0}
          minDistance={6}
          maxDistance={6}
          onControlStart={() => setIsInteracting(true)}
          onControlEnd={() => setIsInteracting(false)}
        />
      </Canvas>

      <div className="absolute inset-0 pointer-events-none z-[5] opacity-[0.08] bg-[linear-gradient(to_bottom,transparent_0%,transparent_96%,#00e5ff_100%)] bg-[length:100%_6px]" />

      <div className="absolute right-3 bottom-3 z-10 bg-[#050816]/75 border border-cyan-400/30 rounded-md px-2.5 py-2 text-[9px] text-cyan-100 backdrop-blur pointer-events-none shadow-[0_0_24px_rgba(0,229,255,0.18)]">
        <div className="font-bold text-[10px] text-white mb-1">3D 地球圖層</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-300" />
          <span className={transportMode === "flight" ? "text-cyan-300" : ""}>航班分析</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rotate-45 bg-fuchsia-400 inline-block" />
          <span className={transportMode === "shipping" ? "text-fuchsia-300" : ""}>海運分析</span>
        </div>
        <div className="mt-1.5 text-[8px] text-cyan-200/60">提示：按住滑鼠可旋轉地球</div>
      </div>
    </div>
  );
}

export default memo(GlobeSceneView);
