# Contract: `useTodos()` hook

**Phase**: 1
**Date**: 2026-05-05
**Fil**: `hooks/useTodos.ts`

`useTodos` är en React-hook som äger todo-listans state och synkar den med
`localStorage`. Komponenter (`TodoInput`, `TodoList`, `TodoItem`, `FilterBar`)
är medvetet okunniga om persistens — de pratar bara med hooken.

---

## Publik signatur

```ts
type UseTodosReturn = {
  tasks: Task[];               // Sorterad nyaste först
  remainingCount: number;      // Antal med done === false
  storageWarning: StorageWarning | null;
  add: (text: string) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clearCompleted: () => void;
  hasCompleted: boolean;       // Bekväm flagga för "Rensa klara"-knappen
};

type StorageWarning =
  | 'unavailable'              // localStorage finns inte / blockerad
  | 'corrupted';               // Tidigare data kunde inte tolkas

function useTodos(): UseTodosReturn;
```

`Task`-typen är definierad i `lib/types.ts` (se `data-model.md`).

---

## Beteende per metod

### `add(text)`

- Trimmar `text`. Om resultatet är tom sträng — gör ingenting (FR-003).
- Skapar en ny `Task`:
  ```ts
  { id: crypto.randomUUID(), text: trimmed.slice(0, 200), done: false, createdAt: Date.now() }
  ```
- Lägger till i state. Effekten i `useEffect` skriver om hela envelope:n till
  `localStorage` (FR-022).
- `text.slice(0, 200)` är en defensiv åtgärd ifall input-elementets `maxLength`
  någonsin skulle gå förbi (paste från utvecklarverktyg etc.).

### `toggle(id)`

- Hittar uppgiften med `id` och flippar `done`. Övriga uppgifter orörda.
- Position i listan ändras inte (FR-012a).
- Persistens uppdateras via `useEffect`.

### `remove(id)`

- Tar bort uppgiften med `id` från state.
- **Hooken anropar inte `confirm()` själv.** Komponenten (TodoItem) ansvarar för
  bekräftelsedialogen och anropar `remove` först efter att användaren bekräftat
  (FR-013–015). Detta håller hooken testbar och fri från UI-anrop.

### `clearCompleted()`

- Tar bort alla uppgifter med `done === true`.
- **Komponenten ansvarar för `confirm()`-dialogen** av samma skäl som ovan
  (FR-020).

### `tasks`

- Alltid sorterad: nyaste `createdAt` först, `id` som tiebreaker (data-model.md).
- Returneras som ny array vid varje förändring så React kan re-rendra korrekt.

### `remainingCount`

- `tasks.filter(t => !t.done).length`. Räknas i hooken för att räknaren ska
  vara konsekvent över komponenter.

### `hasCompleted`

- `tasks.some(t => t.done)`. Används för att inaktivera/dölja "Rensa
  klara"-knappen (FR-021).

### `storageWarning`

- `null` i normalfallet.
- `'unavailable'` om `localStorage` kastar exception (privat läge, blockerad).
  Hooken fortsätter fungera men ändringar persistas inte.
- `'corrupted'` om gammal data inte kunde tolkas. Hooken startade då med tom lista
  men användaren bör få veta.
- `page.tsx` renderar ett dämpat meddelande baserat på värdet (FR-024).

---

## Persistens-livscykel

1. **Mount**: `useEffect(() => { ... }, [])` läser från `localStorage` via
   `lib/storage.ts`. Sätter `tasks` och eventuellt `storageWarning`.
2. **Vid varje state-ändring**: Ett `useEffect` med `[tasks]` som dependency
   skriver hela envelope:n. Skip vid första render (för att inte överskriva
   det vi just läst).
3. **Vid unmount**: Ingen åtgärd — Next.js river bara komponentträdet.

### Race-skydd vid första render

- En `useRef` (`hasHydrated`) sätts efter mount-effekten. Skriv-effekten kollar
  `hasHydrated.current === true` innan den skriver. Annars riskerar man att
  skriva tom array innan datat hunnit läsas.

---

## Vad hooken **inte** gör

- Visar inga dialoger (`confirm` är komponentens ansvar).
- Filtrerar inte listan (filter är vy-state i `page.tsx`).
- Validerar inte 200-teckens-gränsen i UI:t (input-elementet sätter `maxLength`).
  Hooken slice:ar bara defensivt.
- Synkar inte mellan webbläsarfilkar (medvetet val per spec).

---

## Användningsexempel

```tsx
'use client';

import { useTodos } from '@/hooks/useTodos';

export default function Page() {
  const { tasks, remainingCount, hasCompleted, add, toggle, remove, clearCompleted, storageWarning } = useTodos();
  const [filter, setFilter] = useState<Filter>('alla');

  const visible = tasks.filter(t =>
    filter === 'alla' ? true : filter === 'kvar' ? !t.done : t.done
  );

  return (
    <main>
      <h1>Mina uppgifter</h1>
      {storageWarning === 'unavailable' && (
        <p role="status">Dina uppgifter kan inte sparas i den här webbläsaren – de försvinner när du stänger fliken.</p>
      )}
      <TodoInput onAdd={add} />
      <TodoList tasks={visible} onToggle={toggle} onRemove={remove} />
      <p aria-live="polite">{remainingCount === 1 ? '1 uppgift kvar' : `${remainingCount} uppgifter kvar`}</p>
      <FilterBar filter={filter} onChange={setFilter} />
      {hasCompleted && <button onClick={clearCompleted}>Rensa klara</button>}
    </main>
  );
}
```

(Den faktiska implementationen kommer ha bekräftelsedialoger inbäddade där det
är relevant.)
