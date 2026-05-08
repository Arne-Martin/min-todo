# Data Model: Designöversyn — designtokens

**Phase**: 1
**Date**: 2026-05-08

Denna feature introducerar ingen ny runtime-data. "Data model" här är
*designtokens*: CSS-variabler som definieras i `app/globals.css` och konsumeras
av komponentstilarna. Detta dokument är den kanoniska katalogen.

---

## Token-katalog

Variabler definieras på `:root` (ljust tema, default) och kan överlagras i
`[data-theme="dark"]` för mörkt tema. Strukturella tokens (radius, tap-storlek)
är samma i båda teman och definieras bara i `:root`.

### Färgtokens

| Variabel | Ljust tema | Mörkt tema | Användning |
|---|---|---|---|
| `--bg` | `#fafaf7` | `#1a1a1a` | sidans bakgrund (`<body>`); aldrig ren vit |
| `--fg` | `#1a1a1a` | `#f0f0f0` | brödtext, rubriker |
| `--muted` | `#6b6b6b` | `#999999` | dämpad text (räknare, hjälptext, tom-state) |
| `--accent` | `#cc7c5e` | `#e89678` | terrakotta-accent: bakgrund på Lägg till-knappen, fokusring, filter-aktiv-underline, warning-vänsterkant |
| `--accent-fg` | `#ffffff` | `#1a1a1a` | textfärg på fylld accent (kontrast-säker per tema, FR-003) |
| `--border` | `#d4d4d4` | `#34353a` | subtila avgränsare (listraders bottenkant, knapp-borders) |
| `--danger` | `#c62828` | `#ef6b6b` | felmeddelanden, papperskorg-knapp på hover |
| `--ok` | `#2e7d32` | `#7fc987` | reserverad — används inte i v1 men föreskriven av konstitutionen |

### Strukturella tokens (samma i båda teman)

| Variabel | Värde | Användning |
|---|---|---|
| `--radius-button` | `6px` | knappar (alla `<button>`-element) |
| `--radius-card` | `8px` | inputs, listrader, paneler, warning-banner |
| `--tap` | `44px` | minsta klickyta — knapphöjd, checkbox-yta |

### Borttagna tokens

| Variabel | Tidigare värde | Ersättning |
|---|---|---|
| `--gap` | `0.75rem` (12 px) | direkt `1rem` (16 px) i komponenterna där den användes |
| `--radius` | `0.5rem` (8 px) | delas i `--radius-button` (6 px) och `--radius-card` (8 px) |

### Tillagda tokens (jämfört med 002 baseline)

- `--ok` (light + dark)
- `--radius-button`
- `--radius-card`

---

## Typografi-tokens

Konstitutionen pinnar typografi i CSS, inte som CSS-variabler. Reglerna är
direkt-skrivna i `globals.css`:

```css
body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Helvetica Neue", Arial, sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
}
```

Vikter: `400` (brödtext), `600` (rubriker). Inga andra vikter används.

---

## Spacing-tokens

8-skalan från konstitutionen är inte CSS-variabler — den är en **regel** som
appliceras direkt i komponentstilarna. Standardvärden i `rem` (1 rem = 16 px):

| Px | Rem | Typisk användning |
|---|---|---|
| 8 | `0.5rem` | tight padding (knapp-padding y, kompakt kant-padding) |
| 16 | `1rem` | standard padding (knapp-padding x, formulärs-gap, banner-padding) |
| 24 | `1.5rem` | listobjekt-gap (FR-007), större vertikal rytm |
| 32 | `2rem` | sektionsavstånd vid behov |
| 48 | `3rem` | stora vertikala separationer (inte använt i v1) |

**Förbjudna värden**: `0.75rem` (12 px), `0.875rem` (14 px), `1.125rem` (18 px),
etc. Linter eller manuell granskning får fånga dessa.

---

## Animations-tokens

Konstitutionen kräver `200ms ease-out` på hover/focus och tema-byten. Inte heller
en CSS-variabel — direkt-skrivet i regelmatchningar:

```css
/* På hover-/focus-element */
transition:
  background-color 200ms ease-out,
  color 200ms ease-out,
  border-color 200ms ease-out,
  filter 200ms ease-out;

/* På globala tema-byten (inkl. alla element) */
*, *::before, *::after {
  transition:
    background-color 200ms ease-out,
    color 200ms ease-out,
    border-color 200ms ease-out,
    fill 200ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0ms; }
}
```

Den globala regeln matchar exakt 002:s mönster, bara att `ease` byts mot
`ease-out`.

---

## Skugg-token

Konstitutionen tillåter exakt en skugga: `0 1px 3px rgba(0, 0, 0, 0.08)`. Den
är så subtil att den inte motiverar en variabel; lägg den direkt på de få
element som behöver höjd­känsla (om några — i v1 av denna feature finns inget
sådant element).

---

## Konsumtions-katalog

Vilka komponentstilar refererar varje variabel?

| Variabel | Konsumeras av |
|---|---|
| `--bg` | `body` (globals), eventuellt `.warning`-bakgrundsmix |
| `--fg` | `body` (globals), `.warning` (text), `<button>` (text via `inherit`), filter-knapparnas inaktiva text |
| `--muted` | `TodoList.empty`, `TodoItem.done`, `TodoItem.removeButton`, `page.counter`, `page.clearButton` |
| `--accent` | `TodoInput.addButton` (bg + border), `:focus-visible` (outline), `FilterBar.active` (border-bottom), `.warning` (border-left + bg-mix), `ThemeToggle` (focus-ring inherits), `clearButton:hover` (border-color via konvention) |
| `--accent-fg` | `TodoInput.addButton` (text) |
| `--border` | `<button>` (border-globals), `input[type="text"]` (border), `TodoItem.row` (border-bottom), `TodoItem.removeButton:hover` (border), `ThemeToggle.button` (border + hover-bg) |
| `--danger` | `page.clearButton:hover/focus` (text + border), `TodoItem.removeButton:hover/focus` (text) |
| `--ok` | reserverad — inga konsumenter i v1 |
| `--radius-button` | alla `<button>`-element (globals) |
| `--radius-card` | `input[type="text"]`, `.warning`, eventuella kort/paneler |
| `--tap` | `<button>` (min-height-globals), `TodoItem.row` (min-height), `TodoItem.label` (min-height), `TodoItem.removeButton` (width/height), `TodoInput.addButton` (width/height), `ThemeToggle.button` (min-width/min-height) |

---

## Stabilitetsgarantier

Alla variabler i tabellerna ovan är **publik del av designsystemet** och kan
refereras från godtycklig CSS Module i projektet. Specifikt:

- **Färg-tokens** växlar värde per tema. Komponentstilar SKA använda dem
  (inte hårdkoda hex).
- **Strukturella tokens** är konstanta över teman.
- **Borttagna tokens** (t.ex. `--gap`, `--radius`) får inte refereras längre
  — komponenter som gör det MÅSTE migreras i denna feature.

Framtida ändringar av variabel-värden (men inte namn) följer konstitutionens
governance: varje semantisk färgändring kräver en konstitutions-amendment och
WCAG-omverifiering.

---

## Sammanfattning

8 färg-tokens × 2 teman + 3 strukturella tokens = 19 designvärden som styr
hela appens visuella uttryck. Alla samlade i `app/globals.css`, alla
refererade via `var(--*)` från komponentstilar. Inga magiska hex-värden i
komponenter (FR-004).
