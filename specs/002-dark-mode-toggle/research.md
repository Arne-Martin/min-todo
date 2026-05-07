# Research: Mörkt läge-toggle

**Phase**: 0
**Date**: 2026-05-07
**Status**: Komplett — inga `NEEDS CLARIFICATION` återstår

Detta dokument samlar de tekniska val som `plan.md` vilar på. Varje val anges med
beslut, motivering och alternativ som övervägdes.

---

## 1. Hur förhindras "flash of wrong theme" (FOUC)?

**Decision**: Inline-script i `<head>` (i `app/layout.tsx`) som körs **innan** React
hydrerar. Skriptet läser `localStorage["min-todo:theme"]`, faller tillbaka på
`window.matchMedia('(prefers-color-scheme: dark)').matches` om värdet saknas eller är
ogiltigt, och sätter sedan `document.documentElement.dataset.theme = "light" | "dark"`
direkt. `<html>`-elementet får också `suppressHydrationWarning` så att React inte
varnar för att server-renderad markup inte matchar (servern vet inte vilket tema
användaren vill ha).

**Rationale**:
- En ren CSS-only-lösning (`@media (prefers-color-scheme: dark)`) kan inte respektera
  ett *manuellt* val sparat i `localStorage` — den faller alltid tillbaka på systemet.
  Spec.md FR-011 kräver att manuellt val har företräde, så CSS-only räcker inte.
- Att rendera temat först efter att React mountat skulle ge en synlig blink i fel
  färg under första frame (~50–100 ms). Spec.md SC-004 förbjuder detta.
- Inline-scriptet körs synkront i `<head>` och blockerar paint, vilket är önskat här:
  vi vill att paint sker med rätt `data-theme` redan första gången.

**Alternatives considered**:
- **Server-renderad theme via cookies**: Skulle fungera men kräver server-runtime­
  beteende (läsa cookies vid SSR), och appen är medvetet helt klient-renderad
  (`"use client"`-sidan i 001 forsätter att vara klient-only).
- **`next-themes`-biblioteket**: Löser exakt detta problem men strider mot princip I
  (inget extra beroende när problemet kan lösas med ~10 raders inline-JS).
- **Rendera tomt tills hooken laddat tema från `localStorage`**: Ger en synlig
  blink/skelett — strider mot SC-004.

---

## 2. CSS-variabel-strategi: hur struktureras teman?

**Decision**: Definiera CSS Custom Properties på `:root` för **ljust** tema (default),
och överlagra dem i en `[data-theme="dark"]`-selektor för mörkt tema. Variablerna
används överallt i komponenter (CSS Modules) och i `globals.css`.

```css
:root {
  --bg: #fafafa;          /* off-white, dämpad */
  --fg: #1f2024;          /* off-black, varm */
  --surface: #ffffff;     /* ren vit för kort/listor i ljust läge */
  --border: #e5e5e7;
  --muted-fg: #6b6b70;
  --accent: #2563eb;      /* fokusring, knapp-accent */
  --done-fg: #9ca0a8;
}

[data-theme="dark"] {
  --bg: #1a1b1f;          /* dämpad mörkblågrå (inte rent svart) */
  --fg: #e8e8eb;          /* off-white, lätt varm */
  --surface: #232428;
  --border: #34353a;
  --muted-fg: #9097a0;
  --accent: #6b9aff;      /* ljusare blå för bättre kontrast mot mörk bg */
  --done-fg: #66696f;
}
```

**Rationale**:
- En enda källa till sanning för färger. Komponentstilarna kan vara temaagnostiska
  (`color: var(--fg)`) och fungerar i båda lägen.
- `[data-theme="dark"]`-selektorn matchas så fort inline-scriptet sätter attributet
  på `<html>` — ingen klass behöver flippas eller bytas ut.
- Ljust som default gör att om JS av någon anledning inte körs (t.ex. en mycket
  tidig paint innan inline-scriptet rendercolades) så får användaren det neutrala
  ljusa temat snarare än ett trasigt mellanläge.
- Dämpade nyanser (off-whites/off-blacks) uppfyller spec.md FR-013 ("inga skarpa
  kontraster — använd dämpade nyanser") medan WCAG AA-kontrasten (4,5:1 för text
  mot bakgrund) bibehålls.

**Alternatives considered**:
- **CSS-klass `light`/`dark` på `<html>`**: Funktionellt likvärdigt men attribut
  signalerar tydligare "detta är ett tema" än en av många klasser. Också enklare
  att läsa i devtools.
- **Två separata stylesheets (`light.css` / `dark.css`)**: Dubblerar koden,
  switching kräver dynamisk `<link>`-manipulation, och prefetching av båda blir
  bandbreddsslöseri.
- **Mörkt som default**: Onödigt — system-defaulten i de flesta OS är fortfarande
  ljust, och spec.md vill att default följer systemet (vilket inline-scriptet
  hanterar).

**WCAG-verifiering** (alla par mot variant­bakgrund):

| Par | Ljust | Mörkt |
|---|---|---|
| `--fg` mot `--bg` (normal text) | ~13:1 (#1f2024 vs #fafafa) ✅ AA | ~12:1 (#e8e8eb vs #1a1b1f) ✅ AA |
| `--muted-fg` mot `--bg` (hjälptext) | ~5:1 ✅ AA | ~4,7:1 ✅ AA |
| `--accent` mot `--bg` (fokusring) | ~5,5:1 ✅ AA | ~7:1 ✅ AA |

(Värdena är ungefärliga från WCAG-formelns kontrasthjul. Konkret verifiering görs
manuellt i T010 i tasks.md med ett kontrastverktyg.)

---

## 3. Animation: hur appliceras 200 ms-övergången globalt?

**Decision**: En generell regel i `globals.css` på alla element och deras
pseudoelement, som transitionerar de fyra färgegenskaperna med samma duration:

```css
*,
*::before,
*::after {
  transition:
    background-color 200ms ease,
    color 200ms ease,
    border-color 200ms ease,
    fill 200ms ease;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0ms;
  }
}
```

**Rationale**:
- Applicerar övergången på **alla** färgbärande egenskaper (FR-007) utan att varje
  komponent själv behöver tänka på det.
- `ease`-kurva är CSS-standard och upplevs naturlig — inget skäl till exotisk
  cubic-bezier för en så enkel övergång.
- `prefers-reduced-motion: reduce` overridar duration till `0ms` vilket uppfyller
  FR-008 (instant byte).
- Transitionen är kopplad till de exakta egenskaperna (inte `all`) för att undvika
  oavsiktliga animationer av layout-egenskaper (width, height etc.) — viktigt
  eftersom layouten ska vara identisk mellan teman (FR-015).

**Alternatives considered**:
- **`transition: all 200ms`**: Animerar även icke-färgegenskaper, vilket kan ge
  oönskade rörelser om en CSS-variabel råkar styra layout. Avfärdas mot FR-015.
- **Per-komponent transition i varje CSS Module**: Mer kod, lättare att glömma en
  yta — bryter mot KISS.
- **JS-animerad färgblend (t.ex. lerp på hex-värden)**: Mycket större komplexitet
  utan tydlig vinst; webbläsaren animerar redan rgb()-värden mjukt.

---

## 4. `localStorage`-nyckel och värdeformat

**Decision**: Nyckel `min-todo:theme`. Värdet är en av de exakta strängarna `"light"`
eller `"dark"`. Saknad nyckel betyder "inget val gjort — följ system". Ogiltiga
värden (allt som inte är exakt `"light"` eller `"dark"`) behandlas som om nyckeln
saknas.

**Rationale**:
- Konsekvent med 001-todo-apps namespace­konvention (`min-todo:tasks`).
- Sträng utan JSON-envelope eftersom värdet är en enskild atomär enum, inte ett
  objekt med fält som kan utökas. Att tvinga in JSON skulle göra inline-scriptet
  längre och svårare att läsa.
- Att låta saknad nyckel = "följ system" är enklare än ett tredje värde
  (`"system"`) eftersom toggleringen är binär (FR-002, FR-004) — det finns ingen
  UI-kontroll för att gå *tillbaka* till "följ system" en gång användaren har
  klickat.
- Ogiltig data ⇒ fallback till system: matchar FR-016 och täcker manipulation,
  korrupt skrivning eller framtida schemaändringar.

**Alternatives considered**:
- **JSON-envelope `{ version: 1, theme: "light" }`**: Onödigt formellt för en
  atomär enum. Bryter mot KISS.
- **Booleskt värde (`"true"` = mörkt)**: Mindre läsbart i devtools än explicit
  `"light"` / `"dark"`.
- **Tre värden (`"light"` / `"dark"` / `"system"`)**: Skulle möjliggöra explicit
  "följ system"-läge, men vi har ingen UI-yta för det och spec.md beskriver
  toggleringen som binär. Avfärdas av princip I (KISS).

---

## 5. Tillgänglighet på toggleknappen

**Decision**: Knappen är ett `<button type="button">` med:
- `aria-label="Växla till mörkt läge"` när effektivt tema är ljust,
  `aria-label="Växla till ljust läge"` när effektivt tema är mörkt.
- Ikonen (`Sun` eller `Moon` från `lucide-react`) markeras med `aria-hidden="true"`
  så att skärmläsare bara läser knappens label, inte ett ikon-namn.
- Synlig fokusring via global `:focus-visible`-regel (samma som övriga knappar i
  001).
- Klickyta minst 44 × 44 px (definieras i `ThemeToggle.module.css`).

**Rationale**:
- Det dynamiska label-bytet uppfyller FR-003 ("uppdateras dynamiskt med aktuellt
  läge").
- Att gömma ikonen för skärmläsare undviker dubbeluppläsning ("solen, växla till
  ljust läge") — beprövat tillgänglighetsmönster.
- `<button type="button">` ger gratis tangentbordsstöd för Enter och mellanslag
  (FR-005).

**Alternatives considered**:
- **Switch-roll (`role="switch"` + `aria-checked`)**: Semantiskt korrekt för
  on/off-toggle, men skärmläsare uttalar det olika ("on/off" på engelska) och
  läget "mörkt/ljust" är inte en typisk on/off-axel. En vanlig knapp med tydlig
  label är mer förutsägbar och uppfyller WCAG ARIA practices för "toggle button".
- **Två separata knappar (sol och måne, alltid synliga)**: Bryter mot FR-002 som
  förutsätter en knapp som *byter ikon*. Tar också mer plats i headern.

---

## 6. Ikoner

**Decision**: `Sun` och `Moon` från det redan installerade `lucide-react`-paketet.

**Rationale**:
- `lucide-react` är redan ett godkänt undantag i 001-todo-app (Trash2, Check). Att
  använda samma bibliotek för fler ikoner introducerar inget nytt beroende.
- Båda ikonerna finns ut-ur-lådan, har konsekvent stroke-stil och är tree-shakable
  (~1 KB per ikon).
- `aria-hidden="true"` och `size`-prop fungerar identiskt med befintliga
  ikon­importer.

**Alternatives considered**:
- **Inline SVG i komponenten**: Funktionellt likvärdigt men gör JSX:n bullrigare
  och inkonsekvent med 001:s mönster.
- **Emoji ☀️ 🌙**: Renderas inkonsekvent på OS:er och drar ofta in färg — bryter
  den dämpade designen.

---

## 7. Storage-läs/skrivlogik och felhantering

**Decision**: `useTheme`-hooken har en intern read-funktion som anropar
`localStorage.getItem('min-todo:theme')` i en `try/catch`. Vid undantag (privat läge,
quota, blockerad) eller ogiltigt värde returneras `null` och hooken faller tillbaka
på `window.matchMedia('(prefers-color-scheme: dark)').matches`. Skrivning skyddas
likadant — ett misslyckat skriv loggar inget och kraschar inte; valet gäller bara
för sessionen.

**Rationale**:
- Konsekvent med `lib/storage.ts` i 001 (samma defensiva mönster).
- Edge case "localStorage otillgängligt" (spec.md) uppfylls: appen fungerar i
  sessionen och defaultar till systempreferensen vid varje laddning.
- Vi vidarebefordrar **inte** ett "storageDisabled"-meddelande till UI:t (som
  todo-storage gör) eftersom det vore dramatik för en feature av denna storlek.
  Användaren märker bara att deras val inte sparas mellan besök.

**Alternatives considered**:
- **Visa en notis när localStorage inte fungerar**: För mycket UI för en så liten
  feature. Den befintliga storage-notisen (för todo-data) räcker som signal.
- **Throw vid första misslyckande**: Skulle krascha appen — strider mot FR-016.

---

## 8. Komponentplacering i headern

**Decision**: Header i `app/page.tsx` blir en flexrad: `<h1>Mina uppgifter</h1>` till
vänster, `<ThemeToggle />` till höger. `app/page.module.css` får en
`header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }`-regel.

**Rationale**:
- Matchar Q4 i Clarifications: "På samma rad som h1, högerjusterad".
- `align-items: center` håller knappen visuellt centrerad även om h1:s line-height
  är högre.
- `gap` säkerställer att texten aldrig kolliderar med knappen om rubriken någon
  gång blir längre.
- Vid 320 px bredd: `"Mina uppgifter"` ≈ 130 px + 16 px gap + 44 px-knapp = ~190 px
  ≪ 320 px. Inga `flex-wrap` eller media queries behövs.

**Alternatives considered**:
- **CSS Grid med två kolumner**: Mer kraftfullt än vad som behövs här. Avfärdas
  för KISS.
- **Absolute-positionerad knapp ovanpå rubrikraden**: Tar knappen ur flödet och
  riskerar överlapp på små skärmar. Avfärdas.

---

## Sammanfattning

Inga `NEEDS CLARIFICATION`-poster återstår. Alla val är förankrade i
konstitutionens principer och i Clarifications-sessionen 2026-05-07. Plan klar för
Phase 1 (data model + contracts).
