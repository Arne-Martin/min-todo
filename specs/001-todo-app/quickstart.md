# Quickstart: Todo-app (min-todo)

**Phase**: 1
**Date**: 2026-05-05

Den här guiden förklarar hur du startar appen lokalt och verifierar att kärnflödena
fungerar. Den är skriven så att en nybörjare ska kunna följa den utan extern
dokumentation.

---

## Förutsättningar

- **Node.js 20** eller senare LTS. Kontrollera med `node --version`.
- **Webbläsare** med utvecklarverktyg (Chrome, Firefox, Safari eller Edge).
- Mappen `min-todo/` är initierad som git-repo (det är den redan i detta
  projekt).

---

## Första gången: scaffolda appen

> **Obs**: Detta steg utförs en gång under T002 i `tasks.md`. Hoppa över det om
> appen redan är skapad (kontrollera om `package.json` finns i repo-roten).

```powershell
# Från repo-roten C:\projects\min-todo
npx create-next-app@latest . `
  --typescript `
  --eslint `
  --app `
  --no-src-dir `
  --no-tailwind `
  --import-alias "@/*"
```

Flaggorna betyder:

- `--typescript`: TypeScript från start (princip III).
- `--eslint`: Inkluderar Next.js ESLint-regler.
- `--app`: App Router (princip III).
- `--no-src-dir`: Platt struktur — `app/` ligger direkt i roten (princip IV
  – tydlig kod).
- `--no-tailwind`: Princip III förbjuder Tailwind.
- `--import-alias "@/*"`: Tillåter `import x from '@/components/...'`.

Sätt sedan TypeScript till `strict` i `tsconfig.json` om scaffolden inte
redan gjort det:

```json
{ "compilerOptions": { "strict": true } }
```

Installera ikonbiblioteket (godkänt undantag — se `plan.md` > Complexity
Tracking):

```powershell
npm install lucide-react
```

---

## Köra utvecklingsservern

```powershell
npm run dev
```

Öppna `http://localhost:3000` i webbläsaren.

---

## Manuell testkörning (mot acceptansscenarierna)

Följande lista speglar `spec.md` > User Stories. Pricka av varje rad i
webbläsaren innan du markerar en uppgift "klar" i `tasks.md`.

### US1 – Lägga till och se uppgifter

- [ ] Skriv "Köp mjölk" i textfältet och tryck **Enter** → uppgiften visas i
      listan, fältet töms och behåller fokus.
- [ ] Skriv "Boka tandläkare" och klicka **+**-knappen → uppgiften läggs till
      ovanför "Köp mjölk" (nyaste överst).
- [ ] Skriv bara mellanslag och tryck Enter → ingenting händer, inga felljud.
- [ ] Försök skriva mer än 200 tecken → input slutar acceptera vid 200.
- [ ] Räknaren visar "2 uppgifter kvar".
- [ ] Stäng fliken → öppna `localhost:3000` igen → båda uppgifterna finns kvar.

### US2 – Markera klar / inte klar

- [ ] Klicka i checkboxen på en uppgift → texten blir överstruken och dämpad.
      Räknaren minskar med 1.
- [ ] Klicka i checkboxen igen → uppgiften återgår till aktivt utseende.
      Räknaren ökar med 1.
- [ ] Den klara uppgiften behåller sin position i listan (hoppar inte upp/ner).
- [ ] Ladda om → status är bevarad.

### US3 – Ta bort uppgift

- [ ] Klicka på papperskorg-ikonen → bekräftelseruta visas.
- [ ] Klicka **Avbryt** → uppgiften är kvar.
- [ ] Klicka papperskorgen igen och **OK** → uppgiften försvinner.
- [ ] Ladda om → uppgiften är fortfarande borta.

### US4 – Filtrera

- [ ] Skapa fyra uppgifter, kryssa i två som klara.
- [ ] Klicka **Kvar** → bara de två okryssade syns; "Kvar"-fliken har en synlig
      markering.
- [ ] Klicka **Klara** → bara de två kryssade syns.
- [ ] Klicka **Alla** → alla fyra syns igen.
- [ ] Med filtret **Klara** aktivt — kryssa av en av de klara → uppgiften
      försvinner från vyn (men finns kvar om du går till **Alla**).
- [ ] Ladda om → filtret är **Alla** (FR-018).

### US5 – Rensa klara

- [ ] Skapa fem uppgifter, kryssa tre som klara.
- [ ] Knappen **Rensa klara** är synlig och aktiv.
- [ ] Klicka **Rensa klara** → bekräftelseruta. Avbryt → alla fem finns kvar.
- [ ] Klicka **Rensa klara** → bekräfta → de tre klara försvinner.
- [ ] Knappen är nu inaktiverad eller dold (FR-021).
- [ ] Ladda om → de två kvar är fortfarande där.

### Tillgänglighet (alla user stories)

- [ ] Tabba genom sidan med **Tab** → input, +-knapp, varje checkbox och
      papperskorg, filterknapparna, "Rensa klara". Fokusring syns hela tiden.
- [ ] Använd **Mellanslag** för att toggla checkboxar.
- [ ] Använd **Enter** på alla knappar.
- [ ] (Valfritt) Slå på en skärmläsare och bekräfta att räknaren och
      filterläget annonseras vid förändring.

### Mobiltest

- [ ] Öppna devtools → device toolbar → välj **iPhone SE** (375 × 667) eller
      **Galaxy S8** (360 × 740).
- [ ] Verifiera att kolumnen är centrerad, ingen horisontell scroll, alla
      knappar är minst 44 × 44 px.
- [ ] Krymp till 320 px bredd → samma kontroll. Inget bryter sig.

### Felhantering — `localStorage`

- [ ] I devtools → Application → Local Storage → välj origin → ta bort nyckeln
      `min-todo:tasks` → ladda om → appen visar tom-lista-placeholder.
- [ ] Sätt nyckelns värde manuellt till `not json` → ladda om → appen visar tom
      lista och meddelandet "Tidigare data kunde inte läsas".
- [ ] Öppna en privat/incognito-flik (vissa webbläsare blockerar
      `localStorage`) → appen ska fungera under sessionen och visa varnings­meddelandet om att data inte kan sparas.

---

## Bygga för produktion (valfritt)

```powershell
npm run build
npm run start
```

Bygget ska gå igenom utan TypeScript-fel eller ESLint-varningar. Annars är
något brutet mot konstitutionen (princip III: TS strict + Next.js standard­regler).

---

## Felsökning

| Symptom | Åtgärd |
|---|---|
| `localStorage is not defined` vid bygge | Något kallar storage på server-nivå. Kontrollera att alla anrop är i `useEffect` eller `"use client"`-komponenter. |
| Hydration mismatch i konsolen | `page.tsx` saknar `"use client"`, eller renderar olika på server och klient. |
| Listan är tom efter omladdning trots tillagda uppgifter | Kolla `localStorage` i devtools. Är nyckeln `min-todo:tasks` där? Är JSON giltig? |
| TypeScript-fel om `crypto.randomUUID` | Höj `tsconfig.json` lib till åtminstone `["DOM", "ES2022"]`. |

---

## Var ligger vad?

| Fil | Innehåll |
|---|---|
| `app/layout.tsx` | Globalt skelett, `<html lang="sv">`, viewport-meta, importerar `globals.css`. |
| `app/page.tsx` | App-komponenten — håller filter-state, renderar rubrik och delegerar till komponenter. |
| `app/globals.css` | Reset, CSS-variabler (färger, spacing), baseline-typografi. |
| `app/page.module.css` | Layout för centrerad 600 px-kolumn. |
| `components/TodoInput.*` | Textfält + plus-knapp. |
| `components/TodoList.*` | `<ul>` med rader. |
| `components/TodoItem.*` | Checkbox, text, papperskorg. |
| `components/FilterBar.*` | Tre filterknappar. |
| `hooks/useTodos.ts` | All state + `localStorage`-synk. |
| `lib/storage.ts` | `loadTasks()` / `saveTasks()`. |
| `lib/types.ts` | `Task`, `Filter`, `StorageEnvelope`. |
