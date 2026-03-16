"use client";

import { useState, useEffect, useCallback } from "react";
import type { Wish } from "@/app/page";

const STORAGE_KEY = "great-koi-wishes";
const COUNT_KEY = "great-koi-wish-count";

export function useWishStorage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [wishCount, setWishCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedCount = localStorage.getItem(COUNT_KEY);
      if (stored) setWishes(JSON.parse(stored));
      if (storedCount) setWishCount(parseInt(storedCount, 10));
    } catch {
      // localStorage unavailable
    }
    setLoaded(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
      localStorage.setItem(COUNT_KEY, wishCount.toString());
    } catch {
      // quota exceeded or unavailable
    }
  }, [wishes, wishCount, loaded]);

  const addWish = useCallback((wish: Wish) => {
    setWishes((prev) => [...prev, wish]);
    setWishCount((c) => c + 1);
  }, []);

  return { wishes, wishCount, addWish, loaded };
}
