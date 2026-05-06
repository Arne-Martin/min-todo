// Custom React-hook som äger todo-listans state och synkar med localStorage.
// Kontrakt: specs/001-todo-app/contracts/useTodos.md

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { loadTasks, saveTasks } from "@/lib/storage";
import type { StorageWarning, Task } from "@/lib/types";

export type UseTodosReturn = {
  /** Sorterade uppgifter, nyaste först. */
  tasks: Task[];
  /** Antal uppgifter som inte är klara. */
  remainingCount: number;
  /** True om minst en uppgift är klar (används för "Rensa klara"-knappen). */
  hasCompleted: boolean;
  /** Eventuell varning som UI:t kan visa. `null` i normalfallet. */
  storageWarning: StorageWarning | null;
  /** Lägg till en ny uppgift. Tomma strängar ignoreras tyst. */
  add: (text: string) => void;
  /** Växla klar-status för en uppgift. */
  toggle: (id: string) => void;
  /** Ta bort en uppgift permanent (komponenten ansvarar för bekräftelse). */
  remove: (id: string) => void;
  /** Ta bort alla klara uppgifter (komponenten ansvarar för bekräftelse). */
  clearCompleted: () => void;
};

/**
 * Sortera uppgifter med nyaste först. `id` används som tiebreaker om två
 * uppgifter någonsin skulle få exakt samma `createdAt` (osannolikt med
 * `Date.now()`-precision men billigt att gardera).
 */
function sortByNewest(tasks: Task[]): Task[] {
  return tasks.slice().sort((a, b) => {
    if (b.createdAt !== a.createdAt) return b.createdAt - a.createdAt;
    return a.id < b.id ? -1 : 1;
  });
}

export function useTodos(): UseTodosReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [storageWarning, setStorageWarning] = useState<StorageWarning | null>(
    null
  );

  // hasHydrated förhindrar att skriv-effekten skriver tom array innan
  // läs-effekten hunnit fylla state vid första render.
  const hasHydrated = useRef(false);

  // Läs in befintligt data en gång efter mount. localStorage är ett
  // klient-only-API som inte finns under server-rendering – därför sker
  // hydreringen i useEffect snarare än i useState's lazy initializer.
  // Det är React-idiomet för att synkronisera in från ett externt system.
  useEffect(() => {
    const result = loadTasks();
    /* eslint-disable react-hooks/set-state-in-effect */
    setTasks(result.tasks);
    if (result.storageDisabled) {
      setStorageWarning("unavailable");
    } else if (result.corrupted) {
      setStorageWarning("corrupted");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    hasHydrated.current = true;
  }, []);

  // Skriv till localStorage vid varje förändring – men först efter hydration.
  // Om skrivningen misslyckas (t.ex. när privat-läge plötsligt slår på)
  // sätter vi varningen så UI:t kan informera användaren.
  useEffect(() => {
    if (!hasHydrated.current) return;
    const result = saveTasks(tasks);
    if (!result.ok && result.reason === "unavailable") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageWarning("unavailable");
    }
  }, [tasks]);

  const add = useCallback((text: string) => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      // slice är en defensiv åtgärd om input-elementets maxLength någonsin
      // skulle gå förbi (t.ex. via paste från devtools).
      text: trimmed.slice(0, 200),
      done: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const toggle = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.done));
  }, []);

  // Sortera och beräkna räknare/flagga vid varje render. Cheap för listor < 1000.
  const sorted = useMemo(() => sortByNewest(tasks), [tasks]);
  const remainingCount = useMemo(
    () => tasks.filter((t) => !t.done).length,
    [tasks]
  );
  const hasCompleted = useMemo(() => tasks.some((t) => t.done), [tasks]);

  return {
    tasks: sorted,
    remainingCount,
    hasCompleted,
    storageWarning,
    add,
    toggle,
    remove,
    clearCompleted,
  };
}
