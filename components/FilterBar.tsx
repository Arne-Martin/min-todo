"use client";

// FilterBar: tre knappar för att filtrera listan. Aktiv knapp får
// `aria-pressed="true"` och en visuell `active`-klass.

import type { Filter } from "@/lib/types";
import styles from "./FilterBar.module.css";

type Props = {
  filter: Filter;
  onChange: (next: Filter) => void;
};

// Etiketterna i UI:t hålls separat från värdet så att vi kan översätta
// fritt utan att röra interna värden ('alla' / 'kvar' / 'klara').
const OPTIONS: Array<{ value: Filter; label: string }> = [
  { value: "alla", label: "Alla" },
  { value: "kvar", label: "Kvar" },
  { value: "klara", label: "Klara" },
];

export function FilterBar({ filter, onChange }: Props) {
  return (
    <div
      className={styles.bar}
      role="group"
      aria-label="Filtrera uppgifter"
    >
      {OPTIONS.map(({ value, label }) => {
        const isActive = filter === value;
        return (
          <button
            key={value}
            type="button"
            className={`${styles.button} ${isActive ? styles.active : ""}`}
            aria-pressed={isActive}
            onClick={() => onChange(value)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
