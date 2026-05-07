# Feature Specification: Mörkt läge-toggle

**Feature Branch**: `002-dark-mode-toggle`
**Created**: 2026-05-06
**Status**: Draft
**Input**: User description: "Lägg till en mörkt läge-toggle uppe till höger på sidan.
En knapp/ikon med en sol respektive måne, beroende på läge. Klick växlar mellan ljust och
mörkt tema. Användarens val sparas i localStorage så det följer mellan besök. Default-läget
följer användarens systeminställning (prefers-color-scheme). Animera övergången mjukt
(200ms). Mörkt tema ska ha samma layout men mörk bakgrund och ljus text. Inga skarpa
kontraster — använd dämpade nyanser."

## Clarifications

### Session 2026-05-07

- Q: Om användaren inte gjort ett manuellt val och byter OS-tema medan appen är öppen — ska sidan följa live eller behålla temat från första laddning? → A: Behåll temat från första laddning; OS-ändringar under sessionen ignoreras.
- Q: Vilka ytor ska animeras vid temabyte — bara bakgrund och text, eller alla färgbärande ytor? → A: Alla färgbärande ytor (bakgrund, text, ramar, knappfärger, ikoner, fokusring) övergår mjukt med samma 200 ms.
- Q: Hur ska temabytet bete sig när `prefers-reduced-motion: reduce` är aktivt — instant, kort animation, eller behåll 200 ms? → A: Instant — övergångstiden sätts till 0 ms och färgbytet sker omedelbart.
- Q: Var i kolumntoppen ska toggleknappen sitta i förhållande till h1-rubriken "Mina uppgifter"? → A: På samma rad som h1, högerjusterad — rubrik vänster, knapp höger.

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Växla mellan ljust och mörkt tema (Priority: P1)

Som användare vill jag kunna klicka på en knapp uppe till höger på sidan för att växla
mellan ljust och mörkt tema, så att jag kan välja det utseende som passar bäst för min
omgivning eller mina ögon. Knappen visar en sol-ikon när jag är i mörkt läge (ett löfte om
att klicket tar mig till det ljusa) och en måne-ikon när jag är i ljust läge. När jag
klickar växlar hela sidans bakgrund och text mjukt (cirka 200 ms) till det andra temat —
layouten är oförändrad, det är bara färgerna som byts.

**Why this priority**: Detta är hela funktionens kärna. Utan att kunna växla tema finns
ingen produkt; persistens och systempreferens är värdelösa utan en fungerande växling
först.

**Independent Test**: Öppna appen i ljust läge. Klicka på måne-ikonen uppe till höger.
Sidan blir mörk (mörk bakgrund, ljus text) och ikonen byter till en sol. Klicka på
sol-ikonen. Sidan blir ljus igen och ikonen byter tillbaka till en måne. Övergångarna är
mjuka — inga hårda hopp.

**Acceptance Scenarios**:

1. **Given** appen visas i ljust läge, **When** användaren klickar på toggleknappen,
   **Then** byter sidan till mörkt tema (mörk bakgrund, ljus text) och ikonen visar en
   sol.
2. **Given** appen visas i mörkt läge, **When** användaren klickar på toggleknappen,
   **Then** byter sidan till ljust tema (ljus bakgrund, mörk text) och ikonen visar en
   måne.
3. **Given** ett temabyte sker, **When** övergången spelas upp, **Then** ändrar bakgrund
   och text färg gradvis under cirka 200 ms — inga hårda hopp.
4. **Given** appen visas på en telefon (≥320 px bredd), **When** användaren tittar på
   sidan, **Then** är toggleknappen synlig uppe till höger inom innehållsbredden och har
   en klickyta på minst 44 × 44 px.
5. **Given** en uppgiftslista visas, **When** användaren växlar tema, **Then** är
   listans struktur, ordning och innehåll oförändrade — bara färgerna ändras.
6. **Given** användaren navigerar bara med tangentbordet, **When** användaren tabbar till
   toggleknappen och trycker Enter eller mellanslag, **Then** växlar temat och en synlig
   fokusring visas på knappen.

---

### User Story 2 – Mitt val följer mellan besök (Priority: P2)

Som användare vill jag att mitt valda tema kommer ihåg sig mellan besök, så att jag inte
behöver klicka tillbaka till mitt föredragna läge varje gång jag öppnar appen. Om jag
valde mörkt igår ska sidan starta i mörkt idag.

**Why this priority**: Persistens gör funktionen användbar i vardagen, men US1 fungerar
även utan den (i samma session). Därför P2.

**Independent Test**: Klicka på toggleknappen så att appen visas i mörkt läge. Stäng
fliken och öppna appen igen — sidan startar direkt i mörkt läge. Växla till ljust och
ladda om — sidan startar i ljust läge.

**Acceptance Scenarios**:

1. **Given** användaren har valt mörkt tema, **When** sidan laddas om eller öppnas i ny
   flik, **Then** visas appen direkt i mörkt tema utan att blinka först i ljust.
2. **Given** användaren har valt ljust tema, **When** sidan laddas om, **Then** visas
   appen i ljust tema.
3. **Given** ingen tidigare val finns sparat, **When** användaren växlar tema för första
   gången, **Then** sparas valet så att det används vid nästa besök.
4. **Given** ett sparat val finns, **When** användaren stänger webbläsaren och kommer
   tillbaka senare samma vecka, **Then** är valet fortfarande kvar.

---

### User Story 3 – Default följer systemets inställning (Priority: P3)

Som ny användare vill jag att appen automatiskt visas i mörkt läge om jag har valt mörkt
läge i mitt operativsystem (eller webbläsare), och i ljust läge annars, så att appen
känns hemmastad utan att jag behöver göra något. När jag manuellt väljer ett tema
övertar mitt val systeminställningen.

**Why this priority**: Förbättrar första intrycket men kräver att US1 (växling) och US2
(persistens) redan fungerar för att vara meningsfullt. Därför P3.

**Independent Test**: Rensa localStorage. Ställ in mörkt läge i operativsystemet eller
webbläsaren. Öppna appen — den visas i mörkt läge. Ställ in ljust läge i systemet, rensa
localStorage igen, ladda om — appen visas nu i ljust läge.

**Acceptance Scenarios**:

1. **Given** inget sparat val finns och systemet är inställt på mörkt, **When**
   användaren öppnar appen, **Then** visas appen i mörkt tema.
2. **Given** inget sparat val finns och systemet är inställt på ljust, **When**
   användaren öppnar appen, **Then** visas appen i ljust tema.
3. **Given** användaren har manuellt valt ett tema, **When** systemets inställning
   ändras, **Then** behåller appen användarens explicita val (manuellt val har
   företräde).

---

### Edge Cases

- **localStorage otillgängligt** (privat läge, full disk, blockerat av användaren):
  Appen MÅSTE fortfarande gå att använda. Temat följer systeminställningen och växling
  fungerar inom sessionen, men valet glöms vid omladdning.
- **Korrupt eller ogiltigt sparat värde** i localStorage (t.ex. om någon manuellt har
  ändrat värdet till "blå"): Appen behandlar det som om inget val finns och faller
  tillbaka på systeminställningen.
- **Användaren har `prefers-reduced-motion` påslaget**: Övergången sätts till 0 ms —
  färgbytet sker omedelbart utan fade.
- **Snabba upprepade klick** på toggleknappen: Varje klick växlar tema utan att
  animationer hopar sig eller hänger. Slutläget motsvarar antalet klick (jämnt = samma
  som start, udda = motsatt).
- **Snabb första rendering** ("flash of wrong theme"): Om användaren har valt mörkt får
  ingen kort vit blink synas innan mörkt tema appliceras vid sidladdning.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sidan MÅSTE visa en synlig toggleknapp på samma rad som sidans h1-rubrik
  ("Mina uppgifter"), högerjusterad i den centrerade kolumnen — rubrik till vänster och
  toggleknapp till höger på samma horisontella rad.
- **FR-002**: Toggleknappen MÅSTE visa en måne-ikon när nuvarande tema är ljust och en
  sol-ikon när nuvarande tema är mörkt (ikonen representerar det läge man kommer till om
  man klickar).
- **FR-003**: Toggleknappen MÅSTE ha ett tillgängligt namn som beskriver åtgärden (t.ex.
  "Växla till mörkt läge" / "Växla till ljust läge") och uppdateras dynamiskt med
  aktuellt läge så att skärmläsare läser upp rätt etikett.
- **FR-004**: Klick (mus eller pekskärm) på toggleknappen MÅSTE växla aktivt tema mellan
  ljust och mörkt.
- **FR-005**: Knappen MÅSTE vara tangentbordsanvändbar — fokuserbar via Tab och
  aktiverbar med Enter och mellanslag — och visa en synlig fokusring.
- **FR-006**: Klickytan på toggleknappen MÅSTE vara minst 44 × 44 px på alla
  skärmstorlekar.
- **FR-007**: Vid varje temabyte MÅSTE alla färgbärande ytor — bakgrund, text, ramar,
  knappfärger, ikoner och fokusring — övergå mjukt under cirka 200 ms, samtidigt och
  med samma varaktighet, så att övergången upplevs som en sammanhängande färgton­ändring
  och inte som att delar av sidan hoppar.
- **FR-008**: När `prefers-reduced-motion: reduce` är aktivt MÅSTE övergångstiden sättas
  till 0 ms — färgbytet sker omedelbart utan animation. Detta gäller alla färgbärande
  ytor i FR-007.
- **FR-009**: Användarens valda tema MÅSTE sparas och användas vid nästa besök så att
  valet följer mellan sessioner i samma webbläsare.
- **FR-010**: När inget sparat val finns MÅSTE appen använda systemets inställning
  (`prefers-color-scheme`) som default — mörkt om systemet är mörkt, annars ljust.
  Detektionen sker vid första laddning; ändras systeminställningen senare under samma
  session uppdateras inte temat automatiskt.
- **FR-011**: Ett manuellt val MÅSTE ha företräde över systeminställningen så länge
  valet finns sparat.
- **FR-012**: Vid första rendering MÅSTE rätt tema vara aktivt direkt — användaren ska
  inte se en kort blink i fel tema innan det riktiga temat appliceras.
- **FR-013**: Mörkt tema MÅSTE ha mörk bakgrund och ljus text och använda dämpade
  nyanser — inga rena 100 % vita eller rena 100 % svarta toner mot varandra.
- **FR-014**: Båda teman MÅSTE uppfylla WCAG AA-färgkontrast (minst 4,5:1 för normal
  text, 3:1 för stor text och interaktiva element).
- **FR-015**: Layout, struktur, typografi och avstånd MÅSTE vara identiska mellan ljust
  och mörkt tema — endast färgerna skiljer sig.
- **FR-016**: Om sparat värde är ogiltigt eller om sparlagring är otillgänglig MÅSTE
  appen falla tillbaka på systeminställningen utan att krascha.

### Key Entities

- **Temaval**: Användarens valda visningsläge. Tar ett av tre logiska tillstånd —
  *ljust*, *mörkt*, eller *inget val (följ systemet)*. Persisteras i webbläsarens
  lokala lagring så att det överlever omladdningar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En användare kan växla tema med ett enda klick eller en enda
  tangentbordsaktivering på under 1 sekund (från klick till färdig övergång).
- **SC-002**: 100 % av användarens manuella temaval bevaras vid omladdning av sidan och
  vid nästa besök i samma webbläsare (givet att lokal lagring är tillgänglig).
- **SC-003**: 100 % av nya besökare utan sparat val ser det tema som matchar deras
  systeminställning vid första rendering.
- **SC-004**: Vid första sidladdning visas inget synligt fel-tema-blink (dvs. ingen
  märkbar blixt av motsatt tema innan rätt tema appliceras).
- **SC-005**: Färgkontrasten i båda teman uppfyller WCAG AA (minst 4,5:1 för normal
  text och 3:1 för stora element och fokusringar) — verifierbart med vilket
  WCAG-kontrastverktyg som helst.
- **SC-006**: Toggleknappen är åtkomlig och aktiverbar enbart med tangentbord, och
  skärmläsare annonserar både dess syfte och aktuellt läge på ett begripligt sätt.
- **SC-007**: Funktionen fungerar oförändrat på skärmar från 320 px breda till desktop
  utan att layouten bryts eller horisontell scroll uppstår.
- **SC-008**: Färgövergången vid temabyte upplevs som mjuk (cirka 200 ms) av en majoritet
  av testanvändare, och respekteras automatiskt när reducerad rörelse är efterfrågad.

## Assumptions

- **Toggleknappens placering**: Knappen sitter på samma horisontella rad som sidans
  h1-rubrik "Mina uppgifter" — rubrik till vänster, toggleknapp högerjusterad — inom
  den centrerade innehållskolumnen (inte fixerad i webbläsarfönstrets hörn). Detta
  sparar vertikalt utrymme på mobil och stämmer med konventionella app-headers.
- **Återanvändning av befintlig design**: Det ljusa temat behåller exakt samma
  färgpalett som dagens app — det enda som är nytt är ett mörkt tema och en växlare. Inga
  färger i ljust tema ändras inom ramen för denna feature.
- **Mörka temats palett**: "Dämpade nyanser" tolkas som off-blacks (t.ex. mycket mörka
  grå/blågrå toner) för bakgrund och off-whites (mjuka ljusgrå/varma vita toner) för
  text — aldrig ren `#000` mot ren `#fff`. Konkreta färgvärden bestäms i planeringen
  så länge WCAG AA uppfylls.
- **Sparlagring**: `localStorage` förutsätts som lagringsmekanism (i linje med projektets
  konstitution och hur övriga data redan persisteras). Om den är otillgänglig fungerar
  appen ändå inom sessionen men minns inget val mellan besök.
- **Systempreferens-detektion**: `prefers-color-scheme` förutsätts vara tillgänglig i
  målmiljön (alla moderna webbläsare); ingen särskild fallback-logik krävs för äldre
  webbläsare.
- **Existerande tillgänglighet**: Appen följer redan konstitutionens tillgänglighets-
  princip (synlig fokusring, semantisk HTML, WCAG AA). Den nya knappen ärver dessa
  vanor.
- **Ingen ny route eller modal**: I enlighet med principen "En enda sida" sker växlingen
  in-place på samma vy — ingen popup, panel eller separat inställningssida.
