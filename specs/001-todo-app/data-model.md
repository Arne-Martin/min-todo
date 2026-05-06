# Data Model: Todo-app (min-todo)

**Phase**: 1
**Date**: 2026-05-05

Detta dokument beskriver dataformaten i appen — både i minnet (TypeScript-typer)
och i `localStorage`.

---

## Entity: `Task`

En enskild att-göra-rad.

| Fält | Typ | Krav | Beskrivning |
|---|---|---|---|
| `id` | `string` | obligatoriskt, unikt | UUID v4 genererad via `crypto.randomUUID()`. Stabilt över persistens. |
| `text` | `string` | obligatoriskt, längd 1–200 efter trimning | Användarens text. Tomma och whitespace-only blockeras vid input (FR-003). |
| `done` | `boolean` | obligatoriskt | `true` om uppgiften är markerad klar. Standard `false` vid skapande. |
| `createdAt` | `number` (Unix ms) | obligatoriskt | Tidsstämpel vid skapande. Används som primär sorteringsnyckel (desc). |

### Validering

- `text.trim().length >= 1` — annars läggs uppgiften inte till.
- `text.length <= 200` — input-elementets `maxLength` håller detta vid skrivning;
  `lib/storage.ts` trunkerar vid läsning ifall någon manipulerat datat manuellt.
- `done` är alltid en strikt boolean (inte truthy-värde).

### Livscykel

```
[skapad: done=false] ──toggle──> [klar: done=true] ──toggle──> [skapad: done=false]
       │                                  │
       └─────── ta bort ──────────────────┴─────── rensa klara ─────> [borttagen]
```

Inga andra tillstånd. Texten kan inte redigeras (out of scope per spec).

---

## Entity: `Filter` (klient-vy-state)

Inte persistat, finns bara i komponentens `useState`.

```ts
type Filter = 'alla' | 'kvar' | 'klara';
```

- Standardvärde: `'alla'` vid varje sidladdning (FR-018).
- Påverkar bara vilka `Task` som visas i `TodoList` — själva datat är orört.

---

## Storage Envelope

Vad som skrivs till och läses från `localStorage`-nyckeln `min-todo:tasks`.

```ts
type StorageEnvelope = {
  version: 1;
  tasks: Task[];
};
```

| Fält | Typ | Beskrivning |
|---|---|---|
| `version` | `1` (literal) | Schemaversion. Tillåter framtida migreringar utan dataförlust. |
| `tasks` | `Task[]` | Hela listan av uppgifter. Ordning är inte semantiskt viktig i lagringen — sortering sker vid läsning. |

### Serialisering

```ts
localStorage.setItem('min-todo:tasks', JSON.stringify(envelope));
```

### Deserialisering

`lib/storage.ts` läser, tolkar och returnerar `tasks` (eller tom array vid fel).
Vid läsning sker dessa kontroller i ordning:

1. Anrop `localStorage.getItem('min-todo:tasks')`. Vid undantag (privat läge, kvot,
   blockerad åtkomst) returneras `{ tasks: [], storageDisabled: true }`.
2. Om värdet är `null` (första besöket) returneras `{ tasks: [], storageDisabled: false }`.
3. `JSON.parse` på värdet. Vid fel returneras `{ tasks: [], storageDisabled: false,
   corrupted: true }` så hooken kan visa ett dämpat meddelande.
4. Validera att resultatet är ett objekt med `tasks: Array`. Om inte, behandla som
   korrupt (samma som steg 3).
5. För varje element i `tasks`: kontrollera att `id`, `text`, `done`, `createdAt`
   har rätt typ. Element som inte uppfyller kraven kastas tyst (logga en gång till
   konsol).

---

## Identitet och unikhet

- `id` är primärnyckel. Två `Task` med samma text men olika `id` är olika
  uppgifter (dubbletter tillåtna per spec).
- `useTodos` använder `id` för alla operationer (`toggle(id)`, `remove(id)`).

---

## Sorteringsregel

Vid varje render sorteras listan så att nyaste (`createdAt` störst) ligger överst.
Stabil sortering via:

```ts
tasks.slice().sort((a, b) =>
  b.createdAt - a.createdAt || (a.id < b.id ? -1 : 1)
);
```

`id`-jämförelsen finns bara som tiebreaker om två uppgifter någonsin skulle få
samma `createdAt` (osannolikt med `Date.now()`-precision men billigt att gardera
sig).

---

## Migreringsstrategi (för framtiden)

Inte aktuell i v1, men dokumenterad:

- Om `version` saknas eller är annan än `1` antas datat vara korrupt.
- Vid `version: 2` introduceras en migrationsfunktion `migrateV1ToV2(envelope)`.
- Existerande data ska aldrig skrivas över utan att ha tolkats korrekt.

---

## Storleksuppskattning

En typisk Task vid serialisering:

```json
{"id":"f81d4fae-7dec-11d0-a765-00a0c91e6bf6","text":"Köp mjölk","done":false,"createdAt":1746432000000}
```

Cirka 110 byte. `localStorage`-kvoten är ~5 MB per origin → ~45 000 uppgifter
innan kvoten nås. Långt över alla tänkbara användningsfall för en personlig
todo-app.
