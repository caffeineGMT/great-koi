"use client";

interface PremiumModalProps {
  onClose: () => void;
}

const features = [
  { title: "Unlimited Wishes", desc: "Send as many wishes as your heart desires" },
  { title: "Golden Koi", desc: "Unlock rare golden and celestial koi" },
  { title: "Wish Journal", desc: "Track and reflect on all your past wishes" },
  { title: "Ambient Sounds", desc: "Calming water, wind, and nature sounds" },
  { title: "Custom Ponds", desc: "Seasonal themes: cherry blossom, moonlit, zen garden" },
];

export default function PremiumModal({ onClose }: PremiumModalProps) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass rounded-2xl p-5 sm:p-8 w-full max-w-md animate-fade-in
          mb-4 sm:mb-0 max-h-[80vh] overflow-y-auto"
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
              <span className="text-[var(--gold)] mt-0.5 text-sm">&#10003;</span>
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
        </div>

        <button
          className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)]
            text-[var(--pond-deep)] font-medium text-sm sm:text-base
            hover:opacity-90 transition-opacity cursor-pointer"
          onClick={() => {
            // Stripe checkout would go here
            alert("Stripe checkout coming soon!");
          }}
        >
          Start Free Trial
        </button>

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
