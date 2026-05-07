# Quickstart: Mörkt läge-toggle

**Phase**: 1
**Date**: 2026-05-07

Den här guiden förklarar hur du kör utvecklingsservern och verifierar att
mörkt-läge-funktionen uppfyller specens acceptanskriterier — manuellt i
webbläsaren, i linje med projektets test-policy.

---

## Förutsättningar

- 001-todo-app är redan implementerad (komponenter, `useTodos`, `globals.css`,
  `lucide-react` installerat). Om inte: kör `/speckit-implement` på 001 först.
- **Node.js 20** eller senare LTS. Kontrollera med `node --version`.
- **Webbläsare** med utvecklarverktyg (Chrome, Firefox, Safari eller Edge).

---

## Starta utvecklingsservern

```powershell
# Från repo-roten C:\projects\min-todo
npm run dev
```

Öppna `http://localhost:3000` och håll devtools öppna (F12). Tabbar du behöver:

- **Console** — för eventuella fel.
- **Application > Storage > Local Storage** — för att inspektera och rensa
  `min-todo:theme`-nyckeln.
- **Elements** — för att se `<html data-theme="…">`-attributet.
- **Rendering** (i Chrome devtools) — för att simulera
  `prefers-color-scheme` och `prefers-reduced-motion` utan att ändra OS-inställningen.

---

## Verifieringssteg

Stegen följer user stories och acceptanskriterier i `spec.md`. Markera ✅ när
ett steg fungerar; ⚠ om något skaver.

### US1 — Växla mellan ljust och mörkt tema (P1)

> Acceptansreferens: spec.md > User Story 1 > Acceptance Scenarios 1–6.

1. **Initialladdning**: Öppna `http://localhost:3000`. Sidan visas i ljust eller
   mörkt tema beroende på systemets `prefers-color-scheme`. Toggleknappen syns
   uppe till höger på samma rad som rubriken "Mina uppgifter".
2. **Klicka på knappen**. Sidan byter tema. Bakgrunden, texten, ramarna,
   knapparna, ikonerna och fokusringen färgskiftar mjukt under cirka 200 ms.
3. **Inga layoutändringar**: Listan, input-fältet och filterknapparna sitter på
   exakt samma plats före och efter bytet.
4. **Ikonen byter**: I ljust läge visas en måne; i mörkt visas en sol.
5. **`<html data-theme="…">` ändras** i Elements-fliken vid varje klick.
6. **Tangentbord**: Tabba till toggleknappen. En synlig fokusring visas.
   Tryck Enter — temat byter. Tryck mellanslag — temat byter tillbaka.
7. **Klickyta**: Hovra över knappen i Elements. Boxen ska vara minst 44 × 44 px.

### US2 — Mitt val följer mellan besök (P2)

> Acceptansreferens: spec.md > User Story 2.

1. Klicka tills du är i mörkt läge. Inspektera Application > Local Storage —
   `min-todo:theme` ska vara `dark`.
2. Stäng fliken och öppna `http://localhost:3000` igen. Sidan ska starta direkt
   i mörkt läge — **ingen blink i ljust** vid första paint.
3. Klicka tills du är i ljust läge. Ladda om (Ctrl+R). Sidan startar i ljust.
4. Öppna en *helt ny privat-fönster*-flik och navigera till samma URL. Den
   privata fliken har sin egen `localStorage` — om systemet är inställt på
   mörkt visas mörkt tema; om ljust visas ljust. (Privatläge speglar US3.)

### US3 — Default följer systemets inställning (P3)

> Acceptansreferens: spec.md > User Story 3.

1. Stäng fliken. Rensa `min-todo:theme` från Local Storage.
2. Öppna devtools > Rendering > "Emulate CSS media feature `prefers-color-scheme`"
   och välj **dark**.
3. Ladda om sidan. Den ska visas i mörkt tema (ingen `min-todo:theme` finns;
   systemet säger mörkt → mörkt).
4. Ändra emuleringen till **light**. Rensa `min-todo:theme` igen. Ladda om.
   Sidan visas i ljust.
5. Klicka på toggleknappen så ett manuellt val sparas (säg `dark`). Ändra
   emuleringen till **light** igen. Ladda om. Sidan ska visas i mörkt — det
   manuella valet har företräde.
6. **Live-byte under sessionen**: Med en sparad nyckel `dark` och emulering
   `dark`, ändra emuleringen till `light` *utan att ladda om*. Sidan ska
   **inte** ändras (FR-010, Q1 i Clarifications). Toggleknappen är fortfarande
   sättet att byta.

### Edge cases

> Acceptansreferens: spec.md > Edge Cases.

1. **localStorage otillgängligt**: Öppna en *privat flik* eller stäng av
   sidans skript-cookies. (Kan också simuleras genom att öppna devtools
   > Application och klicka "Disable storage".) Toggleringen ska fungera
   inom sessionen, men nästa laddning startar i systempreferens-temat.
2. **Korrupt värde**: Sätt manuellt `min-todo:theme` till `"hellblau"` i
   Local Storage. Ladda om. Sidan ska visas i systempreferens-temat (inte
   krascha). Klicka på toggleknappen — värdet skrivs över med en giltig
   sträng.
3. **`prefers-reduced-motion`**: I Rendering-fliken, sätt
   `prefers-reduced-motion` till **reduce**. Klicka på toggleknappen.
   Färgbytet ska ske **omedelbart** (ingen 200 ms-fade).
4. **Snabba upprepade klick**: Klicka på toggleknappen 6 gånger så snabbt du
   kan. Slutläget ska motsvara det jämna antalet (samma som start). Inga
   animationer "hänger" eller stackar.
5. **Ingen FOUC**: Sätt nyckeln till `dark` och refresha med devtools-flikens
   nätverksstrypning på "Slow 3G". Det ska inte synas en blink i ljust tema
   innan sidan landar i mörkt — temat appliceras innan första paint via
   inline-scriptet.

---

## Kontroller med kommandoraden

Innan du markerar implementationen klar, kör:

```powershell
npm run lint     # ESLint — Next.js-regler
npm run build    # next build — fångar TypeScript- och bygg-fel
```

`npm run build` körs i CI-tankesätt (full type-check + bundling). Om bygget
lyckas och alla manuella verifieringssteg ovan är ✅, är featuren klar.

---

## Kontrastverifiering (FR-014, SC-005)

För båda teman:

1. Använd ett WCAG-kontrastverktyg (t.ex. devtools "Inspect" > "Contrast
   ratio" som visas på text-element, eller webaim.org/resources/contrastchecker).
2. Verifiera följande par:
   - Brödtext (`color: var(--fg)`) mot bakgrund (`background: var(--bg)`) — minst
     **4,5:1**.
   - Hjälptext / sekundär text (`var(--muted-fg)`) mot bakgrund — minst **4,5:1**
     om det är textstorlek under 18 px, annars **3:1**.
   - Fokusring (`var(--accent)`) mot bakgrund — minst **3:1** (UI-komponentkrav).

Om något par ligger under tröskeln — justera färgvärdet i `globals.css` och
verifiera igen. Detta är den enda situation där `globals.css`-färger får
finjusteras efter att tasks.md är klar.

---

## Felsökning

| Symptom | Trolig orsak | Lösning |
|---|---|---|
| Synlig blink i fel tema vid första paint | Inline-scriptet i `app/layout.tsx` kommer inte med, eller `<html>` saknar `suppressHydrationWarning` | Verifiera att `<script>` ligger i `<head>` *före* `<body>` och att `<html suppressHydrationWarning>` är satt |
| `data-theme` ändras inte vid klick | Hooken sätter inte attributet — eller `useEffect` har fel deps | Inspektera Elements-fliken vid klick. Om attributet inte uppdateras: kolla `useEffect`-deps i `useTheme.ts` |
| Färger ändras inte trots att `data-theme` ändras | CSS-variablerna används inte i komponenten, eller selektorn `[data-theme="dark"]` har lägre specifitet än något annat | Kontrollera att komponentens CSS Module använder `var(--fg)`, `var(--bg)` etc. — inte hårdkodade hex-värden |
| Knappen är mindre än 44 × 44 px | `min-width`/`min-height` saknas i `ThemeToggle.module.css` | Lägg till `min-width: 44px; min-height: 44px;` på `.button` |
| Skärmläsare läser "knapp, knapp" utan kontext | `aria-label` saknas eller är felstavat | Verifiera att `aria-label` växlar mellan "Växla till mörkt läge" och "Växla till ljust läge" |
