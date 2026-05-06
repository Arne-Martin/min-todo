# Contract: localStorage-schema

**Phase**: 1
**Date**: 2026-05-05
**Fil**: `lib/storage.ts`

Detta dokument definierar exakt vad som lagras i `localStorage` och hur
`lib/storage.ts` läser och skriver datat.

---

## Nyckel

```
min-todo:tasks
```

En enskild nyckel håller hela appens data. Namespacet `min-todo:` är medvetet
för att undvika kollision med andra appar på samma origin under utveckling.

---

## Värde (envelope)

JSON-serialiserat objekt:

```json
{
  "version": 1,
  "tasks": [
    {
      "id": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
      "text": "Köp mjölk",
      "done": false,
      "createdAt": 1746432000000
    }
  ]
}
```

Se `data-model.md` för fältdefinitioner.

---

## Publik API i `lib/storage.ts`

```ts
type LoadResult =
  | { ok: true; tasks: Task[]; storageDisabled: false; corrupted: false }
  | { ok: true; tasks: []; storageDisabled: true;  corrupted: false }
  | { ok: true; tasks: []; storageDisabled: false; corrupted: true };

export function loadTasks(): LoadResult;
export function saveTasks(tasks: Task[]): { ok: boolean; reason?: 'unavailable' | 'quota' };
```

### `loadTasks()`

Steg-för-steg:

1. Försök `localStorage.getItem('min-todo:tasks')`.
   - Vid `SecurityError`/`ReferenceError`/övrigt kast → returnera
     `{ ok: true, tasks: [], storageDisabled: true, corrupted: false }`.
2. Om värdet är `null` → första besök → returnera tom OK-list.
3. Försök `JSON.parse`.
   - Vid kast → returnera `corrupted: true`.
4. Validera struktur:
   - Måste vara objekt.
   - `version === 1` (eller saknas — då behandlas det som korrupt).
   - `Array.isArray(parsed.tasks)`.
5. För varje element i `tasks`:
   - `typeof id === 'string' && id.length > 0`
   - `typeof text === 'string' && text.length >= 1 && text.length <= 200`
   - `typeof done === 'boolean'`
   - `typeof createdAt === 'number' && Number.isFinite(createdAt)`
   - Element som inte uppfyller alla kriterier filtreras tyst bort. Om majoritet
     filtreras ut (>50 %) anses datat korrupt och vi returnerar tom lista med
     `corrupted: true`.
6. Returnera den filtrerade listan.

### `saveTasks(tasks)`

```ts
const envelope = { version: 1, tasks };
try {
  localStorage.setItem('min-todo:tasks', JSON.stringify(envelope));
  return { ok: true };
} catch (err) {
  // QuotaExceededError eller liknande
  if (err instanceof DOMException && err.name === 'QuotaExceededError') {
    return { ok: false, reason: 'quota' };
  }
  return { ok: false, reason: 'unavailable' };
}
```

Hooken konsumerar inte `reason` i v1 (vi visar inget för kvot-fel just nu —
det är extremt osannolikt med ~45 000 uppgifter), men returvärdet är där om
någon vill bygga vidare.

---

## SSR-säkerhet

`localStorage` finns inte under server-rendering. `lib/storage.ts` får INTE
köras toplevel — alla anrop sker inifrån `useEffect` (klient-only). Hela
`page.tsx` är `"use client"`, så det är garanterat ändå, men `lib/storage.ts`
kollar defensivt:

```ts
if (typeof window === 'undefined') {
  return { ok: true, tasks: [], storageDisabled: true, corrupted: false };
}
```

---

## Felhantering — sammanfattning

| Situation | `loadTasks()`-resultat | UI-effekt |
|---|---|---|
| Första besöket | `tasks: []`, allt false | Visa tom-lista-placeholder. |
| Normal data | `tasks: [...]` | Rendera listan. |
| `localStorage` blockerad | `storageDisabled: true` | Visa dämpat meddelande "Kan inte sparas". |
| Trasig JSON eller okänd version | `corrupted: true` | Visa "Tidigare data kunde inte läsas". |
| Element saknar fält | Element filtreras bort | Tyst (bara konsol-varning). |

---

## Migreringskontrakt (för framtiden)

- Om vi någonsin höjer `version` till `2`, ska `loadTasks` upptäcka `version: 1`
  och köra en explicit migrationsfunktion.
- Vi skriver aldrig över äldre data utan att ha läst den först.
- Migration sker engångsvis vid läsning, och resultatet skrivs tillbaka direkt.

I v1 finns ingen migrationskod — bara version-fältet.
