// Säker läsning och skrivning till localStorage.
// Kontrakt: specs/001-todo-app/contracts/storage-schema.md
// Datamodell: specs/001-todo-app/data-model.md

import type { LoadResult, StorageEnvelope, Task } from "./types";

/** Den enda nyckeln vi använder i localStorage. */
const STORAGE_KEY = "min-todo:tasks";

/**
 * Läser uppgiftslistan från localStorage. Returnerar alltid ett resultat —
 * kastar aldrig. Vid problem (blockerad storage, trasig JSON) flaggas det i
 * det returnerade objektet så att UI:t kan visa rätt meddelande.
 */
export function loadTasks(): LoadResult {
  // SSR-skydd: localStorage finns inte under server-rendering.
  if (typeof window === "undefined") {
    return { ok: true, tasks: [], storageDisabled: true, corrupted: false };
  }

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // SecurityError eller liknande – t.ex. blockerad i privat läge.
    return { ok: true, tasks: [], storageDisabled: true, corrupted: false };
  }

  if (raw === null) {
    // Första besöket – ingen data ännu.
    return { ok: true, tasks: [], storageDisabled: false, corrupted: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: true, tasks: [], storageDisabled: false, corrupted: true };
  }

  // Verifiera att det är ett objekt med rätt struktur.
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as { version?: unknown }).version !== 1 ||
    !Array.isArray((parsed as { tasks?: unknown }).tasks)
  ) {
    return { ok: true, tasks: [], storageDisabled: false, corrupted: true };
  }

  const rawTasks = (parsed as StorageEnvelope).tasks;

  // Filtrera bort element som inte uppfyller schemat (t.ex. manuellt manipulerade).
  const validated: Task[] = [];
  for (const item of rawTasks) {
    if (isValidTask(item)) {
      // Trunkera defensivt om någon manipulerat datat till >200 tecken.
      validated.push({ ...item, text: item.text.slice(0, 200) });
    }
  }

  // Om majoriteten filtrerades bort betraktar vi datat som korrupt.
  if (rawTasks.length > 0 && validated.length / rawTasks.length < 0.5) {
    return { ok: true, tasks: [], storageDisabled: false, corrupted: true };
  }

  return {
    ok: true,
    tasks: validated as Task[],
    storageDisabled: false,
    corrupted: false,
  } as LoadResult;
}

/**
 * Skriver hela uppgiftslistan till localStorage. Returnerar `{ ok: false }` med
 * en orsak om det misslyckades — useTodos använder detta för att inte krascha
 * appen om kvoten överskrids eller om storage plötsligt blockeras.
 */
export function saveTasks(
  tasks: Task[]
): { ok: true } | { ok: false; reason: "unavailable" | "quota" } {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  const envelope: StorageEnvelope = { version: 1, tasks };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    return { ok: true };
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      return { ok: false, reason: "quota" };
    }
    return { ok: false, reason: "unavailable" };
  }
}

// Type guard som kontrollerar att en okänd rad har alla fält rätt typade.
function isValidTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    v.id.length > 0 &&
    typeof v.text === "string" &&
    v.text.length >= 1 &&
    typeof v.done === "boolean" &&
    typeof v.createdAt === "number" &&
    Number.isFinite(v.createdAt)
  );
}
