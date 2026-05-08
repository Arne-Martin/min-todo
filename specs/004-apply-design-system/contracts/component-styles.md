# Contract: Komponent-specifika styleregler

**Phase**: 1
**Date**: 2026-05-08

Detta dokument är kontraktet mellan spec.md och CSS-implementationen för de
komponenter som har specifika krav i FR-014 till FR-017. Reglerna är skrivna i
imperativ form ("MÅSTE", "SKA") och CSS-utdragen är *målbild* — den faktiska
koden får skilja sig i mindre detaljer (kommentarer, ordning) men semantiken
SKA stämma.

---

## "Lägg till"-knappen — `TodoInput.module.css` `.addButton`

**FR-014**: Fylld accent-bakgrund, tema-aware text, subtil hover under
200 ms ease-out.

```css
.addButton {
  flex: 0 0 auto;
  width: var(--tap);
  height: var(--tap);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--accent);
  border-radius: var(--radius-button);
  background: var(--accent);
  color: var(--accent-fg);
  cursor: pointer;
  transition:
    background-color 200ms ease-out,
    border-color 200ms ease-out,
    filter 200ms ease-out;
}

.addButton:hover:not(:disabled) {
  /* Subtil — en aning ljusare/mörkare beroende på tema. brightness fungerar
     symmetriskt: i ljust läge dämpas accenten lite, i mörkt läge ljusas
     den upp en aning. */
  filter: brightness(1.05);
}

.addButton:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
```

**Krav som stilen MÅSTE uppfylla**:

- Klickyta `≥ var(--tap)` (= 44 px) i båda axlar.
- Hörn-radius exakt `var(--radius-button)`.
- Bakgrund `var(--accent)`, text `var(--accent-fg)` — båda växlar per tema.
- Hover triggar en visuell förändring som *syns* (inte hoppar) tack vare
  `transition`-egenskapen.
- Disabled-tillståndet behåller samma bakgrund men sänker opacitet (matchar
  001:s ursprungsbeteende).

---

## Filter-aktiv-stil — `FilterBar.module.css` `.button` + `.active`

**FR-015 + FR-016**: Aktiv knapp har understreckning i `var(--accent)`. Alla
filter-knappar har samma höjd oavsett aktiv eller inte.

```css
.bar {
  display: flex;
  gap: 1rem;             /* 16 px — ersätter borttagna --gap */
  flex-wrap: wrap;
}

.button {
  flex: 1 1 auto;
  min-height: var(--tap);
  padding: 0.5rem 1rem;  /* 8 px / 16 px — bryter inte 8-skalan */
  /* Transparent botten-border så aktiv stil inte hoppar layout. */
  border-bottom: 2px solid transparent;
  border-radius: var(--radius-button);
  background: transparent;
  color: var(--fg);
  cursor: pointer;
  transition:
    background-color 200ms ease-out,
    border-color 200ms ease-out,
    color 200ms ease-out;
}

.button:hover:not(.active) {
  background: var(--border);  /* subtil hover */
}

.active {
  border-bottom-color: var(--accent);
  font-weight: 600;
  /* Behåll bakgrund transparent — accenten kommer från understräcket */
}
```

**Krav som stilen MÅSTE uppfylla**:

- Inaktiva knappar har transparent border-bottom på 2 px så höjden inte
  förändras vid byte.
- Aktiv knapp har border-bottom-color `var(--accent)`.
- Endast en knapp i taget kan ha `.active` (säkerställs i `FilterBar.tsx`,
  som inte ändras i denna feature — befintlig logik behåller exakt en aktiv
  åt gången).
- Knappens bas-border (`1px solid var(--border)` från globals) finns kvar på
  toppen/sidorna — bottom-bordern överlagrar.

**OBS**: Den befintliga `.active`-stilen i 001 var "kraftig bakgrund":
`background: var(--fg); color: var(--bg);`. Den ersätts helt — den nya stilen
kombineras inte med den gamla.

---

## Tom-tillstånd — `TodoList.tsx` + `TodoList.module.css`

**FR-017 + FR-018**: Dämpad kursiv text + symbolen `☐` med `aria-hidden`.

### JSX-ändring (`TodoList.tsx`)

```jsx
if (tasks.length === 0) {
  return (
    <p className={styles.empty}>
      <span aria-hidden="true" className={styles.emptyIcon}>☐</span>
      {emptyMessage}
    </p>
  );
}
```

(Inget annat i komponenten ändras.)

### CSS (`TodoList.module.css`)

```css
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;          /* 24 px mellan listobjekt — FR-007 */
}

.empty {
  color: var(--muted);
  font-style: italic;
  padding: 1rem 0;       /* 16 px — 8-skala */
  margin: 0;
  text-align: center;
}

.emptyIcon {
  display: inline-block;
  margin-right: 0.5rem;  /* 8 px */
  font-size: 1.5rem;     /* 24 px — visuellt likvärdigt med övriga symboler */
  vertical-align: middle;
  font-style: normal;    /* så att kursivt inte påverkar boxen */
}
```

**Krav som stilen + JSX MÅSTE uppfylla**:

- Listans gap mellan listobjekt är 24 px (mätbart i devtools).
- Tom-state-text är `var(--muted)`-färg, kursiv.
- Symbolen ärver textens färg via cascade (ingen explicit `color`).
- Symbolen är `aria-hidden="true"` så skärmläsare inte uttalar den.

**Notering om `<TodoItem>`-rader**: Den befintliga `TodoItem.module.css`'s
`.row` har `border-bottom: 1px solid var(--border)`. Med 24 px gap mellan
listraderna ser det ut som tunna avgränsare med luft runt. Det är medvetet —
borderna ger struktur, gap'en ger luft. Bordern kan stanna kvar.

---

## Warning-banner — `app/page.module.css` `.warning`

**FR-005**: Neutral, tema-aware look som använder befintliga variabler.

```css
.warning {
  background: color-mix(in srgb, var(--accent) 12%, var(--bg));
  color: var(--fg);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-card);
  padding: 0.5rem 1rem;       /* 8 / 16 — 8-skala */
  margin: 0;
  font-size: 0.95rem;
}
```

**Krav som stilen MÅSTE uppfylla**:

- Bakgrund baserad på `color-mix(in srgb, var(--accent) 12%, var(--bg))` —
  ger en mjuk accent-tonad yta som anpassar sig till temat.
- Vänster-border `3px solid var(--accent)` markerar bannerns "obs"-natur.
- Hörn `var(--radius-card)` (8 px).
- Text `var(--fg)` — full kontrast oavsett tema.

**Browser-stöd för `color-mix`**: Chrome 111+, Firefox 113+, Safari 16.2+.
Alla mål-webbläsare är väl över dessa versioner. Ingen fallback krävs.

---

## "Rensa klara"-knappen — `app/page.module.css` `.clearButton`

**Bevarad funktionalitet, uppdaterade tokens**: Knappen behåller sin sekundära
stil (text-only, blir röd vid hover) men får uppdaterade variabler och en
explicit transition.

```css
.clearButton {
  align-self: flex-start;
  color: var(--muted);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-button);
  padding: 0.5rem 1rem;
  min-height: var(--tap);
  cursor: pointer;
  transition:
    color 200ms ease-out,
    border-color 200ms ease-out,
    background-color 200ms ease-out;
}

.clearButton:hover:not(:disabled),
.clearButton:focus-visible {
  color: var(--danger);
  border-color: var(--danger);
}

.clearButton:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
```

---

## Sammanfattning

Fyra konkreta komponentkontrakt: "Lägg till"-knapp, filter-aktiv-stil, tom-
state, warning-banner. Plus den uppdaterade `clearButton` som ärver
designsystemets tokens. Alla refererar `var(--*)` — inga hex-värden.

Övriga befintliga komponentstilar (`TodoItem.module.css`, `ThemeToggle.module.css`,
`page.module.css` övriga klasser) får sina padding/radius-värden uppdaterade
till 8-skala och nya radius-tokens men har inga nya regler — de förändras bara
mekaniskt.
