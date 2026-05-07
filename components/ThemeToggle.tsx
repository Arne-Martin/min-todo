"use client";

// ThemeToggle: ikonknapp uppe till höger som växlar mellan ljust och mörkt tema.
// Hela tema-state, persistens och systempref-fallback ligger i useTheme-hooken.

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";

import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggle}
      aria-label={isDark ? "Växla till ljust läge" : "Växla till mörkt läge"}
    >
      {isDark ? (
        <Sun aria-hidden="true" size={20} />
      ) : (
        <Moon aria-hidden="true" size={20} />
      )}
    </button>
  );
}
