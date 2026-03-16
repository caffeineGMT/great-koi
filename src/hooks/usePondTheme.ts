"use client";

import { useState, useEffect } from "react";

export interface PondTheme {
  id: string;
  name: string;
  premium: boolean;
  waterColor: string;
  deepColor: string;
  ambientColor: string;
  lightColor: string;
  particleColor: string;
  accentColor: string;
}

export const THEMES: PondTheme[] = [
  {
    id: "classic",
    name: "Classic Pond",
    premium: false,
    waterColor: "#1a3a5c",
    deepColor: "#061020",
    ambientColor: "#e8dcc8",
    lightColor: "#d4a855",
    particleColor: "#d4a855",
    accentColor: "#2d5a3d",
  },
  {
    id: "moonlit",
    name: "Moonlit Night",
    premium: true,
    waterColor: "#0f1f3a",
    deepColor: "#050a15",
    ambientColor: "#c0d0e8",
    lightColor: "#8899cc",
    particleColor: "#aabbee",
    accentColor: "#1a2a4a",
  },
  {
    id: "cherry",
    name: "Cherry Blossom",
    premium: true,
    waterColor: "#2a3050",
    deepColor: "#0a0a18",
    ambientColor: "#f0d0d8",
    lightColor: "#e8a0b0",
    particleColor: "#f0b0c0",
    accentColor: "#4a2030",
  },
  {
    id: "zen",
    name: "Zen Garden",
    premium: true,
    waterColor: "#1a2a20",
    deepColor: "#050a08",
    ambientColor: "#c0d8c8",
    lightColor: "#80b090",
    particleColor: "#90c0a0",
    accentColor: "#2d4a3d",
  },
  {
    id: "golden",
    name: "Golden Hour",
    premium: true,
    waterColor: "#2a2018",
    deepColor: "#0a0805",
    ambientColor: "#f0d8a0",
    lightColor: "#e8b040",
    particleColor: "#d4a030",
    accentColor: "#4a3820",
  },
];

const THEME_KEY = "great-koi-theme";

export function usePondTheme() {
  const [themeId, setThemeId] = useState("classic");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) setThemeId(stored);
  }, []);

  const setTheme = (id: string) => {
    setThemeId(id);
    localStorage.setItem(THEME_KEY, id);
  };

  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  return { theme, setTheme, themes: THEMES };
}
