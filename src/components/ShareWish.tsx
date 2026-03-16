"use client";

interface ShareWishProps {
  wishText: string;
  onClose: () => void;
}

export default function ShareWish({ wishText, onClose }: ShareWishProps) {
  const shareText = `My wish: "${wishText}" - sent to the koi pond`;
  const shareUrl = "https://great-koi.vercel.app";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Great Koi - My Wish",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert("Copied to clipboard!");
    }
    onClose();
  };

  const handleTwitter = () => {
    const encoded = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");
    onClose();
  };

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
        <h3 className="text-lg text-[var(--gold-light)] mb-2 text-center">
          Share Your Wish
        </h3>
        <p className="text-sm text-[var(--foreground)]/50 text-center mb-5 italic">
          &ldquo;{wishText}&rdquo;
        </p>

        <div className="space-y-2">
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-xl bg-[var(--gold)]/15 text-[var(--gold-light)]
              text-sm hover:bg-[var(--gold)]/25 transition-colors cursor-pointer"
          >
            {typeof navigator !== "undefined" && "share" in navigator
              ? "Share..."
              : "Copy to Clipboard"}
          </button>
          <button
            onClick={handleTwitter}
            className="w-full py-3 rounded-xl bg-[var(--pond-light)]/50 text-[var(--foreground)]/70
              text-sm hover:bg-[var(--pond-light)]/70 transition-colors cursor-pointer"
          >
            Post on X / Twitter
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-[var(--foreground)]/30
              hover:text-[var(--foreground)]/50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
