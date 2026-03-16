"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const pts: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 5,
    }));
    setParticles(pts);
  }, []);

  return (
    <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[var(--gold)]/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animation: `gentle-pulse ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
