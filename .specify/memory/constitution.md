<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Bump rationale: MINOR — två nya top-level-sektioner ("Designspråk" och
    "Komponentprinciper") tillagda. Ingen befintlig princip omdefinieras
    eller tas bort; den existerande Tillgänglighets- och Mobilvänlig-
    principen kompletteras med konkreta värden i de nya sektionerna.

Modifierade principer: (inga)
Tillagda sektioner:
  - Designspråk
      - Färgpalett (ljust + mörkt läge)
      - Typografi
      - Skala
      - Hörn
      - Skuggor
      - Animationer
  - Komponentprinciper

Borttagna sektioner: (inga)

Mallar och dokument granskade för anpassning:
  ✅ .specify/templates/plan-template.md — "Constitution Check" är
      generisk platshållare; nya design-värden härleds vid planerings-
      tillfället från denna fil.
  ✅ .specify/templates/spec-template.md — innehåller inga hårdkodade
      design-referenser; ingen ändring krävs.
  ✅ .specify/templates/tasks-template.md — uppgiftskategorier är
      generiska; ingen ändring krävs.
  ✅ README.md — kort och språkligt förenligt; ingen ändring krävs.
  ✅ CLAUDE.md — pekar på aktuell plan; ingen ändring krävs.

Migrationsplan för befintlig kod (icke-blockerande för konstitutionen, men
    krävs innan nästa /speckit-plan kan klara Constitution Check utan
    avvikelser):
  ⚠ app/globals.css (från 001 + 002, behöver migration):
      - --bg #ffffff (ljust) → #fafaf7 (regeln "aldrig ren vit").
      - --accent #2563eb (blå) → #cc7c5e (terrakotta).
      - --danger #b91c1c → #c62828 (närliggande röd, men nu kanonisk).
      - --gap 0.75rem (12 px) bryter 8-skala-regeln → 0.5rem (8 px) eller
          1rem (16 px).
      - --radius 0.5rem (8 px) — fungerar för kort men knappar behöver
          separat 6 px-radius (ny variabel, t.ex. `--radius-button: 6px`).
      - 002 mörkt tema: bg #1a1b1f → #1a1a1a, fg #e8e8eb → #f0f0f0,
          accent #6b9aff → #e89678, muted #9097a0 → #999999.
  ⚠ app/page.module.css: `.warning` hårdkodar `#fef3c7` / `#78350f`. Bör
      ersättas med variabel-baserade fel/ok-färger eller motiveras som
      undantag.
  ⚠ specs/002-dark-mode-toggle/research.md §2 och plan.md: dokumenterad
      mörk palett stämmer inte längre med konstitutionen. Forsknings-
      dokumentet är historiskt och får stå kvar — men en migrationsnotis
      bör läggas till när migreringen utförs.

Uppskjutna TODO:s:
  - TODO(DARK_FEEDBACK_COLORS): mörkt läges fel- och ok-färger är inte
      specificerade i denna version av konstitutionen. Klargörs vid
      första användning i en framtida feature; tills dess ärvs
      ljusvärdena men SKA WCAG-verifieras mot mörk bakgrund (#1a1a1a)
      innan release.
-->

# min-todo Constitution

## Core Principles

### I. KISS – Hålls enkelt

Projektet MÅSTE förbli så enkelt som möjligt. Endast Next.js används som
ramverk; inga ytterligare bibliotek eller verktyg får läggas till utan
explicit motivering i implementationsplanen. Det finns INGEN autentisering
och INGEN databas — all data lagras i webbläsarens `localStorage`.

**Rationale**: Detta är en pedagogisk app vars huvudsakliga mål är
att lära ut spec-driven utveckling. Varje extra beroende ökar den
kognitiva belastningen för en nybörjare och drar fokus från kärnflödet.

### II. Tillgänglighet

Appen MÅSTE fungera fullt ut med tangentbord och skärmläsare. Markup
SKA vara semantisk HTML (`<button>`, `<ul>`, `<label>`, `<input>` etc.) —
ingen `<div>`-soppa för interaktiva element. Synlig fokusring SKA
behållas, ARIA-attribut används när semantisk HTML inte räcker till,
och färgkontrast SKA uppfylla WCAG AA.

**Rationale**: Tillgänglighet är en del av kvaliteten, inte ett tillval.
Att lära sig semantisk HTML från början är enklare än att rätta till
otillgänglig kod senare.

### III. Modern men inte trendig

Stacken är Next.js (App Router) + TypeScript. Tillåtna stilar är
**CSS Modules** eller **global CSS**. Förbjudet är: CSS-i-JS-bibliotek
(styled-components, emotion, etc.), animationsbibliotek (Framer Motion,
GSAP, etc.), UI-komponentbibliotek och utility-CSS-ramverk (Tailwind,
Bootstrap, etc.) — om inte ett sådant beroende motiveras explicit och
godkänns som ett undantag i planen.

**Rationale**: Plattformens egna verktyg räcker långt. Att hålla
tekniska val begränsade gör att en nybörjare faktiskt kan läsa hela
kodbasen och förstå den utan att behöva lära sig flera abstraktioner
samtidigt.

### IV. Tydlig kod över smart kod

Kod SKA skrivas för att läsas av en nybörjare. Föredra långa, beskrivande
namn framför korta. Föredra rakt linjär kod framför generiska
abstraktioner. Kommentarer SKA skrivas på **svenska** där de förtydligar
*varför* något görs (inte vad). Undvik kommentarer som upprepar koden.

**Rationale**: Projektet är en lärresurs. "Smart" kod (avancerade
typgymnastik, djupa hierarkier, för tidiga abstraktioner) hindrar
inlärning även när den är tekniskt korrekt.

### V. En enda sida

Hela applikationen MÅSTE rymmas på en enda sida. Ingen klientroutning,
ingen flersidig navigation, inga modaler i nya routes. Filtrering,
sortering och redigering sker på samma sida.

**Rationale**: En todo-app behöver inte mer än en vy. Att lägga till
routing skulle dubbla mängden begrepp som måste introduceras innan
appen ens fungerar.

### VI. Mobilvänlig

Layouten SKA fungera lika bra på telefon (≥320 px bredd) som på dator.
Designen utvecklas mobile-first: börja från en smal kolumn och addera
breddrelaterade regler för större skärmar via media queries. Knappar
och klickytor SKA vara minst 44 × 44 px. Ingen horisontell scroll vid
normal användning.

**Rationale**: Todo-appar används oftast på telefonen i vardagen. En
mobilvänlig layout är ett funktionskrav, inte en bonus.

## Tekniska begränsningar

- **Plattform**: Next.js (senaste stabila huvudversion) med App Router.
- **Språk**: TypeScript i `strict`-läge för all applikationskod.
- **Stil**: CSS Modules eller global CSS. Inga preprocessorer (Sass,
  Less) och ingen CSS-i-JS.
- **Datalagring**: Endast `localStorage` i webbläsaren. Ingen server,
  ingen databas, inga API-anrop till tredjepart.
- **Beroenden**: Tilläggsberoenden utöver Next.js, React och TypeScript
  MÅSTE motiveras i `plan.md` under "Complexity Tracking" och godkännas
  innan de installeras.
- **Bygge**: Standardkommandon (`next dev`, `next build`, `next start`).
  Inga egna byggverktyg eller bundlers ovanpå Next.js.

## Designspråk

Designprinciperna nedan styr alla visuella val. Konkreta värden (färger,
mått, animationer) är medvetet pinned så att två komponenter aldrig
implementerar samma sak på två olika sätt. Värdena lever som CSS-variabler
i `app/globals.css`; ingen komponent får använda hårdkodade färger eller
mått som avviker från denna sektion utan att avvikelsen motiveras i planen.

### Färgpalett

**Ljust läge**:

- Bakgrund: `#fafaf7` (dämpad off-white — aldrig ren `#ffffff`)
- Text: `#1a1a1a`
- Accent: `#cc7c5e` (varm terrakotta)
- Dämpad text: `#6b6b6b`
- Fel: `#c62828`
- OK: `#2e7d32`

**Mörkt läge**:

- Bakgrund: `#1a1a1a`
- Text: `#f0f0f0`
- Accent: `#e89678` (ljusare terrakotta)
- Dämpad text: `#999999`

(Mörkt läges fel- och ok-färger är ännu inte fastställda; se
TODO(DARK_FEEDBACK_COLORS) i Sync Impact Report. Innan de specificeras
SKA fel/ok i mörkt tema verifieras mot WCAG AA-kontrast på `#1a1a1a` vid
varje användning.)

**Rationale**: En liten, fastställd palett gör visuella val mekaniska
istället för åsiktsdrivna. "Aldrig ren vit"-regeln dämpar bländnings­
effekten och matchar appens lugna karaktär.

### Typografi

Typsnittsfamilj: system-font-stack — `-apple-system, BlinkMacSystemFont,
"Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial,
sans-serif`. Inga webfonts.

Vikter:

- Rubriker: `600`
- Brödtext: `400`

**Rationale**: Systemtypsnitt laddas omedelbart, är välbekanta för
användaren och kräver ingen extra beroendekedja. Två vikter räcker för
informationshierarki utan att introducera fler val.

### Skala

All padding och margin SKA vara en multipel av 8 px. Standardvärden i
ordning av storlek: `8, 16, 24, 32, 48 px`. Avvikande mått (t.ex. 12 px)
är inte tillåtna utan explicit motivering i planen.

**Rationale**: En enda skala eliminerar småskillnader mellan komponenter
och gör spacing förutsägbar utan mätning. Det är också enkelt att
verifiera vid kodgranskning.

### Hörn

- Knappar: `6px` border-radius.
- Kort, paneler, inputs och listrader: `8px` border-radius.
- Aldrig skarpa hörn (`0px`).

**Rationale**: En subtil rundning utan att gå in i "pillerformer".
Knapparna skiljer sig något från kort så hierarkin är synlig utan att
vara skrikig.

### Skuggor

Max en subtil skugga: `0 1px 3px rgba(0, 0, 0, 0.08)`. Djupa skuggor
(t.ex. `0 8px 24px ...`) är förbjudna.

**Rationale**: Lugn, papperslik känsla. Tunga skuggor signalerar "modal"
eller "överlappning" — beteenden som sällan behövs på en enda-sida-app
och som ändå är förbjudna av princip V.

### Animationer

Övergångar SKA vara `200ms ease-out` på hover- och fokus-tillstånd.
Längre durationer eller andra easings är inte tillåtna utan explicit
motivering i planen.

**Rationale**: 200 ms är gränsen för vad som upplevs som omedelbart
utan att försvinna helt. `ease-out` ger en naturlig, fysisk känsla där
slutet "landar mjukt". Längre tider fördröjer interaktivitet och bryter
intrycket av direktrespons.

## Komponentprinciper

- **Knappar** SKA vara minst `44 px` höga. Detta överlappar med princip VI
  (klickytor ≥ 44 × 44 px) och konkretiserar höjdregeln.
- **Inputs** SKA visa en synlig fokusring: `2px solid var(--accent)` med
  passande `outline-offset`. Ringen får inte tas bort utan ersättas med en
  likvärdig visuell indikator (jfr princip II).
- **Bakgrund**: aldrig `#ffffff`. I ljust läge SKA bakgrunden vara
  `#fafaf7` (eller motsvarande CSS-variabel-spegling).
- **Ikoner**: kommer från `lucide-react` (godkänt undantag mot princip I)
  och är `20 px` om inget annat uttryckligen sägs i en specifik komponent­
  kontext. Ikonen markeras alltid med `aria-hidden="true"` när knappens
  `aria-label` redan beskriver åtgärden.

## Utvecklingsarbetsflöde

- **Spec-driven flöde**: Allt arbete följer Spec Kit-flödet —
  `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` →
  `/speckit-implement`. Hoppa inte över steg.
- **Constitution Check**: Varje plan (`plan.md`) MÅSTE innehålla en
  uttrycklig kontroll mot principerna I–VI samt mot Designspråk- och
  Komponentprinciper-sektionerna. Avsteg dokumenteras i "Complexity
  Tracking" med motivering och förkastade alternativ.
- **Reviewmoment**: Varje förändring (PR eller commit-grupp) ska kunna
  besvara: "Vilken princip stödjer detta?" och "Bryter detta mot någon
  princip?".
- **Verifiering**: Innan en uppgift markeras klar SKA den manuellt
  testas i webbläsaren — golden path och åtminstone en kant­situation
  (tomt tillstånd, lång text, snabba upprepade klick).

## Governance

Denna konstitution äger företräde framför alla andra utvecklingsregler
i projektet. Vid konflikt mellan en princip här och en vana, mall eller
kommentar någon annanstans i kodbasen, gäller konstitutionen.

**Ändringar** SKA göras genom `/speckit-constitution` och innehålla:
1. Vilken princip eller sektion som ändras (eller läggs till/tas bort).
2. Motivering — vilket problem löser ändringen?
3. Migrationsplan om ändringen påverkar befintlig kod eller specs.

**Versionspolicy** följer semantisk versionering:

- **MAJOR**: Bakåtinkompatibel ändring — princip tas bort eller
  omdefinieras så att tidigare kod inte längre uppfyller den.
- **MINOR**: Ny princip eller sektion läggs till, eller en befintlig
  utökas väsentligt.
- **PATCH**: Förtydliganden, omformuleringar och rättningar utan
  semantisk effekt.

**Efterlevnadsgranskning**: Vid varje `/speckit-plan` och
`/speckit-analyze` granskas planerade och utförda ändringar mot denna
konstitution. Avvikelser ska antingen åtgärdas eller motiveras
uttryckligen i planen.

**Version**: 1.1.0 | **Ratified**: 2026-05-05 | **Last Amended**: 2026-05-08
