# Feature Specification: Todo-app (min-todo)

**Feature Branch**: `001-todo-app`
**Created**: 2026-05-05
**Status**: Draft
**Input**: User description: "Bygg en enkel todo-app med funktioner för att lägga till, visa,
markera klar/inte klar, ta bort, filtrera och rensa klara uppgifter. Persistens via
localStorage. Centrerad kolumn max 600 px, rubrik 'Mina uppgifter', mobilvänlig layout."

## Clarifications

### Session 2026-05-05

- Q: I vilken ordning ska uppgifterna visas i listan? → A: Nyaste uppgiften högst upp.
- Q: Vad händer med en uppgift när den markeras klar? → A: Den ligger kvar på exakt
  samma plats; bara utseendet (överstruken + dämpad) ändras.

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Lägga till och se uppgifter (Priority: P1)

Som användare vill jag kunna skriva in en uppgift i ett textfält och trycka Enter (eller
klicka på en plus-knapp) för att lägga till den i listan, så att jag kan börja samla
saker jag behöver göra. Listan visas direkt under inputfältet och en räknare visar hur
många uppgifter som finns. När jag stänger fliken och öppnar den igen finns mina
uppgifter kvar.

**Why this priority**: Detta är kärnan i en todo-app. Utan möjligheten att lägga till
och se uppgifter med persistens finns ingen produkt alls.

**Independent Test**: Öppna appen, skriv "Köp mjölk", tryck Enter. Uppgiften visas i
listan. Skriv "Boka tandläkare", klicka på +-knappen. Båda uppgifterna visas. Stäng
fliken, öppna igen — uppgifterna finns kvar.

**Acceptance Scenarios**:

1. **Given** ett tomt textfält, **When** användaren skriver "Handla" och trycker Enter,
   **Then** "Handla" visas som en post i listan och textfältet töms.
2. **Given** ett tomt textfält, **When** användaren skriver "Städa" och klickar på
   +-knappen, **Then** "Städa" läggs till i listan.
3. **Given** ett tomt eller bara-mellanslag-textfält, **When** användaren trycker Enter,
   **Then** ingen uppgift läggs till och inget felmeddelande spammas (knappen kan vara
   inaktiv eller åtgärden tyst ignoreras).
4. **Given** ett textfält med 200 tecken, **When** användaren försöker skriva ett 201:a
   tecken, **Then** ytterligare tecken accepteras inte.
5. **Given** en lista med tre uppgifter, **When** sidan laddas om, **Then** samma tre
   uppgifter visas i samma ordning.
6. **Given** två uppgifter har lagts till, **When** användaren tittar på sidan, **Then**
   visas en räknare som anger antal uppgifter (t.ex. "2 uppgifter kvar").

---

### User Story 2 – Markera uppgift klar / inte klar (Priority: P2)

Som användare vill jag kunna markera en uppgift som klar genom att klicka i en checkbox
bredvid den, så att jag kan följa min progress. Klara uppgifter ska visas tydligt
annorlunda (överstruken text och dämpad färg) och räknaren ska bara visa kvarvarande
uppgifter.

**Why this priority**: Att kryssa av saker är själva belöningen i en todo-app, men man
kan tekniskt sett använda US1 utan det. Därför P2.

**Independent Test**: Lägg till tre uppgifter (US1). Klicka i checkboxen för en av dem.
Den uppgiften får överstruken text och dämpad färg. Räknaren visar nu "2 uppgifter kvar".
Klicka i checkboxen igen — uppgiften återgår till aktiv stil och räknaren visar "3
uppgifter kvar". Ladda om sidan — checkbox-statusen är kvar.

**Acceptance Scenarios**:

1. **Given** en uppgift som inte är markerad klar, **When** användaren klickar i dess
   checkbox, **Then** uppgiften visas med överstruken text och dämpad färg, och
   kvarvarande-räknaren minskar med 1.
2. **Given** en uppgift som är markerad klar, **When** användaren klickar i checkboxen
   igen, **Then** uppgiften återgår till normalt utseende och räknaren ökar med 1.
3. **Given** en blandad lista med klara och inte klara uppgifter, **When** sidan laddas
   om, **Then** klar-statusen är bevarad för alla uppgifter.

---

### User Story 3 – Ta bort uppgift (Priority: P3)

Som användare vill jag kunna ta bort en uppgift genom att klicka på en
papperskorg-ikon, men först få en bekräftelseruta så att jag inte tar bort något av
misstag.

**Why this priority**: Att kunna städa bort gamla uppgifter är viktigt för långtidsbruk
men inte kritiskt för första intryck eller MVP.

**Independent Test**: Skapa två uppgifter. Klicka på papperskorgen bredvid den första.
En bekräftelseruta dyker upp. Klicka "Avbryt" — uppgiften finns kvar. Klicka på
papperskorgen igen och bekräfta — uppgiften försvinner från listan och räknaren
uppdateras. Ladda om — uppgiften är fortfarande borta.

**Acceptance Scenarios**:

1. **Given** en uppgift i listan, **When** användaren klickar på papperskorg-ikonen,
   **Then** visas en bekräftelseruta som frågar om uppgiften ska tas bort.
2. **Given** att bekräftelserutan visas, **When** användaren bekräftar, **Then** tas
   uppgiften bort från listan, räknaren uppdateras, och borttagningen sparas.
3. **Given** att bekräftelserutan visas, **When** användaren avbryter, **Then** finns
   uppgiften kvar oförändrad.

---

### User Story 4 – Filtrera vy (Priority: P4)

Som användare vill jag kunna filtrera listan till "Alla", "Kvar" eller "Klara" via tre
knappar/flikar under listan, så att jag kan fokusera på det som är relevant just nu.

**Why this priority**: Värdefullt när listan blir lång, men inte nödvändigt i början.
Bygger på US2 (klar-status måste finnas).

**Independent Test**: Skapa fyra uppgifter, markera två som klara. Klicka "Kvar" — bara
de två okryssade visas. Klicka "Klara" — bara de två kryssade visas. Klicka "Alla" —
alla fyra visas igen. Den aktiva fliken har en synlig markering hela tiden.

**Acceptance Scenarios**:

1. **Given** en blandad lista, **When** användaren klickar på "Kvar", **Then** visas
   endast okryssade uppgifter och fliken "Kvar" markeras som aktiv.
2. **Given** en blandad lista, **When** användaren klickar på "Klara", **Then** visas
   endast kryssade uppgifter.
3. **Given** filterläge "Klara" är aktivt, **When** användaren kryssar av en uppgift som
   var klar, **Then** försvinner uppgiften från den synliga vyn (men finns kvar i
   datat).
4. **Given** appen öppnas på nytt, **When** sidan laddas, **Then** är "Alla" det aktiva
   filtret som standard.

---

### User Story 5 – Rensa klara (Priority: P5)

Som användare vill jag kunna trycka på en knapp "Rensa klara" som tar bort alla
markerade-klara uppgifter på en gång (efter bekräftelse), så att jag slipper ta bort dem
en i taget.

**Why this priority**: Bekvämlighetsfunktion som blir värdefull först när man har använt
appen ett tag. Lägst prioritet.

**Independent Test**: Skapa fem uppgifter, markera tre som klara. Klicka "Rensa klara".
En bekräftelseruta visas. Avbryt — alla fem finns kvar. Klicka "Rensa klara" igen och
bekräfta — bara de två okryssade finns kvar. Räknaren visar "2 uppgifter kvar". Ladda
om — borttagningen är permanent.

**Acceptance Scenarios**:

1. **Given** minst en klar uppgift, **When** användaren klickar "Rensa klara" och
   bekräftar, **Then** tas alla uppgifter med klar-status bort medan okryssade uppgifter
   är orörda.
2. **Given** att inga uppgifter är klara, **When** användaren tittar på knappen, **Then**
   är knappen antingen dold eller inaktiverad så att den inte kan tryckas av misstag.
3. **Given** bekräftelserutan visas, **When** användaren avbryter, **Then** är inga
   uppgifter borttagna.

---

### Edge Cases

- **Tomt fält + whitespace**: Endast mellanslag/tabbar räknas som tomt och får inte
  läggas till.
- **Längre text än 200 tecken**: Inputfältet förhindrar att fler tecken matas in (eller
  klipper av). Klistrad text längre än 200 tecken klipps till 200 eller blockeras helt.
- **Tomt initialtillstånd**: Vid första besöket (eller efter att alla uppgifter är
  borttagna) visas listan tom med en lugn placeholder-text som "Inga uppgifter än" eller
  motsvarande, inte en mystisk tom yta.
- **Många uppgifter**: Listan ska kunna scrollas; sidans rubrik och inputfält behöver
  inte vara fasta men layouten får inte gå sönder vid t.ex. 200 uppgifter.
- **localStorage ej tillgänglig** (privat läge i vissa webbläsare, kvotfullt, eller
  inaktiverat): Appen ska fortfarande fungera under sessionen, men användaren ska
  informeras tydligt att uppgifter inte kommer att sparas mellan sessioner. Inga
  silent failures.
- **Trasig data i localStorage**: Om datat inte går att tolka (t.ex. manuell
  manipulation eller äldre format) ska appen starta med en tom lista hellre än att
  krascha — och helst meddela användaren att tidigare data inte kunde läsas.
- **Snabba upprepade Enter-tryck** med samma text: Varje tryck lägger till en ny post
  (dubbletter är tillåtna).
- **Filter "Klara" när inga klara finns**: Listområdet visas tomt med en placeholder
  som klargör vyn (t.ex. "Inga klara uppgifter").
- **Mycket smal skärm (320 px)**: Alla kontroller är åtkomliga och klickytor minst
  44 × 44 px utan horisontell scroll.

## Requirements *(mandatory)*

### Functional Requirements

**Lägga till uppgifter**

- **FR-001**: Sidan MÅSTE visa ett textfält högst upp där användaren kan skriva in en
  ny uppgift.
- **FR-002**: Användaren MÅSTE kunna lägga till en uppgift både genom att trycka Enter
  i textfältet och genom att klicka på en synlig +-knapp.
- **FR-003**: Systemet MÅSTE förhindra att tomma uppgifter läggs till (text som efter
  trimning av blanksteg är tom räknas som tom).
- **FR-004**: Systemet MÅSTE begränsa uppgiftens text till maximalt 200 tecken; försök
  att mata in mer ska blockeras eller klippas.
- **FR-005**: Efter att en uppgift lagts till MÅSTE textfältet tömmas och behålla
  fokus så att användaren snabbt kan lägga till fler.

**Visa uppgifter**

- **FR-006**: Listan med uppgifter MÅSTE visas direkt under inputfältet.
- **FR-007**: Varje uppgift MÅSTE visa tre element: själva texten, en checkbox för
  klar-status, och en papperskorg-ikon för borttagning.
- **FR-008**: Klar-markerade uppgifter MÅSTE visas med överstruken text och dämpad
  färg så att de tydligt skiljer sig från okryssade.
- **FR-009**: Sidan MÅSTE visa en räknare med antal kvarvarande (icke-klara) uppgifter
  i naturlig svenska (t.ex. "3 uppgifter kvar", "1 uppgift kvar", "0 uppgifter kvar").
- **FR-010**: När listan är tom MÅSTE en informativ placeholder visas i stället för
  en blank yta.
- **FR-010a**: Listan MÅSTE sorteras med den nyaste uppgiften högst upp och den
  äldsta längst ner. Sorteringen är stabil mellan sidladdningar.

**Markera klar / inte klar**

- **FR-011**: Klick eller tangentbordsaktivering av en uppgifts checkbox MÅSTE växla
  uppgiftens klar-status.
- **FR-012**: Statusändringen MÅSTE sparas omedelbart (innan eventuell omladdning).
- **FR-012a**: En uppgift MÅSTE behålla sin position i listan när dess klar-status
  växlas; ingen automatisk omsortering sker vid statusbyte.

**Ta bort uppgift**

- **FR-013**: Klick på papperskorg-ikonen MÅSTE öppna en bekräftelseruta innan
  borttagning sker.
- **FR-014**: Vid bekräftelse MÅSTE uppgiften tas bort från listan och persistensen.
- **FR-015**: Vid avbruten bekräftelse MÅSTE listan vara helt oförändrad.

**Filtrera**

- **FR-016**: Sidan MÅSTE visa tre filter-kontroller under listan: "Alla", "Kvar",
  "Klara".
- **FR-017**: Aktivt filter MÅSTE visas tydligt visuellt (t.ex. annan bakgrund, ram
  eller fet text) och programmatiskt (t.ex. för skärmläsare).
- **FR-018**: "Alla" MÅSTE vara standard vid första besök.
- **FR-019**: Filtervalet är vy-state och behöver INTE persistas mellan sessioner
  (medvetet val för enkelhetens skull).

**Rensa klara**

- **FR-020**: Sidan MÅSTE ha en "Rensa klara"-knapp som tar bort alla klar-markerade
  uppgifter på en gång efter bekräftelse.
- **FR-021**: Knappen "Rensa klara" SKA vara inaktiverad eller dold när inga uppgifter
  är klara.

**Persistens**

- **FR-022**: Uppgifter (text och klar-status) MÅSTE sparas i webbläsarens
  localStorage så att de finns kvar efter att fliken stängs och öppnas igen.
- **FR-023**: Systemet MÅSTE ha INGEN backend, INGA konton och göra INGA externa
  nätverksanrop för datat.
- **FR-024**: Om localStorage inte är tillgänglig eller datat är trasigt MÅSTE appen
  starta med tom lista och informera användaren snarare än att krascha.

**Layout och utseende**

- **FR-025**: Innehållet MÅSTE presenteras i en centrerad kolumn med max-bredd
  600 px.
- **FR-026**: Sidan MÅSTE ha en tydlig rubrik "Mina uppgifter" högst upp.
- **FR-027**: Designen SKA vara minimalistisk med vit bakgrund och mörk text.
- **FR-028**: Layouten MÅSTE fungera utan horisontell scroll på skärmar från 320 px
  och uppåt och se proportionerlig ut på desktop (≥1024 px).
- **FR-029**: Alla interaktiva element (knappar, checkboxar, papperskorg) MÅSTE ha
  en klickyta på minst 44 × 44 px på touch-enheter.

**Tillgänglighet**

- **FR-030**: Hela appens funktionalitet MÅSTE kunna utföras med enbart tangentbord
  (lägga till, kryssa av, ta bort, filtrera, rensa).
- **FR-031**: Synlig fokusring MÅSTE finnas på alla fokuserbara element.
- **FR-032**: Listan, räknaren och filtervalen MÅSTE vara begripliga för en
  skärmläsare (semantisk markup; tillståndsändringar tillkännages).
- **FR-033**: Färgkontrast mellan text och bakgrund MÅSTE uppfylla WCAG AA i både
  aktivt och dämpat (klart) tillstånd.

### Key Entities

- **Uppgift (Task)**: Representerar en sak användaren vill bli av med.
  - **Text**: Mellan 1 och 200 tecken (efter trimning).
  - **Klar-status**: Antingen klar eller ej klar.
  - **Skapelseordning**: Bevaras för konsekvent visning (t.ex. via tidsstämpel eller
    sekventiellt id internt). Synlig sortordning specificeras i Assumptions.
  - **Identitet**: En uppgift har en unik intern referens som gör att toggle och
    delete kan rikta sig mot rätt rad även när texten är dubblerad.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En användare kan lägga till sin första uppgift inom 5 sekunder från det
  att sidan laddats (skriva + Enter).
- **SC-002**: 100 % av uppgifter som syns vid stängning av fliken visas i samma skick
  vid nästa öppning av samma webbläsare på samma enhet (under förutsättning att
  localStorage inte är inaktiverad).
- **SC-003**: Användare på 320 px breda skärmar kan utföra alla kärnflöden (lägg till,
  kryssa, ta bort, filtrera) utan att någon kontroll hamnar utanför vyn eller överlappar.
- **SC-004**: Användare som enbart använder tangentbord kan utföra alla kärnflöden
  utan att fastna eller behöva mus.
- **SC-005**: En användare som hanterar en lista med 50 uppgifter upplever ingen
  märkbar fördröjning vid någon av åtgärderna (lägg till, kryssa, filtrera, rensa).
- **SC-006**: Klar-markerade uppgifter är visuellt distinkta från okryssade — i en
  blindtest av en skärmdump kan en betraktare på under 2 sekunder svara vilka uppgifter
  som är klara.
- **SC-007**: 0 fall av oavsiktlig dataförlust under normalt bruk: ingen
  borttagning sker utan att användaren har bekräftat den först.
- **SC-008**: 0 användarstoppande fel: appen kan starta även när localStorage är
  inaktiverad eller innehåller skadad data, och informerar då tydligt om begränsningen.

## Assumptions

- **Språk**: Hela gränssnittet är på svenska (rubriker, knappar, bekräftelserutor,
  räknare och felmeddelanden), eftersom funktionsbeskrivningen och projektets övriga
  texter är på svenska.
- **Sortordning**: Nyaste uppgift hamnar överst i listan (bekräftat i Clarifications
  2026-05-05). Inputfältet ligger högst upp och en ny uppgift dyker upp direkt under
  det.
- **Bekräftelserutor**: Webbläsarens inbyggda bekräftelsedialog (`window.confirm` eller
  motsvarande) räcker; ingen egen modal-komponent byggs. Detta följer KISS-principen i
  konstitutionen och säkerställer att även skärmläsare och tangentbord fungerar utan
  extra arbete.
- **Filterstandard**: "Alla" är standardfilter vid varje sidladdning. Filterval
  persistas inte mellan sessioner.
- **Dubbletter**: Två uppgifter med identisk text är tillåtna och behandlas som
  separata poster.
- **Ingen redigering av text**: Att redigera en befintlig uppgifts text är inte i
  scope för denna version. Vill man ändra texten tar man bort och lägger till på nytt.
- **Tidsstämplar**: Inga skapelse- eller ändringsdatum visas i UI:t. (En intern
  tidsstämpel eller ordningssiffra används bara för stabil sortering.)
- **localStorage-nyckel**: En enskild nyckel under appens namn används för hela
  datat. Konkret nyckelnamn bestäms i implementationsplanen.
- **Inga konton, ingen synkning**: Datat är låst till webbläsaren och enheten. Detta
  är en uttrycklig avgränsning, inte en begränsning att åtgärda.
- **Ingen export/import**: Att flytta uppgifter mellan enheter är inte i scope.
- **Mobilstöd**: Senaste två huvudversionerna av Safari iOS, Chrome Android, Firefox,
  Edge och Chrome desktop räcker som målwebbläsare.
