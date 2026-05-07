// Centrala datatyper för hela appen.
// Se specs/001-todo-app/data-model.md för en utförlig beskrivning.

/** En enskild att-göra-rad som lagras och visas i appen. */
export type Task = {
  /** Unik intern referens (UUID v4). Stabil över persistens. */
  id: string;
  /** Användarens text. 1–200 tecken efter trimning. */
  text: string;
  /** True om uppgiften är markerad klar. */
  done: boolean;
  /** Tidsstämpel (Unix ms) vid skapande. Sortering: nyaste överst. */
  createdAt: number;
};

/** De tre filterlägena. Lever som vy-state, persistas inte. */
export type Filter = "alla" | "kvar" | "klara";

/** Det format som lagras i localStorage. Versionsfältet möjliggör framtida migration. */
export type StorageEnvelope = {
  version: 1;
  tasks: Task[];
};

/** Varningar som hooken kan rapportera till UI:t. */
export type StorageWarning = "unavailable" | "corrupted";

/**
 * Resultatet av att läsa från localStorage. Tre möjliga utfall:
 * 1. Allt OK — `tasks` populerad, inga flaggor satta.
 * 2. localStorage är blockerad/saknas — `storageDisabled: true`, tom lista.
 * 3. Datat fanns men kunde inte tolkas — `corrupted: true`, tom lista.
 */
export type LoadResult =
  | { ok: true; tasks: Task[]; storageDisabled: false; corrupted: false }
  | { ok: true; tasks: []; storageDisabled: true; corrupted: false }
  | { ok: true; tasks: []; storageDisabled: false; corrupted: true };

// Tematyper – se specs/002-dark-mode-toggle/data-model.md.

/**
 * Användarens val. `null` = inget val gjort, följ system.
 * Endast `'light'` och `'dark'` sparas i localStorage.
 */
export type ThemeChoice = "light" | "dark" | null;

/** Det effektivt aktiva temat. Alltid en av två konkreta värden. */
export type ThemeMode = "light" | "dark";
