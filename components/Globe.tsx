"use client";
import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useTerminalStore } from "./terminal/store";
import type { RegionKey } from "./terminal/types";

// 經緯度轉 3D 座標
function latLonToVec3(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// ----------------------------------------------------------------------
// 1. 獨立的資料集：飛行航班 (Flight Routes)
// ----------------------------------------------------------------------
const FLIGHT_ROUTES = [
  { fromName: "Taipei", from: [25.0, 121.5], toName: "New York", to: [40.7, -74.0] },
  { fromName: "London", from: [51.5, -0.1], toName: "Dubai", to: [25.2, 55.3] },
  { fromName: "Tokyo", from: [35.6, 139.6], toName: "Paris", to: [48.8, 2.3] },
  { fromName: "San Francisco", from: [37.7, -122.4], toName: "Hong Kong", to: [22.3, 114.2] },
];

// ----------------------------------------------------------------------
// 2. 獨立的資料集：衝突熱點 (Conflict Zones)
// ----------------------------------------------------------------------
const CONFLICT_ZONES = [
  { name: "Ukraine", lat: 48.3, lon: 31.1, tier: 1, region: "europe" as RegionKey },
  { name: "Gaza", lat: 31.5, lon: 34.4, tier: 1, region: "middle-east" as RegionKey },
  { name: "Red Sea", lat: 15.5, lon: 41.8, tier: 2, region: "middle-east" as RegionKey },
  { name: "Taiwan Strait", lat: 24.0, lon: 119.0, tier: 2, region: "asia-pacific" as RegionKey },
];

const CONFLICT_DETAILS: Record<string, string> = {
  Ukraine: "東線砲擊密度升高，無人機偵察活動頻繁，補給線維持高壓運作。",
  Gaza: "城市交戰持續，地面推進與空中監控同步進行，平民撤離通道受限。",
  "Red Sea": "商船航道風險提升，護航編隊增加，保險費率持續上調。",
  "Taiwan Strait": "高頻軍機與海上巡航活動增加，電子偵搜強度維持高檔。",
};

type FlightDotPath = {
  curve: THREE.QuadraticBezierCurve3;
  offset: number;
  speed: number;
  label: string;
  infoType: "航班分析" | "海運分析";
  mid: THREE.Vector3;
};

type GlobeProps = {
  transportMode: "default" | "flight" | "shipping" | "allTransport";
  autoRotate: boolean;
};

const SHIPPING_ROUTES = [
  { fromName: "Shanghai", from: [31.2, 121.5], toName: "Singapore", to: [1.3, 103.8] },
  { fromName: "Tokyo", from: [35.4, 139.7], toName: "Los Angeles", to: [34.0, -118.2] },
  { fromName: "Rotterdam", from: [51.9, 4.5], toName: "New York", to: [40.7, -74.0] },
  { fromName: "Hong Kong", from: [22.3, 114.2], toName: "Miami", to: [25.8, -80.2] },
];

export default function Globe({ transportMode, autoRotate }: GlobeProps) {
  const globeGroup = useRef<THREE.Group>(null);
  // 相容性保護：避免舊版快取 bundle 仍引用 cyberRing ref 時產生 runtime error
  const cyberRingARef = useRef<THREE.Mesh | null>(null);
  const cyberRingBRef = useRef<THREE.Mesh | null>(null);
  const flightDotsRef = useRef<Array<THREE.Mesh | null>>([]);
  const shippingDotsRef = useRef<Array<THREE.Mesh | null>>([]);
  const elapsedRef = useRef(0);
  const [hoverInfo, setHoverInfo] = useState<{
    title: string;
    detail: string;
    position: THREE.Vector3;
  } | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<{
    name: string;
    detail: string;
    position: THREE.Vector3;
    cameraPosition: THREE.Vector3;
  } | null>(null);
  const controls = useThree(
    (state) =>
      state.controls as unknown as
        | {
            target: THREE.Vector3;
            setLookAt: (
              px: number,
              py: number,
              pz: number,
              tx: number,
              ty: number,
              tz: number,
              enableTransition?: boolean
            ) => void;
          }
        | undefined
  );
  const camera = useThree((state) => state.camera);
  const selectedRegion = useTerminalStore((state) => state.selectedRegion);
  const focusCoordinates = useTerminalStore((state) => state.focusCoordinates);
  const setFocusCoordinates = useTerminalStore((state) => state.setFocusCoordinates);
  const defaultCameraPosition = useMemo(() => new THREE.Vector3(0, 0, 6), []);
  const defaultCameraTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const resetToDefaultView = useCallback(() => {
    setSelectedConflict(null);
    if (controls) {
      controls.setLookAt(
        defaultCameraPosition.x,
        defaultCameraPosition.y,
        defaultCameraPosition.z,
        defaultCameraTarget.x,
        defaultCameraTarget.y,
        defaultCameraTarget.z,
        true
      );
    } else {
      camera.position.copy(defaultCameraPosition);
      camera.lookAt(defaultCameraTarget);
    }
  }, [camera, controls, defaultCameraPosition, defaultCameraTarget]);

  useEffect(() => {
    if (!focusCoordinates || !controls) return;
    queueMicrotask(() => setSelectedConflict(null));
    const target = latLonToVec3(focusCoordinates.lat, focusCoordinates.lon, 2.7);
    const cameraPosition = target.clone().normalize().multiplyScalar(4.1);
    controls.setLookAt(
      cameraPosition.x,
      cameraPosition.y,
      cameraPosition.z,
      target.x,
      target.y,
      target.z,
      true
    );
    setFocusCoordinates(null);
  }, [controls, focusCoordinates, setFocusCoordinates]);

  // ----------------------------------------------------------------------
  // 計算邏輯：生成航線幾何體與動態點軌跡
  // ----------------------------------------------------------------------
  const { lines, dots } = useMemo(() => {
    const linesArr: THREE.BufferGeometry[] = [];
    const dotsArr: FlightDotPath[] = [];

    FLIGHT_ROUTES.forEach((route, index) => {
      const start = latLonToVec3(route.from[0], route.from[1], 2.5);
      const end = latLonToVec3(route.to[0], route.to[1], 2.5);
      
      // 計算拋物線中點：將向量相加取一半，向外推伸以產生弧度
      const mid = start.clone().add(end).divideScalar(2).normalize().multiplyScalar(3.2);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      
      linesArr.push(new THREE.BufferGeometry().setFromPoints(curve.getPoints(50)));
      // 以固定序號產生可重現的偏移與速度，避免渲染階段使用非純函式
      const offset = (index * 0.237) % 1;
      const speed = 0.05 + ((index * 0.113) % 0.05);
      dotsArr.push({
        curve,
        offset,
        speed,
        infoType: "航班分析",
        label: `${route.fromName} → ${route.toName}`,
        mid: curve.getPoint(0.5),
      });
    });

    return { lines: linesArr, dots: dotsArr };
  }, []);

  const { shippingLines, shippingDots } = useMemo(() => {
    const linesArr: THREE.BufferGeometry[] = [];
    const dotsArr: FlightDotPath[] = [];

    SHIPPING_ROUTES.forEach((route, index) => {
      const start = latLonToVec3(route.from[0], route.from[1], 2.5);
      const end = latLonToVec3(route.to[0], route.to[1], 2.5);
      const mid = start.clone().add(end).divideScalar(2).normalize().multiplyScalar(2.9);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

      linesArr.push(new THREE.BufferGeometry().setFromPoints(curve.getPoints(50)));
      const offset = (index * 0.193) % 1;
      const speed = 0.02 + ((index * 0.071) % 0.03);
      dotsArr.push({
        curve,
        offset,
        speed,
        infoType: "海運分析",
        label: `${route.fromName} → ${route.toName}`,
        mid: curve.getPoint(0.5),
      });
    });

    return { shippingLines: linesArr, shippingDots: dotsArr };
  }, []);

  const showFlight = transportMode === "default" || transportMode === "flight" || transportMode === "allTransport";
  const showShipping = transportMode === "shipping" || transportMode === "allTransport";
  const activeSelectedConflict = useMemo(() => {
    if (!selectedConflict) return null;
    const zone = CONFLICT_ZONES.find((item) => item.name === selectedConflict.name);
    if (!zone) return null;
    if (selectedRegion !== "global" && zone.region !== selectedRegion) return null;
    return selectedConflict;
  }, [selectedConflict, selectedRegion]);

  // ----------------------------------------------------------------------
  // 動畫循環：控制地球自轉與飛機移動
  // ----------------------------------------------------------------------
  useFrame((_, delta) => {
    elapsedRef.current += delta;
    const t = elapsedRef.current;
    if (globeGroup.current && autoRotate) globeGroup.current.rotation.y += 0.001;
    if (cyberRingARef.current || cyberRingBRef.current) {
      // no-op: keep refs live for backward-compatible hot updates
    }

    flightDotsRef.current.forEach((dot, i) => {
      if (!dot) return;
      const { curve, offset, speed } = dots[i];
      // 取小數部分實現無限循環 (0 -> 1 -> 0)
      const progress = (t * speed + offset) % 1;
      dot.position.copy(curve.getPoint(progress));
    });

    shippingDotsRef.current.forEach((dot, i) => {
      if (!dot) return;
      const { curve, offset, speed } = shippingDots[i];
      const progress = (t * speed + offset) % 1;
      dot.position.copy(curve.getPoint(progress));
    });

  });

  return (
    <group
      ref={globeGroup}
      onPointerMissed={() => {
        resetToDefaultView();
      }}
    >
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      
      {/* =========================================
          底層：地球主體、網格、大氣層
      ========================================= */}
      <mesh>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial
          color="#0b1022"
          emissive="#132850"
          emissiveIntensity={0.62}
          roughness={0.88}
          metalness={0.1}
          transparent
          opacity={0.95}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.505, 32, 16]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.17} />
      </mesh>

      <mesh scale={1.1}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          vertexShader={`varying vec3 vNormal; void main(){vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
          fragmentShader={`varying vec3 vNormal; void main(){float i=pow(0.75-dot(vNormal,vec3(0,0,1.0)),2.2); gl_FragColor=vec4(0.0,0.9,1.0,1.0)*i;}`}
        />
      </mesh>

      {/* =========================================
          圖層一：飛行航班 (藍色軌跡與亮點)
      ========================================= */}
      {showFlight && (
        <group name="FlightLayer">
          {lines.map((geo, i) => (
            <line key={`flight-line-${i}`}>
              <primitive object={geo} attach="geometry" />
              <lineBasicMaterial color="#00e5ff" transparent opacity={0.4} />
            </line>
          ))}

          {dots.map((_, i) => (
            <mesh
              key={`flight-dot-${i}`}
              ref={(el) => {
                flightDotsRef.current[i] = el;
              }}
            >
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#22d3ee" />
            </mesh>
          ))}

          {dots.map((item, i) => (
            <mesh
              key={`flight-marker-${i}`}
              position={item.mid}
              onPointerOver={() =>
                setHoverInfo({
                  title: item.infoType,
                  detail: item.label,
                  position: item.mid.clone().multiplyScalar(1.03),
                })
              }
              onPointerOut={() => setHoverInfo(null)}
            >
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshBasicMaterial color="#67e8f9" transparent opacity={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {showShipping && (
        <group name="ShippingLayer">
          {shippingLines.map((geo, i) => (
            <line key={`shipping-line-${i}`}>
              <primitive object={geo} attach="geometry" />
              <lineBasicMaterial color="#ff4ecd" transparent opacity={0.48} />
            </line>
          ))}

          {shippingDots.map((_, i) => (
            <mesh
              key={`shipping-dot-${i}`}
              ref={(el) => {
                shippingDotsRef.current[i] = el;
              }}
            >
              <boxGeometry args={[0.03, 0.03, 0.03]} />
              <meshBasicMaterial color="#ff4ecd" />
            </mesh>
          ))}

          {shippingDots.map((item, i) => (
            <mesh
              key={`shipping-marker-${i}`}
              position={item.mid}
              onPointerOver={() =>
                setHoverInfo({
                  title: item.infoType,
                  detail: item.label,
                  position: item.mid.clone().multiplyScalar(1.03),
                })
              }
              onPointerOut={() => setHoverInfo(null)}
            >
              <octahedronGeometry args={[0.06, 0]} />
              <meshBasicMaterial color="#ff6bd6" transparent opacity={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {/* =========================================
          圖層二：衝突熱點 (紅色發光警示標記)
      ========================================= */}
      <group name="ConflictLayer">
        {CONFLICT_ZONES.map((zone, i) => {
          const isRegionVisible = selectedRegion === "global" || selectedRegion === zone.region;
          if (!isRegionVisible) return null;
          const isCritical = zone.tier === 1;
          const color = isCritical ? "#f87171" : "#f5a524"; // 1級紅色，2級橘色

          return (
            <group
              key={`conflict-${i}`}
              position={latLonToVec3(zone.lat, zone.lon, 2.51)}
              onPointerOver={() =>
                setHoverInfo({
                  title: "戰爭衝突資訊",
                  detail: zone.name,
                  position: latLonToVec3(zone.lat, zone.lon, 2.7),
                })
              }
              onPointerOut={() => setHoverInfo(null)}
              onClick={(event) => {
                event.stopPropagation();
                const focus = latLonToVec3(zone.lat, zone.lon, 2.7);
                const cameraPosition = focus.clone().normalize().multiplyScalar(4.1);
                setSelectedConflict({
                  name: zone.name,
                  detail: CONFLICT_DETAILS[zone.name] ?? "目前戰區情報更新中。",
                  position: focus,
                  cameraPosition,
                });
                controls?.setLookAt(
                  cameraPosition.x,
                  cameraPosition.y,
                  cameraPosition.z,
                  focus.x,
                  focus.y,
                  focus.z,
                  true
                );
              }}
            >
              {/* 核心光點 */}
              <mesh>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshBasicMaterial color={color} />
              </mesh>
              {/* 外圍發光暈圈 */}
              <mesh>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial 
                  color={color} 
                  transparent 
                  opacity={0.5} 
                  blending={THREE.AdditiveBlending} 
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* =========================================
          場景燈光
      ========================================= */}
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 2, 4]} intensity={1.2} color="#00e5ff" />
      <pointLight position={[-4, -1, -3]} intensity={0.8} color="#ff4ecd" />
      <directionalLight position={[5, 3, 5]} intensity={0.8} />

      {hoverInfo && (
        <Html position={hoverInfo.position} center>
          <div className="bg-[#020617]/95 border border-cyan-400/40 rounded-md px-2 py-1.5 text-[10px] shadow-[0_0_20px_rgba(0,229,255,0.25)] min-w-[150px] pointer-events-none">
            <div className="text-cyan-300 font-bold">{hoverInfo.title}</div>
            <div className="text-fuchsia-200 mt-0.5">{hoverInfo.detail}</div>
          </div>
        </Html>
      )}

      {activeSelectedConflict && (
        <Html position={activeSelectedConflict.position.clone().multiplyScalar(1.03)} center>
          <div className="w-[240px] bg-[#050816]/96 border border-fuchsia-400/40 rounded-lg px-3 py-2.5 text-[10px] shadow-[0_0_24px_rgba(255,78,205,0.22)]">
            <div className="text-fuchsia-300 font-bold tracking-wide">{activeSelectedConflict.name}</div>
            <div className="text-[9px] text-cyan-200/70 mt-0.5">戰區焦點簡報</div>
            <div className="text-cyan-100/90 mt-1.5 leading-relaxed whitespace-normal break-words">
              {activeSelectedConflict.detail}
            </div>
            <button
              type="button"
              onClick={resetToDefaultView}
              className="mt-2 text-[9px] px-2 py-1 rounded bg-white/10 text-gray-200 hover:bg-white/20 w-full"
            >
              關閉聚焦
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
