# Feature Specification: Designöversyn — applicera designsystemet

**Feature Branch**: `004-apply-design-system`
**Created**: 2026-05-08
**Status**: Draft
**Input**: User description: "Designöversyn — applicera projektets designsystem på todo-appen.
Granska all CSS och uppdatera färger, padding, hörn och skuggor enligt constitution.md. Byt
ut hårdkodade färger mot CSS-variabler. 24 px mellan listobjekt. Lägg till-knapp får
accent-färg som bakgrund, vit text, subtil hover. Filter-knappar får aktiv-stil med
understruken accent-färg. Tom-tillstånd får dämpad kursiv text och en emoji. Layout och
komponentstruktur, useTodos och localStorage-kod orörda."

## Clarifications

### Session 2026-05-08

- Q: "Vit text" på Lägg till-knappen i mörkt läge — vit ger endast ≈ 2.3:1 kontrast mot accent `#e89678`. Hur ska textfärgen hanteras? → A: `--accent-fg` växlar per tema — vit (`#ffffff`) i ljust läge, mörk (≈ `#1a1a1a`) i mörkt läge. "Vit text"-formuleringen tolkas som tema-aware kontrastfärg på accent.
- Q: Mörkt-läges värden för `--danger` och `--ok` (TODO_DARK_FEEDBACK_COLORS från konstitutionen)? → A: `--danger: #ef6b6b` (≈ 5.7:1 mot `#1a1a1a`), `--ok: #7fc987` (≈ 6.2:1 mot `#1a1a1a`). Värdena committas tillbaka som amendment till konstitutionen efter implementation.
- Q: Vilken symbol ska visas vid tom-tillstånd? → A: `☐` (U+2610 BALLOT BOX) — tematisk (tom checkbox), monokrom, ärver `var(--muted)`-färg och fungerar konsekvent i båda teman.
- Q: Vilken färgstrategi ska warning-bannern använda? → A: Neutral — bakgrund med en mild accent-tonad overlay, text i `var(--fg)`, vänster-border i `var(--accent)`. Använder befintliga variabler — inga nya `--warning-*`-variabler eller överdramatisk röd.

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Konsekvent färgsystem (Priority: P1)

Som användare vill jag att hela appen ser ihopkopplad ut visuellt — bakgrund, text,
accent och feltoner ska vara samma uppsättning färger oavsett vilken del av sidan jag
tittar på, och tema­växlingen mellan ljust och mörkt ska byta alla färger samtidigt
(inga "kvarglömda" hårdkodade hex-värden som blinkar fel). Den ljusa bakgrunden ska
vara den mjuka off-vita från designsystemet (inte ren vit), och accentfärgen ska vara
den varma terrakotta-tonen — inte den nuvarande blå.

**Why this priority**: Färgkonsistensen är grunden i designsystemet. Utan den fortsätter
appen att kännas "halvfärdig" med blandade beslut, och tema­växlingen från 002 är
fortfarande inkomplett (warning-bannern växlar inte färg t.ex.). Allt annat i denna
feature bygger på att paletten är på plats.

**Independent Test**: Öppna appen i ljust läge. Kontrollera bakgrundsfärgen — den ska
vara den dämpade off-vita (`#fafaf7`), inte ren vit. Accentfärger (Lägg till-knappen,
fokusringen, filter-aktiv-tillståndet) är terrakotta, inte blå. Klicka på toggle-knappen
till mörkt läge. Alla synliga färger byter till de mörka motsvarigheterna; warning-
banner-färgerna (om en visas) växlar också, ingen del av sidan har kvar en ljus rest.
Inspektera CSS i devtools — utanför `:root`- och `[data-theme="dark"]`-blocken finns
inga hårdkodade hex-värden.

**Acceptance Scenarios**:

1. **Given** appen visas i ljust läge, **When** användaren tittar på bakgrunden,
   **Then** är bakgrunden den dämpade off-vita från designsystemet — inte ren vit.
2. **Given** appen visas i ljust läge, **When** användaren tittar på interaktiva
   accent-element (Lägg till-knapp, fokusring, aktiv filter-stil), **Then** används
   den varma terrakotta-tonen från designsystemet.
3. **Given** appen visas i ljust läge med en warning-banner synlig, **When**
   användaren växlar till mörkt läge, **Then** byter warning-banner­ns bakgrund och
   text till värden som passar mörkt tema och uppfyller WCAG AA-kontrast.
4. **Given** designsystemet kräver att inga hårdkodade hex-värden finns utanför
   tema-deklarationerna, **When** en utvecklare granskar CSS-filerna i `app/` och
   `components/`, **Then** används endast `var(--*)`-referenser för färger där
   tema-aware-färger förväntas.
5. **Given** appen visas i mörkt läge, **When** användaren tittar på fel- och
   ok-färger (om sådana visas), **Then** har de tillräcklig kontrast (≥ 4,5:1) mot
   den mörka bakgrunden.

---

### User Story 2 – Lugnare luft och mjukare hörn (Priority: P2)

Som användare vill jag att appen känns lugn och bekväm att använda — listobjekten ska
ha mer luft mellan sig så de är lättare att skilja åt med blicken, och hörn ska vara
mjukt rundade (men inte pilliga) på alla interaktiva element. Ingen hård "rektangel-
estetik".

**Why this priority**: Kräver att färgsystemet (US1) är på plats men handlar om en
annan dimension — spacing och form. Bidrar med en stor del av "den nya appen ser
trevligare ut"-känslan men US1 levererar redan basvärdet. Därför P2.

**Independent Test**: Öppna appen med flera todo-poster i listan. Mät avståndet
mellan två listrader — minst ≈ 24 px luft (kontrollerbar via devtools "Computed"-
fliken). Inspektera knappars och inputs hörn — knappar har mindre rundning (≈ 6 px)
än kort/inputs (≈ 8 px). Inga element har skarpa 0 px-hörn. Ingen padding eller
margin är 12 px, 14 px, 18 px etc. — bara multiplar av 8.

**Acceptance Scenarios**:

1. **Given** listan visar flera uppgifter, **When** användaren tittar på två rader
   bredvid varandra, **Then** är det vertikala avståndet (gap eller margin) mellan
   dem 24 px.
2. **Given** en knapp visas, **When** användaren tittar på dess hörn, **Then** är
   border-radius 6 px — inte mer, inte mindre.
3. **Given** ett inputfält eller en kort-yta visas, **When** användaren tittar på
   dess hörn, **Then** är border-radius 8 px.
4. **Given** designsystemet kräver 8-px-skala, **When** en utvecklare granskar
   padding- och margin-värden i CSS, **Then** är alla värden multiplar av 8 px
   (8, 16, 24, 32, 48 …) — inte 12 px, 14 px, 18 px etc.

---

### User Story 3 – Tydligare interaktiva element (Priority: P3)

Som användare vill jag direkt se *vad* som är klickbart och *vad som är aktivt just
nu*. "Lägg till"-knappen ska sticka ut som en tydlig primärknapp (fylld med
accent­färg, vit text), filter-knapparna ska visa vilket filter som är aktivt med
en understruken accentfärg, och när listan är tom ska tom-meddelandet kännas
välkomnande snarare än kliniskt — dämpat, kursivt, med en liten illustration.

**Why this priority**: Förfinar interaktionen ytterligare men kräver att US1 (färger)
och US2 (spacing) redan är applicerade — annars sticker ändringarna ut som
inkonsekventa. Sista poleringssteget av designöversynen.

**Independent Test**: Öppna appen, töm den på uppgifter. Tom-meddelandet visas i
dämpad kursiv text med en emoji eller illustrations­symbol bredvid. Skriv något i
input-fältet — "Lägg till"-knappen syns tydligt med accentbakgrund och vit text.
Hovra över knappen — färgen ändrar sig subtilt under ≈ 200 ms (ease-out). Klicka på
"Kvar"-filtret — knappen får en understruken accentfärg som signalerar att det är
det aktiva filtret. Klicka på "Klara" — understreckningen flyttar dit istället.

**Acceptance Scenarios**:

1. **Given** ett inputfält med text och en aktiv "Lägg till"-knapp, **When**
   användaren tittar på knappen, **Then** har den fylld accentbakgrund (terrakotta i
   ljust läge, ljusare terrakotta i mörkt) och vit text.
2. **Given** "Lägg till"-knappen visas, **When** användaren hovrar med musen,
   **Then** ändras knappens utseende subtilt (mjuk färg- eller ljushets­förskjutning)
   under ≈ 200 ms ease-out.
3. **Given** filter-knapparna (Alla / Kvar / Klara) visas, **When** användaren
   tittar på vilket filter som är aktivt, **Then** har den aktiva knappen en
   understruken accentfärg som tydligt skiljer den från de inaktiva.
4. **Given** listan är tom, **When** användaren tittar på tom-meddelandet, **Then**
   visas det med dämpad kursiv text och en emoji eller illustrations­symbol som
   signalerar tomhet på ett vänligt sätt.
5. **Given** användaren växlar mellan filter (Alla → Kvar → Klara), **When** ett
   nytt filter blir aktivt, **Then** flyttas den understrukna accentmarkeringen
   omedelbart till den nya knappen.

---

### Edge Cases

- **Warning-bannern (`.warning`)**: Den hårdkodar idag pale-yellow-bakgrund och
  brun text. När mörkt tema är aktivt sticker den ut som en ljus rest. Per Q4 i
  Clarifications ersätts den med en neutral look som använder befintliga
  variabler (overlay av `--accent`, text i `--fg`, vänster-border i `--accent`).
- **Mörkt läges fel/ok-färger** är inte specificerade i konstitutionen (öppen
  TODO_DARK_FEEDBACK_COLORS). Om denna feature behöver visa fel- eller ok-färg i
  mörkt läge MÅSTE WCAG AA-kontrast verifieras mot bakgrund `#1a1a1a` innan release.
- **`--accent-fg` i båda teman**: Per Q1 i Clarifications växlar `--accent-fg` per
  tema — `#ffffff` i ljust och en mörk ton (≈ `#1a1a1a`) i mörkt — så att kontrast
  mot accent uppfylls i båda lägena (FR-003).
- **Befintlig hover-effekt** (`filter: brightness(0.95)` på "Lägg till"-knappen i
  001) är inte 200 ms ease-out — saknar transition-egenskap helt och hållet. Måste
  uppdateras för att vara observerbart subtil och uppfylla designsystemets 200 ms
  ease-out-regel.
- **Tema-bytes-övergång (200 ms ease)** från 002: konstitutionen kräver `ease-out`,
  inte plain `ease`. Skillnaden är subtil men ska rättas.
- **Existerande `--accent-fg`-variabel** används som textfärg på Lägg till-knappen.
  I konstitutionens designsystem nämns inte explicit `--accent-fg` — det är OK att
  behålla som intern variabel för "kontrastfärg på accent", men dess värde måste
  förbli WCAG-kompatibelt mot den nya terrakotta-accenten i båda teman.

## Requirements *(mandatory)*

### Functional Requirements

#### Färgsystem (US1)

- **FR-001**: Ljus paletten i `:root` MÅSTE matcha konstitutionen exakt: `--bg:
  #fafaf7`, `--fg: #1a1a1a`, `--accent: #cc7c5e`, `--muted: #6b6b6b` (alias för
  "dämpad text"), `--danger: #c62828` (alias för "fel"), `--ok: #2e7d32` (ny
  variabel för "ok").
- **FR-002**: Mörk paletten i `[data-theme="dark"]` MÅSTE matcha konstitutionen
  exakt: `--bg: #1a1a1a`, `--fg: #f0f0f0`, `--accent: #e89678`, `--muted:
  #999999`. Per Q2 i Clarifications: `--danger: #ef6b6b` (≈ 5,7:1 mot `#1a1a1a` ✅
  AA), `--ok: #7fc987` (≈ 6,2:1 mot `#1a1a1a` ✅ AA). De faktiska värdena
  verifieras med ett kontrastverktyg vid implementation och committas tillbaka som
  amendment till konstitutionen.
- **FR-003**: Variabeln `--accent-fg` MÅSTE växla per tema: `#ffffff` i ljust läge
  (kontrast ≈ 4,7:1 mot `--accent: #cc7c5e` ✅ AA), och en mörk ton (≈ `#1a1a1a`)
  i mörkt läge (kontrast ≈ 5,7:1 mot `--accent: #e89678` ✅ AA). Båda paren MÅSTE
  uppfylla WCAG AA (≥ 4,5:1) för normal text och verifieras vid implementation.
- **FR-004**: Ingen CSS-fil i `app/` eller `components/` får innehålla hårdkodade
  hex-färger utanför de två tema-blocken (`:root` och `[data-theme="dark"]`). Alla
  andra färgreferenser SKA använda `var(--*)`.
- **FR-005**: Warning-bannern (`.warning` i `app/page.module.css`) MÅSTE använda
  endast befintliga design-variabler (inga nya `--warning-*`). Per Q4 i
  Clarifications får den en neutral look: bakgrund som blandar in lite av accenten
  (t.ex. en mycket transparent overlay av `var(--accent)`), textfärg `var(--fg)`,
  och en vänster-border `3px solid var(--accent)` som visuellt markerar "obs". Den
  MÅSTE uppfylla WCAG AA-kontrast i båda teman.

#### Spacing och hörn (US2)

- **FR-006**: Alla padding- och margin-värden i CSS-filerna MÅSTE vara multiplar av
  8 px (uttryckta som `8px`, `1rem`, `1.5rem`, `2rem`, `3rem`, etc. där 1 rem = 16
  px). Befintliga 12 px-värden (t.ex. `--gap: 0.75rem`, `padding: 0.5rem 0.75rem`)
  MÅSTE bytas till närmaste 8-multipel.
- **FR-007**: Listobjekt (`<TodoItem>`-rader i `<TodoList>`) MÅSTE ha 24 px
  vertikalt mellanrum mellan sig (gap eller motsvarande).
- **FR-008**: Knappar (alla `<button>`-element) MÅSTE ha `border-radius: 6px`.
- **FR-009**: Inputs, kort, listrader och paneler MÅSTE ha `border-radius: 8px`.
- **FR-010**: Inget element får ha `border-radius: 0` eller skarpa hörn.
- **FR-011**: Skuggor i CSS MÅSTE begränsas till `box-shadow: 0 1px 3px rgba(0, 0,
  0, 0.08)` eller saknas helt. Djupare/starkare skuggor är inte tillåtna.

#### Animationer (US1+US2+US3)

- **FR-012**: CSS-transitions för hover- och fokus-tillstånd MÅSTE använda `200ms
  ease-out`. Befintliga `200ms ease` (från 002) ska uppdateras.
- **FR-013**: Tema-bytes-transitionen i `globals.css` MÅSTE uppdateras till `200ms
  ease-out` (var `200ms ease`).

#### Komponent-detaljer (US3)

- **FR-014**: "Lägg till"-knappen (`<TodoInput>`-formulärets submit-knapp) MÅSTE ha
  fylld accentfärg som bakgrund (`background: var(--accent)`) och tema-aware
  kontrastfärg på texten (`color: var(--accent-fg)` — vit i ljust läge, mörk i
  mörkt läge per FR-003), samt en subtil hover-effekt som ändrar färg-/ljushets­
  ton under `200ms ease-out`.
- **FR-015**: Filter-knapparna (Alla / Kvar / Klara) MÅSTE ha en synlig aktiv-stil
  med en understreckning i `var(--accent)`-färgen. Inaktiva filter-knappar har
  ingen understreckning.
- **FR-016**: Vid byte av aktivt filter MÅSTE understreckningen flyttas omedelbart
  (eller med samma 200 ms ease-out som övriga animationer) till den nya aktiva
  knappen. Endast en knapp i taget kan ha understreckningen.
- **FR-017**: Tom-tillstånds-meddelandet (när `<TodoList>` får en tom array) MÅSTE
  visas med (a) dämpad textfärg (`color: var(--muted)`), (b) kursiv stil
  (`font-style: italic`), och (c) symbolen `☐` (U+2610 BALLOT BOX) bredvid eller
  ovanför texten som visuellt signalerar tomhet. Symbolen ärver textens dämpade
  färg via `currentColor` (eller `color: inherit`) och växlar därför med temat
  utan separat hantering.
- **FR-018**: Tom-tillstånds-emojin/symbolen MÅSTE vara dekorativ — markeras med
  `aria-hidden="true"` så att skärmläsare inte läser upp den.

#### Tillgänglighet (oförändrad — verifieras)

- **FR-019**: Den synliga fokusringen (`:focus-visible`) MÅSTE bevaras med `outline:
  2px solid var(--accent); outline-offset: 2px` (eller motsvarande som upprätthåller
  WCAG-synlighet).
- **FR-020**: Alla färgkombinationer som visar text MÅSTE uppfylla WCAG AA-kontrast
  i båda teman: minst 4,5:1 för normal text, 3:1 för stora element och UI-
  komponenter (knappar, fokusringar). Inga befintliga `aria-label` eller
  `aria-hidden`-attribut får tas bort.
- **FR-021**: Klickytor MÅSTE förbli minst 44 × 44 px (oförändrat krav från princip
  VI och 002).

#### Scope-begränsningar (GÖR INTE)

- **FR-022**: Ingen JSX-struktur, komponentträd, props-yta eller komponent­fil­
  uppsättning får ändras. Ändringar sker uteslutande i CSS-filer (utom det enskilda
  fallet i FR-017 där `<TodoList>` kan behöva lägga till en visuell symbol som
  syskon till tom-texten — detta räknas som en visuell tillägning, inte en
  strukturändring).
- **FR-023**: `hooks/useTodos.ts`, `hooks/useTheme.ts` och `lib/storage.ts` MÅSTE
  vara helt orörda i denna feature. Ingen logikändring, ingen omsignering av
  publika ytor.

### Key Entities

(Ingen ny data — denna feature ändrar bara presentation. Befintliga entiteter
`Task`, `Filter`, `ThemeChoice` och `ThemeMode` återanvänds oförändrade.)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % av CSS-filerna i `app/` och `components/` kan visuellt och
  programmatiskt inspekteras (t.ex. med `grep -E '#[0-9a-f]{3,6}'`) och visar inga
  hårdkodade hex-färger utanför de två tema-blocken i `globals.css`.
- **SC-002**: Båda teman (ljust och mörkt) uppfyller WCAG AA-kontrast på alla
  text/bakgrund-par och UI-komponent-par, verifierat med ett standard­
  kontrastverktyg.
- **SC-003**: Spacing-värden i CSS — uttryckta i px eller rem — kan inspekteras
  och visar att alla padding- och margin-värden tillhör den fastställda 8-px-
  skalan (`8, 16, 24, 32, 48`). Inga 12-px- eller 14-px-värden återstår.
- **SC-004**: Listobjekt har observerbart 24 px (eller `1.5rem`) vertikalt
  mellanrum, mätbart i devtools "Computed"-fliken.
- **SC-005**: "Lägg till"-knappen är visuellt distinkt från övriga knappar —
  fylld accentbakgrund med vit text — och hovrar med en synlig men subtil
  förändring under cirka 200 ms.
- **SC-006**: Det aktiva filter-tillståndet (Alla, Kvar eller Klara) är direkt
  identifierbart i en visuell granskning av första frame: en användare som ser
  appen för första gången kan utan att klicka peka ut vilket filter som är aktivt.
- **SC-007**: Tom-tillstånds-meddelandet upplevs som vänligt snarare än kliniskt
  i en kvalitativ användartest (enkel ja/nej-fråga: "Känns detta välkomnande?").
- **SC-008**: Alla acceptanskriterier från 001 (todo-app: lägga till, kryssa,
  filtrera, rensa, persistens) och 002 (tema-toggle, persistens, systemdefault)
  fortsätter att passera oförändrat — inga regressioner.
- **SC-009**: `npm run lint` och `npm run build` passerar utan fel eller
  varningar efter ändringen.

## Assumptions

- **Mörkt läges fel/ok-färger** (löste TODO_DARK_FEEDBACK_COLORS från konstitutionen
  per Q2 i Clarifications): `--danger` (mörkt) `#ef6b6b`, `--ok` (mörkt) `#7fc987`.
  Värdena committas tillbaka som en amendment till konstitutionen efter att de
  WCAG-verifierats vid implementation.
- **Hover-effekt på "Lägg till"** ("subtil") tolkas som en mild ljushets-/
  färgförskjutning — t.ex. en lätt ljusare accentfärg eller en
  `filter: brightness(0.95)` (men *med* `transition: 200ms ease-out` så övergången
  syns).
- **Tom-tillstånds-symbol**: Per Q3 i Clarifications är symbolen `☐` (U+2610
  BALLOT BOX). Den är monokrom så den följer designsystemets dämpade ton i båda
  teman, och tematisk (tom checkbox = en uppgift att skapa). Markeras
  `aria-hidden="true"` så skärmläsare inte uttalar den.
- **Filter-aktiv-stil "understruken"** tolkas som `border-bottom: 2px solid
  var(--accent)` (med tillräckligt offset så det inte ser ut som ett input-streck)
  snarare än `text-decoration: underline`. Förra alternativet ger en tydligare
  "tab-känsla" och respekterar accentfärgen.
- **`--gap`-variabeln** (12 px / `0.75rem` idag) ersätts inte av en enskild ny
  variabel utan av ett par mer specifika spacing-värden i komponentkontexten
  (t.ex. `1rem` för formulärets gap mellan input och knapp, `1.5rem` mellan
  listobjekt). Detta är mer i linje med 8-skala-disciplinen än en gemensam
  generisk gap-variabel.
- **Befintliga komponentfiler ändras endast i CSS-modulerna**. JSX-koden i
  `components/*.tsx` och `app/page.tsx` rörs inte — undantaget en eventuell
  liten dekorativ symbol som läggs till för tom-tillståndet i `<TodoList>`-
  komponenten (FR-017). Allt annat — propsignaturer, händelse­hanterare,
  tillstånds­hantering — är intakt.
- **Konstitutionsversionen som styr designvalen** är v1.1.0 (commit `84e8b20`
  på `main`). Eventuella senare ändringar som omförhandlar paletten kräver en
  uppföljande migration.
