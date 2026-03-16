"use client";

import { THEMES, type PondTheme } from "@/hooks/usePondTheme";

interface ThemePickerProps {
  currentTheme: PondTheme;
  onSelectTheme: (id: string) => void;
  onClose: () => void;
}

export default function ThemePicker({
  currentTheme,
  onSelectTheme,
  onClose,
}: ThemePickerProps) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass rounded-2xl p-5 sm:p-6 w-full max-w-sm animate-fade-in mb-4 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg text-[var(--gold-light)] mb-4 text-center">
          Pond Themes
        </h3>

        <div className="space-y-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                if (!theme.premium) {
                  onSelectTheme(theme.id);
                }
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer
                ${currentTheme.id === theme.id
                  ? "bg-[var(--gold)]/15 border border-[var(--gold)]/30"
                  : "hover:bg-white/5 border border-transparent"
                }
                ${theme.premium ? "opacity-60" : ""}`}
            >
              <div
                className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${theme.waterColor}, ${theme.lightColor})`,
                }}
              />
              <div className="flex-1 text-left">
                <p className="text-sm text-[var(--foreground)]/80">{theme.name}</p>
              </div>
              {theme.premium && (
                <span className="text-xs text-[var(--gold)]/60 px-2 py-0.5 rounded-full bg-[var(--gold)]/10">
                  Premium
                </span>
              )}
              {currentTheme.id === theme.id && (
                <span className="text-[var(--gold-light)] text-sm">&#10003;</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-sm text-[var(--foreground)]/40
            hover:text-[var(--foreground)]/60 transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
