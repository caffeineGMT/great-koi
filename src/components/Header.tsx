"use client";

interface HeaderProps {
  wishCount: number;
  freeLimit: number;
  onPremiumClick: () => void;
  onJournalClick: () => void;
  onBreathingClick: () => void;
  onThemeClick: () => void;
}

export default function Header({
  wishCount,
  freeLimit,
  onPremiumClick,
  onJournalClick,
  onBreathingClick,
  onThemeClick,
}: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-6 flex items-start justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl sm:text-2xl">&#128031;</span>
        <h1 className="text-base sm:text-xl font-light text-[var(--gold-light)] tracking-wider">
          Great Koi
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onThemeClick}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm
            text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70
            transition-colors cursor-pointer"
          title="Pond themes"
        >
          &#127912;
        </button>
        <button
          onClick={onBreathingClick}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm
            text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70
            transition-colors cursor-pointer"
          title="Breathing exercise"
        >
          &#127793;
        </button>
        <button
          onClick={onJournalClick}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm
            text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70
            transition-colors cursor-pointer"
          title="Wish Journal"
        >
          &#128214;
        </button>
        <span className="text-xs text-[var(--foreground)]/40 mx-1">
          {wishCount}/{freeLimit}
        </span>
        <button
          onClick={onPremiumClick}
          className="px-2.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm
            bg-[var(--gold)]/15 text-[var(--gold-light)]
            hover:bg-[var(--gold)]/25 transition-colors cursor-pointer"
        >
          &#10024;
        </button>
      </div>
    </header>
  );
}
