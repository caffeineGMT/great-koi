"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useWishStorage } from "@/hooks/useWishStorage";
import WishInput from "@/components/WishInput";
import WishOverlay from "@/components/WishOverlay";
import Header from "@/components/Header";
import PremiumModal from "@/components/PremiumModal";
import WishJournal from "@/components/WishJournal";
import Ripples from "@/components/Ripples";
import Particles from "@/components/Particles";

const KoiPond = dynamic(() => import("@/components/KoiPond"), { ssr: false });

export interface Wish {
  id: string;
  text: string;
  timestamp: number;
  x: number;
  y: number;
}

export default function Home() {
  const { wishes, wishCount, addWish, loaded } = useWishStorage();
  const [showInput, setShowInput] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showJournal, setShowJournal] = useState(false);

  const FREE_WISH_LIMIT = 3;

  const handleSendWish = useCallback(
    (text: string) => {
      if (wishCount >= FREE_WISH_LIMIT) {
        setShowPremium(true);
        setShowInput(false);
        return;
      }

      const wish: Wish = {
        id: crypto.randomUUID(),
        text,
        timestamp: Date.now(),
        x: 0.3 + Math.random() * 0.4,
        y: 0.3 + Math.random() * 0.4,
      };
      addWish(wish);
      setShowInput(false);
    },
    [wishCount, addWish]
  );

  const handlePondClick = useCallback(() => {
    if (!showInput && !showPremium && !showJournal) {
      setShowInput(true);
    }
  }, [showInput, showPremium, showJournal]);

  if (!loaded) {
    return (
      <main className="relative w-screen h-screen overflow-hidden pond-gradient flex items-center justify-center">
        <div className="text-[var(--gold-light)] text-lg animate-gentle-pulse">
          &#128031;
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <KoiPond wishes={wishes} onPondClick={handlePondClick} />
      <Particles />
      <Ripples />

      <Header
        wishCount={wishCount}
        freeLimit={FREE_WISH_LIMIT}
        onPremiumClick={() => setShowPremium(true)}
        onJournalClick={() => setShowJournal(true)}
      />

      <WishOverlay wishes={wishes} />

      {!showInput && !showPremium && !showJournal && (
        <button
          onClick={() => setShowInput(true)}
          className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-30
            px-6 sm:px-8 py-3 sm:py-4 rounded-full glass text-[var(--gold-light)] text-base sm:text-lg
            hover:bg-opacity-80 transition-all duration-300
            animate-gentle-pulse cursor-pointer select-none"
        >
          Make a Wish
        </button>
      )}

      {showInput && (
        <WishInput
          onSend={handleSendWish}
          onClose={() => setShowInput(false)}
        />
      )}

      {showPremium && (
        <PremiumModal onClose={() => setShowPremium(false)} />
      )}

      {showJournal && (
        <WishJournal wishes={wishes} onClose={() => setShowJournal(false)} />
      )}
    </main>
  );
}
