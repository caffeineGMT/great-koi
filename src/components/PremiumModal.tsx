"use client";

import { useState } from "react";

interface PremiumModalProps {
  onClose: () => void;
}

const features = [
  { icon: "\u221E", title: "Unlimited Wishes", desc: "Send as many wishes as your heart desires" },
  { icon: "\u2728", title: "Golden Koi", desc: "Unlock rare golden and celestial koi" },
  { icon: "\uD83D\uDCD6", title: "Wish Journal", desc: "Track and reflect on all your past wishes" },
  { icon: "\uD83C\uDFB6", title: "Ambient Sounds", desc: "Calming water, wind, and nature soundscapes" },
  { icon: "\uD83C\uDF38", title: "Seasonal Ponds", desc: "Cherry blossom, moonlit, zen garden themes" },
  { icon: "\uD83E\uDDD8", title: "Guided Breathing", desc: "Extended meditation and breathing exercises" },
];

export default function PremiumModal({ onClose }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [waitlisted, setWaitlisted] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Stripe not configured — show waitlist instead
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const handleWaitlist = async () => {
    if (!email.includes("@")) return;
    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setWaitlisted(true);
    } catch {
      // silently fail
    }
    setLoading(false);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass rounded-2xl p-5 sm:p-8 w-full max-w-md animate-fade-in
          mb-4 sm:mb-0 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5 sm:mb-6">
          <span className="text-3xl sm:text-4xl block mb-2">&#10024;</span>
          <h2 className="text-xl sm:text-2xl font-light text-[var(--gold-light)] mb-2">
            Great Koi Premium
          </h2>
          <p className="text-xs sm:text-sm text-[var(--foreground)]/60">
            Unlock the full sanctuary experience
          </p>
        </div>

        <div className="space-y-3 mb-5 sm:mb-6">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="text-base mt-0.5 w-6 text-center">{f.icon}</span>
              <div>
                <p className="text-sm text-[var(--gold-light)]">{f.title}</p>
                <p className="text-xs text-[var(--foreground)]/40">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mb-4">
          <div className="text-2xl sm:text-3xl font-light text-[var(--gold-light)]">
            $8.99
            <span className="text-sm text-[var(--foreground)]/40">/month</span>
          </div>
          <p className="text-xs text-[var(--foreground)]/30 mt-1">7-day free trial included</p>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)]
            text-[var(--pond-deep)] font-medium text-sm sm:text-base
            hover:opacity-90 transition-opacity cursor-pointer
            disabled:opacity-50 disabled:cursor-wait"
        >
          {loading ? "Loading..." : "Start Free Trial"}
        </button>

        <div className="mt-4 pt-4 border-t border-[var(--gold)]/10">
          {waitlisted ? (
            <p className="text-sm text-[var(--gold-light)] text-center">
              You&apos;re on the list! We&apos;ll notify you at launch.
            </p>
          ) : (
            <>
              <p className="text-xs text-[var(--foreground)]/30 text-center mb-2">
                Or join the waitlist for launch updates
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent border border-[var(--gold)]/20 rounded-lg
                    px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30
                    focus:outline-none focus:border-[var(--gold)]/40"
                />
                <button
                  onClick={handleWaitlist}
                  disabled={loading || !email.includes("@")}
                  className="px-4 py-2 rounded-lg bg-[var(--gold)]/15 text-[var(--gold-light)]
                    text-sm hover:bg-[var(--gold)]/25 transition-colors cursor-pointer
                    disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-sm text-[var(--foreground)]/40
            hover:text-[var(--foreground)]/60 transition-colors cursor-pointer"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
