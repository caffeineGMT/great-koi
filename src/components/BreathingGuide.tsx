"use client";

import { useState, useEffect, useRef } from "react";

interface BreathingGuideProps {
  onClose: () => void;
}

type Phase = "inhale" | "hold" | "exhale" | "rest";

const PHASES: { phase: Phase; duration: number; label: string }[] = [
  { phase: "inhale", duration: 4000, label: "Breathe in..." },
  { phase: "hold", duration: 4000, label: "Hold..." },
  { phase: "exhale", duration: 6000, label: "Breathe out..." },
  { phase: "rest", duration: 2000, label: "Rest..." },
];

export default function BreathingGuide({ onClose }: BreathingGuideProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [scale, setScale] = useState(0.6);
  const timerRef = useRef<NodeJS.Timeout>(null);

  const currentPhase = PHASES[phaseIndex];
  const totalCycles = 3;

  useEffect(() => {
    // Animate scale based on phase
    if (currentPhase.phase === "inhale") {
      setScale(1);
    } else if (currentPhase.phase === "exhale") {
      setScale(0.6);
    }

    timerRef.current = setTimeout(() => {
      const nextIndex = (phaseIndex + 1) % PHASES.length;
      if (nextIndex === 0) {
        const nextCycle = cycles + 1;
        if (nextCycle >= totalCycles) {
          onClose();
          return;
        }
        setCycles(nextCycle);
      }
      setPhaseIndex(nextIndex);
    }, currentPhase.duration);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phaseIndex, cycles, currentPhase, onClose]);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div className="relative flex items-center justify-center mb-8">
        <div
          className="w-40 h-40 sm:w-56 sm:h-56 rounded-full border-2 border-[var(--gold)]/30
            flex items-center justify-center"
          style={{
            transform: `scale(${scale})`,
            transition: `transform ${currentPhase.duration}ms ease-in-out`,
          }}
        >
          <div
            className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-[var(--gold)]/10
              flex items-center justify-center"
          >
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-[var(--gold)]/15" />
          </div>
        </div>
      </div>

      <p className="text-xl sm:text-2xl font-light text-[var(--gold-light)] mb-2 transition-opacity duration-500">
        {currentPhase.label}
      </p>

      <p className="text-sm text-[var(--foreground)]/30">
        Cycle {cycles + 1} of {totalCycles}
      </p>

      <button
        onClick={onClose}
        className="absolute bottom-8 text-sm text-[var(--foreground)]/20
          hover:text-[var(--foreground)]/40 transition-colors cursor-pointer"
      >
        Tap anywhere to exit
      </button>
    </div>
  );
}
