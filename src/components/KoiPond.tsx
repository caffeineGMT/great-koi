"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Wish } from "@/app/page";
import type { PondTheme } from "@/hooks/usePondTheme";
import { waterVertexShader, waterFragmentShader } from "@/shaders/water";

// ─── Procedural Koi Fish ─────────────────────────────────────────

interface KoiConfig {
  bodyColor: string;
  accentColor: string;
  speed: number;
  offset: number;
  size: number;
  pathRadius: number;
}

function createKoiGeometry(size: number): THREE.BufferGeometry {
  const segments = 24;
  const radialSegments = 12;
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const bodyPositions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments; // 0 = nose, 1 = tail tip
    // Fish profile: fat in the middle, tapered at both ends
    let radius: number;
    if (t < 0.15) {
      // Head taper
      radius = size * (0.3 + t * 3.5) * 0.55;
    } else if (t < 0.6) {
      // Body (widest)
      radius = size * 0.85 * (1.0 - (t - 0.35) * (t - 0.35) * 1.5);
    } else {
      // Tail taper
      const tailT = (t - 0.6) / 0.4;
      radius = size * 0.5 * (1.0 - tailT * 0.85);
    }

    // Flatten slightly (fish are taller than wide)
    const bodyLength = size * 3.5;
    const z = -t * bodyLength + bodyLength * 0.3; // center the fish

    for (let j = 0; j <= radialSegments; j++) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.65; // flatten vertically

      vertices.push(x, y, z);

      // Simple normal
      const nx = Math.cos(angle);
      const ny = Math.sin(angle) * 0.65;
      const len = Math.sqrt(nx * nx + ny * ny);
      normals.push(nx / len, ny / len, 0);

      uvs.push(j / radialSegments, t);
      bodyPositions.push(t);
    }
  }

  // Indices
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = a + radialSegments + 1;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  // Tail fin (fan shape)
  const tailCenter = vertices.length / 3;
  const tailZ = -size * 3.5 + size * 3.5 * 0.3;
  const tailSpread = size * 1.2;
  const tailLength = size * 1.0;

  // Center vertex
  vertices.push(0, 0, tailZ);
  normals.push(0, 1, 0);
  uvs.push(0.5, 1);
  bodyPositions.push(1.0);

  // Fan vertices
  const tailFanSegments = 8;
  for (let i = 0; i <= tailFanSegments; i++) {
    const ft = i / tailFanSegments;
    const angle = (ft - 0.5) * Math.PI * 0.8;
    const x = Math.sin(angle) * tailSpread;
    const y = Math.cos(angle) * tailSpread * 0.3;
    const z2 = tailZ - tailLength;
    vertices.push(x, y, z2);
    normals.push(0, 1, 0);
    uvs.push(ft, 1);
    bodyPositions.push(1.0);
  }

  for (let i = 0; i < tailFanSegments; i++) {
    indices.push(
      tailCenter,
      tailCenter + 1 + i,
      tailCenter + 1 + i + 1
    );
  }

  // Dorsal fin
  const dorsalStart = Math.floor(segments * 0.2);
  const dorsalEnd = Math.floor(segments * 0.55);
  const dorsalCenter = vertices.length / 3;
  for (let i = dorsalStart; i <= dorsalEnd; i++) {
    const t = i / segments;
    const bodyLength2 = size * 3.5;
    const z3 = -t * bodyLength2 + bodyLength2 * 0.3;
    const finHeight = size * 0.6 * Math.sin(((t - 0.2) / 0.35) * Math.PI);

    // Base (on body top)
    vertices.push(0, size * 0.55 * 0.65, z3);
    normals.push(1, 0, 0);
    uvs.push(0.5, t);
    bodyPositions.push(t);

    // Tip
    vertices.push(0, size * 0.55 * 0.65 + finHeight, z3);
    normals.push(1, 0.5, 0);
    uvs.push(0.5, t);
    bodyPositions.push(t);
  }

  const dorsalVerts = dorsalEnd - dorsalStart;
  for (let i = 0; i < dorsalVerts; i++) {
    const base = dorsalCenter + i * 2;
    indices.push(base, base + 1, base + 2);
    indices.push(base + 1, base + 3, base + 2);
  }

  // Pectoral fins (small side fins)
  for (const side of [-1, 1]) {
    const finBase = vertices.length / 3;
    const finZ = size * 3.5 * 0.3 - size * 3.5 * 0.25;
    const finX = side * size * 0.5;

    // 3 vertices per fin
    vertices.push(finX, -size * 0.1, finZ);
    normals.push(0, -1, 0);
    uvs.push(0.5, 0.25);
    bodyPositions.push(0.25);

    vertices.push(finX + side * size * 0.8, -size * 0.25, finZ - size * 0.3);
    normals.push(0, -1, 0);
    uvs.push(0.5, 0.25);
    bodyPositions.push(0.3);

    vertices.push(finX + side * size * 0.3, -size * 0.15, finZ - size * 0.6);
    normals.push(0, -1, 0);
    uvs.push(0.5, 0.3);
    bodyPositions.push(0.35);

    indices.push(finBase, finBase + 1, finBase + 2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("aBodyPosition", new THREE.Float32BufferAttribute(bodyPositions, 1));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function Koi({ bodyColor, accentColor, speed, offset, size, pathRadius }: KoiConfig) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const time = useRef(offset);

  const geometry = useMemo(() => createKoiGeometry(size), [size]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uSize: { value: size },
      uBodyColor: { value: new THREE.Color(bodyColor) },
      uAccentColor: { value: new THREE.Color(accentColor) },
    }),
    [speed, size, bodyColor, accentColor]
  );

  useFrame((_, delta) => {
    if (!groupRef.current || !materialRef.current) return;
    time.current += delta * speed;
    const t = time.current;

    materialRef.current.uniforms.uTime.value = t;

    // Organic swimming path with figure-8-like movement
    const r = pathRadius + Math.sin(t * 0.2) * 1.0;
    const x = Math.cos(t * 0.35 + offset) * r;
    const z = Math.sin(t * 0.25 + offset) * r * 0.7 + Math.sin(t * 0.5 + offset) * 0.5;

    groupRef.current.position.set(x, 0.04 + Math.sin(t * 1.5) * 0.015, z);

    // Face direction of travel
    const dt = 0.02;
    const nx = Math.cos((t + dt) * 0.35 + offset) * r;
    const nz =
      Math.sin((t + dt) * 0.25 + offset) * r * 0.7 +
      Math.sin((t + dt) * 0.5 + offset) * 0.5;
    const angle = Math.atan2(nz - z, nx - x);
    groupRef.current.rotation.y = -angle + Math.PI / 2;

    // Slight banking on turns
    const turnRate = Math.sin(t * 0.35 + offset) * 0.15;
    groupRef.current.rotation.z = turnRate;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={`
            uniform float uTime;
            uniform float uSpeed;
            uniform float uSize;
            varying vec2 vUv;
            varying float vBodyPos;
            varying vec3 vNormal;
            attribute float aBodyPosition;
            void main() {
              vUv = uv;
              vBodyPos = aBodyPosition;
              vNormal = normalize(normalMatrix * normal);
              vec3 pos = position;
              float wave = sin(uTime * uSpeed * 6.0 + aBodyPosition * 4.5) * aBodyPosition * 0.25 * uSize;
              pos.x += wave;
              pos.y += sin(uTime * uSpeed * 2.0) * 0.015;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 uBodyColor;
            uniform vec3 uAccentColor;
            uniform float uTime;
            varying vec2 vUv;
            varying float vBodyPos;
            varying vec3 vNormal;
            void main() {
              float pattern = smoothstep(0.25, 0.75, sin(vUv.x * 5.0 + vBodyPos * 2.5) * 0.5 + 0.5);
              float spot1 = smoothstep(0.35, 0.3, length(vUv - vec2(0.35, 0.5)));
              float spot2 = smoothstep(0.25, 0.2, length(vUv - vec2(0.7, 0.45)));
              vec3 color = mix(uBodyColor, uAccentColor, pattern * 0.5 + spot1 * 0.7 + spot2 * 0.5);
              float iri = sin(vBodyPos * 8.0 + uTime * 0.4) * 0.04;
              color += vec3(iri, iri * 0.3, -iri * 0.5);
              vec3 lightDir = normalize(vec3(0.4, 1.0, 0.3));
              float diffuse = max(dot(vNormal, lightDir), 0.0);
              float sss = max(dot(-vNormal, lightDir), 0.0) * 0.12;
              color *= 0.45 + diffuse * 0.45 + sss;
              float sheen = pow(max(dot(vNormal, vec3(0.0, 1.0, 0.0)), 0.0), 12.0) * 0.25;
              color += sheen;
              color *= 1.0 - vBodyPos * 0.12;
              gl_FragColor = vec4(color, 0.95 - vBodyPos * 0.08);
            }
          `}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Shader Water Surface ─────────────────────────────────────────

function Water({ theme }: { theme: PondTheme }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 128, 128);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWaterColor: { value: new THREE.Color(theme.waterColor) },
      uDeepColor: { value: new THREE.Color(theme.deepColor) },
      uLightColor: { value: new THREE.Color(theme.lightColor) },
    }),
    [theme.waterColor, theme.deepColor, theme.lightColor]
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={waterVertexShader}
        fragmentShader={waterFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Light Beams (volumetric rays) ────────────────────────────────

function LightBeams({ theme }: { theme: PondTheme }) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  const beams = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      x: (i - 2) * 2.5 + (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 6,
      width: 0.3 + Math.random() * 0.4,
      speed: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((_, delta) => {
    time.current += delta;
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const beam = beams[i];
      const mesh = child as THREE.Mesh;
      const opacity = 0.04 + Math.sin(time.current * beam.speed + beam.phase) * 0.03;
      (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, opacity);
    });
  });

  return (
    <group ref={groupRef}>
      {beams.map((beam, i) => (
        <mesh
          key={i}
          position={[beam.x, 1.5, beam.z]}
          rotation={[0, 0, (Math.random() - 0.5) * 0.3]}
        >
          <planeGeometry args={[beam.width, 4]} />
          <meshBasicMaterial
            color={theme.lightColor}
            transparent
            opacity={0.04}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Floating Petals ──────────────────────────────────────────────

function FloatingPetals() {
  const count = 15;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const time = useRef(0);

  const offsets = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 10,
        speed: 0.1 + Math.random() * 0.2,
        rotSpeed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        scale: 0.03 + Math.random() * 0.04,
      })),
    []
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta;

    for (let i = 0; i < count; i++) {
      const o = offsets[i];
      const t = time.current;
      dummy.position.set(
        o.x + Math.sin(t * o.speed + o.phase) * 0.5,
        0.08 + Math.sin(t * 0.8 + o.phase) * 0.01,
        o.z + Math.cos(t * o.speed * 0.7 + o.phase) * 0.3
      );
      dummy.rotation.set(
        -Math.PI / 2 + Math.sin(t * 0.5 + o.phase) * 0.1,
        t * o.rotSpeed,
        0
      );
      dummy.scale.setScalar(o.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <circleGeometry args={[1, 6]} />
      <meshStandardMaterial
        color="#f0c0c8"
        emissive="#e8a0b0"
        emissiveIntensity={0.15}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ─── Wish Orbs with glow ──────────────────────────────────────────

function WishOrb({ wish }: { wish: Wish }) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(Math.random() * 10);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    time.current += delta;
    const t = time.current;
    groupRef.current.position.y = -0.08 + Math.sin(t * 1.2) * 0.04;
    const s = 0.85 + Math.sin(t * 2) * 0.15;
    groupRef.current.scale.setScalar(s);
  });

  const x = (wish.x - 0.5) * 6;
  const z = (wish.y - 0.5) * 6;

  return (
    <group ref={groupRef} position={[x, -0.08, z]}>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial
          color="#d4a855"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color="#e8c878"
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#fff8e0"
          emissive="#d4a855"
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// ─── Lily Pads ────────────────────────────────────────────────────

function LilyPad({
  position,
  hasFlower,
}: {
  position: [number, number, number];
  hasFlower: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(Math.random() * 10);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    time.current += delta;
    groupRef.current.position.y =
      position[1] + Math.sin(time.current * 0.6) * 0.008;
    groupRef.current.rotation.y += delta * 0.02;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Pad - slightly concave */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.45, 24, 1, 0, Math.PI * 1.85]} />
        <meshStandardMaterial
          color="#1a4a2a"
          roughness={0.7}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Vein lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.04, 0.42, 8, 1, 0, Math.PI * 1.85]} />
        <meshBasicMaterial
          color="#2d6a3d"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
      {hasFlower && (
        <group position={[0.15, 0.06, 0]}>
          {/* Petals */}
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 5) * Math.PI * 2) * 0.06,
                0,
                Math.sin((i / 5) * Math.PI * 2) * 0.06,
              ]}
              rotation={[-Math.PI / 3, 0, (i / 5) * Math.PI * 2]}
            >
              <sphereGeometry args={[0.04, 6, 4]} />
              <meshStandardMaterial
                color="#f0b8c8"
                emissive="#e890a8"
                emissiveIntensity={0.1}
                roughness={0.6}
              />
            </mesh>
          ))}
          {/* Center */}
          <mesh position={[0, 0.02, 0]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial
              color="#e8d040"
              emissive="#e8c020"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ─── Underwater Pebbles ───────────────────────────────────────────

function Pebbles() {
  const count = 30;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pebbles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 12,
        z: (Math.random() - 0.5) * 12,
        scale: 0.05 + Math.random() * 0.15,
        ry: Math.random() * Math.PI,
      })),
    []
  );

  useMemo(() => {
    // This runs once to set initial positions
    if (!meshRef.current) return;
    pebbles.forEach((p, i) => {
      dummy.position.set(p.x, -0.48, p.z);
      dummy.rotation.set(0, p.ry, 0);
      dummy.scale.set(p.scale, p.scale * 0.5, p.scale * 0.8);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [pebbles, dummy]);

  // Set matrices on first frame
  useFrame(() => {
    if (!meshRef.current) return;
    if (!(meshRef.current as unknown as { _initialized?: boolean })._initialized) {
      pebbles.forEach((p, i) => {
        dummy.position.set(p.x, -0.48, p.z);
        dummy.rotation.set(0, p.ry, 0);
        dummy.scale.set(p.scale, p.scale * 0.5, p.scale * 0.8);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      (meshRef.current as unknown as { _initialized: boolean })._initialized = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#1a2a35" roughness={0.9} />
    </instancedMesh>
  );
}

// ─── Scene Composition ────────────────────────────────────────────

function Scene({ wishes, theme }: { wishes: Wish[]; theme: PondTheme }) {
  const koiConfigs = useMemo<KoiConfig[]>(
    () => [
      { bodyColor: "#e87040", accentColor: "#f0ebe0", speed: 0.55, offset: 0, size: 0.14, pathRadius: 2.5 },
      { bodyColor: "#f0ebe0", accentColor: "#c44040", speed: 0.45, offset: 1.8, size: 0.12, pathRadius: 3.0 },
      { bodyColor: "#c44040", accentColor: "#d4a855", speed: 0.6, offset: 3.5, size: 0.16, pathRadius: 2.0 },
      { bodyColor: "#d4a855", accentColor: "#e87040", speed: 0.4, offset: 5.2, size: 0.13, pathRadius: 3.5 },
      { bodyColor: "#e87040", accentColor: "#d4a855", speed: 0.5, offset: 7.0, size: 0.11, pathRadius: 2.8 },
      { bodyColor: "#f0ebe0", accentColor: "#e87040", speed: 0.35, offset: 9.0, size: 0.15, pathRadius: 3.2 },
      { bodyColor: "#1a1a2a", accentColor: "#d4a855", speed: 0.58, offset: 11.0, size: 0.17, pathRadius: 2.2 },
    ],
    []
  );

  const lilyPads = useMemo(
    () => [
      { pos: [-3.5, 0.065, -2] as [number, number, number], flower: true },
      { pos: [3.2, 0.065, -3.2] as [number, number, number], flower: false },
      { pos: [-2.2, 0.065, 3.8] as [number, number, number], flower: true },
      { pos: [4.2, 0.065, 2.2] as [number, number, number], flower: false },
      { pos: [-4.5, 0.065, 1.0] as [number, number, number], flower: true },
      { pos: [1.0, 0.065, -4.2] as [number, number, number], flower: false },
      { pos: [-1.5, 0.065, -3.5] as [number, number, number], flower: true },
    ],
    []
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} color={theme.ambientColor} />
      <directionalLight
        position={[4, 8, 3]}
        intensity={0.4}
        color={theme.ambientColor}
        castShadow={false}
      />
      <pointLight
        position={[0, 3, 0]}
        intensity={0.15}
        color={theme.lightColor}
        distance={15}
        decay={2}
      />

      {/* Shader water */}
      <Water theme={theme} />

      {/* Pond bottom */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={theme.deepColor} roughness={0.95} />
      </mesh>

      {/* Volumetric light beams */}
      <LightBeams theme={theme} />

      {/* Underwater pebbles */}
      <Pebbles />

      {/* Koi fish */}
      {koiConfigs.map((koi, i) => (
        <Koi key={i} {...koi} />
      ))}

      {/* Lily pads */}
      {lilyPads.map((pad, i) => (
        <LilyPad key={i} position={pad.pos} hasFlower={pad.flower} />
      ))}

      {/* Floating petals */}
      <FloatingPetals />

      {/* Wish orbs */}
      {wishes.map((wish) => (
        <WishOrb key={wish.id} wish={wish} />
      ))}

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────

interface KoiPondProps {
  wishes: Wish[];
  onPondClick: () => void;
  theme: PondTheme;
}

export default function KoiPond({ wishes, onPondClick, theme }: KoiPondProps) {
  const handleClick = useCallback(() => {
    onPondClick();
  }, [onPondClick]);

  return (
    <div
      className="absolute inset-0 pond-gradient cursor-pointer"
      onClick={handleClick}
    >
      <Canvas
        camera={{ position: [0, 5.5, 5.5], fov: 45, near: 0.1, far: 100 }}
        style={{ touchAction: "none" }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
      >
        <Scene wishes={wishes} theme={theme} />
      </Canvas>
    </div>
  );
}
