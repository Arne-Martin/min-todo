# Quickstart: Designöversyn — verifieringsguide

**Phase**: 1
**Date**: 2026-05-08

Den här guiden är för dig som ska verifiera att designöversynen är korrekt
applicerad. Den följer acceptanskriterierna från `spec.md` (US1, US2, US3 +
edge cases) och avslutas med en explicit WCAG-kontrastrunda och en
regression-check mot 001 + 002.

---

## Förutsättningar

- 001-todo-app och 002-dark-mode-toggle är fullt implementerade och fungerar
  innan denna feature börjar (annars: stoppa, åtgärda dem först).
- **Node.js 20** eller senare LTS.
- En modern webbläsare med devtools (Chrome/Firefox/Edge/Safari).
- Inga nya paket behöver installeras (`lucide-react` finns redan från 001).

---

## Starta utvecklingsservern

```powershell
npm run dev
```

Öppna `http://localhost:3000` med devtools öppna (F12). Använd:

- **Elements** — för att inspektera DOM och CSS-variabler.
- **Computed**-fliken (eller motsvarande) — för att mäta padding/gap-värden.
- **Rendering** — för att simulera `prefers-color-scheme` och
  `prefers-reduced-motion`.
- **Application > Local Storage** — för att rensa eller manipulera
  `min-todo:theme` mellan testkörningar.

---

## Verifieringssteg

### US1 — Konsekvent färgsystem (P1)

> Acceptansreferens: spec.md > User Story 1 > Acceptance Scenarios 1–5.

1. **Bakgrundsfärg ljust läge**: Sidan är **inte** ren vit. Mät i Elements >
   Computed: `body { background: rgb(250, 250, 247) }` (= `#fafaf7`).
2. **Accentfärg ljust läge**: Klicka i input-fältet — fokusringen är
   terrakotta (`#cc7c5e`), inte blå. "Lägg till"-knappen har terrakotta som
   bakgrund. Filter-aktiv-understreckningen är terrakotta.
3. **Tema-byte**: Växla till mörkt läge via toggleknappen. Kontrollera att:
   - Bakgrunden går till `#1a1a1a`.
   - Texten blir `#f0f0f0`.
   - Accentfärgerna blir den ljusare terrakottan `#e89678`.
   - Warning-bannern (om en visas) byter färg samtidigt — ingen ljus rest.
4. **Inga hårdkodade färger**: Kör i terminalen från repo-roten:
   ```powershell
   Select-String -Path "app\*.module.css","components\*.module.css" `
     -Pattern '#[0-9a-fA-F]{3,8}'
   ```
   Inga träffar förväntas.
5. **WCAG i mörkt läge**: I devtools, hovra över texten i en TodoItem och
   öppna "Contrast ratio"-info — den ska visa minst 4,5:1.

### US2 — Lugnare luft och mjukare hörn (P2)

> Acceptansreferens: spec.md > User Story 2 > Acceptance Scenarios 1–4.

1. **Listobjekt-luft**: Lägg till tre uppgifter. I Elements, klicka på en
   `<li>` och inspektera "Computed" > `gap` på föräldra-`<ul>`. Värdet ska
   vara `24px`.
2. **Knapp-radius**: Klicka på Lägg till-knappen i Elements. "Computed" >
   `border-radius` ska vara `6px`. Samma för Rensa klara-knappen och
   ThemeToggle-knappen.
3. **Input/kort-radius**: Klicka på input-fältet. "Computed" > `border-radius`
   ska vara `8px`. Samma för warning-bannern (om synlig).
4. **Inga skarpa hörn**: Inspektera alla synliga interaktiva element — inget
   ska ha `border-radius: 0`.
5. **8-skala**: Sök i CSS-källorna efter förbjudna spacing-värden:
   ```powershell
   Select-String -Path "app\*.css","components\*.module.css" `
     -Pattern '0\.75rem|0\.875rem|1\.125rem|1\.25rem'
   ```
   Inga träffar förväntas (12 px, 14 px, 18 px, 20 px är förbjudna).

### US3 — Tydligare interaktiva element (P3)

> Acceptansreferens: spec.md > User Story 3 > Acceptance Scenarios 1–5.

1. **Lägg till-knapp i ljust läge**: Knappen är fylld terrakotta med vit
   text. Hovra med musen — färgen ändras subtilt under cirka 200 ms.
2. **Lägg till-knapp i mörkt läge**: Knappen är fylld ljusare terrakotta med
   mörk text (≈ `#1a1a1a`). Kontrast verifierad WCAG AA i devtools.
3. **Filter-aktiv-stil**: Standardläget visar Alla / Kvar / Klara. Den aktiva
   filter-knappen har en understreckning i accentfärg (border-bottom 2 px).
   De inaktiva har ingen synlig understreckning men *samma höjd* (transparent
   border på 2 px).
4. **Filter-byte**: Klicka på "Kvar" — understreckningen flyttar dit.
   Klicka på "Klara" — den flyttar igen. Endast en understreckning åt
   gången.
5. **Tom-tillstånd**: Ta bort alla uppgifter (eller filtrera till "Klara"
   när inga är klara). Tom-meddelandet visas i kursiv dämpad text med
   symbolen ☐ före texten. Symbolen är samma färg som texten (ärver via
   cascade).
6. **Skärmläsar-test (om möjligt)**: Aktivera NVDA/VoiceOver. Navigera till
   tom-meddelandet — skärmläsaren ska läsa exempelvis "Inga uppgifter än"
   utan att uttala "ballot box" eller "fyrkant".

### Edge cases

> Acceptansreferens: spec.md > Edge Cases.

1. **Warning-banner i mörkt läge**: Simulera `localStorage.setItem("min-todo:tasks", "trasig data")` i Console-fliken och ladda om. Warning-bannern visas. Den har neutral mörk look (svag accent-tonad bakgrund, accent vänster-border, ljus brödtext) — passar mörkt tema.
2. **Reduced motion**: I devtools > Rendering, sätt `prefers-reduced-motion`
   till **reduce**. Klicka på toggleknappen för tema. Färgbytet ska ske
   omedelbart (ingen 200 ms ease-out). Hovra på Lägg till-knappen — hover-
   effekten är också instant.
3. **`--accent-fg`-kontrast verifieras**: I ljust läge, klicka på
   Lägg till-knappens text och kolla "Contrast ratio" i devtools — ≥ 4.5:1.
   Växla till mörkt läge — kontrollera igen, ≥ 4.5:1.

---

## Regression-check mot 001 och 002

Inga befintliga acceptanskriterier får brytas:

- **001**: Lägg till en uppgift, kryssa, ta bort, filtrera, "Rensa klara".
  Allt fungerar oförändrat. localStorage persistens fungerar.
- **002**: Tema-toggleknappen finns uppe till höger. Klick byter tema
  mjukt. Valet sparas till localStorage. Ny incognito-flik följer
  systempreferensen.

Om något fungerar sämre än innan migreringen → stop, undersök, åtgärda.

---

## Bygg- och lint-verifiering

```powershell
npm run lint
npm run build
```

Båda ska passa utan fel eller varningar.

---

## WCAG-kontrastverifiering (slutgiltig)

I båda teman, verifiera följande par i ett kontrastverktyg (devtools eller
webaim.org):

**Ljust** (mot `#fafaf7`):

- [ ] `--fg` `#1a1a1a` ≥ 4.5:1
- [ ] `--muted` `#6b6b6b` ≥ 4.5:1
- [ ] `--accent` `#cc7c5e` ≥ 3:1 (UI)
- [ ] `--danger` `#c62828` ≥ 4.5:1
- [ ] `--ok` `#2e7d32` ≥ 4.5:1
- [ ] `--accent-fg` `#ffffff` mot `--accent` `#cc7c5e` ≥ 4.5:1

**Mörkt** (mot `#1a1a1a`):

- [ ] `--fg` `#f0f0f0` ≥ 4.5:1
- [ ] `--muted` `#999999` ≥ 4.5:1
- [ ] `--accent` `#e89678` ≥ 3:1 (UI)
- [ ] `--danger` `#ef6b6b` ≥ 4.5:1
- [ ] `--ok` `#7fc987` ≥ 4.5:1
- [ ] `--accent-fg` `#1a1a1a` mot `--accent` `#e89678` ≥ 4.5:1

Om något par underkänns: justera värdet i `globals.css` och dokumentera den
slutliga uppsättningen i en notering till konstitutionsamendmentet.

---

## Konstitutionsamendment efter implementation

Tre värden bestämdes i denna feature som påverkar konstitutionen:

- `--accent-fg` mörkt (≈ `#1a1a1a`)
- `--danger` mörkt (`#ef6b6b`)
- `--ok` mörkt (`#7fc987`)

Efter att alla verifieringssteg ovan är ✅, kör `/speckit-constitution` för
att uppdatera konstitutionen v1.1.0 → v1.1.1 (PATCH — eftersom det är en
specificering av en TODO, inte en ny princip). Detta är en **separat efter-
åtgärd** och inte en del av denna feature.

---

## Felsökning

| Symptom | Trolig orsak | Lösning |
|---|---|---|
| Tema-byte animerar inte | `transition` saknas eller `prefers-reduced-motion` är aktivt | Kolla devtools Rendering > prefers-reduced-motion. Verifiera att globals.css har `200ms ease-out`-regeln på `*, *::before, *::after`. |
| Warning-bannern är genomskinlig | Webbläsaren stöder inte `color-mix` | Verifiera webbläsarversion (Chrome 111+, Firefox 113+, Safari 16.2+). Om äldre — uppdatera webbläsaren. |
| Filter-aktiv hoppar 2 px | Inaktiva knappar saknar transparent botten-border | Verifiera att `.button` har `border-bottom: 2px solid transparent;`. |
| Tom-state-symbolen lutar | `font-style: italic` ärvs från `.empty` | Sätt `font-style: normal` på `.emptyIcon`. |
| Hårdkodad hex hittad i komponentstil | Migreringen missade en plats | Byt mot `var(--*)` — använd token-katalogen i `data-model.md` för rätt namn. |
| Bygget klagar på saknad variabel | Komponent refererar borttagen `--gap` eller `--radius` | Migrera till `1rem` resp. `var(--radius-button)` / `var(--radius-card)`. |
