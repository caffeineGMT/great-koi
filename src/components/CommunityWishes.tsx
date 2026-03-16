"use client";

import { useEffect, useState } from "react";

interface CommunityWish {
  id: string;
  text: string;
  timestamp: number;
}

export default function CommunityWishes() {
  const [wishes, setWishes] = useState<CommunityWish[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/wishes")
      .then((r) => r.json())
      .then((data) => {
        if (data.wishes?.length > 0) {
          setWishes(data.wishes);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (wishes.length === 0) return;

    const cycle = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % wishes.length);
      }, 6000);
    };

    // Start after 10s delay
    const initial = setTimeout(cycle, 10000);
    const interval = setInterval(cycle, 12000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [wishes]);

  if (wishes.length === 0) return null;

  const wish = wishes[currentIndex];

  return (
    <div
      className={`absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-20
        pointer-events-none transition-all duration-1000
        ${visible ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div className="glass rounded-xl px-4 py-2 max-w-[250px] sm:max-w-xs text-center">
        <p className="text-xs text-[var(--foreground)]/50 italic">
          &ldquo;{wish.text}&rdquo;
        </p>
        <p className="text-[10px] text-[var(--foreground)]/20 mt-1">
          &#127752; from the community pond
        </p>
      </div>
    </div>
  );
}
