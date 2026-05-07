# Contract: `useTheme()` hook

**Phase**: 1
**Date**: 2026-05-07
**Fil**: `hooks/useTheme.ts`

`useTheme` är en React-hook som äger temats state, synkar det med `localStorage` och
applicerar `data-theme`-attributet på `<html>`. Komponenter (i praktiken
`<ThemeToggle />`) är medvetet okunniga om persistens — de pratar bara med hooken.

---

## Publik signatur

```ts
type ThemeMode = 'light' | 'dark';

type UseThemeReturn = {
  /** Det effektiva temat just nu — alltid 'light' eller 'dark', aldrig null. */
  theme: ThemeMode;

  /** Sätt ett explicit tema. Persisteras till localStorage. */
  setTheme: (next: ThemeMode) => void;

  /** Växla till motsatt tema. Genväg för setTheme(theme === 'light' ? 'dark' : 'light'). */
  toggle: () => void;
};

function useTheme(): UseThemeReturn;
```

`ThemeMode`-typen är definierad i `lib/types.ts` (se `data-model.md`).

---

## Beteende

### Vid första render

1. Hooken läser `localStorage["min-todo:theme"]` via en intern `readChoice()`
   med try/catch. Resultatet är `'light' | 'dark' | null`.
2. Om resultatet är `null` (saknad eller ogiltig nyckel), läses
   `window.matchMedia('(prefers-color-scheme: dark)').matches` **en gång** och
   omsätts till `'dark'` eller `'light'`.
3. Det effektiva temat sparas i hookens interna `useState`.
4. En `useEffect` synkar `document.documentElement.dataset.theme` till det
   effektiva temat (även om inline-scriptet i `<head>` redan har gjort det — vi
   bekräftar bara att React och DOM är konsekventa).

> **Notera**: Inline-scriptet i `app/layout.tsx` har redan satt `data-theme`
> innan React mountar. `useTheme` *läser inte* DOM-attributet — det läser
> `localStorage` direkt. Detta håller hookens logik testbar isolerat från DOM
> och undviker att en eventuell race mellan inline-script och hook orsakar
> divergens.

### `setTheme(next)`

1. Uppdaterar internt state till `next`.
2. Skriver `localStorage["min-todo:theme"] = next` via `writeChoice()` (try/catch).
3. `useEffect` reagerar på state-bytet och uppdaterar
   `document.documentElement.dataset.theme`.
4. CSS-transitionen i `globals.css` animerar över 200 ms (eller 0 ms vid
   `prefers-reduced-motion`).

### `toggle()`

Genvägsmetod, ekvivalent med:

```ts
setTheme(theme === 'light' ? 'dark' : 'light');
```

Anropet förändrar `localStorage`-nyckeln även om användaren tidigare hade `null`
(följde systemet) — efter ett `toggle`-anrop finns alltid ett explicit val sparat.

### Fel- och kantfall

| Scenario | Beteende |
|---|---|
| `localStorage` är otillgängligt (privat läge, blockerat) | `readChoice` returnerar `null`, fallback på systempref. `writeChoice` swallowar undantag. Valet gäller bara för sessionen. |
| Sparat värde är ogiltigt (t.ex. `"blå"` eller en JSON-sträng) | `readChoice` returnerar `null`, fallback på systempref. Nästa `setTheme` skriver över den ogiltiga datan. |
| `window.matchMedia` saknas (mycket gamla webbläsare utanför mål) | Hooken antar `systemPrefersDark = false` ⇒ ljust tema. Inget kraschar. |
| Snabba upprepade `toggle()`-anrop | Varje anrop uppdaterar state och skriver till `localStorage`. React batchar staterar, så slutläget motsvarar antalet klick. CSS-transitionen avbryts mjukt — inget hopar sig. |
| Server-render | Hooken körs aldrig på servern (`page.tsx` är `"use client"`). Inline-scriptet i `app/layout.tsx` (som körs i webbläsaren) sätter `data-theme` innan hydration. `<html>` får `suppressHydrationWarning` så React inte varnar. |

---

## Användning från komponenter

`<ThemeToggle />` är den enda förväntade konsumenten:

```tsx
'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggle}
      aria-label={isDark ? 'Växla till ljust läge' : 'Växla till mörkt läge'}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
}
```

`<ThemeToggle />` använder *inte* `setTheme` direkt — bara `toggle`. `setTheme`
exponeras ändå för framtida utbyggnad (t.ex. en inställningssida) utan att hookens
publika yta måste bryta då.

---

## Vad hooken **inte** gör

- **Lyssnar inte på `matchMedia`-ändringar** under sessionen — per Q1 i
  Clarifications och FR-010 låser vi temat till första laddningens
  systempreferens när inget manuellt val finns.
- **Visar ingen UI-notis** om `localStorage` är otillgängligt — det är medvetet
  tyst för att hålla featurens UX-yta liten (se research.md §7).
- **Tar inte hand om favicon-bytet** eller liknande sidoeffekter. Out of scope.
- **Exponerar inte `ThemeChoice`** (det interna `null`-tillståndet) — externt är
  hookens världsbild att temat alltid är `'light'` eller `'dark'`. Detta håller
  konsumenter enkla.
