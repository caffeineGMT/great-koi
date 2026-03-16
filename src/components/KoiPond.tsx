"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Wish } from "@/app/page";

interface KoiProps {
  color: string;
  speed: number;
  offset: number;
  size: number;
}

function Koi({ color, speed, offset, size }: KoiProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(offset);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta * speed;

    const t = time.current;
    const radius = 2 + Math.sin(t * 0.3) * 1.5;
    const x = Math.cos(t * 0.4 + offset) * radius;
    const z = Math.sin(t * 0.3 + offset) * radius * 0.7;

    meshRef.current.position.set(x, 0.05, z);

    const nextX = Math.cos((t + 0.05) * 0.4 + offset) * radius;
    const nextZ = Math.sin((t + 0.05) * 0.3 + offset) * radius * 0.7;
    const angle = Math.atan2(nextZ - z, nextX - x);
    meshRef.current.rotation.y = -angle + Math.PI / 2;

    // Gentle bobbing
    meshRef.current.position.y = 0.05 + Math.sin(t * 2) * 0.02;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.05, 0]}>
      {/* Body */}
      <sphereGeometry args={[size, 12, 8]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.1}
        transparent
        opacity={0.9}
      />
    </mesh>
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
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta;
    meshRef.current.position.y = -0.1 + Math.sin(time.current * 1.5) * 0.05;
    const scale = 0.8 + Math.sin(time.current * 2) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  const x = (wish.x - 0.5) * 6;
  const z = (wish.y - 0.5) * 6;

  return (
    <mesh ref={meshRef} position={[x, -0.1, z]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color="#d4a855"
        emissive="#d4a855"
        emissiveIntensity={0.5}
        transparent
        opacity={0.7}
        roughness={0.2}
      />
    </mesh>
  );
}

function LilyPad({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(Math.random() * 10);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta;
    meshRef.current.position.y = 0.06 + Math.sin(time.current * 0.8) * 0.01;
    meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.4, 24]} />
      <meshStandardMaterial
        color="#2d5a3d"
        roughness={0.6}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Scene({ wishes }: { wishes: Wish[] }) {
  const koiConfigs = useMemo<KoiProps[]>(
    () => [
      { color: "#e87040", speed: 0.6, offset: 0, size: 0.18 },
      { color: "#f0ebe0", speed: 0.5, offset: 2, size: 0.15 },
      { color: "#c44040", speed: 0.7, offset: 4, size: 0.2 },
      { color: "#d4a855", speed: 0.45, offset: 6, size: 0.16 },
      { color: "#e87040", speed: 0.55, offset: 8, size: 0.14 },
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
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} color="#e8dcc8" />
      <pointLight position={[0, 2, 0]} intensity={0.3} color="#d4a855" />

      <WaterSurface />

      {/* Pond bottom */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#061020" />
      </mesh>

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
      >
        <Scene wishes={wishes} />
      </Canvas>
    </div>
  );
}
