"use client";

import { useState } from "react";

interface WelcomeScreenProps {
  onEnter: () => void;
}

export default function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [fading, setFading] = useState(false);

  const handleEnter = () => {
    setFading(true);
    setTimeout(onEnter, 800);
  };

  return (
    <div
      className={`absolute inset-0 z-[100] pond-gradient flex flex-col items-center justify-center
        transition-opacity duration-700 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      {/* Animated koi silhouette */}
      <div className="relative mb-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-[var(--gold)]/20 flex items-center justify-center">
          <span className="text-5xl sm:text-6xl animate-gentle-pulse">&#128031;</span>
        </div>
        <div
          className="absolute inset-0 rounded-full border border-[var(--gold)]/10 animate-ripple"
          style={{ animationDuration: "3s", animationIterationCount: "infinite" }}
        />
      </div>

      <h1 className="text-3xl sm:text-5xl font-light text-[var(--gold-light)] tracking-[0.2em] mb-4">
        GREAT KOI
      </h1>

      <p className="text-sm sm:text-base text-[var(--foreground)]/50 max-w-xs sm:max-w-sm text-center mb-12 px-4 leading-relaxed">
        A sanctuary for your wishes. Tap the pond, whisper your hopes, and watch
        them drift among the koi.
      </p>

      <button
        onClick={handleEnter}
        className="px-8 sm:px-10 py-3 sm:py-4 rounded-full glass text-[var(--gold-light)]
          text-base sm:text-lg tracking-wider
          hover:bg-opacity-80 transition-all duration-300 cursor-pointer
          animate-gentle-pulse"
      >
        Enter the Pond
      </button>

      <p className="absolute bottom-6 text-xs text-[var(--foreground)]/20">
        A digital wellness experience
      </p>
    </div>
  );
}
