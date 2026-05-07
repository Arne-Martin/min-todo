// Custom React-hook som äger temats state och speglar det till <html data-theme>.
// Kontrakt: specs/002-dark-mode-toggle/contracts/useTheme.md
// Storage-format: specs/002-dark-mode-toggle/contracts/theme-storage.md

"use client";

import { useCallback, useEffect, useState } from "react";

import type { ThemeChoice, ThemeMode } from "@/lib/types";

// OBS: Samma nyckel och läslogik finns i app/layout.tsx (inline-script).
// Ändra båda samtidigt — annars syns en blink i fel tema vid första paint.
const THEME_STORAGE_KEY = "min-todo:theme";

/** Läs sparat val. Ogiltiga värden och undantag → null (följ system). */
function readChoice(): ThemeChoice {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return raw === "light" || raw === "dark" ? raw : null;
  } catch {
    return null;
  }
}

/** Skriv val tyst — ett misslyckat skriv betyder att valet gäller bara sessionen. */
function writeChoice(value: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    // localStorage otillgängligt — användaren märker bara att valet
    // inte följer mellan besök. Ingen UI-notis (se research.md §7).
  }
}

/**
 * Läs systemets prefers-color-scheme. Anropas bara vid initialisering;
 * vi lyssnar inte på ändringar (se FR-010 och Q1 i Clarifications).
 */
function readSystemPref(): ThemeMode {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

/** Spegla effektivt tema till <html data-theme>. */
function applyDataTheme(value: ThemeMode): void {
  document.documentElement.dataset.theme = value;
}

export type UseThemeReturn = {
  /** Det effektiva temat just nu — alltid 'light' eller 'dark'. */
  theme: ThemeMode;
  /** Sätt ett explicit tema. Persisteras till localStorage. */
  setTheme: (next: ThemeMode) => void;
  /** Växla till motsatt tema. */
  toggle: () => void;
};

/**
 * useTheme — äger temats state, läser/skriver localStorage och speglar
 * effektivt tema till <html data-theme>.
 *
 * Initialvärdet är medvetet 'light' i både SSR och klientens första
 * render för att undvika hydration-mismatch. Det riktiga temat (sparat
 * val ?? systempref) hydreras i useEffect nedan — samma mönster som
 * useTodos i 001 använder för localStorage-data. Inline-scriptet i
 * app/layout.tsx har redan satt rätt data-theme på <html> innan React
 * hydrerar, så användaren ser inget visuellt fel-tema-blink under den
 * korta stunden då React-state och DOM tillfälligt är osynkade.
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  // Hydrera state från localStorage / systempref efter mount.
  // localStorage och matchMedia är klient-only-API:er som inte finns
  // under server-rendering — därför sker läsningen här, inte i useState.
  useEffect(() => {
    const hydrated = readChoice() ?? readSystemPref();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(hydrated);
    applyDataTheme(hydrated);
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    writeChoice(next);
    applyDataTheme(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((current) => {
      const next = current === "light" ? "dark" : "light";
      writeChoice(next);
      applyDataTheme(next);
      return next;
    });
  }, []);

  return { theme, setTheme, toggle };
}
