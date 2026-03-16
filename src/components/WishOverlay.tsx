"use client";

import { useEffect, useState } from "react";
import type { Wish } from "@/app/page";

interface WishOverlayProps {
  wishes: Wish[];
}

interface FloatingWish {
  wish: Wish;
  visible: boolean;
}

export default function WishOverlay({ wishes }: WishOverlayProps) {
  const [floatingWishes, setFloatingWishes] = useState<FloatingWish[]>([]);

  useEffect(() => {
    if (wishes.length === 0) return;
    const latest = wishes[wishes.length - 1];

    // Check if we already have this wish
    setFloatingWishes((prev) => {
      if (prev.find((fw) => fw.wish.id === latest.id)) return prev;
      return [...prev, { wish: latest, visible: true }];
    });

    // Fade out after 4 seconds
    const timer = setTimeout(() => {
      setFloatingWishes((prev) =>
        prev.map((fw) =>
          fw.wish.id === latest.id ? { ...fw, visible: false } : fw
        )
      );
    }, 4000);

    // Remove from DOM after animation
    const removeTimer = setTimeout(() => {
      setFloatingWishes((prev) =>
        prev.filter((fw) => fw.wish.id !== latest.id)
      );
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [wishes]);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {floatingWishes.map(({ wish, visible }) => (
        <div
          key={wish.id}
          className={`absolute transition-opacity duration-1000 ${
            visible ? "opacity-80" : "opacity-0"
          }`}
          style={{
            left: `${wish.x * 100}%`,
            top: `${wish.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="animate-float-up">
            <div className="glass rounded-xl px-3 sm:px-4 py-2 max-w-[200px] sm:max-w-xs">
              <p className="text-[var(--gold-light)] text-xs sm:text-sm text-center">
                {wish.text}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
