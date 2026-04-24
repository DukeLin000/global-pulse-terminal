"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

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
  { from: [25.0, 121.5], to: [40.7, -74.0] }, // Taipei -> New York
  { from: [51.5, -0.1], to: [25.2, 55.3] },   // London -> Dubai
  { from: [35.6, 139.6], to: [48.8, 2.3] },   // Tokyo -> Paris
  { from: [37.7, -122.4], to: [22.3, 114.2] },// SF -> Hong Kong
];

// ----------------------------------------------------------------------
// 2. 獨立的資料集：衝突熱點 (Conflict Zones)
// ----------------------------------------------------------------------
const CONFLICT_ZONES = [
  { name: "Ukraine", lat: 48.3, lon: 31.1, tier: 1 },
  { name: "Gaza", lat: 31.5, lon: 34.4, tier: 1 },
  { name: "Red Sea", lat: 15.5, lon: 41.8, tier: 2 },
  { name: "Taiwan Strait", lat: 24.0, lon: 119.0, tier: 2 },
];

type FlightDotPath = {
  curve: THREE.QuadraticBezierCurve3;
  offset: number;
  speed: number;
};

type GlobeProps = {
  transportMode: "default" | "flight" | "shipping" | "allTransport";
};

const SHIPPING_ROUTES = [
  { from: [31.2, 121.5], to: [1.3, 103.8] },   // Shanghai -> Singapore
  { from: [35.4, 139.7], to: [34.0, -118.2] }, // Tokyo -> Los Angeles
  { from: [51.9, 4.5], to: [40.7, -74.0] },    // Rotterdam -> New York
  { from: [22.3, 114.2], to: [25.8, -80.2] },  // Hong Kong -> Miami
];

export default function Globe({ transportMode }: GlobeProps) {
  const globeGroup = useRef<THREE.Group>(null);
  const flightDotsRef = useRef<Array<THREE.Mesh | null>>([]);
  const shippingDotsRef = useRef<Array<THREE.Mesh | null>>([]);

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
      dotsArr.push({ curve, offset, speed });
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
      dotsArr.push({ curve, offset, speed });
    });

    return { shippingLines: linesArr, shippingDots: dotsArr };
  }, []);

  const showFlight = transportMode === "default" || transportMode === "flight" || transportMode === "allTransport";
  const showShipping = transportMode === "shipping" || transportMode === "allTransport";

  // ----------------------------------------------------------------------
  // 動畫循環：控制地球自轉與飛機移動
  // ----------------------------------------------------------------------
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (globeGroup.current) globeGroup.current.rotation.y += 0.001;

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
    <group ref={globeGroup}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      
      {/* =========================================
          底層：地球主體、網格、大氣層
      ========================================= */}
      <mesh>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshPhongMaterial 
          color="#0a1428" emissive="#020510" specular="#112244" 
          shininess={10} transparent opacity={0.9} 
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.505, 32, 16]} />
        <meshBasicMaterial color="#3060a0" wireframe transparent opacity={0.15} />
      </mesh>

      <mesh scale={1.1}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          vertexShader={`varying vec3 vNormal; void main(){vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
          fragmentShader={`varying vec3 vNormal; void main(){float i=pow(0.7-dot(vNormal,vec3(0,0,1.0)),2.5); gl_FragColor=vec4(0.4,0.7,1.0,1.0)*i;}`}
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
              <lineBasicMaterial color="#64b4ff" transparent opacity={0.25} />
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
              <meshBasicMaterial color="#88e0ff" />
            </mesh>
          ))}
        </group>
      )}

      {showShipping && (
        <group name="ShippingLayer">
          {shippingLines.map((geo, i) => (
            <line key={`shipping-line-${i}`}>
              <primitive object={geo} attach="geometry" />
              <lineBasicMaterial color="#34d399" transparent opacity={0.3} />
            </line>
          ))}

          {shippingDots.map((_, i) => (
            <mesh
              key={`shipping-dot-${i}`}
              ref={(el) => {
                shippingDotsRef.current[i] = el;
              }}
            >
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshBasicMaterial color="#6ee7b7" />
            </mesh>
          ))}
        </group>
      )}

      {/* =========================================
          圖層二：衝突熱點 (紅色發光警示標記)
      ========================================= */}
      <group name="ConflictLayer">
        {CONFLICT_ZONES.map((zone, i) => {
          const isCritical = zone.tier === 1;
          const color = isCritical ? "#f87171" : "#f5a524"; // 1級紅色，2級橘色

          return (
            <group key={`conflict-${i}`} position={latLonToVec3(zone.lat, zone.lon, 2.51)}>
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
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
    </group>
  );
}
