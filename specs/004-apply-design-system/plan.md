# Implementation Plan: Designöversyn — applicera designsystemet

**Branch**: `004-apply-design-system` | **Date**: 2026-05-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-apply-design-system/spec.md`

## Summary

Tillämpa konstitutionens v1.1.0 designsystem (Designspråk + Komponentprinciper) på
todo-appens befintliga CSS. Inga komponenters JSX-struktur, hooks eller
localStorage-kod ändras — bara stilar. Två konkreta JSX-ändringar tillåts:
(a) en `<span aria-hidden="true">☐</span>` läggs till i tom-tillståndet i
`<TodoList>`, och (b) inget annat. Mörkt-läges värden för `--accent-fg`, `--danger`
och `--ok` (öppna i konstitutionen) bestäms i denna feature och committas tillbaka
som amendment till konstitutionen efter implementation.

**Teknisk approach**: CSS Modules + CSS Custom Properties. Färger och hörn-radius
flyttas till variabler i `app/globals.css` så att `[data-theme="dark"]`-overrides
fortsätter fungera utan komponentlogik. Gap-variabeln `--gap` (12 px, bryter
8-skalan) tas bort och ersätts av direkta värden (`1rem`, `1.5rem`) på de få
ställen där den används. Hörn-radius delas i två: `--radius-button: 6px` och
`--radius-card: 8px`. En ny variabel `--ok` läggs till för success-färg
(används idag inte men föreskrivs av konstitutionen). Tema-bytes-transitionen i
`globals.css` byts från `200ms ease` till `200ms ease-out`. Komponenternas
hover/focus-transitions skrivs explicit som `200ms ease-out`. "Lägg till"-knappen
får `transition`-egenskap så hover-effekten blir observerbar (idag har den ingen).
Filter-aktiv-stilen byts från "kraftig bakgrund" till `border-bottom: 2px solid
var(--accent)` med matchande padding-justering så listan inte hoppar.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 20+ (LTS) för utveckling
**Primary Dependencies**: Next.js 16 (App Router), React 19, lucide-react
(befintliga — inga nya beroenden i denna feature)
**Storage**: Webbläsarens `localStorage` — orörd. Logiken i `useTodos` och
`useTheme` ändras inte.
**Testing**: Manuell verifiering i webbläsaren per konstitution + analytisk
WCAG-kontrastberäkning i `research.md`. `npm run lint && npm run build` agerar
statisk kvalitetsspärr.
**Target Platform**: Webbläsare — senaste två huvudversionerna av Safari iOS,
Chrome Android, Firefox, Edge och Chrome desktop. Klient-only.
**Project Type**: Web (single-page client app — utökar befintlig)
**Performance Goals**: Inga prestandakrav utöver de befintliga. CSS-variabel-
ändringar har försumbar runtime-kostnad.
**Constraints**:
- Inga nya bibliotek (princip I + användarens explicita instruktion).
- Inga JSX-strukturändringar utöver den enskilda `☐`-symbolen i `<TodoList>`
  (FR-022).
- Hooks och `lib/storage.ts` MÅSTE förbli orörda (FR-023).
- WCAG AA-kontrast i båda teman (FR-020).
- 8-px-skala genomgående (Designspråk > Skala).
**Scale/Scope**: 7 CSS-filer redigeras, 1 TSX-fil får en liten visuell tillägning
(`<TodoList>`-tom-tillstånd). Inga nya komponenter, inga nya hooks.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princip / Sektion | Status | Anteckning |
|---|---|---|
| I. KISS – Hålls enkelt | ✅ | Inga nya beroenden. Två CSS-variabler tillkommer (`--radius-button`, `--ok`); en tas bort (`--gap`). |
| II. Tillgänglighet | ✅ | Fokusring uppdateras till exakt `2px solid var(--accent)` (Komponentprinciper). Alla `aria-label`/`aria-hidden` bevaras. WCAG AA-kontrast verifieras analytiskt i `research.md` och praktiskt i T-uppgifter. |
| III. Modern men inte trendig | ✅ | CSS Modules + global CSS — exakt vad konstitutionen tillåter. Inga utility-frameworks eller CSS-i-JS introduceras. |
| IV. Tydlig kod över smart kod | ✅ | Variabler får beskrivande namn (`--radius-button` vs `--radius-card` istället för bara `--radius`). Inga magiska hex-värden i komponentstilar — alla refererar `var(--*)`. |
| V. En enda sida | ✅ | Inga route-ändringar. Inga modaler eller paneler. |
| VI. Mobilvänlig | ✅ | Klickytor 44 × 44 px bevaras (FR-021). Listans ökade luft (24 px) påverkar inte horisontell layout. |
| Designspråk | ✅ | *Det är hela poängen med featuren.* Färgpalett, typografi, skala, hörn, skuggor, animationer — alla appliceras enligt konstitutionen. |
| Komponentprinciper | ✅ | Knapphöjd, fokusring-stil, "aldrig ren vit"-bakgrund, ikoner från `lucide-react` 20 px — appliceras genomgående. |

**Resultat**: Pass före Phase 0. Re-evalueras efter Phase 1 design (sektion längst
ned). Inga avvikelser, inga `Complexity Tracking`-rader behövs.

## Project Structure

### Documentation (this feature)

```text
specs/004-apply-design-system/
├── plan.md              # Denna fil
├── spec.md              # Funktionsspec (med Clarifications från 2026-05-08)
├── research.md          # Phase 0 output – tekniska val och WCAG-verifiering
├── data-model.md        # Phase 1 output – designtokens (CSS-variabler)
├── quickstart.md        # Phase 1 output – manuell verifieringsguide
├── contracts/           # Phase 1 output – stil-kontrakt
│   ├── css-variables.md      # Vilka CSS-variabler komponenter får anta
│   └── component-styles.md   # Specifika styleregler per komponent
├── checklists/
│   └── requirements.md  # Spec-kvalitetschecklista
└── tasks.md             # Genereras av /speckit-tasks (skapas EJ här)
```

### Source Code (repository root)

Endast filer som **berörs** av denna feature listas. Alla övriga filer
(`hooks/*`, `lib/*`, `app/layout.tsx`, `components/*.tsx` utom `TodoList.tsx`,
m.fl.) är oförändrade.

```text
min-todo/
├── app/
│   ├── globals.css         # ÄNDRAS: ny palett, --gap tas bort, --radius
│   │                       #         delas i --radius-button + --radius-card,
│   │                       #         ny --ok-variabel, transition ease-out
│   ├── page.module.css     # ÄNDRAS: .warning skrivs om (neutral, var-baserad),
│   │                       #         .clearButton hover/focus-transition
│   ├── page.tsx            # OFÖRÄNDRAD
│   └── layout.tsx          # OFÖRÄNDRAD
├── components/
│   ├── TodoInput.module.css       # ÄNDRAS: gap → 1rem, addButton transition
│   ├── TodoList.tsx               # ÄNDRAS: <span ☐> i tom-tillstånd (FR-017)
│   ├── TodoList.module.css        # ÄNDRAS: list gap 24px, empty-stil med ikon
│   ├── TodoItem.module.css        # ÄNDRAS: padding/gap 8-multiplar, radius
│   ├── TodoItem.tsx               # OFÖRÄNDRAD
│   ├── FilterBar.module.css       # ÄNDRAS: .active blir border-bottom-underline
│   ├── FilterBar.tsx              # OFÖRÄNDRAD
│   ├── ThemeToggle.module.css     # ÄNDRAS: radius-button, transition ease-out
│   └── ThemeToggle.tsx            # OFÖRÄNDRAD
├── hooks/                  # OFÖRÄNDRAD HELT (FR-023)
└── lib/                    # OFÖRÄNDRAD HELT (FR-023)
```

**Structure Decision**: Vi behåller den platta strukturen. Ingen ny mapp, inga
nya komponenter. Designtokens samlas i `app/globals.css` (single source of
truth). Komponentstilar refererar tokens via `var(--*)`.

## Complexity Tracking

> Inga avvikelser från konstitutionen. Sektionen tom.

---

## Phase 0: Outline & Research

Genererar `research.md` med:

1. **Variabel-omstrukturering**: vilka variabler läggs till, ändras och tas bort,
   med rationale.
2. **WCAG-kontrastverifiering**: alla nya färgpar i båda teman, beräknade
   analytiskt enligt WCAG-formeln.
3. **Animationsstrategi**: var `200ms ease-out` appliceras och hur befintliga
   `200ms ease` (från 002) hanteras.
4. **Filter-aktiv-stil**: `border-bottom` vs `text-decoration` vs andra
   alternativ — slutligt val och varför.
5. **Warning-banner-omstilning**: hur den neutrala accent-overlay-looken
   konstrueras med endast befintliga variabler.
6. **Tom-tillstånds-symbol**: hur `☐` placeras (DOM, color inheritance,
   `aria-hidden`).
7. **Migration utan att bryta 002**: hur tema-byte-transitionen anpassas.

Inga `NEEDS CLARIFICATION` återstår — alla 4 öppna frågor i specen är besvarade
i Clarifications-sessionen 2026-05-08.

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete

1. **Data model** → `data-model.md`: Designtokens-tabell. Eftersom featuren inte
   introducerar någon runtime-data fungerar "data model" här som *design-token-
   katalog*: variabelnamn, värden per tema, var den används.
2. **Contracts** → `contracts/`:
   - `css-variables.md` — Vilken CSS-variabel-yta komponenter får förvänta sig
     från `globals.css`. Stabilitetsgaranti per variabel (kommer den finnas
     framöver?).
   - `component-styles.md` — Specifika styleregler per komponent (Lägg
     till-knappen, filter-aktiv-stilen, tom-tillstånd, warning-banner). Detta är
     "kontraktet" mellan spec och CSS-implementationen.
3. **Quickstart** → `quickstart.md`: Manuell verifieringsguide som speglar
   acceptanskriterierna i spec.md (US1, US2, US3 + edge cases) plus en explicit
   WCAG-kontrastrunda.
4. **Agent context update**: Uppdatera `CLAUDE.md` mellan `<!-- SPECKIT START -->`
   och `<!-- SPECKIT END -->` så att den pekar på denna planfil.

### Post-Design Constitution Re-Check

Utförs efter att alla Phase 1-artefakter är genererade:

| Princip / Sektion | Re-check |
|---|---|
| I. KISS | ✅ Designdokumenten introducerar inga nya beroenden. Token-katalogen är ren beskrivning av befintliga + två nya/ett borttaget värde. |
| II. Tillgänglighet | ✅ Kontrast-tabellen i `research.md` visar AA-passande värden i båda teman. |
| III. Modern men inte trendig | ✅ Strategi: CSS Modules + variabler bekräftad. |
| IV. Tydlig kod | ✅ Token-katalogen pekar varje variabel mot dess användning. Komponentstil-kontraktet beskriver konkreta selektorer och regler. |
| V. En enda sida | ✅ Inga route- eller layoutförändringar dokumenteras. |
| VI. Mobilvänlig | ✅ 44 px-klickytor och 320 px-bredd-funktion bevaras. |
| Designspråk | ✅ Datamodell + research speglar konstitutionens värden 1:1. |
| Komponentprinciper | ✅ Komponent-stil-kontraktet hämtar reglerna från konstitutionen ord för ord. |

**Resultat**: Pass. Inga nya avvikelser. Klar för `/speckit-tasks`.
