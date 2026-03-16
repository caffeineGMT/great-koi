"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Wish } from "@/app/page";

interface KoiProps {
  bodyColor: string;
  accentColor: string;
  speed: number;
  offset: number;
  size: number;
}

function Koi({ bodyColor, accentColor, speed, offset, size }: KoiProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const finLRef = useRef<THREE.Mesh>(null);
  const finRRef = useRef<THREE.Mesh>(null);
  const time = useRef(offset);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    time.current += delta * speed;
    const t = time.current;

    const radius = 2 + Math.sin(t * 0.3) * 1.5;
    const x = Math.cos(t * 0.4 + offset) * radius;
    const z = Math.sin(t * 0.3 + offset) * radius * 0.7;

    groupRef.current.position.set(x, 0.05 + Math.sin(t * 2) * 0.02, z);

    const nextX = Math.cos((t + 0.05) * 0.4 + offset) * radius;
    const nextZ = Math.sin((t + 0.05) * 0.3 + offset) * radius * 0.7;
    const angle = Math.atan2(nextZ - z, nextX - x);
    groupRef.current.rotation.y = -angle + Math.PI / 2;

    // Tail wag
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 6) * 0.4;
    }
    // Fin flutter
    if (finLRef.current) {
      finLRef.current.rotation.z = -0.3 + Math.sin(t * 4) * 0.15;
    }
    if (finRRef.current) {
      finRRef.current.rotation.z = 0.3 - Math.sin(t * 4) * 0.15;
    }
  });

  const s = size;

  return (
    <group ref={groupRef}>
      {/* Main body - elongated ellipsoid */}
      <mesh>
        <sphereGeometry args={[s, 16, 12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh scale={[1.6, 0.7, 0.85]}>
        <sphereGeometry args={[s, 16, 12]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.3}
          metalness={0.15}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Head bump */}
      <mesh position={[0, s * 0.15, s * 1.2]}>
        <sphereGeometry args={[s * 0.55, 12, 10]} />
        <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Accent patches */}
      <mesh position={[s * 0.3, s * 0.2, s * 0.3]} scale={[0.8, 0.5, 1]}>
        <sphereGeometry args={[s * 0.5, 10, 8]} />
        <meshStandardMaterial color={accentColor} roughness={0.35} transparent opacity={0.7} />
      </mesh>
      <mesh position={[-s * 0.2, s * 0.2, -s * 0.2]} scale={[0.6, 0.4, 0.7]}>
        <sphereGeometry args={[s * 0.45, 10, 8]} />
        <meshStandardMaterial color={accentColor} roughness={0.35} transparent opacity={0.6} />
      </mesh>

      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0, -s * 1.6]}>
        <coneGeometry args={[s * 0.6, s * 1.2, 6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Dorsal fin */}
      <mesh position={[0, s * 0.6, -s * 0.2]} rotation={[0.3, 0, 0]} scale={[0.15, 1, 1]}>
        <coneGeometry args={[s * 0.5, s * 0.8, 4]} />
        <meshStandardMaterial color={accentColor} roughness={0.4} transparent opacity={0.7} />
      </mesh>

      {/* Left pectoral fin */}
      <mesh ref={finLRef} position={[s * 0.6, -s * 0.1, s * 0.4]} rotation={[0, 0, -0.3]} scale={[1, 0.15, 0.8]}>
        <sphereGeometry args={[s * 0.35, 8, 6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} transparent opacity={0.7} />
      </mesh>

      {/* Right pectoral fin */}
      <mesh ref={finRRef} position={[-s * 0.6, -s * 0.1, s * 0.4]} rotation={[0, 0, 0.3]} scale={[1, 0.15, 0.8]}>
        <sphereGeometry args={[s * 0.35, 8, 6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} transparent opacity={0.7} />
      </mesh>

      {/* Eyes */}
      <mesh position={[s * 0.35, s * 0.25, s * 1.4]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.2} />
      </mesh>
      <mesh position={[-s * 0.35, s * 0.25, s * 1.4]}>
        <sphereGeometry args={[s * 0.08, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.2} />
      </mesh>
    </group>
  );
}

function WaterSurface() {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 64, 64);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta;

    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y =
        Math.sin(x * 0.5 + time.current * 0.8) * 0.03 +
        Math.cos(z * 0.4 + time.current * 0.6) * 0.03 +
        Math.sin((x + z) * 0.3 + time.current * 0.5) * 0.02;
      positions.setY(i, y);
    }
    positions.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#1a3a5c"
        transparent
        opacity={0.85}
        roughness={0.1}
        metalness={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function WishOrb({ wish }: { wish: Wish }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta;
    meshRef.current.position.y = -0.1 + Math.sin(time.current * 1.5) * 0.05;
    const scale = 0.8 + Math.sin(time.current * 2) * 0.1;
    meshRef.current.scale.setScalar(scale);
    if (glowRef.current) {
      glowRef.current.position.y = meshRef.current.position.y;
      glowRef.current.scale.setScalar(scale * 1.8);
    }
  });

  const x = (wish.x - 0.5) * 6;
  const z = (wish.y - 0.5) * 6;

  return (
    <group>
      {/* Glow */}
      <mesh ref={glowRef} position={[x, -0.1, z]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#d4a855"
          emissive="#d4a855"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
        />
      </mesh>
      {/* Core */}
      <mesh ref={meshRef} position={[x, -0.1, z]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#e8c878"
          emissive="#d4a855"
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

function LilyPad({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(Math.random() * 10);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    time.current += delta;
    groupRef.current.position.y = position[1] + Math.sin(time.current * 0.8) * 0.01;
    groupRef.current.rotation.y += delta * 0.03;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 24]} />
        <meshStandardMaterial color="#2d5a3d" roughness={0.6} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Flower (on some pads) */}
      {Math.random() > 0.5 && (
        <mesh position={[0.1, 0.08, 0]} rotation={[-Math.PI / 4, 0, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#e8a0b0" emissive="#e8a0b0" emissiveIntensity={0.2} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

function Scene({ wishes }: { wishes: Wish[] }) {
  const koiConfigs = useMemo<KoiProps[]>(
    () => [
      { bodyColor: "#e87040", accentColor: "#f0ebe0", speed: 0.6, offset: 0, size: 0.18 },
      { bodyColor: "#f0ebe0", accentColor: "#c44040", speed: 0.5, offset: 2, size: 0.15 },
      { bodyColor: "#c44040", accentColor: "#d4a855", speed: 0.7, offset: 4, size: 0.2 },
      { bodyColor: "#d4a855", accentColor: "#e87040", speed: 0.45, offset: 6, size: 0.16 },
      { bodyColor: "#e87040", accentColor: "#d4a855", speed: 0.55, offset: 8, size: 0.14 },
      { bodyColor: "#f0ebe0", accentColor: "#e87040", speed: 0.4, offset: 10, size: 0.17 },
      { bodyColor: "#1a1a1a", accentColor: "#d4a855", speed: 0.65, offset: 12, size: 0.19 },
    ],
    []
  );

  const lilyPositions = useMemo<[number, number, number][]>(
    () => [
      [-3.5, 0.06, -2],
      [3, 0.06, -3],
      [-2, 0.06, 3.5],
      [4, 0.06, 2],
      [-4, 0.06, 1],
      [1, 0.06, -4],
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 5]} intensity={0.5} color="#e8dcc8" />
      <pointLight position={[0, 3, 0]} intensity={0.2} color="#d4a855" distance={15} />
      <pointLight position={[-3, 1, 2]} intensity={0.1} color="#4488aa" distance={8} />
      <pointLight position={[3, 1, -2]} intensity={0.1} color="#4488aa" distance={8} />

      <WaterSurface />

      {/* Pond bottom with subtle texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#061020" roughness={0.9} />
      </mesh>

      {/* Underwater rocks */}
      {[[-2, -0.35, 1], [3, -0.4, -1], [-1, -0.38, -3], [2.5, -0.42, 3]].map((pos, i) => (
        <mesh key={`rock-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.2 + Math.random() * 0.15, 8, 6]} />
          <meshStandardMaterial color="#1a2a3a" roughness={0.9} />
        </mesh>
      ))}

      {koiConfigs.map((koi, i) => (
        <Koi key={i} {...koi} />
      ))}

      {lilyPositions.map((pos, i) => (
        <LilyPad key={i} position={pos} />
      ))}

      {wishes.map((wish) => (
        <WishOrb key={wish.id} wish={wish} />
      ))}
    </>
  );
}

interface KoiPondProps {
  wishes: Wish[];
  onPondClick: () => void;
}

export default function KoiPond({ wishes, onPondClick }: KoiPondProps) {
  const handleClick = useCallback(() => {
    onPondClick();
  }, [onPondClick]);

  return (
    <div
      className="absolute inset-0 pond-gradient cursor-pointer"
      onClick={handleClick}
    >
      <Canvas
        camera={{ position: [0, 6, 6], fov: 50, near: 0.1, far: 100 }}
        style={{ touchAction: "none" }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Scene wishes={wishes} />
      </Canvas>
    </div>
  );
}
