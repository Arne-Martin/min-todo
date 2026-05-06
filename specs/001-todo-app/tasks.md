---

description: "Task list för Todo-app (min-todo) – grupperad per user story enligt spec.md"
---

# Tasks: Todo-app (min-todo)

**Input**: Designdokument från `/specs/001-todo-app/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/useTodos.md`,
`contracts/storage-schema.md`, `quickstart.md`.

**Tests**: Inga automatiska tester i denna iteration. Konstitutionen (princip IV)
föreskriver manuell verifiering i webbläsaren mot acceptansscenarierna i `spec.md`.
Verifierings-tasks (T015, T017, T019, T022, T024, T028) är därför explicita kontroller
enligt `quickstart.md`.

**Organisation**: Tasks är grupperade per user story så att varje story kan utvecklas
och verifieras självständigt. P1 är MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Kan köras parallellt (olika filer, inga beroenden bakåt).
- **[Story]**: Knyter tasken till en specifik user story (US1–US5). Setup-, Foundational-
  och Polish-faser saknar story-etikett.
- Exakta filsökvägar anges i varje task (relativt repo-roten `min-todo/`).

---

## Phase 1: Setup (Delad infrastruktur)

**Purpose**: Skapa Next.js-projektet och lägg in den minimala basgrund som varje
user story bygger vidare på.

- [X] T001 Scaffolda Next.js-appen i repo-roten genom att köra `npx create-next-app@latest . --typescript --eslint --app --no-src-dir --no-tailwind --import-alias "@/*"`. Bekräfta promptet om att fortsätta i en icke-tom mapp (`.specify/`, `specs/`, `CLAUDE.md` ska bevaras). Om filerna `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs` finns efter körningen är T001 klar. **Anmärkning**: scaffolden vägrade köra i icke-tom mapp; löst genom att scaffolda i `C:/projects/min-todo-scaffold` och flytta innehållet hit (utom `.git/`, `.next/`, deras `CLAUDE.md`). Resultat: Next.js 16.2.4 (registry `latest` levererar nu 16, inte 15 — funktionellt likvärdigt för App Router-användning).
- [X] T002 [P] Installera ikonbiblioteket: `npm install lucide-react` (motiverat undantag i `plan.md` > Complexity Tracking).
- [X] T003 [P] Säkerställ att `tsconfig.json` har `"strict": true` under `compilerOptions` (princip III). Lägg också till `"DOM"` och `"ES2022"` i `lib`-arrayen om de saknas (krävs för `crypto.randomUUID`). **Verifierat**: scaffolden gav redan `strict: true` och `lib: ["dom","dom.iterable","esnext"]` — `esnext` täcker ES2022. Ingen ändring behövdes.
- [X] T004 [P] Uppdatera `app/layout.tsx`: byt `<html lang="en">` till `<html lang="sv">` och bekräfta att `metadata.viewport` (eller `export const viewport`) sätter `width=device-width, initial-scale=1`. Sätt `metadata.title` till "Mina uppgifter".
- [X] T005 [P] Ersätt det auto-genererade innehållet i `app/globals.css` med projektets baseline: CSS-reset (`*, *::before, *::after { box-sizing: border-box }` + `body { margin: 0 }`), CSS-variabler (`--bg: #ffffff`, `--fg: #1a1a1a`, `--muted: #6b6b6b`, `--accent: #2563eb`, `--border: #d4d4d4`, `--gap: 0.75rem`, `--radius: 0.5rem`), system-fontstack på `body`, och en synlig fokusring (`:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }`). Mobile-first: inga breakpoints alls i denna fil.
- [X] T006 [P] Ersätt `app/page.tsx` med en minimal `"use client"`-placeholder som bara renderar `<main><h1>Mina uppgifter</h1></main>`. Importera `page.module.css` (skapa filen tom så build:en går).
- [X] T007 [P] Skriv om repo-rotens `README.md` till en kort presentation av projektet med en länk till `specs/001-todo-app/quickstart.md` för utvecklare. Behåll `CLAUDE.md` orörd (uppdaterad av `/speckit-plan`).

**Checkpoint**: `npm run dev` visar en tom sida med rubriken "Mina uppgifter" på
`localhost:3000`. TypeScript- och ESLint-bygget passerar.

---

## Phase 2: Foundational (Blockerande förutsättningar)

**Purpose**: Datalager (typer, storage, hook) som alla user stories konsumerar.

**⚠️ CRITICAL**: Ingen user story kan börja förrän denna fas är klar.

- [X] T008 [P] Skapa `lib/types.ts` med exakt dessa exports per `data-model.md`: `Task` (`id: string`, `text: string`, `done: boolean`, `createdAt: number`), `Filter` (`'alla' | 'kvar' | 'klara'`), `StorageEnvelope` (`{ version: 1; tasks: Task[] }`), `StorageWarning` (`'unavailable' | 'corrupted'`), och `LoadResult` (de tre varianterna i `contracts/storage-schema.md`).
- [X] T009 Skapa `lib/storage.ts` enligt `contracts/storage-schema.md`: konstanten `STORAGE_KEY = 'min-todo:tasks'`, funktionen `loadTasks(): LoadResult` med SSR-guard (`typeof window === 'undefined'`), full validering enligt schemat (filtrerar bort element som saknar fält, markerar `corrupted: true` om >50 % filtreras), och `saveTasks(tasks: Task[]): { ok: boolean; reason?: 'unavailable' | 'quota' }` med `try/catch`. Kommentera funktionerna kortfattat på svenska. Beroende: T008.
- [X] T010 Skapa `hooks/useTodos.ts` enligt `contracts/useTodos.md`: returnerar `{ tasks, remainingCount, hasCompleted, storageWarning, add, toggle, remove, clearCompleted }`. Använd `useState` för intern lista, `useRef` (`hasHydrated`) för att skydda första rendern, `useEffect([])` som hydrerar via `loadTasks` och sätter `storageWarning`, och `useEffect([tasks])` som anropar `saveTasks` när `hasHydrated.current === true`. Sortera `tasks` med nyaste först (`b.createdAt - a.createdAt` med `id`-tiebreaker, per `data-model.md`). `add(text)` ska trimma, returnera tidigt vid tom sträng, slice:a till 200 tecken, och använda `crypto.randomUUID()` + `Date.now()`. Kommentera på svenska. Beroenden: T008, T009. **Anmärkning**: React 19 / Next.js 16 har en ny ESLint-regel `react-hooks/set-state-in-effect` som flaggar setState-anrop i useEffect. Lokalt undantag tillämpat i hookens hydration- och save-effekter — det är den dokumenterade React-idiomet för att synkronisera in från ett externt klient-only-API (localStorage finns inte under SSR).

**Checkpoint**: Datalagret kan importeras och unit-testas manuellt i konsolen om
man vill, men inget UI använder det än.

---

## Phase 3: User Story 1 – Lägga till och se uppgifter (Priority: P1) 🎯 MVP

**Goal**: Användaren kan skriva en uppgift, trycka Enter (eller +), se den i listan,
se en räknare, och få den att ligga kvar mellan sessioner.

**Independent Test**: Följ `quickstart.md` > "US1" — lägg till två uppgifter, ladda
om sidan, bekräfta att båda finns kvar och räknaren visar "2 uppgifter kvar".

### Implementation for User Story 1

- [X] T011 [P] [US1] Skapa `components/TodoInput.tsx` (`'use client'` ej nödvändigt – komponenten konsumeras från klient-sidan): props `{ onAdd: (text: string) => void }`. Renderar ett `<form onSubmit>` med ett `<label>` (visuellt dolt eller synligt) "Ny uppgift", `<input type="text" maxLength={200}>` och en `<button type="submit">` som visar lucide-ikonen `Plus` med `aria-label="Lägg till"`. Hanterar lokalt input-state med `useState`, anropar `onAdd(text)` vid submit, tömmer fältet och behåller fokus. Disable submit-knappen när `text.trim() === ''`. Skapa `components/TodoInput.module.css` med stil för formulär, fältbredd 100 %, plus-knappen ≥ 44 × 44 px. Beroende: T002 (lucide).
- [X] T012 [P] [US1] Skapa `components/TodoList.tsx`: props `{ tasks: Task[]; onToggle: (id: string) => void; onRemove: (id: string) => void; emptyMessage: string }`. Renderar antingen `<ul>` med en `TodoItem` per task, eller en `<p className="empty">{emptyMessage}</p>` om listan är tom. Skapa `components/TodoList.module.css` (lista utan punkter, 0 padding-vänster, gap mellan rader). Beroende: T008, T013.
- [X] T013 [P] [US1] Skapa `components/TodoItem.tsx` med MINIMAL implementation för US1: props `{ task: Task; onToggle: (id: string) => void; onRemove: (id: string) => void }`. Renderar bara texten i ett `<li>` för tillfället (checkbox och papperskorg läggs till i US2/US3). Skapa `components/TodoItem.module.css` med basstil för raden (flex layout med utrymme för kommande kontroller). Beroende: T008.
- [X] T014 [US1] Bygg ut `app/page.tsx` med full US1-funktionalitet: importera `useTodos`, `TodoInput`, `TodoList`. Lägg `'use client'` överst. Rendera `<h1>Mina uppgifter</h1>`, ett villkorligt varningsbanner när `storageWarning === 'unavailable'` (text: "Dina uppgifter kan inte sparas i den här webbläsaren – de försvinner när du stänger fliken.") respektive `'corrupted'` ("Tidigare data kunde inte läsas och har återställts."), `<TodoInput onAdd={add} />`, `<TodoList tasks={tasks} onToggle={toggle} onRemove={remove} emptyMessage="Inga uppgifter än" />`, och en räknare `<p aria-live="polite">{remainingCount === 1 ? '1 uppgift kvar' : \`${remainingCount} uppgifter kvar\`}</p>`. Lägg till `useState<Filter>('alla')` redan nu (filtreringen aktiveras i US4 men variabeln är harmlös). Skriv `app/page.module.css` med en centrerad `<main>` med `max-width: 600px`, `margin: 0 auto`, `padding: 1.5rem 1rem` (mobile-first; ingen extra desktop-justering behövs här). Beroenden: T010, T011, T012, T013.
- [ ] T015 [US1] Manuell verifiering av US1 enligt `quickstart.md` > "US1 – Lägga till och se uppgifter". Pricka av alla rader i listan. Kör `npm run build` och säkerställ noll fel/varningar. **Status**: `npm run build` passerar utan fel/varningar. **Webbläsar­verifiering återstår — användaren utför detta efter implementation är klar.**

**Checkpoint**: User Story 1 är fullt fungerande och testbar självständigt — appen
är användbar som en enkel notisblock-todo redan här.

---

## Phase 4: User Story 2 – Markera klar / inte klar (Priority: P2)

**Goal**: Användaren kan kryssa av uppgifter; klara uppgifter visas överstrukna och
dämpade; räknaren räknar bara kvarvarande.

**Independent Test**: Följ `quickstart.md` > "US2" — kryssa, ladda om, kryssa av igen.

### Implementation for User Story 2

- [X] T016 [US2] Utöka `components/TodoItem.tsx`: lägg till en `<input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)}>` med ett associerat `<label>` som visar `task.text` (för korrekt klick- och tangent­bordsstöd via etikettkoppling). När `task.done === true` ska radens text få klassen `done` (CSS Modules) som applicerar `text-decoration: line-through` och `color: var(--muted)`. Uppdatera `components/TodoItem.module.css` med klassen `.done`, samt se till att `<label>`-ytan har minst 44 px höjd och pekarpekare (`cursor: pointer`). Säkerställ att fokusringen fortfarande syns på checkboxen (kommer från `globals.css`). Beroende: T013.
- [ ] T017 [US2] Manuell verifiering av US2 enligt `quickstart.md` > "US2 – Markera klar / inte klar". Bekräfta också att en kryssad uppgift behåller sin position (FR-012a) — ingen automatisk omsortering vid statusbyte. **Webbläsar­verifiering återstår — användaren utför detta efter implementation är klar.**

**Checkpoint**: US1 + US2 fungerar tillsammans.

---

## Phase 5: User Story 3 – Ta bort uppgift (Priority: P3)

**Goal**: Användaren kan klicka papperskorg-ikonen, bekräfta i en dialog, och få
uppgiften borttagen permanent.

**Independent Test**: Följ `quickstart.md` > "US3" — klicka papperskorg, avbryt,
klicka igen och bekräfta, ladda om.

### Implementation for User Story 3

- [X] T018 [US3] Utöka `components/TodoItem.tsx`: lägg till en `<button type="button" aria-label={\`Ta bort "${task.text}"\`}>` som renderar lucide-ikonen `Trash2`. Klick-handlern anropar `window.confirm(\`Vill du ta bort "${task.text}"?\`)` och kallar `onRemove(task.id)` endast om användaren bekräftar. Knappen ska ha minst 44 × 44 px klickyta. Stilen i `components/TodoItem.module.css`: knappen är genomskinlig, ikonen i `var(--muted)`, hover/focus i `var(--fg)`. Lucide-ikonen får `aria-hidden="true"` (eftersom knappen redan har `aria-label`). Beroende: T002, T016.
- [ ] T019 [US3] Manuell verifiering av US3 enligt `quickstart.md` > "US3 – Ta bort uppgift". Bekräfta att avbruten dialog lämnar listan helt orörd (FR-015). **Webbläsar­verifiering återstår — användaren utför detta efter implementation är klar.**

**Checkpoint**: US1 + US2 + US3 fungerar tillsammans.

---

## Phase 6: User Story 4 – Filtrera vy (Priority: P4)

**Goal**: Användaren kan välja "Alla", "Kvar" eller "Klara" i en filterrad och
listan uppdateras direkt. Aktivt filter visas tydligt.

**Independent Test**: Följ `quickstart.md` > "US4" — verifiera alla tre filter och
att Alla återställs vid sidladdning.

### Implementation for User Story 4

- [X] T020 [US4] Skapa `components/FilterBar.tsx`: props `{ filter: Filter; onChange: (f: Filter) => void }`. Renderar tre `<button type="button">`-element ("Alla", "Kvar", "Klara") inom en `<div role="group" aria-label="Filtrera uppgifter">`. Aktiv knapp får `aria-pressed="true"` och en CSS-klass `active`. Skapa `components/FilterBar.module.css` med flex-layout, gap mellan knapparna, klickytor ≥ 44 × 44 px. Aktiv stil: kraftigare bakgrund (`var(--accent)` eller `var(--fg)`) med kontrasterande text — säkerställ WCAG AA. Beroende: T008.
- [X] T021 [US4] Uppdatera `app/page.tsx`: importera `FilterBar`, rendera den under räknaren, koppla till `filter`/`setFilter`-state som redan finns. Filtrera tasks lokalt innan de skickas till `TodoList`: `filter === 'alla' ? tasks : filter === 'kvar' ? tasks.filter(t => !t.done) : tasks.filter(t => t.done)`. Skicka en filter-anpassad `emptyMessage` till `TodoList` ("Inga kvarvarande uppgifter" / "Inga klara uppgifter" / "Inga uppgifter än"). Beroende: T020.
- [ ] T022 [US4] Manuell verifiering av US4 enligt `quickstart.md` > "US4 – Filtrera". Bekräfta att (a) aktiv flik är synligt distinkt även för en daltonisk betraktare (testa med devtools' Rendering > Emulate vision deficiencies), och (b) filtret återgår till "Alla" efter sidladdning (FR-018). **Webbläsar­verifiering återstår — användaren utför detta efter implementation är klar.**

**Checkpoint**: Alla user stories utom Rensa klara fungerar.

---

## Phase 7: User Story 5 – Rensa klara (Priority: P5)

**Goal**: Användaren kan ta bort alla klara uppgifter på en gång efter bekräftelse.

**Independent Test**: Följ `quickstart.md` > "US5" — skapa fem uppgifter, kryssa
tre, klicka Rensa klara, avbryt, klicka igen och bekräfta.

### Implementation for User Story 5

- [X] T023 [US5] Uppdatera `app/page.tsx`: rendera en `<button type="button">` med texten "Rensa klara" under FilterBar. Knappen är inaktiverad (`disabled={!hasCompleted}`) när ingen klar uppgift finns (FR-021). Klick-handler: `if (window.confirm('Vill du ta bort alla klara uppgifter?')) clearCompleted();`. Stil: lägg en klass i `app/page.module.css` (`.clearButton`) som kompletterar globala fokusringen och ger knappen rimlig padding/margin från filtren. Säkerställ att `disabled`-tillståndet har visuell distinktion (lägre opacity, inte bara grayed-out av webbläsaren).
- [ ] T024 [US5] Manuell verifiering av US5 enligt `quickstart.md` > "US5 – Rensa klara". Bekräfta särskilt att avbruten bekräftelse lämnar listan oförändrad. **Webbläsar­verifiering återstår — användaren utför detta efter implementation är klar.**

**Checkpoint**: Alla user stories är implementerade.

---

## Phase 8: Polish & tvärgående kvalitetskontroll

**Purpose**: Avstämning mot konstitutionens principer II, V, VI och spec:s
framgångskriterier.

- [ ] T025 [P] Tabba genom hela appen från en omladdad `localhost:3000`: input → +-knapp → varje uppgifts checkbox → varje papperskorg → varje filterknapp → "Rensa klara". Bekräfta att fokusringen är synlig på alla element. Använd Mellanslag på checkboxar och Enter på knappar. (Konst. II + FR-030, FR-031.) **Webbläsar­verifiering återstår.**
- [ ] T026 [P] Öppna devtools > Device toolbar och testa iPhone SE (375 × 667), Galaxy S8 (360 × 740), och en manuell 320 × 568. Bekräfta: ingen horisontell scroll, kolumnen centrerad, alla klickytor ≥ 44 × 44 px (mät i Inspect-läget). (Konst. VI + FR-028, FR-029.) **Webbläsar­verifiering återstår.**
- [X] T027 [P] Kör `npm run build` och `npm run lint`. Båda ska passera utan fel eller varningar. Om `next lint`-varningar uppstår, åtgärda dem hellre än att tysta dem (princip IV). Säkerställ också att TS-felaktig kod (`tsc --noEmit`) flaggas — bygget gör detta automatiskt. **Resultat**: båda passerar utan fel eller varningar. `npm run build` (Next.js 16 / Turbopack) genererar `/` och `/_not-found` som statiska sidor.
- [ ] T028 [P] Kör hela `quickstart.md` "Manuell testkörning" från start till slut i en frisk webbläsarflik (rensa `localStorage` först). Pricka av varje rad. Detta är den definitiva acceptansgenomgången mot SC-001…SC-007. **Webbläsar­verifiering återstår.**
- [ ] T029 [P] Verifiera felhantering enligt `quickstart.md` > "Felhantering — `localStorage`": (a) Saknad nyckel → tom-lista-placeholder. (b) Korrupt JSON i nyckeln → "Tidigare data kunde inte läsas". (c) Privat/incognito → varningsbanner om att uppgifter inte kan sparas. (SC-008 + FR-024.) **Webbläsar­verifiering återstår.**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Inga beroenden — kör först.
- **Foundational (Phase 2)**: Beror på Setup — BLOCKERAR alla user stories.
- **User Stories (Phase 3+)**: Alla beror på Foundational. Kan göras i prioritetsordning P1 → P2 → P3 → P4 → P5, eller i princip parallellt (men med samma fil-konflikter, se nedan).
- **Polish (Phase 8)**: Beror på att de user stories man vill leverera är klara.

### User Story Dependencies

- **US1 (P1)**: Inga story-beroenden. Komponenterna `TodoInput`, `TodoList`, `TodoItem`-skelett byggs här.
- **US2 (P2)**: Beror **inte** funktionellt på US1, men T016 redigerar samma fil som T013 (`TodoItem.tsx`). Sekventiellt.
- **US3 (P3)**: Samma fil-relation som US2 (T018 redigerar `TodoItem.tsx`). Sekventiellt efter US2.
- **US4 (P4)**: T021 redigerar `app/page.tsx` (samma fil som T014). Sekventiellt efter US1.
- **US5 (P5)**: T023 redigerar `app/page.tsx`. Sekventiellt efter US4.

### Within Each User Story

- Skapa nya komponentfiler först ([P]-bara), wire-up i `page.tsx` sist (sekventiellt).
- Verifierings-tasken är alltid sista i sin fas.

### Parallel Opportunities

- Setup: T002–T007 är alla [P] (T001 måste vara klar först).
- Foundational: T008 är [P]; T009 och T010 är sekventiella (beroende på T008 respektive T009).
- US1: T011, T012, T013 är [P] (olika filer); T014 sekventiell.
- US4: T020 är [P]; T021 sekventiell.
- Polish: T025–T029 är alla [P] (oberoende kontroller).

---

## Parallel Example: User Story 1

```bash
# När Foundational är klart kan dessa tre köras parallellt (olika filer):
Task: "T011 [P] [US1] Skapa components/TodoInput.tsx + .module.css"
Task: "T012 [P] [US1] Skapa components/TodoList.tsx + .module.css"
Task: "T013 [P] [US1] Skapa components/TodoItem.tsx + .module.css (US1-version)"

# Sedan sekventiellt:
Task: "T014 [US1] Bygg ut app/page.tsx med US1-funktionalitet"
Task: "T015 [US1] Manuell verifiering av US1 mot quickstart.md"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Klar Phase 1 + Phase 2.
2. Klar Phase 3 (US1).
3. **STOP & VALIDATE**: Kör T015 — appen fungerar redan som en minimal todo-lista.

### Incremental Delivery

1. MVP (US1) → demo / självverifiering.
2. Lägg till US2 → demo (kan kryssa av).
3. Lägg till US3 → demo (kan ta bort).
4. Lägg till US4 → demo (kan filtrera).
5. Lägg till US5 → demo (kan rensa klara).
6. Polish-fasen — sista kvalitetskontroll innan leverans.

### Solo-utvecklare (det här projektet)

Eftersom du är ensam utvecklare och stories delar två filer (`TodoItem.tsx`,
`page.tsx`) är det enklast att gå strikt sekventiellt P1 → P5 och köra Polish
sist. Inga merge-konflikter att hantera.

---

## Notes

- **[P] = parallellt möjligt** (olika filer, inga öppna beroenden).
- **[Story]-etikett** kopplar tasken till en user story så att man kan följa
  vilken effekt varje rad har för slutanvändaren.
- **Manuell verifiering**: konstitutionen kräver detta — pricka av rader i
  `quickstart.md` snarare än att hoppa över verifierings-tasksen.
- **Commit-rytm**: en commit per task (eller per logisk grupp som T011–T014) gör
  historiken pedagogisk för läsaren.
- **Stoppa vid checkpoint**: appen är användbar redan vid US1-checkpointen och
  varje följande story bygger på en fungerande bas.
