---

description: "Task list för Mörkt läge-toggle — grupperad per user story enligt spec.md"
---

# Tasks: Mörkt läge-toggle

**Input**: Designdokument från `/specs/002-dark-mode-toggle/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/useTheme.md`, `contracts/theme-storage.md`, `quickstart.md`.

**Tests**: Inga automatiska tester i denna iteration. Konstitutionen (princip IV) och
projektets etablerade praxis (001-todo-app) föreskriver manuell verifiering i
webbläsaren mot acceptansscenarierna i `spec.md`. Verifierings-tasks (T007, T010,
T013, T016) är därför explicita kontroller enligt `quickstart.md`.

**Organisation**: Tasks är grupperade per user story så att varje story kan utvecklas
och verifieras självständigt. P1 (US1) är MVP — visuell växling i sessionen.
Persistens (US2) och systemdefault (US3) byggs som inkrementella påbyggnader
ovanpå MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Kan köras parallellt (olika filer, inga beroenden bakåt).
- **[Story]**: Knyter tasken till en specifik user story (US1–US3). Setup-,
  Foundational- och Polish-faser saknar story-etikett.
- Exakta filsökvägar anges i varje task (relativt repo-roten `min-todo/`).

---

## Phase 1: Setup (Delad infrastruktur)

**Purpose**: Bekräfta att 001-todo-app är implementerad — denna feature bygger
direkt på dess struktur (`app/`, `components/`, `hooks/`, `lib/`) och dess
beroende `lucide-react`. Inga nya paket installeras.

- [X] T001 Verifiera att 001-todo-app är implementerad: `npm run dev` ska visa appen på `http://localhost:3000` med rubriken "Mina uppgifter", input-fältet, todo-listan och filterraden synliga. Bekräfta att `package.json` har `lucide-react` i `dependencies`. Om något saknas: kör `/speckit-implement` på 001-todo-app innan denna feature påbörjas. Inga nya paket installeras i denna feature.

**Checkpoint**: Befintlig todo-app kör. Vi har en grund att utöka.

---

## Phase 2: Foundational (Blockerande förutsättningar)

**Purpose**: Lägg in den infrastruktur som *alla* tre user stories vilar på —
typerna i `lib/types.ts` och CSS-variablerna i `app/globals.css`. Utan dessa
fungerar varken `useTheme`-hooken eller temaskiftet visuellt.

**⚠️ CRITICAL**: Ingen user story kan börja förrän denna fas är klar.

- [X] T002 [P] Lägg till tematyper i `lib/types.ts` (filen finns redan från 001). Lägg till efter de befintliga exporterna: `export type ThemeChoice = 'light' | 'dark' | null;` och `export type ThemeMode = 'light' | 'dark';`. Behåll existerande typer (`Task`, `Filter`, `StorageEnvelope`, `StorageWarning`, `LoadResult`) oförändrade.
- [X] T003 [P] Utöka `app/globals.css` med tema-CSS-variabler och global färgövergång enligt `research.md` §2 och §3. Lägg till nytt block direkt efter befintliga `:root`-variablerna (utan att ta bort befintliga `--bg`, `--fg`, `--muted`, `--accent`, `--border` — överlagra istället deras värden så de fungerar i båda teman): definiera ljust tema på `:root` med `--bg: #fafafa; --fg: #1f2024; --surface: #ffffff; --border: #e5e5e7; --muted-fg: #6b6b70; --accent: #2563eb; --done-fg: #9ca0a8;`. Lägg till mörk override: `[data-theme="dark"] { --bg: #1a1b1f; --fg: #e8e8eb; --surface: #232428; --border: #34353a; --muted-fg: #9097a0; --accent: #6b9aff; --done-fg: #66696f; }`. Lägg också till global transition: `*, *::before, *::after { transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease, fill 200ms ease; }` och `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0ms; } }`. Om 001 hårdkodar någon färg som inte använder en variabel — lämna den orörd i denna task; den justeras vid behov i T014. Beroende: ingen.

**Checkpoint**: Variabler finns för båda teman. Inget UI har bytt utseende än
eftersom inget element sätter `data-theme="dark"`. Existerande sida ser identisk
ut som innan.

---

## Phase 3: User Story 1 – Växla mellan ljust och mörkt tema (Priority: P1) 🎯 MVP

**Goal**: Användaren kan klicka på en knapp uppe till höger på sidan och se hela
sidan byta tema mjukt över ~200 ms. Knappens ikon byter mellan måne (i ljust läge)
och sol (i mörkt läge). Tangentbordsanvändning fungerar.

**Independent Test**: Följ `quickstart.md` > "US1 — Växla mellan ljust och mörkt
tema". Klicka på toggleknappen, observera tematbytet, byt med tangentbord,
kontrollera att layouten är oförändrad. (Persistens mellan sessioner är *inte* en
del av US1 — det är US2.)

### Implementation for User Story 1

- [X] T004 [P] [US1] Skapa `hooks/useTheme.ts` med MINIMAL implementation för US1 — endast in-memory state, ingen `localStorage`, ingen `matchMedia`. Markera filen `'use client'` (eller säkerställ att den bara importeras från klient-komponenter). Importera `ThemeMode` från `@/lib/types`. Implementera enligt `contracts/useTheme.md`: `useState<ThemeMode>('light')` som startvärde (persistens och systempref kommer i US2/US3). Returnera `{ theme, setTheme, toggle }` där `toggle = () => setTheme(theme === 'light' ? 'dark' : 'light')`. Lägg en `useEffect([theme])` som sätter `document.documentElement.dataset.theme = theme;`. Lägg en kort svensk kommentar ovanför hooken: `// Hook som äger temats state och speglar det till <html data-theme>.`. Beroende: T002.
- [X] T005 [P] [US1] Skapa `components/ThemeToggle.tsx` enligt `contracts/useTheme.md` § "Användning från komponenter". Markera `'use client'` om hooken kräver det. Importera `Sun` och `Moon` från `lucide-react`, `useTheme` från `@/hooks/useTheme`, och `styles` från `./ThemeToggle.module.css`. Renderar `<button type="button" className={styles.button} onClick={toggle} aria-label={isDark ? 'Växla till ljust läge' : 'Växla till mörkt läge'}>` med ikonen `{isDark ? <Sun aria-hidden="true" size={20} /> : <Moon aria-hidden="true" size={20} />}` (variabeln `const isDark = theme === 'dark';`). Skapa `components/ThemeToggle.module.css` med `.button { min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; background: transparent; color: var(--fg); border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; padding: 0; }` och `.button:hover { background: var(--surface); }`. Den globala `:focus-visible`-regeln från 001 räcker för fokusring. Beroenden: T004 (hook), `lucide-react` (befintligt).
- [X] T006 [US1] Uppdatera `app/page.tsx`: importera `ThemeToggle` från `@/components/ThemeToggle`. Wrappa den befintliga `<h1>Mina uppgifter</h1>` i en `<header>`-tag (eller en `<div className={styles.header}>` om HTML-semantiken redan har `<header>` på annat ställe — använd CSS Module-klass istället). Inom `<header>`: `<h1>Mina uppgifter</h1>` följt av `<ThemeToggle />`. Uppdatera `app/page.module.css`: lägg till regel `.header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; }` (justera `margin-bottom` så att den befintliga vertikala rytmen behålls — ta värdet från det h1 hade tidigare). Befintliga regler för `<h1>` (font-storlek etc.) lämnas orörda; de funkar oförändrat inuti flex-headern. Beroenden: T005.
- [ ] T007 [US1] Manuell verifiering av US1 enligt `quickstart.md` > "US1 — Växla mellan ljust och mörkt tema" (alla 7 steg). Pricka av varje rad. Kör `npm run lint` och `npm run build` — noll fel, noll varningar. **Notera**: Vid denna punkt fungerar växlingen *bara i sessionen* — efter en omladdning är det alltid ljust. Persistens kommer i US2. **Status**: `npm run lint` och `npm run build` passerar utan fel/varningar. Webbläsar­verifiering återstår — användaren utför detta efter implementationen är klar.

**Checkpoint**: Användaren kan klicka och se hela sidan byta tema mjukt. Detta är
MVP — featuren levererar redan värde här. US2 och US3 är tilläggsmål.

---

## Phase 4: User Story 2 – Mitt val följer mellan besök (Priority: P2)

**Goal**: Användarens val sparas till `localStorage` och appen startar i sparat
tema vid nästa besök, utan synlig blink i fel tema vid första paint.

**Independent Test**: Följ `quickstart.md` > "US2 — Mitt val följer mellan besök".
Klicka till mörkt, ladda om — sidan startar i mörkt utan blink. Klicka till ljust,
ladda om — startar i ljust.

### Implementation for User Story 2

- [X] T008 [US2] Utöka `hooks/useTheme.ts` med `localStorage`-läsning och -skrivning enligt `contracts/theme-storage.md` § "Läsregler" och § "Skrivregler". Lägg till en konstant `const THEME_STORAGE_KEY = 'min-todo:theme';` ovanför hooken med kommentar `// OBS: Samma nyckel och läslogik finns i app/layout.tsx (inline-script). Ändra båda samtidigt.`. Skapa två interna funktioner: `function readChoice(): ThemeChoice { try { const raw = localStorage.getItem(THEME_STORAGE_KEY); return raw === 'light' || raw === 'dark' ? raw : null; } catch { return null; } }` och `function writeChoice(value: ThemeMode): void { try { localStorage.setItem(THEME_STORAGE_KEY, value); } catch { /* tyst — valet gäller bara sessionen */ } }`. Ändra hooken så att initialt state läses från `readChoice()` med fallback till `'light'` (systempreffallback kommer i US3, T011): `const [theme, setThemeState] = useState<ThemeMode>(() => readChoice() ?? 'light');`. Wrap `setTheme` så att den både uppdaterar state och anropar `writeChoice(next)`. `toggle` ändras inte — den anropar `setTheme` internt. Beroende: T004.
- [X] T009 [US2] Lägg in pre-hydration-script i `app/layout.tsx` enligt `research.md` §1. På `<html lang="sv">`-elementet, lägg till `suppressHydrationWarning` som prop. Inom `<head>` (eller direkt efter `<head>`-öppningen) lägg en `<script>` med `dangerouslySetInnerHTML`. Innehållet är ren JS som körs *innan* React hydrerar och sätter `data-theme` baserat på `localStorage`. Använd exakt detta script-innehåll: `(function(){try{var v=localStorage.getItem('min-todo:theme');if(v==='light'||v==='dark'){document.documentElement.dataset.theme=v;return;}}catch(e){}document.documentElement.dataset.theme='light';})();`. (matchMedia-fallback läggs till i T012.) Lägg en svensk kommentar ovanför scriptet: `{/* Sätter data-theme innan React hydrerar — förhindrar 'flash of wrong theme'. Samma läslogik som hooks/useTheme.ts; ändra båda samtidigt. */}`. Beroende: T008.
- [ ] T010 [US2] Manuell verifiering av US2 enligt `quickstart.md` > "US2 — Mitt val följer mellan besök" (4 steg) **plus** edge cases nr. 1, 2 och 5 från `quickstart.md` > "Edge cases" (localStorage otillgängligt, korrupt värde, ingen FOUC). Pricka av varje rad. Kör `npm run lint` och `npm run build` — noll fel, noll varningar. **Status**: `npm run lint` och `npm run build` passerar utan fel/varningar. Webbläsar­verifiering återstår — användaren utför detta efter implementationen är klar.

**Checkpoint**: Valet följer mellan besök. Nya användare utan sparat val ser
fortfarande bara ljust tema (systemdefault kommer i US3).

---

## Phase 5: User Story 3 – Default följer systemets inställning (Priority: P3)

**Goal**: Nya besökare utan sparat val ser ett tema som matchar deras
`prefers-color-scheme` vid första laddning. Manuellt val har företräde över
systeminställning. Live-systembyten under sessionen ignoreras (per Q1 i
Clarifications).

**Independent Test**: Följ `quickstart.md` > "US3 — Default följer systemets
inställning" (6 steg). Rensa `localStorage`, växla systempreferens, ladda om,
verifiera att appen följer systemet. Klicka och se att manuellt val tar över.

### Implementation for User Story 3

- [X] T011 [US3] Utöka `hooks/useTheme.ts` med `prefers-color-scheme`-fallback. Lägg till en intern hjälpfunktion `function readSystemPref(): ThemeMode { try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; } }`. Ändra initialvärdet i `useState`-callbacken så att fallbacken är `readSystemPref()` istället för `'light'`: `useState<ThemeMode>(() => readChoice() ?? readSystemPref());`. **Lyssna inte** på `matchMedia.addEventListener('change', ...)` — per FR-010 och Q1 i Clarifications låser vi temat till första laddningens systempref när inget manuellt val finns. Beroende: T008.
- [X] T012 [US3] Utöka inline-scriptet i `app/layout.tsx` med matchMedia-fallback. Ändra script-innehållet från T009 till exakt: `(function(){try{var v=localStorage.getItem('min-todo:theme');if(v==='light'||v==='dark'){document.documentElement.dataset.theme=v;return;}}catch(e){}try{var m=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=m?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();`. Den svenska kommentaren ovanför uppdateras inte — den gäller fortfarande. Beroende: T009.
- [ ] T013 [US3] Manuell verifiering av US3 enligt `quickstart.md` > "US3 — Default följer systemets inställning" (alla 6 steg, inklusive steg 6 som verifierar att live-systembyten under sessionen ignoreras). Pricka av varje rad. Kör `npm run lint` och `npm run build` — noll fel, noll varningar. **Status**: `npm run lint` och `npm run build` passerar utan fel/varningar. Webbläsar­verifiering återstår — användaren utför detta efter implementationen är klar.

**Checkpoint**: Alla tre user stories är fullt fungerande och självständigt
verifierade. Featuren är funktionellt komplett.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Slutverifiera kvalitetsattribut som spänner över alla user stories
— kontrast, tillgänglighet och bygg-renlighet.

- [X] T014 [P] WCAG-kontrastverifiering enligt `quickstart.md` > "Kontrastverifiering". I båda teman: mät kontrast för (a) brödtext mot bakgrund, (b) hjälptext (`--muted-fg`) mot bakgrund, (c) fokusring (`--accent`) mot bakgrund. Använd webbläsarens devtools "Inspect element" > "Contrast ratio" eller webaim.org/resources/contrastchecker. Acceptanströsklar: 4,5:1 för normaltext, 3:1 för stora element och UI-komponenter. Om något par underkänns: justera färgvärdet i `app/globals.css` (endast i variabel-blocken som T003 lade in) tills tröskeln nås. Dokumentera resultatet (mätt värde per par) som en kommentar i `app/globals.css` direkt ovanför `[data-theme="dark"]`-blocket på formen `/* Kontrast i mörkt tema (verifierat YYYY-MM-DD): fg/bg ≈ X:1, muted/bg ≈ Y:1, accent/bg ≈ Z:1 */`.
- [ ] T015 [P] Skärmläsar- och tangentbordsverifiering: (a) Tabba till toggleknappen från sidans början — fokusringen är synlig och knappen ligger logiskt i tab-ordningen (efter rubriken, före input-fältet eller motsvarande). (b) Tryck Enter och mellanslag — båda växlar temat. (c) Aktivera en skärmläsare (NVDA på Windows, VoiceOver på Mac med Cmd+F5) och gå till knappen — den ska annonseras som "Växla till mörkt läge, knapp" i ljust läge respektive "Växla till ljust läge, knapp" i mörkt läge, *utan* att läsa upp ikon-namnet. Om något inte uppfyller kraven: justera `aria-label` eller `aria-hidden` i `components/ThemeToggle.tsx`. **Status**: Kod-sidan av tillgängligheten är på plats — dynamisk `aria-label`, `aria-hidden="true"` på ikoner, semantisk `<button type="button">`, fokusring via global `:focus-visible`-regel. Skärmläsar- och tangentbordsverifiering återstår — användaren utför detta.
- [ ] T016 Slutgiltig end-to-end-verifiering: kör `npm run dev` och gå igenom *hela* `quickstart.md` från början till slut, inklusive alla edge cases (1–5). Pricka av varje steg. Avsluta med `npm run lint && npm run build` (en kombinerad körning) och säkerställ noll fel och noll varningar i bygget. Featuren är klar att markeras som färdig först när detta steg är ✅. **Status**: `npm run lint` och `npm run build` passerar utan fel/varningar. Webbläsar­verifiering återstår — användaren utför detta efter implementationen är klar.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Inga beroenden — kan startas direkt. Verifierar bara att 001 är klar.
- **Foundational (Phase 2)**: Beror på Setup. **BLOCKERAR** alla user stories.
- **US1 (Phase 3)**: Beror på Foundational. Kan därefter köras självständigt.
- **US2 (Phase 4)**: Beror på US1 (utökar `useTheme` och `app/layout.tsx`).
  Kan inte köras parallellt med US1.
- **US3 (Phase 5)**: Beror på US2 (utökar samma `useTheme` och inline-script
  som US2). Kan inte köras parallellt med US2.
- **Polish (Phase 6)**: Beror på alla föregående faser.

### User Story Dependencies

- **US1**: Beroende på Foundational. Helt självständigt funktionellt — appen
  kan demonstreras och användas redan vid US1-checkpoint.
- **US2**: Bygger på US1:s `useTheme`-hook. Lägger till persistens. Påverkar
  inte US1:s acceptanskriterier — bara förstärker.
- **US3**: Bygger på US2:s `useTheme` och inline-script. Lägger till
  systempref-fallback. Påverkar inte tidigare stories.

### Within Each User Story

- Modeller/typer (Foundational) före komponenter och hooks.
- Hook (`useTheme`) före komponent (`ThemeToggle`) före integration (`page.tsx`).
- Implementation före manuell verifiering.
- En story klar (verifierad) före nästa påbörjas — undvik att blanda US1- och
  US2-arbete i samma sittning, det förvirrar verifieringen.

### Parallel Opportunities

- **Inom Phase 2**: T002 (types) och T003 (CSS) berör olika filer — kan köras
  parallellt.
- **Inom Phase 3 (US1)**: T004 (`useTheme`) och T005 (`ThemeToggle`) berör olika
  filer och har bara typ-beroende på Phase 2 — kan köras parallellt.
- **Inom Phase 4 (US2)**: T008 (`useTheme`-utökning) och T009 (`layout.tsx`-script)
  berör olika filer men måste hålla sig konsekventa per `contracts/theme-storage.md`.
  Kan i teorin köras parallellt om båda utvecklare har kontraktet i åtanke;
  enklare att hantera sekventiellt.
- **Inom Phase 5 (US3)**: T011 och T012 är olika filer — kan parallelliseras.
- **Inom Phase 6**: T014 och T015 är oberoende verifieringsspår — kan
  parallelliseras.

---

## Parallel Example: User Story 1

```text
# Efter att Phase 2 är klar — kan köras tillsammans:
Task T004: Skapa hooks/useTheme.ts (in-memory variant)
Task T005: Skapa components/ThemeToggle.tsx + ThemeToggle.module.css

# När båda är klara:
Task T006: Integrera ThemeToggle i app/page.tsx + page.module.css

# Sista steget i fasen:
Task T007: Manuell verifiering enligt quickstart.md
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. **Phase 1**: Verifiera 001 (T001).
2. **Phase 2**: Foundational — typer + CSS-variabler (T002, T003).
3. **Phase 3**: US1 — visuell växling (T004–T007).
4. **STOP and VALIDATE**: Demonstrera att toggleknappen byter tema mjukt i
   sessionen. Featuren levererar redan kärnvärde.
5. Bestäm: gå vidare till US2 nu, eller leverera MVP och vänta?

### Incremental Delivery

1. Setup + Foundational → grund klar.
2. US1 → sessions-toggle fungerar (MVP, demobart).
3. US2 → val sparas mellan besök (klart värdetillskott).
4. US3 → systemdefault för nya användare (sista poleringssteg).
5. Polish → kontrast, tillgänglighet, bygg-rent.

Varje steg kan demonstreras och eventuellt levereras separat. Konstitutionens
KISS-princip gynnas av att leverera US1 + US2 tillsammans som "v1" och behandla
US3 som "v1.1" — men allt-i-ett-leverans är också rimligt eftersom totalstorleken
är liten.

### Solo Strategy (en utvecklare)

Eftersom 002 är litet och en enskild utvecklare oftast bygger detta i en
sittning: gå sekventiellt T001 → T016. De `[P]`-markerade tasks kan göras i
valfri ordning inom sin fas, men sekventiellt arbete ger bäst chans att fånga
fel tidigt.

---

## Notes

- **Inga nya beroenden**: Hela featuren använder befintliga paket (`lucide-react`
  redan installerat i 001). Princip I (KISS) är inte hotad.
- **Två ställen med samma läslogik**: `hooks/useTheme.ts` (T008, T011) och
  `app/layout.tsx` (T009, T012). Kontraktet i `contracts/theme-storage.md`
  beskriver explicit varför de är duplicerade och hur de hålls i synk.
- **Incremental hook**: `useTheme` byggs upp i tre tasks — T004 (in-memory),
  T008 (+ localStorage), T011 (+ matchMedia). Det är medvetet eftersom varje
  user story då kan verifieras självständigt.
- **Verifiera tester misslyckas**: ej tillämpligt — inga automatiska tester i
  denna iteration.
- **Commit efter varje task eller logisk grupp**: `auto_execute_hooks: true` i
  `.specify/extensions.yml` kan skapa commits per fas-checkpoint via
  `/speckit-git-commit`.
- **Stoppa vid varje checkpoint** för att verifiera storyn självständigt innan
  nästa påbörjas.
- **Undvik**: vaga tasks, kollisioner i samma fil mellan parallella tasks,
  cross-story-beroenden som bryter självständighet.
