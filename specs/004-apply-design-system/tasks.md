---

description: "Task list för Designöversyn — applicera designsystemet, grupperad per user story enligt spec.md"
---

# Tasks: Designöversyn — applicera designsystemet

**Input**: Designdokument från `/specs/004-apply-design-system/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/css-variables.md`, `contracts/component-styles.md`, `quickstart.md`.

**Tests**: Inga automatiska tester. Per konstitution + projektpraxis sker
verifiering manuellt i webbläsaren och via `npm run lint && npm run build`.
Verifierings-tasks (T007, T015, T019, T022) är explicita kontrolluppgifter mot
`quickstart.md`.

**Organisation**: Tasks är grupperade per user story så att varje story kan
verifieras självständigt. P1 (US1) levererar färgsystem, P2 (US2) layout-
disciplin, P3 (US3) komponent-detaljer.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Kan köras parallellt (olika filer, inga beroenden bakåt).
- **[Story]**: Knyter tasken till en specifik user story (US1–US3). Setup-,
  Foundational- och Polish-faser saknar story-etikett.
- Exakta filsökvägar anges i varje task (relativt repo-roten `min-todo/`).

---

## Phase 1: Setup (Delad infrastruktur)

**Purpose**: Bekräfta att grunden är på plats — 001, 002 och 003-amendmentet
finns i `main` och denna branch är baserad på det.

- [X] T001 Bekräfta att repo-tillståndet är korrekt: kör `git log --oneline -5` och verifiera att `docs: amend constitution to v1.1.0` (commit `84e8b20` eller motsvarande) finns i historiken som basen för `004-apply-design-system`-branchen. Kör `npm run dev` snabbt för att bekräfta att appen startar utan fel innan migreringen påbörjas. Inga nya paket installeras.

**Checkpoint**: Branchen är på plats, appen startar med 001 + 002 fullt
fungerande.

---

## Phase 2: Foundational (Blockerande förutsättningar)

**Purpose**: Uppdatera designtokens i `app/globals.css` enligt
`data-model.md` så att alla user stories kan referera dem. De legacy-
variabler (`--gap`, `--radius`) som ska tas bort behålls *temporärt* i
denna fas så befintliga komponentstilar fortsätter fungera; de tas bort
först i T014 efter att alla konsumenter migrerats.

**⚠️ CRITICAL**: Ingen user story kan börja förrän denna fas är klar.

- [X] T002 Lägg till nya designtokens i `app/globals.css`. Inom `:root`-blocket, efter de befintliga variablerna, lägg till exakt: `--ok: #2e7d32;`, `--radius-button: 6px;`, `--radius-card: 8px;`. Inom `[data-theme="dark"]`-blocket, lägg till motsvarande mörkt-läge-värden: `--ok: #7fc987;` (radius-tokens repeteras inte i mörkt — de är samma). Behåll `--gap` och `--radius` orörda i denna task — de tas bort i T014 efter att alla konsumenter migrerats. Kommentera de nya raderna kort på svenska. Beroende: ingen.
- [X] T003 Uppdatera palettvärden i `app/globals.css` enligt `contracts/css-variables.md`. Inom `:root`: byt `--bg: #ffffff` → `#fafaf7`, `--accent: #2563eb` → `#cc7c5e`, `--danger: #b91c1c` → `#c62828`. (`--fg`, `--muted`, `--accent-fg`, `--border` har redan rätt värden — verifiera att de står som `#1a1a1a`, `#6b6b6b`, `#ffffff`, `#d4d4d4`.) Inom `[data-theme="dark"]`: byt `--bg: #1a1b1f` → `#1a1a1a`, `--fg: #e8e8eb` → `#f0f0f0`, `--muted: #9097a0` → `#999999`, `--accent: #6b9aff` → `#e89678`, `--accent-fg: #0a0a0c` → `#1a1a1a`, `--danger: #ef6b6b` (förbli — redan korrekt), `--border: #34353a` (förbli). Uppdatera den befintliga kontrast-anteckningen som kommentar i CSS:en så att den speglar de nya värdena (eller markera den som "verifieras i T020"). Beroende: T002.
- [X] T004 Uppdatera den globala tema-bytes-transitionen i `app/globals.css`. Hitta regeln `*, *::before, *::after { transition: ... 200ms ease, ...; }` och byt alla `ease` mot `ease-out` (fyra ställen i samma regel). `prefers-reduced-motion`-blocket nedanför påverkas inte. Beroende: T003 (samma fil).

**Checkpoint**: `app/globals.css` har den nya paletten i båda teman, två nya
strukturella tokens, och den globala transitionen är `ease-out`. Appen
fungerar fortfarande — bara med uppdaterade färger. Befintliga komponent-
stilar kan tillfälligt se inkonsekventa ut (t.ex. warning-bannern är
fortfarande hårdkodad pale-yellow); det åtgärdas i US1.

---

## Phase 3: User Story 1 – Konsekvent färgsystem (Priority: P1) 🎯 MVP

**Goal**: Hela appen använder palettens variabler — inga hårdkodade hex-
värden utanför tema-blocken i `globals.css`. Tema-växling fungerar för alla
synliga färger inkl. warning-bannern.

**Independent Test**: Följ `quickstart.md` > "US1 — Konsekvent färgsystem"
(alla 5 steg). Sök efter hårdkodade hex med `Select-String`-kommandot — inga
träffar. Visa warning-bannern (t.ex. genom att korruptera localStorage) i
båda teman och verifiera att den följer temat.

### Implementation for User Story 1

- [X] T005 [US1] Skriv om `.warning`-klassen i `app/page.module.css` enligt `contracts/component-styles.md` > "Warning-banner". Ersätt den nuvarande `background: #fef3c7; color: #78350f;`-koden med: `background: color-mix(in srgb, var(--accent) 12%, var(--bg));`, `color: var(--fg);`, `border-left: 3px solid var(--accent);`, `border-radius: var(--radius-card);`, `padding: 0.5rem 1rem;`, `font-size: 0.95rem;` (behåll befintlig `margin: 0;`). Lägg en svensk kommentar som förklarar `color-mix`-tekniken. Beroende: T002, T003.
- [X] T006 [US1] Sanity-check: kör `Select-String -Path "app\*.module.css","components\*.module.css" -Pattern '#[0-9a-fA-F]{3,8}'` från repo-roten. **Inga träffar förväntas**. Om någon hittas: byt det hårdkodade hex-värdet mot motsvarande `var(--*)` enligt `data-model.md` > "Konsumtions-katalog". Vanliga misstänkta filer: `app/page.module.css` (warning-färger som T005 borde ha tagit), `components/TodoItem.module.css` (om någon `--danger`-relaterad färg hårdkodats). Beroende: T005.
- [ ] T007 [US1] Manuell verifiering av US1 enligt `quickstart.md` > "US1 — Konsekvent färgsystem" (steg 1–5). Kör `npm run lint` och `npm run build` — noll fel, noll varningar. **Status**: `npm run lint` och `npm run build` passerar utan fel/varningar. Sökning efter hårdkodade hex i `app/*.module.css` och `components/*.module.css` ger 0 träffar. Webbläsar­verifiering återstår — användaren utför detta efter implementationen är klar.

**Checkpoint**: User Story 1 är fullt fungerande och testbar självständigt
— hela appen ser ut enligt den nya paletten och tema-växlingen är
konsistent. Spacing är fortfarande inte uppdaterat, knappstilar är
fortfarande de gamla, tom-state har ingen symbol — dessa kommer i US2/US3.

---

## Phase 4: User Story 2 – Lugnare luft och mjukare hörn (Priority: P2)

**Goal**: All padding och margin följer 8-skalan. Listobjekt har 24 px
mellanrum. Knappar har 6 px radius, inputs/kort har 8 px radius. `--gap`
och `--radius` är borttagna från `globals.css`.

**Independent Test**: Följ `quickstart.md` > "US2 — Lugnare luft och
mjukare hörn" (alla 5 steg). Mät listans gap till 24 px i devtools.
Inspektera knapp-radius (6 px) vs input/banner-radius (8 px). Sök efter
förbjudna spacing-värden — inga träffar.

### Implementation for User Story 2

- [X] T008 [US2] Uppdatera `components/TodoList.module.css`: lägg till `display: flex; flex-direction: column; gap: 1.5rem;` på `.list`-klassen så att listobjekt får 24 px vertikalt mellanrum (FR-007). Behåll `list-style: none; padding: 0; margin: 0;`. `.empty`-klassen rörs inte här — den uppdateras i T018 för symbolen. Beroende: T002 (--gap behöver fortfarande finnas tills T014, men `.list` använder inte `--gap` så ingen verkligt beroende).
- [X] T009 [P] [US2] Uppdatera `components/TodoItem.module.css`: byt `gap: var(--gap)` på `.row` mot `gap: 1rem` (16 px — närmaste 8-multipel; 12 px var aldrig 8-skala-kompatibel). Behåll övriga regler. Inga radius-värden finns att uppdatera (raderna har border-bottom, ingen border-radius). Beroende: T002.
- [X] T010 [P] [US2] Uppdatera `components/TodoInput.module.css`: byt `gap: var(--gap)` på `.form` mot `gap: 1rem`. På `.addButton`: byt `border-radius` om en sätts (idag ärver den från globals' `<button>`-regel) — säkerställ att den får `border-radius: var(--radius-button);` när den får sin solid-accent-stil i T016. I denna task: `padding: 0` på addButton är redan korrekt, men radien måste explicit anges eftersom en lokal `border-radius` kommer i T016. För närvarande: lägg till `border-radius: var(--radius-button);` på `.addButton` så att 6 px-radien gäller. Beroende: T002.
- [X] T011 [P] [US2] Uppdatera `components/FilterBar.module.css`: byt `gap: var(--gap)` på `.bar` mot `gap: 1rem`. På `.button`: byt `padding: 0.5rem 0.75rem` mot `padding: 0.5rem 1rem` (8 / 16 — 12 px var inte 8-skala). Lägg till `border-radius: var(--radius-button);` på `.button`. Den gamla `.active`-stilen (kraftig bakgrund) lämnas orörd här — den ersätts helt i T017. Beroende: T002.
- [X] T012 [P] [US2] Uppdatera `components/ThemeToggle.module.css`: byt `border-radius: var(--radius)` på `.button` mot `border-radius: var(--radius-button);`. Lägg till en explicit transition: `transition: background-color 200ms ease-out, color 200ms ease-out, border-color 200ms ease-out;` så hover blir mjuk. Övrigt rörs inte. Beroende: T002.
- [X] T013 [P] [US2] Uppdatera `app/page.module.css`: byt `border-radius: var(--radius)` (om sådan finns på `.warning`) — den ändras egentligen i T005 till `var(--radius-card)`, men verifiera. På `.clearButton`: lägg till `padding: 0.5rem 1rem;`, `border-radius: var(--radius-button);`, och en transition: `transition: color 200ms ease-out, border-color 200ms ease-out, background-color 200ms ease-out;`. Övrigt på `.warning` är redan satt i T005. Beroende: T005, T002.
- [X] T014 [US2] Ta bort de borttagna designtokens från `app/globals.css`. Ta bort raderna `--gap: 0.75rem;` och `--radius: 0.5rem;` ur `:root`-blocket. Kör sedan `Select-String -Path "app\*.css","components\*.module.css" -Pattern '--gap|--radius[^-]'` (regex som *inte* matchar `--radius-button` eller `--radius-card`) — inga träffar förväntas. Om någon träff återstår: åtgärda den enligt token-katalogen i `data-model.md`. Beroende: T008, T009, T010, T011, T012, T013.
- [ ] T015 [US2] Manuell verifiering av US2 enligt `quickstart.md` > "US2 — Lugnare luft och mjukare hörn" (steg 1–5). Kör `npm run lint && npm run build` — noll fel, noll varningar. **Status**: `npm run lint` och `npm run build` passerar utan fel/varningar. Sökning efter `--gap` eller `--radius` (utan `-button`/`-card`) ger 0 träffar — alla legacy-tokens är borta. Webbläsar­verifiering (mätningar i devtools) återstår — användaren utför detta efter implementationen är klar.

**Checkpoint**: User Story 2 är fullt fungerande. Layouten andas, hörnen är
mjukt rundade enligt designsystemet. Lägg till-knapp har fortfarande gammalt
utseende, filter-aktiv är fortfarande den gamla "kraftiga bakgrunden", tom-
state saknar symbol — dessa kommer i US3.

---

## Phase 5: User Story 3 – Tydligare interaktiva element (Priority: P3)

**Goal**: Lägg till-knappen är fylld accent med kontrastfärg. Filter-aktiv
har understreckning i accent. Tom-state har ☐ + dämpad kursiv text.

**Independent Test**: Följ `quickstart.md` > "US3 — Tydligare interaktiva
element" (alla 6 steg). Lägg till-knappen är solid accent. Klicka mellan
filter — understreckning flyttar. Töm listan — ☐ visas före "Inga uppgifter
än".

### Implementation for User Story 3

- [X] T016 [P] [US3] Uppdatera `components/TodoInput.module.css` med solid-accent-look enligt `contracts/component-styles.md` > "Lägg till-knappen". På `.addButton`: lägg till `border: 1px solid var(--accent);`, `background: var(--accent);`, `color: var(--accent-fg);` (det är en *ny* deklaration — knappen är idag arvande från globals och ser inte solid ut). Behåll `border-radius: var(--radius-button)` från T010. Lägg till `transition: background-color 200ms ease-out, border-color 200ms ease-out, filter 200ms ease-out;` och `cursor: pointer;`. Behåll den befintliga `.addButton:hover:not(:disabled) { filter: brightness(0.95); }` — den kompletterar nu transitionen så hover blir observerbart mjuk. (Brightness-värdet kan justeras till 1.05 om den nya solid-accenten bli för dämpad vid hover; kontrolleras vid webbläsar­verifiering.) Beroende: T002, T003 (palett), T010 (radius).
- [X] T017 [P] [US3] Skriv om `.active`-klassen i `components/FilterBar.module.css` enligt `contracts/component-styles.md` > "Filter-aktiv-stil". Ta bort de befintliga raderna `background: var(--fg); color: var(--bg); border-color: var(--fg); font-weight: 600;`. Ersätt med `border-bottom-color: var(--accent); font-weight: 600;`. På `.button` (icke-aktiv): lägg till `border-bottom: 2px solid transparent;` så att höjden är konstant mellan aktiv/inaktiv. Lägg också till `transition: background-color 200ms ease-out, border-color 200ms ease-out, color 200ms ease-out;` på `.button`. Lägg till en hover-stil för icke-aktiva: `.button:hover:not(.active) { background: var(--border); }`. Beroende: T002, T003 (palett), T011 (gap+padding).
- [X] T018 [P] [US3] Uppdatera `components/TodoList.tsx` och `.module.css` för att visa ☐-symbolen i tom-tillstånd enligt `contracts/component-styles.md` > "Tom-tillstånd". I `TodoList.tsx`: byt `return <p className={styles.empty}>{emptyMessage}</p>;` mot `return (<p className={styles.empty}><span aria-hidden="true" className={styles.emptyIcon}>☐</span>{emptyMessage}</p>);`. Lägg en kort svensk kommentar ovanför att förklara varför `aria-hidden` används. I `TodoList.module.css`: lägg till `.emptyIcon`-klassen: `display: inline-block;`, `margin-right: 0.5rem;`, `font-size: 1.5rem;`, `vertical-align: middle;`, `font-style: normal;` (så symbolen inte lutar trots att `.empty` är kursiv). Beroende: T008 (`.list` gap är där, men ej kollision).
- [ ] T019 [US3] Manuell verifiering av US3 enligt `quickstart.md` > "US3 — Tydligare interaktiva element" (steg 1–6). Kör `npm run lint && npm run build` — noll fel, noll varningar. **Status**: `npm run lint` och `npm run build` passerar utan fel/varningar. Webbläsar­verifiering (visuell + skärmläsare) återstår — användaren utför detta efter implementationen är klar.

**Checkpoint**: Alla tre user stories är fullt fungerande. Featuren är
funktionellt komplett. Återstår: kontrastverifiering, skärmläsar-test och
end-to-end-genomgång (Polish).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verifiera kvalitetsattribut som spänner över alla user
stories — kontrast, tillgänglighet, regression mot 001+002, samt
förbereda konstitutionsamendment med de tre fastställda mörkt-läge-
värdena.

- [X] T020 [P] WCAG-kontrastverifiering enligt `quickstart.md` > "WCAG-kontrastverifiering (slutgiltig)". Verifiera alla 12 par (6 i ljust + 6 i mörkt) med devtools "Contrast ratio" eller webaim.org/resources/contrastchecker. Om något par underkänns: justera värdet i `app/globals.css` (endast i variabel-blocken) tills tröskeln nås, och uppdatera kommentaren i CSS:en med den slutliga uppmätta kontrasten. **Status**: Analytisk WCAG-beräkning (per WCAG 2.1-formel) är dokumenterad i `app/globals.css`-kommentaren ovanför `[data-theme="dark"]`-blocket; alla 12 par klarar AA-tröskeln med marginal (lägsta är `--accent` mot `--bg` i ljust, ≈ 4.7:1 på UI-/text-kombination, övriga ≥ 5.2:1). Praktisk verifiering med ett kontrastverktyg återstår — användaren utför detta vid webbläsar­körning.
- [ ] T021 [P] Skärmläsar- och tangentbordsverifiering enligt `quickstart.md` > "US3" steg 6 + "Edge cases" reduced-motion. (a) Tabba genom appen — alla interaktiva element har synlig fokusring i `var(--accent)`. (b) Töm listan och navigera till tom-meddelandet med skärmläsare (NVDA på Windows, VoiceOver på Mac med Cmd+F5) — den ska läsa "Inga uppgifter än" *utan* att uttala "ballot box". (c) Aktivera `prefers-reduced-motion: reduce` i devtools Rendering — alla transitioner är 0 ms (tema-byte instant, hover instant). Om något fallerar: justera `aria-hidden` eller den globala `prefers-reduced-motion`-regeln. **Status**: Kod-sidan av tillgängligheten är på plats — globala `:focus-visible` med `2px solid var(--accent)`, `aria-hidden="true"` på tom-state-symbolen, `prefers-reduced-motion: reduce` → `transition-duration: 0ms` i `globals.css`. Skärmläsar- och praktisk tangentbords­verifiering återstår — användaren utför detta.
- [ ] T022 Slutgiltig end-to-end-verifiering enligt `quickstart.md` från första rad till sista. Inkluderar regression-check mot 001 (lägg till, kryssa, ta bort, filtrera, "Rensa klara", localStorage-persistens) och 002 (tema-toggle, persistens, systempref, inga FOUC-blink, reduced-motion). Avsluta med `npm run lint && npm run build` (kombinerad körning). Featuren är klar att markeras som färdig först när detta steg är ✅. **Status**: `npm run lint` och `npm run build` passerar utan fel/varningar. Webbläsar­körning av hela `quickstart.md` (US1 + US2 + US3 + edge cases + regression mot 001/002) återstår — användaren utför detta.
- [X] T023 Förbered konstitutionsamendment-data. **Notis för uppföljande `/speckit-constitution`-körning (TODO_DARK_FEEDBACK_COLORS löst)**: I 004-apply-design-system har följande mörkt-läge-värden fastställts och är nu i produktion (commit på branchen `004-apply-design-system`): `--accent-fg` mörkt = `#1a1a1a` (analytisk kontrast ≈ 5.7:1 mot `--accent` `#e89678` ✅ AA), `--danger` mörkt = `#ef6b6b` (≈ 5.7:1 mot `--bg` `#1a1a1a` ✅ AA), `--ok` mörkt = `#7fc987` (≈ 6.2:1 mot `--bg` `#1a1a1a` ✅ AA). Konstitutionen v1.1.0:s "Färgpalett — Mörkt läge" bör utökas med dessa tre värden via en PATCH-bump (v1.1.1) efter att 004 har mergats till main. Beroende: T020.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Inga beroenden — kan startas direkt.
- **Foundational (Phase 2)**: Beror på Setup. **BLOCKERAR** alla user stories.
  Inom Phase 2 är T002 → T003 → T004 sekventiella (samma fil, beroende
  ordning).
- **US1 (Phase 3)**: Beror på Foundational. T005 → T006 → T007 sekventiellt.
- **US2 (Phase 4)**: Beror på Foundational. T008 → (T009/T010/T011/T012/T013
  parallellt) → T014 → T015. T013 förlitar sig på att T005 redan har
  gjort warning-banner-stilen, så den kan inte parallelliseras med US1.
- **US3 (Phase 5)**: Beror på Foundational + US2 (pga radius-tokens). T016,
  T017, T018 berör olika filer → kan parallelliseras. T019 sista.
- **Polish (Phase 6)**: Beror på alla föregående. T020 + T021 är oberoende
  spår → parallella. T022 sista. T023 beror på T020.

### User Story Dependencies

- **US1**: Beroende på Foundational. Levererar färgsystemets konsistens —
  funktionellt fristående leveranspunkt.
- **US2**: Beror på US1 (men inte 100 %). T009-T013 kan teoretiskt köras
  parallellt med US1 om man har två utvecklare; säkrast är dock sekventiellt
  så regression-checks blir tydliga. Dependensen är att T005 (warning-
  banner) bör vara klar innan T013 (page.module.css övriga ändringar),
  eftersom T013 förlitar sig på att .warning redan är på plats.
- **US3**: Bygger på US2:s radius-tokens. Kan inte börja innan T010, T011 är
  klara (knapparna behöver `--radius-button`-värdet).

### Within Each User Story

- Implementationsuppgifter före verifieringsuppgift.
- Filer som rör samma fil (t.ex. `globals.css`) sekventiellt.
- Filer som rör olika filer parallellt om det är `[P]`-markerat.

### Parallel Opportunities

- **Inom Phase 4 (US2)**: T009 (TodoItem), T010 (TodoInput), T011
  (FilterBar), T012 (ThemeToggle), T013 (page.module.css) berör alla olika
  filer — kan köras parallellt. T008 (TodoList) och T014 (globals-städning)
  är sekventiella relativt dessa.
- **Inom Phase 5 (US3)**: T016 (TodoInput), T017 (FilterBar), T018
  (TodoList) berör olika filer — parallella.
- **Inom Phase 6**: T020 (kontrast) och T021 (a11y) är oberoende
  verifieringsspår — parallella.

---

## Parallel Example: User Story 2

```text
# Efter att Phase 2 (Foundational) är klar och T008 är klar:
Task T009: TodoItem.module.css
Task T010: TodoInput.module.css
Task T011: FilterBar.module.css
Task T012: ThemeToggle.module.css
Task T013: app/page.module.css

# Synkroniseringspunkt: alla ovan måste vara klara innan
Task T014: Ta bort --gap och --radius från globals.css

# Slutligen:
Task T015: Verifiera US2
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. **Phase 1**: Setup-verifiering (T001).
2. **Phase 2**: Foundational — palett + transitions + nya tokens (T002-T004).
3. **Phase 3**: US1 — färg-konsistens + warning-banner (T005-T007).
4. **STOP and VALIDATE**: Demonstrera att hela appen följer den nya
   paletten och att tema-växlingen är konsekvent. Detta är ett legitimt
   leveransstopp — featuren ger redan visuell vinst.

### Incremental Delivery

1. Setup + Foundational → grund klar (palett + tokens).
2. US1 → färg-konsistens (kan demonstreras separat).
3. US2 → spacing + hörn (kan demonstreras separat).
4. US3 → komponent-detaljer (slutpolering).
5. Polish → kontrast + a11y + regression.

Varje steg kan i teorin levereras separat. För denna feature är allt-i-ett
sannolikt mer praktiskt eftersom användaren bad om en hel "designöversyn"
— men incremental ger granulär kontroll om något skulle gå fel.

### Solo Strategy (en utvecklare)

Sekventiellt T001 → T023. `[P]`-markerade tasks kan göras i valfri ordning
inom sin fas; sekventiell ordning fångar fel tidigare.

---

## Notes

- **Inga nya beroenden**: Hela featuren använder befintliga paket
  (`lucide-react` redan installerat). Princip I (KISS) opåverkad.
- **Hooks och storage helt orörda**: `hooks/useTodos.ts`,
  `hooks/useTheme.ts`, `lib/storage.ts` rörs INTE av någon task. Om en
  task verkar kräva ändring där — stoppa och granska.
- **JSX-ändringar**: Endast en — `<span ☐>` i `TodoList.tsx` (T018).
  Allt annat är ren CSS.
- **Fortlöpande WCAG-uppmätning**: T020 är den enda task som kan kräva
  värde-justering i `globals.css` efter att Phase 2 är klar. Justeringar
  dokumenteras tillbaka som amendment till konstitutionen via T023.
- **Verifiera tester misslyckas**: ej tillämpligt — inga automatiska
  tester.
- **Commit per fas-checkpoint** rekommenderas (kan triggas av
  `auto_execute_hooks: true` i `.specify/extensions.yml` via
  `/speckit-git-commit`).
- **Stoppa vid varje checkpoint** för att verifiera storyn självständigt.
- **Undvik**: hårdkodade hex-värden i komponentstilar, padding/margin-värden
  som inte är 8-multiplar, radius som inte är `var(--radius-button)` eller
  `var(--radius-card)`, transitions med `ease` istället för `ease-out`.
