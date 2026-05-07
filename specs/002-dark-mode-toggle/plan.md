# Implementation Plan: Mörkt läge-toggle

**Branch**: `002-dark-mode-toggle` | **Date**: 2026-05-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-dark-mode-toggle/spec.md`

## Summary

Lägg till en knapp uppe till höger på samma rad som h1-rubriken som växlar mellan
ljust och mörkt tema. Användarens val sparas i `localStorage` och följer mellan besök;
nya besökare utan sparat val ser ett tema som matchar systemets `prefers-color-scheme`
vid första laddning. Övergången animerar alla färgbärande ytor (bakgrund, text, ramar,
knappfärger, ikoner, fokusring) under 200 ms och respekteras till 0 ms när användaren
har `prefers-reduced-motion: reduce`.

**Teknisk approach**: CSS Custom Properties (CSS-variabler) definieras på `:root` för
ljust tema och överlagras på `[data-theme="dark"]` för mörkt tema. En liten
inline-script i `<head>` (i `app/layout.tsx`) sätter `data-theme`-attributet på
`<html>` *innan* React hydrerar — det förhindrar "flash of wrong theme" (FOUC). En ny
`<ThemeToggle />`-komponent renderas i sidans header bredvid h1; den använder en
`useTheme()`-hook som äger React-state, läser/skriver till `localStorage` och
applicerar `data-theme`-attributet via `useEffect`. Ikoner (`Sun`, `Moon`) hämtas från
`lucide-react` som redan är ett godkänt beroende. Inga nya tredjeparts­bibliotek
introduceras.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 20+ (LTS) för utveckling
**Primary Dependencies**: Next.js 15 (App Router), React 19, lucide-react (ikoner —
befintligt beroende; vi importerar `Sun` och `Moon` utöver de redan använda
`Trash2` och `Check`)
**Storage**: Webbläsarens `localStorage` (en ny nyckel `min-todo:theme` med
strängvärdet `"light"` eller `"dark"`; saknas nyckeln betyder det "följ system")
**Testing**: Manuell verifiering i webbläsaren (samma policy som i 001-todo-app —
`tsc --noEmit` och `next lint` agerar statisk kvalitetsspärr)
**Target Platform**: Webbläsare — senaste två huvudversionerna av Safari iOS, Chrome
Android, Firefox, Edge och Chrome desktop. Klient-only.
**Project Type**: Web (single-page client app, en sida — utökar befintlig)
**Performance Goals**: Temabyte upplevs omedelbart (animation klar inom 200 ms;
SC-001). Initial paint visar rätt tema utan blink (SC-004).
**Constraints**: Toggleknappens klickyta ≥ 44 × 44 px på alla skärmar (FR-006);
WCAG AA-kontrast i båda teman (FR-014); ingen horisontell scroll vid 320 px bredd
(princip VI); tangentbordsåtkomligt med synlig fokusring (FR-005).
**Scale/Scope**: En komponent, en hook, utökad `globals.css`. Påverkar `app/layout.tsx`
(inline pre-hydration script + `suppressHydrationWarning`) och `app/page.tsx` (header
ändras till en flexrad).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princip | Status | Anteckning |
|---|---|---|
| I. KISS – Hålls enkelt | ✅ | Inga nya beroenden. `lucide-react` återanvänds (redan godkänt undantag i 001). En komponent, en hook, en ny `localStorage`-nyckel. |
| II. Tillgänglighet | ✅ | `<button>` med dynamisk `aria-label`, synlig fokusring, klickyta ≥ 44 × 44 px, WCAG AA-kontrast i båda teman, respekterar `prefers-reduced-motion`. |
| III. Modern men inte trendig | ✅ | CSS Custom Properties (plattformsstandard) + befintlig CSS-Modules-strategi. Ingen ny CSS-i-JS, inget animationsbibliotek, inget temabibliotek. |
| IV. Tydlig kod över smart kod | ✅ | Hook med beskrivande namn (`useTheme`), tydliga konstanter (`THEME_STORAGE_KEY`), svenska kommentarer där syftet inte är uppenbart (t.ex. inline-scriptets FOUC-prevention). |
| V. En enda sida | ✅ | Toggleknappen sitter på samma sida (i headern). Ingen ny route, ingen modal, ingen settings-vy. |
| VI. Mobilvänlig | ✅ | Header blir en flexrad: rubrik vänster, knapp höger. Knappen är 44 × 44 px och får plats även vid 320 px bredd. |

**Resultat**: Pass. Inga nya avvikelser utöver det redan dokumenterade
`lucide-react`-undantaget från 001-todo-app. Re-evalueras efter Phase 1 design (se
sektionen längst ned).

## Project Structure

### Documentation (this feature)

```text
specs/002-dark-mode-toggle/
├── plan.md              # Denna fil
├── spec.md              # Funktionsspec (med Clarifications från 2026-05-07)
├── research.md          # Phase 0 output – tekniska val
├── data-model.md        # Phase 1 output – ThemeChoice-typ och storage-format
├── quickstart.md        # Phase 1 output – verifieringsguide för utvecklaren
├── contracts/           # Phase 1 output – interna kontrakt
│   ├── useTheme.md
│   └── theme-storage.md
├── checklists/
│   └── requirements.md  # Spec-kvalitetschecklista (från /speckit-specify)
└── tasks.md             # Genereras av /speckit-tasks (skapas EJ här)
```

### Source Code (repository root)

Tillägg och ändringar mot 001-todo-apps struktur. Endast filer som **berörs** av
denna feature listas — alla övriga filer (TodoInput, TodoList, TodoItem, FilterBar,
useTodos, storage.ts) är oförändrade.

```text
min-todo/
├── app/
│   ├── layout.tsx          # ÄNDRAS: + inline pre-hydration script i <head>;
│   │                       #         + suppressHydrationWarning på <html>
│   ├── page.tsx            # ÄNDRAS: header blir flexrad; <ThemeToggle /> renderas
│   ├── page.module.css     # ÄNDRAS: header-rad blir flex (space-between, align-center)
│   └── globals.css         # ÄNDRAS: CSS-variabler för ljust tema på :root,
│                           #         override för [data-theme="dark"], global
│                           #         color/background/border-transition (200 ms),
│                           #         prefers-reduced-motion-media-query
├── components/
│   ├── ThemeToggle.tsx           # NY: ikonknapp som anropar toggle() från useTheme
│   └── ThemeToggle.module.css    # NY: stil för knappen (44×44 px, fokusring)
├── hooks/
│   └── useTheme.ts         # NY: state + localStorage-synk + applicerar data-theme
└── lib/
    └── types.ts            # ÄNDRAS: + Theme-typer (ThemeChoice, ThemeMode)
```

**Structure Decision**: Vi behåller den platta strukturen som 001 etablerade —
`components/`, `hooks/`, `lib/` som syskon till `app/`. Den nya hooken ligger
bredvid `useTodos` och den nya komponenten bredvid övriga `*.tsx`. Tema-state
delas inte med todo-state, så ingen sammanslagning av hooks behövs (KISS).

## Complexity Tracking

> Inga nya avvikelser. Det enda dokumenterade undantaget i projektet
> (`lucide-react`) är redan listat i 001-todo-apps `plan.md` och påverkar inte
> denna feature ytterligare — vi importerar bara två extra ikoner från samma
> bibliotek.

---

## Phase 0: Outline & Research

Genererar `research.md` med slutgiltiga tekniska val, motiveringar och alternativ.
Frågor som måste besvaras innan Phase 1:

1. Hur förhindras "flash of wrong theme" (FOUC) i Next.js App Router?
2. CSS-variabel-strategi: hur struktureras ljust default vs. mörk override?
3. Hur appliceras `prefers-reduced-motion` på CSS-transitions globalt?
4. Vilken `localStorage`-nyckel och vilket värdeformat används?
5. Hur exponeras toggleknappens tillstånd för skärmläsare?

Inga `NEEDS CLARIFICATION` återstår från spec eller technical context — alla fyra
clarifications från Session 2026-05-07 är inarbetade.

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete

1. **Data model** → `data-model.md`: `ThemeChoice` (litterära värden), `ThemeMode`
   (det effektiva läget), och `localStorage`-formatet för nyckeln `min-todo:theme`.
2. **Contracts** → `contracts/`:
   - `useTheme.md` — publik signatur på hooken (`theme`, `effectiveTheme`,
     `setTheme`, `toggle`).
   - `theme-storage.md` — exakt format på `localStorage`-värdet, validering vid
     läsning, fallback­regler.
3. **Quickstart** → `quickstart.md`: Manuella verifieringssteg som speglar
   acceptanskriterierna i spec.md (US1, US2, US3 + edge cases).
4. **Agent context update**: Uppdatera `CLAUDE.md` mellan `<!-- SPECKIT START -->`
   och `<!-- SPECKIT END -->` så att den pekar på denna planfil.

### Post-Design Constitution Re-Check

Utförs efter att alla Phase 1-artefakter är genererade:

| Princip | Re-check |
|---|---|
| I. KISS | ✅ Designen visar att inga nya beroenden behövs. Inline pre-hydration scriptet är ~10 rader rent JS. Hooken har 4 publika fält. |
| II. Tillgänglighet | ✅ `useTheme`-kontraktet exponerar `effectiveTheme` så `aria-label` kan ändras dynamiskt. CSS-strategin har dokumenterad WCAG AA-palett. |
| III. Modern men inte trendig | ✅ CSS Custom Properties + `[data-theme]`-attribut är plattforms­standard. Inga bibliotek tillagda. |
| IV. Tydlig kod | ✅ Kontrakten har korta, namngivna actions (`setTheme`, `toggle`). En enda källa till sanning för storage-key (en konstant). |
| V. En enda sida | ✅ Inga nya routes. Toggleknappen är en komponent inom `page.tsx`. |
| VI. Mobilvänlig | ✅ 44 × 44 px-knapp får plats bredvid h1 vid 320 px bredd (rubriken är "Mina uppgifter" — kort nog). |

**Resultat**: Pass. Klar för `/speckit-tasks`.
