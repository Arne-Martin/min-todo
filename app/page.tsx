"use client";

// Huvudkomponenten. Håller filter-state lokalt och delegerar all data-
// hantering till `useTodos`. Komponenten är klient-renderad eftersom datat
// lever i webbläsarens localStorage.

import { useState } from "react";

import { FilterBar } from "@/components/FilterBar";
import { TodoInput } from "@/components/TodoInput";
import { TodoList } from "@/components/TodoList";
import { useTodos } from "@/hooks/useTodos";
import type { Filter } from "@/lib/types";

import styles from "./page.module.css";

export default function Page() {
  const {
    tasks,
    remainingCount,
    hasCompleted,
    add,
    toggle,
    remove,
    clearCompleted,
    storageWarning,
  } = useTodos();

  // Filterläget lever bara i komponentträdet och persistas inte mellan
  // sessioner – vid varje sidladdning startar vi på "Alla" (FR-018).
  const [filter, setFilter] = useState<Filter>("alla");

  const visible =
    filter === "alla"
      ? tasks
      : filter === "kvar"
        ? tasks.filter((t) => !t.done)
        : tasks.filter((t) => t.done);

  // Räknarens text följer svensk pluralis: 1 → "1 uppgift kvar",
  // alla andra antal → "<n> uppgifter kvar".
  const counterText =
    remainingCount === 1
      ? "1 uppgift kvar"
      : `${remainingCount} uppgifter kvar`;

  // Bekräftelseruta före massborttagning – samma princip som per-uppgift-borttagning.
  function handleClearCompleted() {
    const confirmed = window.confirm("Vill du ta bort alla klara uppgifter?");
    if (confirmed) {
      clearCompleted();
    }
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Mina uppgifter</h1>

      {storageWarning === "unavailable" && (
        <p role="status" className={styles.warning}>
          Dina uppgifter kan inte sparas i den här webbläsaren – de försvinner
          när du stänger fliken.
        </p>
      )}
      {storageWarning === "corrupted" && (
        <p role="status" className={styles.warning}>
          Tidigare data kunde inte läsas och har återställts.
        </p>
      )}

      <TodoInput onAdd={add} />

      <TodoList
        tasks={visible}
        onToggle={toggle}
        onRemove={remove}
        emptyMessage={
          filter === "klara"
            ? "Inga klara uppgifter"
            : filter === "kvar"
              ? "Inga kvarvarande uppgifter"
              : "Inga uppgifter än"
        }
      />

      <p className={styles.counter} aria-live="polite">
        {counterText}
      </p>

      <FilterBar filter={filter} onChange={setFilter} />

      <button
        type="button"
        className={styles.clearButton}
        onClick={handleClearCompleted}
        disabled={!hasCompleted}
      >
        Rensa klara
      </button>
    </main>
  );
}
