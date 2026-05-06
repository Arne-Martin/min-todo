# Implementation Plan: Todo-app (min-todo)

**Branch**: `001-todo-app` | **Date**: 2026-05-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-app/spec.md`

## Summary

En klientside-only todo-app som låter användaren lägga till, kryssa av, ta bort, filtrera
och rensa uppgifter. All data sparas i webbläsarens `localStorage`. Layouten är en
centrerad kolumn (max 600 px) som fungerar lika bra på mobil som på desktop.

**Teknisk approach**: Next.js 15 (App Router) + TypeScript scaffoldat med
`create-next-app`. En enda klient-renderad sida (`app/page.tsx` med `"use client"`)
delegerar till fyra små komponenter (`TodoInput`, `TodoList`, `TodoItem`, `FilterBar`)
och en custom hook `useTodos()` som äger all state och `localStorage`-synk. CSS Modules
används för komponentstilar; en `globals.css` håller reset, färger och typografi. Enda
externa beroende utöver Next.js-stacken är `lucide-react` för ikoner — godkänt undantag
mot KISS-principen, motiverat under Complexity Tracking.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 20+ (LTS) för utveckling
**Primary Dependencies**: Next.js 15 (App Router), React 19, lucide-react (ikoner)
**Storage**: Webbläsarens `localStorage` (en JSON-nyckel `min-todo:tasks`)
**Testing**: Manuell verifiering i webbläsaren per konstitutionen — inga automatiska
tester i denna iteration. Type-check via `tsc --noEmit` och `next lint` agerar
statisk kvalitetsspärr.
**Target Platform**: Webbläsare — senaste två huvudversionerna av Safari iOS, Chrome
Android, Firefox, Edge och Chrome desktop. Klient-only; ingen server-runtime utöver
Next.js dev-server och statiska byggfiler.
**Project Type**: Web (single-page client app, en sida)
**Performance Goals**: Inga märkbara fördröjningar vid 50 uppgifter (SC-005). Konkret
mål: alla interaktioner (lägg till/kryssa/filtrera/rensa) renderas inom 100 ms på en
medelpresterande mobil.
**Constraints**: Max-bredd 600 px för kolumnen; fungerar från 320 px breda skärmar utan
horisontell scroll; klickytor ≥ 44 × 44 px; WCAG AA-kontrast; tangentbordsåtkomligt.
**Scale/Scope**: Ingen formell övre gräns på antal uppgifter; praktiskt taget begränsad
av `localStorage`-kvoten (~5 MB) vilket motsvarar tiotusentals uppgifter.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princip | Status | Anteckning |
|---|---|---|
| I. KISS – Hålls enkelt | ⚠ Justified exception | `lucide-react` är ett extra beroende. Motiverat i Complexity Tracking. Inga andra extras. |
| II. Tillgänglighet | ✅ | Plan använder semantisk HTML (`<form>`, `<input type="text">`, `<input type="checkbox">`, `<ul>`, `<button>`). Ikonknappar får `aria-label`. Synlig fokusring bevaras. |
| III. Modern men inte trendig | ✅ | Next.js App Router + TS strict + CSS Modules + global CSS. Inga UI-bibliotek, inga animations­bibliotek, ingen CSS-i-JS. `lucide-react` är ikoner, inte UI-komponenter. |
| IV. Tydlig kod över smart kod | ✅ | Små komponenter, en hook med tydligt namn (`useTodos`), beskrivande variabelnamn, svenska kommentarer där syftet inte är uppenbart. |
| V. En enda sida | ✅ | Endast `/`-routen. Hela appen i `app/page.tsx`. |
| VI. Mobilvänlig | ✅ | Mobile-first CSS, max-bredd 600 px, klickytor ≥ 44 × 44 px, viewport-meta i layout. |

**Resultat**: Pass — med en dokumenterad och motiverad avvikelse på princip I.
Re-evalueras efter Phase 1 design (se sektionen längst ned).

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-app/
├── plan.md              # Denna fil
├── spec.md              # Funktionsspec
├── research.md          # Phase 0 output – tekniska val
├── data-model.md        # Phase 1 output – Task-entity och storage-format
├── quickstart.md        # Phase 1 output – kom-igång för utvecklaren
├── contracts/           # Phase 1 output – interna kontrakt (hook + storage)
│   ├── useTodos.md
│   └── storage-schema.md
├── checklists/
│   └── requirements.md  # Spec-kvalitetschecklista (från /speckit-specify)
└── tasks.md             # Genereras av /speckit-tasks (skapas EJ här)
```

### Source Code (repository root)

```text
min-todo/
├── app/
│   ├── layout.tsx          # Root layout, <html lang="sv">, viewport meta, globals.css
│   ├── page.tsx            # "use client" – App-komponenten (rubrik + delegering)
│   ├── page.module.css     # Layout för App (centrerad kolumn 600 px)
│   └── globals.css         # Reset, färger, typografi, fokusring
├── components/
│   ├── TodoInput.tsx
│   ├── TodoInput.module.css
│   ├── TodoList.tsx
│   ├── TodoList.module.css
│   ├── TodoItem.tsx
│   ├── TodoItem.module.css
│   ├── FilterBar.tsx
│   └── FilterBar.module.css
├── hooks/
│   └── useTodos.ts         # Hela state-livscykeln + localStorage-synk
├── lib/
│   ├── storage.ts          # Säker läs/skriv till localStorage med felhantering
│   └── types.ts            # Task, Filter, StorageEnvelope
├── public/
│   └── favicon.ico         # (genereras av create-next-app)
├── package.json
├── tsconfig.json           # strict: true
├── next.config.ts
├── eslint.config.mjs       # Next.js standardregler
└── README.md               # Hänvisar till specs/001-todo-app/quickstart.md
```

**Structure Decision**: En platt Next.js 15-app utan `src/`-prefix. Komponenter, hooks
och lib bor som syskonmappar till `app/` för att en nybörjare snabbt ska se hela
arkitekturen utan djup nesting. Endast en route — ingen routing-katalog behövs utöver
`app/page.tsx`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| `lucide-react` som tredjepartsberoende (avviker från princip I: KISS) | Två ikoner krävs: papperskorg (ta bort) och kryss/check (klar). Ikonerna ska skala på olika upplösningar och vara tillgängliga. Användaren har explicit valt biblioteket. | (a) Inline SVG i komponenten — fungerar men gör JSX:n bullrig och svår att läsa för en nybörjare. (b) Emoji (🗑️ ✅) — inkonsekvent rendering på olika OS, ser ostädat ut. (c) En egen ikonmapp med SVG-filer — mer underhåll än värt för bara två ikoner. `lucide-react` är ~15 KB tree-shakat, har bra typer, accepterar `aria-label`/`aria-hidden` och är användarens uttryckliga val. |

---

## Phase 0: Outline & Research

Genererar `research.md` med slutgiltiga tekniska val, motiveringar och alternativa
vägar som övervägdes. Inga `NEEDS CLARIFICATION` återstår från spec eller technical
context.

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete

1. **Data model** → `data-model.md`: Task-entity (id, text, done, createdAt) plus
   storage-envelope `{ version, tasks }`.
2. **Contracts** → `contracts/`:
   - `useTodos.md` – publik yta (state + actions) som komponenterna konsumerar.
   - `storage-schema.md` – format på data i `localStorage`, versionshantering,
     felhanteringsregler.
3. **Quickstart** → `quickstart.md`: Steg-för-steg för en utvecklare att starta
   appen lokalt och verifiera kärnflöden manuellt.
4. **Agent context update**: Pek ut denna planfil från `CLAUDE.md` mellan
   `<!-- SPECKIT START -->` och `<!-- SPECKIT END -->`.

### Post-Design Constitution Re-Check

Utförd efter att alla Phase 1-artefakter genererats:

| Princip | Re-check |
|---|---|
| I. KISS | ✅ Inga ytterligare beroenden införda i designen utöver `lucide-react` (redan undantag). State-hanteringen håller sig till `useState` + `useEffect` — ingen reducer, ingen Context, ingen Redux. |
| II. Tillgänglighet | ✅ Datamodell och kontrakt nämner inget UI-tillstånd som inte kan uttryckas i semantisk HTML. Ikonknappar har dokumenterade `aria-label`. |
| III. Modern men inte trendig | ✅ Inga nya bibliotek tillkomna. App Router och TS strict bekräftade. |
| IV. Tydlig kod | ✅ Hook-kontraktet visar små, namngivna actions (`add`, `toggle`, `remove`, `clearCompleted`). |
| V. En enda sida | ✅ En route bekräftad i strukturen. |
| VI. Mobilvänlig | ✅ Mobile-first-strategi nedtecknad i quickstart. |

**Resultat**: Pass. Inga nya avvikelser. Klar för `/speckit-tasks`.
