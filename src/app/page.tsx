"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useWishStorage } from "@/hooks/useWishStorage";
import WishInput from "@/components/WishInput";
import WishOverlay from "@/components/WishOverlay";
import Header from "@/components/Header";
import PremiumModal from "@/components/PremiumModal";
import WishJournal from "@/components/WishJournal";
import Ripples from "@/components/Ripples";
import Particles from "@/components/Particles";
import SoundToggle from "@/components/SoundToggle";
import WelcomeScreen from "@/components/WelcomeScreen";
import ShareWish from "@/components/ShareWish";
import BreathingGuide from "@/components/BreathingGuide";
import CommunityWishes from "@/components/CommunityWishes";

const KoiPond = dynamic(() => import("@/components/KoiPond"), { ssr: false });

export interface Wish {
  id: string;
  text: string;
  timestamp: number;
  x: number;
  y: number;
}

const WELCOME_KEY = "great-koi-welcomed";

export default function Home() {
  const { wishes, wishCount, addWish, loaded } = useWishStorage();
  const [showInput, setShowInput] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [shareWish, setShareWish] = useState<string | null>(null);
  const [latestWish, setLatestWish] = useState<string | null>(null);

  const FREE_WISH_LIMIT = 3;

  useEffect(() => {
    if (loaded) {
      const welcomed = localStorage.getItem(WELCOME_KEY);
      if (!welcomed) {
        setShowWelcome(true);
      }
    }
  }, [loaded]);

  const handleEnterPond = useCallback(() => {
    localStorage.setItem(WELCOME_KEY, "true");
    setShowWelcome(false);
  }, []);

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
      setLatestWish(text);
      setShowInput(false);

      // Save to community pond (fire-and-forget)
      fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }).catch(() => {});

      // Offer share after a moment
      setTimeout(() => {
        setShareWish(text);
      }, 3000);
    },
    [wishCount, addWish]
  );

  const isModalOpen = showInput || showPremium || showJournal || showBreathing || !!shareWish;

  const handlePondClick = useCallback(() => {
    if (!isModalOpen && !showWelcome) {
      setShowInput(true);
    }
  }, [isModalOpen, showWelcome]);

  if (!loaded) {
    return (
      <main className="relative w-screen h-screen overflow-hidden pond-gradient flex items-center justify-center">
        <div className="text-[var(--gold-light)] text-4xl animate-gentle-pulse">
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

      {showWelcome && <WelcomeScreen onEnter={handleEnterPond} />}

      {!showWelcome && (
        <>
          <Header
            wishCount={wishCount}
            freeLimit={FREE_WISH_LIMIT}
            onPremiumClick={() => setShowPremium(true)}
            onJournalClick={() => setShowJournal(true)}
            onBreathingClick={() => setShowBreathing(true)}
          />

          <WishOverlay wishes={wishes} />

          <SoundToggle />
          <CommunityWishes />

          {!isModalOpen && (
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

          {showBreathing && (
            <BreathingGuide onClose={() => setShowBreathing(false)} />
          )}

          {shareWish && (
            <ShareWish
              wishText={shareWish}
              onClose={() => setShareWish(null)}
            />
          )}
        </>
      )}
    </main>
  );
}
