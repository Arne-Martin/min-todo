# Research: Todo-app (min-todo)

**Phase**: 0
**Date**: 2026-05-05
**Status**: Komplett – inga `NEEDS CLARIFICATION` återstår

Detta dokument samlar de tekniska val som plan.md vilar på. Varje val anges med
beslut, motivering och de alternativ som övervägdes.

---

## 1. Ramverk och språk

**Decision**: Next.js 15 (App Router) + TypeScript i `strict`-läge, scaffoldat via
`create-next-app`.

**Rationale**:
- Konstitutionen (princip III) kräver Next.js App Router och TypeScript.
- `create-next-app` ger ESLint, TS-konfig, App Router-skelett, viewport-meta och
  basal CSS-uppsättning — minimerar manuellt grundarbete och håller upplägget igenkännbart för andra som följt Next.js-dokumentationen.
- Strict TypeScript fångar typer av fel som annars skulle leta sig fram till
  webbläsaren — extra värdefullt utan automatiska tester.

**Alternatives considered**:
- **Vite + React**: Snabbare dev-server men kräver egen routing-konfig och saknar
  de inbyggda Next.js-konventionerna konstitutionen förutsätter. Avfärdas.
- **Plain HTML/CSS/JS**: Skulle uppfylla KISS i extrem grad men strider mot
  princip III som föreskriver Next.js. Avfärdas.

---

## 2. Klientrendering vs. server-komponenter

**Decision**: Hela `app/page.tsx` markeras som klientkomponent (`"use client"`).

**Rationale**:
- All data lever i `localStorage`, som bara finns i webbläsaren. Server-rendering
  ger ingen förrenderad lista — sidan måste ändå hydreras innan något visas.
- Att blanda server- och klientgränser för en så liten app skulle introducera
  begrepp (server actions, client islands) som en nybörjare inte behöver lära sig
  här. Strider mot princip IV (tydlig kod).
- Layouten (`app/layout.tsx`) förblir server-renderad — det räcker för viewport,
  `<html lang="sv">` och inkludering av `globals.css`.

**Alternatives considered**:
- **Server-komponent som hydrerar med Suspense + dynamic import**: Mer komplexitet
  utan att lösa något verkligt problem på ett klient-only-data-set. Avfärdas.

---

## 3. State-hantering och persistens

**Decision**: Custom hook `useTodos()` som internt använder `useState` för listan
och `useEffect` för att läsa/skriva `localStorage`. Inga reducers, ingen Context,
ingen tredjeparts-statebibliotek.

**Rationale**:
- Hela state är en lista av Task-objekt + ett filtervärde. Det rymms i en hook.
- En hook är begripligare än Context för en nybörjare och håller komponenterna
  rena från `localStorage`-detaljer.
- `useEffect` med dependency på listan synkar till `localStorage` automatiskt vid
  varje förändring — uppfyller FR-012 (omedelbar persistens) utan extra ramverk.

**Alternatives considered**:
- **`useReducer` + actions**: Stilrent men ger fler nya begrepp (action types,
  reducer-funktioner) för en mycket liten state-yta. Avfärdas mot princip IV.
- **Zustand / Jotai**: Bra bibliotek men strider mot princip I (inga extra
  beroenden) och princip III (inga UI-/state-bibliotek utan tvingande motiv).
- **React Context**: Onödigt när state inte behöver delas över ett djupt komponent­träd — vi har högst två nivåer. Avfärdas.

---

## 4. Ikoner

**Decision**: `lucide-react` för papperskorg (`Trash2`) och kryssikon (`Check`).

**Rationale**:
- Användaren har uttryckligen begärt `lucide-react`.
- Tree-shakable: bara de ikoner vi importerar hamnar i bundlen (~1 KB per ikon
  med SVG inlinad).
- React-komponenterna accepterar `aria-label`, `aria-hidden`, `size`, `strokeWidth`
  m.m. — nyttigt för tillgänglighet (princip II).
- Ingen bygg- eller fontkonfig krävs.

**Alternatives considered**:
- **Inline SVG**: Gör JSX:n bullrig och drar fokus från komponentlogiken. Avfärdas
  för läsbarhet (princip IV).
- **Emoji (🗑️ ✅)**: Renderas inkonsekvent på OS:er, ofta i färg vilket bryter den
  minimalistiska designen. Avfärdas.
- **Heroicons / React-Icons**: Likvärdig funktion men användaren valde lucide.

**Documented exception**: Detta är en avvikelse mot princip I (KISS). Den är
listad i `plan.md` > Complexity Tracking.

---

## 5. CSS-strategi

**Decision**: CSS Modules per komponent (`.module.css`) + en `globals.css` för
reset, CSS-variabler (färger, spacing) och baseline-typografi.

**Rationale**:
- Konstitutionen tillåter exakt detta (princip III).
- CSS Modules ger lokal scope utan någon byggkonfig — Next.js har inbyggt stöd.
- En global fil för CSS-variabler gör det enkelt att samla färger på ett ställe
  (vit bakgrund, mörk text, dämpad färg för klara uppgifter).
- Mobile-first: bas-stilarna gäller från 320 px; media queries adderar bara
  desktop-justeringar (t.ex. lite mer luft).

**Alternatives considered**:
- **Tailwind**: Förbjudet av princip III. Avfärdas.
- **styled-components / emotion**: Förbjudet av princip III. Avfärdas.
- **Sass / Less**: Onödig preprocessor. Avfärdas av princip I.

---

## 6. Bekräftelsedialoger

**Decision**: Webbläsarens inbyggda `window.confirm()` för både per-uppgift-borttagning och "Rensa klara".

**Rationale**:
- Spec.md > Assumptions fastställer detta val.
- Inga extra beroenden, fungerar redan med tangentbord och skärmläsare.
- Stilen är konsekvent med den minimalistiska designen — ingen egen modal.

**Alternatives considered**:
- **Egen modal-komponent** med fokus-trap, escape-hantering osv.: Komplext att
  bygga rätt accessibly och bryter mot princip I/IV.
- **Toast med ångra-knapp**: Trevligt UX men kräver state-hantering för
  pending-deletes och en egen ångra-mekanism. Out of scope.

---

## 7. ID-generering

**Decision**: `crypto.randomUUID()` (inbyggt i alla mål-webbläsare).

**Rationale**:
- Stöds nativt i alla moderna webbläsare; ingen polyfill behövs.
- Garanterat unikt, krockar inte vid snabba upprepade tillägg.

**Alternatives considered**:
- **Tidsstämpel som id (`Date.now()`)**: Riskerar krock vid samma millisekund.
  Avfärdas.
- **`uuid`-biblioteket**: Onödigt beroende när platformen redan löser det.
  Avfärdas av princip I.

---

## 8. Sortering

**Decision**: Sortering sker i `useTodos` baserat på `createdAt` desc (nyaste
överst). Sorteringen är stabil eftersom `createdAt` har millisekund­upplösning och
ID:t bryter eventuell oavgjort.

**Rationale**:
- Bekräftat i Clarifications-sessionen 2026-05-05.
- Att hålla sorteringen i hooken (en gång) snarare än i listkomponenten håller
  rendrings­logiken ren.

**Alternatives considered**:
- **Sortera vid render i `TodoList`**: Extra arbete vid varje render. Avfärdas.

---

## 9. Filtrering

**Decision**: Filterläget (`'alla' | 'kvar' | 'klara'`) bor i komponentträdets
toppnivå (`page.tsx`) som lokalt `useState`. Det persistas inte mellan
sessioner. `useTodos` exponerar den oändrade listan; filtreringen sker i
`TodoList` (eller direkt i `page.tsx` innan listan skickas vidare).

**Rationale**:
- Konsekvent med FR-018 (alltid "Alla" vid sidladdning) och FR-019 (filter
  persistas inte).
- Håller `useTodos` fokuserat på data, inte UI-tillstånd.

**Alternatives considered**:
- **Filter som del av `useTodos`-hookens state**: Bryter separation of concerns;
  hooken ska handla om data, inte vy. Avfärdas.

---

## 10. localStorage-nyckel och schema

**Decision**: Nyckel `min-todo:tasks`. Lagrar JSON-objekt
`{ version: 1, tasks: Task[] }`. Versionsfältet finns för framtida migreringar
men används inte för logik i v1.

**Rationale**:
- Namespaced nyckel (`appnamn:resurs`) gör det tydligt för alla som inspekterar
  webbläsarens devtools.
- Envelope (`version` + `tasks`) gör det möjligt att utöka schemat senare utan
  att existerande data går förlorat.

**Alternatives considered**:
- **Direkt array som rotvärde**: Funkar men gör framtida migreringar svårare.
  Avfärdas.
- **IndexedDB**: Overkill för max några tusen små poster. Avfärdas.

---

## 11. Felhantering vid `localStorage`

**Decision**: `lib/storage.ts` wrapps i try/catch. Vid läsfel (t.ex. korrupt
JSON eller `localStorage` ej tillgänglig) returneras tom array och en flagga
`storageDisabled` sätts på hooken. UI:t visar då en kort, dämpad notis ovanför
listan: "Dina uppgifter kan inte sparas i den här webbläsaren — de försvinner när
du stänger fliken."

**Rationale**:
- Uppfyller FR-024 (graceful degradation).
- Användaren får information utan att appen kraschar.

**Alternatives considered**:
- **Tyst falla tillbaka utan notis**: Bryter mot FR-024 ("informera användaren").
  Avfärdas.
- **Block hela UI:t med felmeddelande**: För dramatiskt — appen fungerar för
  sessionen ändå. Avfärdas.

---

## 12. Räknare och pluralis på svenska

**Decision**: Räknarens text är `"<n> uppgift kvar"` om n === 1, annars
`"<n> uppgifter kvar"` (inkluderar 0).

**Rationale**:
- Korrekt svensk pluralis utan i18n-bibliotek.
- En liten ren funktion i komponenten (eller i `lib/`).

**Alternatives considered**:
- **`Intl.PluralRules`**: Robust men mer än vad som behövs för en singel-form.
  Avfärdas av princip I.

---

## 13. Tester

**Decision**: Inga automatiska tester i v1. Verifiering sker manuellt i
webbläsaren mot acceptansscenarierna i `spec.md`.

**Rationale**:
- Konstitutionen kräver inte tester.
- Spec.md begär inte tester.
- Tasks-mallen anger uttryckligen att tester är frivilliga.
- En testuppsättning (Vitest/Jest + RTL + Playwright) är ett betydande
  inlärningsspår i sig — utanför scope för en första pedagogisk app.

**Alternatives considered**:
- **Lägg till Vitest + React Testing Library**: Värdefullt men gör introduktionen
  brantare. Lämpligt att lägga till i en framtida iteration.

---

## 14. Linting och formatering

**Decision**: Använd standardkonfigurationen som `create-next-app` ger
(ESLint med Next.js-presets). Ingen extra Prettier-konfig.

**Rationale**:
- Princip I och IV: använd det som finns out-of-the-box.
- ESLint:s Next.js-regler fångar de vanligaste misstagen utan extra setup.

**Alternatives considered**:
- **Prettier**: Trevligt men användaren kan formatera manuellt eller via
  IDE-stöd. Lägg till om/när stylingen blir inkonsekvent.

---

## Sammanfattning

Inga `NEEDS CLARIFICATION`-poster återstår. Alla val är dokumenterade och
spårbara mot konstitutionens principer. Plan klar för Phase 1 (data model +
contracts).
