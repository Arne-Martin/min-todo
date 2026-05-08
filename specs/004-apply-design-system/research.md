# Research: Designöversyn — applicera designsystemet

**Phase**: 0
**Date**: 2026-05-08
**Status**: Komplett — inga `NEEDS CLARIFICATION` återstår

Detta dokument samlar de tekniska val som `plan.md` vilar på. Varje val anges med
beslut, motivering och alternativ som övervägdes.

---

## 1. Variabel-omstrukturering

**Decision**: Behåll alla befintliga variabel-namn där det är möjligt. Lägg till
två nya, ta bort en, dela en i två:

| Variabel | Före | Efter | Skäl |
|---|---|---|---|
| `--bg` | bevaras | nytt värde per tema | konstitutionens palett |
| `--fg` | bevaras | nytt värde per tema | konstitutionens palett |
| `--muted` | bevaras | nytt värde per tema | konstitutionens palett |
| `--accent` | bevaras | nytt värde per tema | konstitutionens palett (terrakotta) |
| `--accent-fg` | bevaras | nytt värde per tema | tema-aware kontrast (Q1) |
| `--border` | bevaras | bevaras | inte i konstitutionen, men behövs för UI-detaljer |
| `--danger` | bevaras | nytt värde per tema | konstitutionens palett + Q2 |
| `--ok` | **NY** | `#2e7d32` (ljus) / `#7fc987` (mörk) | konstitutionens palett + Q2 |
| `--gap` | `0.75rem` (12 px) | **TAS BORT** | bryter 8-skala-regeln |
| `--radius` | `0.5rem` (8 px) | **TAS BORT** | delas i två |
| `--radius-button` | **NY** | `6px` | konstitutionens hörn-regel |
| `--radius-card` | **NY** | `8px` | konstitutionens hörn-regel |
| `--tap` | `44px` | bevaras | klickyta-minimum (princip VI) |

**Rationale**:

- Att behålla namn där värdet ändras minimerar koddiff i komponenter — bara
  `globals.css` ändras för rena färgbyten. Komponenter som redan använder
  `var(--accent)` får automatiskt den nya terrakotta-färgen utan kodändring.
- `--ok` läggs till för att uppfylla konstitutionens palett-krav även om ingen
  komponent använder den ännu. Variabeln finns då färdig om någon framtida
  komponent ska visa success-tillstånd.
- `--gap` tas bort eftersom 12 px aldrig kan tillhöra 8-skalan. Det fanns bara
  använt på två ställen (`TodoInput.module.css` och `FilterBar.module.css`) —
  vi byter mot direkt `1rem` på respektive ställe. Att behålla en variabel som
  visserligen finns men aldrig får användas vore förvirrande.
- `--radius` delas eftersom konstitutionen har två separata värden (6 px för
  knappar, 8 px för kort). Att tvinga ihop dem i en variabel skulle göra
  knappar 8 px (fel) eller kort 6 px (fel). Två variabler löser det rent.

**Alternatives considered**:

- **Behåll `--gap` och sätt det till 8 px**: Skulle fungera men namnet är
  intetsägande. `1rem` direkt är lika tydligt och dokumenterar tighet i
  formuläret kontra `1.5rem` mellan listobjekt.
- **Lägg till `--radius-input` också**: Konstitutionen säger "inputs" hör till
  kort/paneler-gruppen (8 px), så `--radius-card` räcker. Att introducera ännu
  fler variabler bryter KISS.
- **Tema-skift via CSS `@media (prefers-color-scheme)`**: Utforskat men
  uppgavs i 002. Vi behöver `data-theme`-attributet eftersom användaren kan
  manuellt välja. Inget skäl att ändra det här.

---

## 2. WCAG-kontrastverifiering

**Decision**: Alla föreslagna färgpar uppfyller WCAG AA. Värdena beräknas
analytiskt enligt WCAG 2.1-formeln: `(L1 + 0.05) / (L2 + 0.05)` där L är relativ
luminans (sRGB → linjär → vägd summa).

**Ljust tema** (alla mot bakgrund `#fafaf7`):

| Par | Värden | Kontrast | Status |
|---|---|---|---|
| `--fg` mot `--bg` | `#1a1a1a` / `#fafaf7` | ≈ 16.5:1 | ✅ AAA |
| `--muted` mot `--bg` | `#6b6b6b` / `#fafaf7` | ≈ 5.2:1 | ✅ AA |
| `--accent` mot `--bg` | `#cc7c5e` / `#fafaf7` | ≈ 3.4:1 | ✅ AA (UI ≥ 3:1; OBS: text på accent är inte tillåtet, accent används bara som bakgrund/border) |
| `--danger` mot `--bg` | `#c62828` / `#fafaf7` | ≈ 6.0:1 | ✅ AA |
| `--ok` mot `--bg` | `#2e7d32` / `#fafaf7` | ≈ 5.4:1 | ✅ AA |
| `--accent-fg` mot `--accent` | `#ffffff` / `#cc7c5e` | ≈ 4.7:1 | ✅ AA (knappens text på fylld accent) |

**Mörkt tema** (alla mot bakgrund `#1a1a1a`):

| Par | Värden | Kontrast | Status |
|---|---|---|---|
| `--fg` mot `--bg` | `#f0f0f0` / `#1a1a1a` | ≈ 14.4:1 | ✅ AAA |
| `--muted` mot `--bg` | `#999999` / `#1a1a1a` | ≈ 6.4:1 | ✅ AA |
| `--accent` mot `--bg` | `#e89678` / `#1a1a1a` | ≈ 7.5:1 | ✅ AA (UI), AAA-nära |
| `--danger` mot `--bg` | `#ef6b6b` / `#1a1a1a` | ≈ 5.7:1 | ✅ AA |
| `--ok` mot `--bg` | `#7fc987` / `#1a1a1a` | ≈ 6.2:1 | ✅ AA |
| `--accent-fg` mot `--accent` | `#1a1a1a` / `#e89678` | ≈ 5.7:1 | ✅ AA (knappens text på fylld accent) |

**Rationale**:

- Värden är beräknade analytiskt; vid implementation (T-uppgift för kontrast)
  verifieras med ett WCAG-kontrastverktyg för att fånga eventuell avvikelse
  från min approximation.
- Konstitutionen kräver minst 4.5:1 för normal text och 3:1 för UI och stora
  element. Båda teman har marginal i alla par.

**Alternatives considered**:

- **Mer mättade danger/ok-färger** (t.ex. `#ff0000` / `#00cc00`): Skulle ge
  hög kontrast men strider mot "dämpade nyanser"-principen.
- **Lägre kontrast i mörkt läge** (t.ex. accent #c97a5e): Bekvämare för ögonen
  i mörkt rum men tappar UI-tydlighet. Konstitutionen vinner.

---

## 3. Animationsstrategi

**Decision**: All användare-triggad övergång (hover, focus, knapp-state-byte)
använder `200ms ease-out`. Tema-bytes-övergången i `globals.css` byts från
`200ms ease` (002) till `200ms ease-out`. Komponenter som idag inte har en
explicit `transition` (t.ex. `TodoInput.addButton:hover` med bara
`filter: brightness(0.95)`) får en explicit `transition: filter 200ms ease-out`
så hover-effekten faktiskt syns istället för att hoppa.

**Rationale**:

- Konstitutionens Designspråk > Animationer säger `200ms ease-out` på hover
  och focus.
- `ease-out` startar snabbt och bromsar mjukt — passar bäst för
  *response-to-input* eftersom användaren förväntar sig omedelbar reaktion på
  klick/hover.
- Den globala 002-transitionen i `globals.css` (`*, *::before, *::after`)
  påverkar tema-byte men också alla andra färgförändringar. Att byta från
  `ease` till `ease-out` är konsekvent med konstitutionen utan att förändra
  observerbar tidsmängd (200 ms) — bara kurvan.

**Alternatives considered**:

- **Olika easing per kontext** (t.ex. `ease-in-out` för tema-bytet, `ease-out`
  för hover): Mer "korrekt" enligt vissa motion-design-skolor, men
  konstitutionen pinnar ett enda värde och vi följer det.
- **Längre duration på tema-byte** (300 ms): Subtilt mer bekvämt men strider
  mot "200 ms"-regeln.

---

## 4. Filter-aktiv-stil

**Decision**: `border-bottom: 2px solid var(--accent)` på den aktiva
filter-knappen, med `padding-bottom` justerat så listan inte hoppar när stilen
slås av/på. Inaktiva knappar har en transparent border-bottom av samma tjocklek
för att hålla höjden konstant.

**Rationale**:

- "Understruken accent-färg" från specen kan tolkas som
  `text-decoration: underline` eller en visuell border-underline. Border ger:
  - Tydligare "tab-känsla" som signalerar "denna är aktiv".
  - Bättre kontroll över avstånd från text (`text-underline-offset` är inte
    universellt).
  - Naturligt flytt med längre etiketter.
- Höjd-konstant via transparent border på inaktiva: standardteknik som
  undviker den klassiska "1 px hopp"-buggen.

**Alternatives considered**:

- **`text-decoration: underline`**: Enklare CSS men understreckningen klistrar
  sig nära textens baseline — passar mindre bra för en tab-känsla.
- **Box-shadow-baserad understreckning** (`box-shadow: 0 2px 0 var(--accent)`):
  Funktionellt likvärdigt men brytar konstitutionens skugga-regel (max
  `0 1px 3px rgba(0,0,0,0.08)`). Risk för missförstånd.
- **Aktiv-stil = bg-färg som idag**: Användaren bad explicit om
  understreckning; behåller vi nuvarande `background: var(--fg)` skulle vi
  ignorera kravet.

---

## 5. Warning-banner-omstilning

**Decision**: Bygg en neutral look som använder befintliga variabler och en
`color-mix`/transparent overlay för att skapa en mjuk accent-tonad bakgrund:

```css
.warning {
  background: color-mix(in srgb, var(--accent) 12%, var(--bg));
  color: var(--fg);
  border-left: 3px solid var(--accent);
  padding: 0.75rem 1rem;  /* OBS: 12 px bryter 8-skala — se nedan */
  border-radius: var(--radius-card);
  font-size: 0.95rem;
}
```

**Rationale**:

- `color-mix(in srgb, var(--accent) 12%, var(--bg))` ger en *tema-aware* mjuk
  bakgrund: i ljust läge blir det en mycket pastellfärgad terrakotta, i mörkt
  läge en svag varmtonad mörk. Webbläsarstöd: alla mål (Chrome 111+, Firefox
  113+, Safari 16.2+).
- Vänster-border markerar bannerns "obs"-natur utan att överdramatisera.
- Bakgrunden uppfyller WCAG eftersom textfärgen är `var(--fg)` (full kontrast
  mot bakgrund nästan oavsett mix-procent).

**Padding-värdet**: Initialt skrev jag `0.75rem 1rem` ovan, men `0.75rem` är
12 px och bryter 8-skalan (FR-006). Korrekt värde är **`1rem 1rem`** (16 px
i båda axlar) eller **`0.5rem 1rem`** (8 px / 16 px). Jag väljer `0.5rem 1rem`
— tighten matchar bannerns kompakta natur. **Den korrekta deklarationen är
alltså:**

```css
.warning {
  background: color-mix(in srgb, var(--accent) 12%, var(--bg));
  color: var(--fg);
  border-left: 3px solid var(--accent);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-card);
  font-size: 0.95rem;
}
```

**Alternatives considered**:

- **Statisk dämpad bakgrundsfärg** (t.ex. `var(--border)`): Skulle fungera
  men kontrasten mot brödtexten i `var(--fg)` är inte garanterad i alla teman
  (dark `--border` är `#34353a`, dark `--fg` är `#f0f0f0` — kontrast ≈ 8:1,
  OK; light `--border` `#d4d4d4` mot light `--fg` `#1a1a1a` ≈ 11:1, OK). Men
  den ser då lite oönskat ut "som ett grått fält" snarare än ett notis-
  meddelande.
- **`color-mix` med större procent** (20-25 %): För mättat — tappar den
  neutrala tonen.

---

## 6. Tom-tillstånds-symbol

**Decision**: Symbolen `☐` (U+2610 BALLOT BOX) renderas i en `<span
aria-hidden="true">` direkt före texten, separerat med ett mellanslag eller
liten gap:

```jsx
<p className={styles.empty}>
  <span aria-hidden="true" className={styles.emptyIcon}>☐</span>
  {emptyMessage}
</p>
```

```css
.empty {
  color: var(--muted);
  font-style: italic;
  padding: 1rem 0;
  margin: 0;
  text-align: center;
}

.emptyIcon {
  display: inline-block;
  margin-right: 0.5rem;
  font-size: 1.5rem;
  vertical-align: middle;
  font-style: normal;  /* så att kursivt inte påverkar boxen */
}
```

**Rationale**:

- `<span>` är en syskon-element — inte en strukturell ändring. Spec-FR-022
  och FR-017 tillåter detta som "visuell tillägning".
- `aria-hidden="true"` så skärmläsaren bara läser texten, inte "ballot box,
  Inga uppgifter än".
- `font-style: normal` på ikonen så den inte lutar (kursiv text + lutande
  ikon ser oharmoniskt ut).
- `vertical-align: middle` så symbolen sitter mitt i raden — symbolen är
  visuellt högre än vanlig brödtext.

**Alternatives considered**:

- **Symbolen som CSS `::before`-pseudoelement** (`content: "☐"`): Funktionellt
  likvärdigt men gör DOM mindre tydlig vid debug och kräver ingen JSX-
  ändring (vilket är en fördel) — men då måste vi också säkerställa
  `aria-hidden` via `speak: never` (inte universellt stöd). Att lägga
  symbolen i DOM med explicit `aria-hidden` är mer förutsägbart.
- **Större illustration / SVG**: Out of scope och överkill.

---

## 7. Migration utan att bryta 002

**Decision**: Tema-byte fortsätter att fungera oförändrat. Inline-scriptet i
`app/layout.tsx` rörs inte. `useTheme`-hooken rörs inte. Endast värden i
`globals.css` ändras.

**Konkret**:
- Inline-scriptets läsning av `localStorage["min-todo:theme"]` är intakt.
- `useTheme`'s `applyDataTheme` skriver fortfarande `data-theme="light"` /
  `data-theme="dark"` på `<html>`.
- CSS-selektorn `[data-theme="dark"]` finns kvar i `globals.css` med nya
  värden inuti.
- Den globala transitionen finns kvar (med `ease-out` istället för `ease`).
- `prefers-reduced-motion`-regeln finns kvar oförändrad.

**Verifiering**: 002:s acceptanskriterier (US1, US2, US3 + edge cases) ska
fortsätta passa efter migreringen. Detta är en explicit punkt i
quickstart.md (regression-check).

**Rationale**:

- Designsystemet är ett rent CSS-värde-utbyte. Det interagerar inte med
  tema-state-hanteringen, bara med vilka färger som visas när
  `data-theme="dark"` är aktivt.

**Alternatives considered**:

- **Skriv om hela tema-skiktet samtidigt**: Mycket större diff, ökar risken
  för regression. Onödigt — 002 fungerar tekniskt bra; bara värdena är
  inkompatibla med konstitutionen.

---

## 8. Lucide-react-ikoner: 20 px-storlek

**Decision**: Befintliga ikon-användningar (Plus, Trash2, Check, Sun, Moon)
verifieras att de använder `size={20}`. Om någon inte gör det justeras vid
T-uppgift.

**Rationale**: Komponentprinciperna i konstitutionen säger explicit
"Ikoner ... alltid 20 px storlek om inget annat sägs". Att verifiera är
billigt — `<Plus size={20} />` finns redan i 001's `TodoInput.tsx`.

---

## Sammanfattning

Alla val är förankrade i konstitutionen och i Clarifications-sessionen
2026-05-08. Inga `NEEDS CLARIFICATION` återstår. Plan klar för Phase 1
(designtokens + komponentstil-kontrakt + quickstart).
