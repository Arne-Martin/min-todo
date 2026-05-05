<!--
SYNC IMPACT REPORT
==================
Version change: TEMPLATE (oifylld) → 1.0.0
Bump rationale: Initial ratification — alla principer och styrningsregler
    fastställs för första gången från en oifylld mall.

Modifierade principer: (ingen — initial version)
Tillagda sektioner:
  - Core Principles (6 principer)
      I.   KISS – Hålls enkelt
      II.  Tillgänglighet
      III. Modern men inte trendig
      IV.  Tydlig kod över smart kod
      V.   En enda sida
      VI.  Mobilvänlig
  - Tekniska begränsningar
  - Utvecklingsarbetsflöde
  - Governance
Borttagna sektioner: (ingen)

Mallar och dokument granskade för anpassning:
  ✅ .specify/templates/plan-template.md — "Constitution Check" är
      generisk platshållare, ingen ändring krävs (gates härleds
      vid planeringstillfället från denna fil).
  ✅ .specify/templates/spec-template.md — innehåller inga
      hårdkodade principreferenser; ingen ändring krävs.
  ✅ .specify/templates/tasks-template.md — uppgiftskategorier är
      generiska; ingen ändring krävs.
  ✅ README.md — kort och språkligt förenligt; ingen ändring krävs.
  ✅ CLAUDE.md — pekar på den aktuella planen; ingen ändring krävs.

Uppskjutna TODO:s:
  - (inga – alla platshållare har ersatts med konkret innehåll)
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

## Utvecklingsarbetsflöde

- **Spec-driven flöde**: Allt arbete följer Spec Kit-flödet —
  `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` →
  `/speckit-implement`. Hoppa inte över steg.
- **Constitution Check**: Varje plan (`plan.md`) MÅSTE innehålla en
  uttrycklig kontroll mot principerna I–VI ovan. Avsteg dokumenteras i
  "Complexity Tracking" med motivering och förkastade alternativ.
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

**Version**: 1.0.0 | **Ratified**: 2026-05-05 | **Last Amended**: 2026-05-05
