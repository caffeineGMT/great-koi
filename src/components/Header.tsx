"use client";

interface HeaderProps {
  wishCount: number;
  freeLimit: number;
  onPremiumClick: () => void;
  onJournalClick: () => void;
}

export default function Header({
  wishCount,
  freeLimit,
  onPremiumClick,
  onJournalClick,
}: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 flex items-start justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl sm:text-2xl">&#128031;</span>
        <h1 className="text-lg sm:text-xl font-light text-[var(--gold-light)] tracking-wider">
          Great Koi
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onJournalClick}
          className="px-3 py-1.5 rounded-full text-xs sm:text-sm
            text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80
            transition-colors cursor-pointer"
          title="Wish Journal"
        >
          &#128214; <span className="hidden sm:inline">Journal</span>
        </button>
        <span className="text-xs sm:text-sm text-[var(--foreground)]/50">
          {wishCount}/{freeLimit}
        </span>
        <button
          onClick={onPremiumClick}
          className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm
            bg-[var(--gold)]/15 text-[var(--gold-light)]
            hover:bg-[var(--gold)]/25 transition-colors cursor-pointer"
        >
          Unlimited
        </button>
      </div>
    </header>
  );
}
