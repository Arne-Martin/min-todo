# Contract: `localStorage`-nyckel för temaval

**Phase**: 1
**Date**: 2026-05-07
**Nyckel**: `min-todo:theme`

Detta dokument fastslår exakt format, läsregler och felhantering för temats
persistens. Det är två kodvägar som måste hålla sig konsekventa: inline-scriptet i
`app/layout.tsx` (körs innan React) och `useTheme`-hooken (körs efter hydration).

---

## Nyckel och värde

| Egenskap | Värde |
|---|---|
| **Nyckel** | `min-todo:theme` |
| **Giltiga värden** | exakt `"light"` eller exakt `"dark"` (skiftlägeskänsligt) |
| **Format** | bokstavlig sträng — **inte** JSON |
| **Frånvaro** | Saknad nyckel betyder "inget val gjort — följ system" |

### Exempel — vad devtools visar

```
Application > Storage > Local Storage > http://localhost:3000

Key                  Value
─────────────────────────────
min-todo:tasks       {"version":1,"tasks":[…]}
min-todo:theme       dark
```

Eller, om användaren aldrig har klickat på toggleknappen:

```
Key                  Value
─────────────────────────────
min-todo:tasks       {"version":1,"tasks":[…]}
                     (ingen min-todo:theme-rad)
```

---

## Läsregler

Både inline-scriptet och `useTheme` följer **exakt** samma regler:

```text
1. Försök läsa localStorage["min-todo:theme"].
2. Om läsningen kastar undantag → behandla som saknat värde, gå till steg 5.
3. Om värdet är exakt strängen "light" → använd "light".
4. Om värdet är exakt strängen "dark"  → använd "dark".
5. Annars (saknat, tomt, ogiltigt format, JSON-objekt, etc.):
   Läs window.matchMedia('(prefers-color-scheme: dark)').matches.
   Om sant  → använd "dark".
   Om falskt → använd "light".
6. Om matchMedia saknas → använd "light" (defensiv default).
```

Notera särskilt:
- **Ingen** automatisk migrering eller rensning av ogiltiga värden vid läsning.
  Om en användares `localStorage` har `"hellblau"` så får de fallback-temat denna
  laddning, och nästa explicit klick på toggleknappen skriver över värdet.
- **Ingen** JSON-parsing — om värdet råkar se ut som JSON (`"\"dark\""` eller
  `{"theme":"dark"}`) räknas det som ogiltigt och faller tillbaka.

---

## Skrivregler

Skrivning sker **endast** från `useTheme`-hookens `setTheme` (som även `toggle`
anropar internt). Inline-scriptet skriver aldrig.

```text
1. Försök localStorage.setItem("min-todo:theme", value) där value ∈ {"light","dark"}.
2. Om skrivningen kastar undantag → swalla det tyst. Inget logges, inget UI uppdateras.
   Användarens val gäller för sessionen men persistas inte.
```

### Varför tyst skrivfel?

Spec.md FR-016 kräver att appen *inte kraschar* när lagring är otillgänglig.
`useTodos`-hooken i 001 visar en synlig notis ("Dina uppgifter kan inte sparas…")
eftersom todo-data är användarens primära innehåll. Temats värde är en
preferens­inställning vars förlust mellan sessioner är minimalt störande — en notis
för det vore överreaktion. Användaren märker bara att deras val nollställs vid
nästa besök, vilket är acceptabelt graceful degradation.

---

## Försiktighet kring konsistens mellan inline-script och hook

Eftersom inline-scriptet inte kan importera moduler (det körs innan bundlen
laddats) duplicerar vi läsreglerna ovan på två ställen:

1. **`app/layout.tsx`** — inline `<script>` med ~10 raders ren JS.
2. **`hooks/useTheme.ts`** — TypeScript-version av samma logik.

Båda måste:

- Läsa nyckeln `"min-todo:theme"` (samma sträng).
- Acceptera **bara** strängarna `"light"` och `"dark"` som giltiga.
- Falla tillbaka på `prefers-color-scheme: dark` när värdet saknas/är ogiltigt.

Vid framtida ändringar (t.ex. om nyckelnamnet eller giltiga värden ändras) **MÅSTE
båda ställena uppdateras tillsammans** — annars kommer inline-scriptet och hooken
att divergera och användaren ser en blink. En kommentar på svenska placeras vid
båda ställena som påminner om detta:

```ts
// OBS: Samma läslogik finns i app/layout.tsx (inline-script). Ändra båda samtidigt.
```

---

## Migrering och versionering

Ingen versionering i denna iteration. Värdeformatet är så enkelt att en
schema-version vore overkill — om vi någon gång behöver utöka stöder vi det
genom att:

1. Lägga till en ny nyckel (t.ex. `min-todo:theme-v2`).
2. Läsa båda nycklarna i läsreglerna; preferera den nyare och migrera den gamla
   tyst vid första läsning.

Det är klart enklare än att förebygga problem som kanske aldrig uppstår.

---

## Sammanfattning

- En nyckel: `min-todo:theme`.
- Två giltiga värden: `"light"`, `"dark"`.
- Frånvaro = "följ system".
- Ogiltig data = "följ system" + valet skrivs över vid nästa explicita toggle.
- Skrivfel sväljs tyst.
- Identisk läslogik på två ställen: inline-script och hook.
