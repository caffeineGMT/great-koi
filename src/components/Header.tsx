"use client";

interface HeaderProps {
  wishCount: number;
  freeLimit: number;
  onPremiumClick: () => void;
  onJournalClick: () => void;
  onBreathingClick: () => void;
}

export default function Header({
  wishCount,
  freeLimit,
  onPremiumClick,
  onJournalClick,
  onBreathingClick,
}: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-6 flex items-start justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl sm:text-2xl">&#128031;</span>
        <h1 className="text-base sm:text-xl font-light text-[var(--gold-light)] tracking-wider">
          Great Koi
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          onClick={onBreathingClick}
          className="px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm
            text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70
            transition-colors cursor-pointer"
          title="Breathing exercise"
        >
          <span className="sm:hidden">&#127793;</span>
          <span className="hidden sm:inline">&#127793; Breathe</span>
        </button>
        <button
          onClick={onJournalClick}
          className="px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm
            text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70
            transition-colors cursor-pointer"
          title="Wish Journal"
        >
          <span className="sm:hidden">&#128214;</span>
          <span className="hidden sm:inline">&#128214; Journal</span>
        </button>
        <span className="text-xs text-[var(--foreground)]/40">
          {wishCount}/{freeLimit}
        </span>
        <button
          onClick={onPremiumClick}
          className="px-2.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm
            bg-[var(--gold)]/15 text-[var(--gold-light)]
            hover:bg-[var(--gold)]/25 transition-colors cursor-pointer"
        >
          <span className="sm:hidden">&#10024;</span>
          <span className="hidden sm:inline">&#10024; Unlimited</span>
        </button>
      </div>
    </header>
  );
}
