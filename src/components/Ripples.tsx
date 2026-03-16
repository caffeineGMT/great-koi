"use client";

import { useState, useCallback } from "react";

interface RipplePoint {
  id: string;
  x: number;
  y: number;
}

export default function Ripples() {
  const [ripples, setRipples] = useState<RipplePoint[]>([]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const ripple: RipplePoint = {
      id: crypto.randomUUID(),
      x: e.clientX,
      y: e.clientY,
    };
    setRipples((prev) => [...prev, ripple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 2000);
  }, []);

  return (
    <div
      className="absolute inset-0 z-10 pointer-events-auto"
      onClick={handleClick}
      style={{ touchAction: "manipulation" }}
    >
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute pointer-events-none"
          style={{ left: r.x, top: r.y }}
        >
          <div className="w-4 h-4 -ml-2 -mt-2 rounded-full border border-[var(--gold)]/40 animate-ripple" />
          <div
            className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border border-[var(--gold)]/20 animate-ripple"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      ))}
    </div>
  );
}
