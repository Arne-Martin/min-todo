# Data Model: Mörkt läge-toggle

**Phase**: 1
**Date**: 2026-05-07

Detta dokument beskriver dataformaten för temahanteringen — i minnet
(TypeScript-typer) och i `localStorage`. Inga server-data eller API-format finns,
i linje med projektets klient-only-natur.

---

## Type: `ThemeChoice`

Det användaren *har valt* (eller inte valt). Tre logiska tillstånd, men endast två
sparas faktiskt — det tredje är frånvaro av sparad data.

```ts
type ThemeChoice = 'light' | 'dark' | null;
```

| Värde | Betydelse | Persistens |
|---|---|---|
| `'light'` | Användaren har explicit valt ljust tema | Sparas i `localStorage` |
| `'dark'` | Användaren har explicit valt mörkt tema | Sparas i `localStorage` |
| `null` | Inget val gjort — följ system | Ingen nyckel i `localStorage` |

### Övergångar

```
[null: följ system] ──toggle──> ['light' eller 'dark' beroende på effektivt läge]
       ▲                                              │
       │                                              │
       └─── (ingen UI-handling i v1) ───────── toggle ┘
```

Toggleringen är binär: ett klick byter mellan de två explicita värdena. Det finns
ingen UI-yta för att återgå till `null` (följ system) i v1 — det är en medveten
KISS-förenkling. Användaren kan dock manuellt rensa `localStorage`-nyckeln via
devtools om de vill.

---

## Type: `ThemeMode`

Det **effektiva** temat som faktiskt visas på skärmen. Alltid en av två konkreta
värden — aldrig `null`.

```ts
type ThemeMode = 'light' | 'dark';
```

### Härledningsregel

```ts
function resolveTheme(choice: ThemeChoice, systemPrefersDark: boolean): ThemeMode {
  if (choice === 'light' || choice === 'dark') return choice;
  return systemPrefersDark ? 'dark' : 'light';
}
```

`systemPrefersDark` beräknas en gång vid första laddning från
`window.matchMedia('(prefers-color-scheme: dark)').matches`. Per FR-010 lyssnar vi
**inte** på ändringar av detta värde under sessionen — temat är låst till första
laddningens systempreferens när inget manuellt val finns.

---

## Storage Format

Vad som skrivs till och läses från `localStorage`-nyckeln `min-todo:theme`.

### Format

Värdet är en bokstavlig sträng — **inte** JSON:

```
"light"
```

eller

```
"dark"
```

### Anledningen till strängformat (inte JSON-envelope)

Tilskillnad från `min-todo:tasks` (som har `{ version, tasks }`-envelope) är
temavalet en atomär enum. Att tvinga in JSON skulle:

1. Göra inline-pre-hydration-scriptet i `app/layout.tsx` längre och svårare att läsa.
2. Lägga till en parsesteg som kan misslyckas, för noll vinst i extensibility.

Om vi någon gång behöver utöka schemat (t.ex. lägga till en kontrasthög-variant)
skiftar vi då till en ny nyckel (`min-todo:theme-v2`) och behåller läsfallback för
den gamla. Det är enklare än att förebygga något som kanske aldrig händer.

### Validering vid läsning

Hooken (och inline-scriptet) accepterar **endast** de exakta strängarna `"light"`
och `"dark"`. Allt annat — tom sträng, `null`, JSON-objekt, ogiltig text, undantag
från `localStorage` — behandlas som om nyckeln saknades, dvs. resulterar i
fallback till systempreferens.

```ts
function readChoice(): ThemeChoice {
  try {
    const raw = localStorage.getItem('min-todo:theme');
    if (raw === 'light' || raw === 'dark') return raw;
    return null;
  } catch {
    return null;
  }
}
```

### Skrivning

Skrivning sker i `useTheme`-hooken vid varje `setTheme` / `toggle`. Skrivning som
kastar undantag (privat läge, quota etc.) loggas inte och kraschar inte — valet
gäller bara för sessionen och försvinner vid nästa besök.

```ts
function writeChoice(choice: ThemeMode): void {
  try {
    localStorage.setItem('min-todo:theme', choice);
  } catch {
    // localStorage otillgängligt — valet gäller bara för sessionen.
  }
}
```

---

## Tillämpning på DOM

Det effektiva temat (`ThemeMode`) speglas till DOM som ett attribut på
`<html>`-elementet:

```html
<html lang="sv" data-theme="dark">
```

CSS i `app/globals.css` matchar:

```css
:root { /* ljust tema (default) */ }
[data-theme="dark"] { /* mörka overrides */ }
```

Attributet sätts på två ställen:

1. **Inline-scriptet i `<head>`** (`app/layout.tsx`) — körs synkront innan första
   paint, läser `localStorage` + `matchMedia`, sätter attributet. Förhindrar
   FOUC.
2. **`useEffect` i `useTheme`** — körs efter hydration vid varje förändring av
   effektivt tema. Synkar attributet om användaren klickar på toggleknappen.

De två måste hålla sig konsekventa: båda läser samma nyckel (`min-todo:theme`) och
båda använder samma härledningsregel (`resolveTheme`). Eftersom inline-scriptet
inte kan importera moduler är härledningsregeln duplicerad där — i ~10 rader,
vilket bedöms acceptabelt mot KISS (motsatsen är ett bygg-system där scriptet
genereras från delad kod, vilket är klart mer komplext).

---

## Sammanfattning

| Begrepp | Typ | Var det lever |
|---|---|---|
| `ThemeChoice` | `'light' \| 'dark' \| null` | I `useTheme`-hookens state, och som värde i `localStorage` (eller frånvaro) |
| `ThemeMode` | `'light' \| 'dark'` | Härlett värde från `ThemeChoice` + system, applicerat på `<html data-theme>` |
| `localStorage["min-todo:theme"]` | sträng `"light"` eller `"dark"`, eller saknad | Persistens mellan besök |

Inga andra entiteter, inga relationer, inga state-maskiner att rita. Datamodellen
är medvetet platt och liten.
