"use client";

import type { Wish } from "@/app/page";

interface WishJournalProps {
  wishes: Wish[];
  onClose: () => void;
}

export default function WishJournal({ wishes, onClose }: WishJournalProps) {
  const sortedWishes = [...wishes].reverse();

  return (
    <div
      className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass rounded-2xl p-5 sm:p-6 w-full max-w-md animate-fade-in
          mb-4 sm:mb-0 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-light text-[var(--gold-light)]">
            Wish Journal
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]/60
              transition-colors cursor-pointer text-xl"
          >
            &times;
          </button>
        </div>

        {sortedWishes.length === 0 ? (
          <p className="text-sm text-[var(--foreground)]/40 text-center py-8">
            No wishes yet. Tap the pond to make your first wish.
          </p>
        ) : (
          <div className="overflow-y-auto space-y-3 flex-1 -mr-2 pr-2">
            {sortedWishes.map((wish) => (
              <div
                key={wish.id}
                className="border border-[var(--gold)]/10 rounded-xl p-3"
              >
                <p className="text-sm text-[var(--foreground)]/80">
                  {wish.text}
                </p>
                <p className="text-xs text-[var(--foreground)]/30 mt-1">
                  {new Date(wish.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
