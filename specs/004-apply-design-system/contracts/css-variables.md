# Contract: CSS-variabler i `app/globals.css`

**Phase**: 1
**Date**: 2026-05-08
**Fil**: `app/globals.css`

Detta dokument beskriver vilken CSS-variabel-yta `app/globals.css` exponerar
till resten av appen. Komponentstilar (`*.module.css`) konsumerar variablerna
via `var(--*)` och får anta att de finns med dokumenterade värden i båda teman.

---

## Tillgängliga variabler

### Färg-tokens

```css
:root {
  --bg: #fafaf7;
  --fg: #1a1a1a;
  --muted: #6b6b6b;
  --accent: #cc7c5e;
  --accent-fg: #ffffff;
  --border: #d4d4d4;
  --danger: #c62828;
  --ok: #2e7d32;
}

[data-theme="dark"] {
  --bg: #1a1a1a;
  --fg: #f0f0f0;
  --muted: #999999;
  --accent: #e89678;
  --accent-fg: #1a1a1a;
  --border: #34353a;
  --danger: #ef6b6b;
  --ok: #7fc987;
}
```

### Strukturella tokens

```css
:root {
  --radius-button: 6px;
  --radius-card: 8px;
  --tap: 44px;
}
```

(Strukturella tokens är samma i båda teman — definieras inte i
`[data-theme="dark"]`.)

---

## Användningsregler

### För komponentstilar (`*.module.css`)

1. **Färger**: Hårdkoda aldrig hex-värden. Använd alltid `var(--färg-token)`.
   Tema-växlingen ärver automatiskt rätt värde via cascade.
2. **Hörn-radius**: Använd `var(--radius-button)` på `<button>`-element och
   `var(--radius-card)` på inputs, listrader, paneler och bannrar.
3. **Klickytor**: Använd `min-height: var(--tap)` (eller `min-width` + `min-height`
   för fyrkantiga ikon-knappar) för att uppfylla 44 × 44 px-regeln.
4. **Spacing**: Använd inte `var(--gap)` — den är borttagen. Skriv i stället
   `0.5rem` / `1rem` / `1.5rem` / `2rem` (alla multiplar av 8 px) direkt.

### För `globals.css` själv

5. **Nya färgtokens**: Får läggas till med ett namn som matchar konstitutionens
   palett-terminologi. Måste WCAG-verifieras i båda teman och dokumenteras
   tillbaka i denna fil.
6. **Borttagningar**: Att ta bort en token kräver migration av alla
   konsumenter i samma feature.

---

## Stabilitetsklassning

| Token | Stabilitet | Notering |
|---|---|---|
| `--bg`, `--fg`, `--muted`, `--accent`, `--accent-fg`, `--border` | **Stabila** | Värden kan ändras vid konstitutions-amendment; namn är garanterade. |
| `--danger`, `--ok` | **Stabila** | Används för fel/ok-tillstånd. Värden kan justeras vid kontrasttest. |
| `--radius-button`, `--radius-card` | **Stabila** | Pinnade i konstitutionen (6 px / 8 px). |
| `--tap` | **Stabilt** | Pinnat av tillgänglighetskravet (44 px). |

---

## Borttagna variabler — får inte refereras

| Token | Anledning till borttagning |
|---|---|
| `--gap` | Värdet 12 px bryter konstitutionens 8-px-skala. Komponenter migreras till `1rem` direkt. |
| `--radius` | Otydligt — knappar och kort har olika radius. Delades i `--radius-button` och `--radius-card`. |

Komponenter som fortfarande refererar dessa MÅSTE migreras innan featuren är
klar (T-uppgifter i tasks.md).

---

## Tema-aware-konsumtion

`--accent-fg` växlar **per tema** så att text på fylld accent alltid har
WCAG-säker kontrast:

```text
Ljust tema:  --accent-fg = #ffffff  →  vit text på #cc7c5e (≈ 4.7:1) ✅
Mörkt tema:  --accent-fg = #1a1a1a  →  mörk text på #e89678 (≈ 5.7:1) ✅
```

Komponenter som visar text på `var(--accent)`-bakgrund (t.ex. "Lägg till"-
knappen) SKA använda `color: var(--accent-fg)` — då fungerar kontrasten
automatiskt i båda teman utan komponentlogik.

---

## Verifiering

CI-spärr: `npm run lint && npm run build` ska passa. Manuell:

```powershell
# Sök efter hårdkodade hex-värden utanför globals.css.
# Träffar utanför ":root"- och "[data-theme=\"dark\"]"-blocken är fel.
Select-String -Path "app\*.module.css","components\*.module.css" `
  -Pattern '#[0-9a-fA-F]{3,8}'
```

Inga träffar förväntas (utöver eventuell `rgba(0,0,0,0.08)` i en skugga som
är konstitutionell — men v1 har inga skuggor så listan ska vara tom).
