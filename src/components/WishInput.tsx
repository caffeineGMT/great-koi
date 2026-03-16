"use client";

import { useState, useRef, useEffect } from "react";

interface WishInputProps {
  onSend: (text: string) => void;
  onClose: () => void;
}

export default function WishInput({ onSend, onClose }: WishInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Small delay to prevent the pond click from immediately closing
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onSend(trimmed);
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="absolute inset-0 z-40 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass rounded-2xl p-5 sm:p-6 w-full max-w-md animate-fade-in mb-4 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[var(--gold-light)] text-sm sm:text-base mb-3 text-center opacity-80">
          What do you wish for?
        </p>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your wish and send it to the koi..."
          maxLength={200}
          rows={3}
          className="wish-input w-full bg-transparent border border-[var(--gold)]/30
            rounded-xl p-3 sm:p-4 text-[var(--foreground)] text-sm sm:text-base
            resize-none focus:outline-none focus:border-[var(--gold)]/60
            transition-colors"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-[var(--foreground)]/40">
            {text.length}/200
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-sm text-[var(--foreground)]/60
                hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="px-5 sm:px-6 py-2 rounded-full bg-[var(--gold)]/20 text-[var(--gold-light)]
                text-sm hover:bg-[var(--gold)]/30 transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Send to Pond
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
