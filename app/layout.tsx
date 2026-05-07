import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mina uppgifter",
  description: "En enkel todo-app som sparar dina uppgifter lokalt i webbläsaren.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/*
 * Sätter data-theme innan React hydrerar — förhindrar "flash of wrong theme".
 * Läsordning: localStorage först, prefers-color-scheme som fallback för ny
 * användare, slutligen 'light' om matchMedia inte stöds.
 * Samma läslogik som hooks/useTheme.ts; ändra båda samtidigt.
 */
const themeBootstrapScript = `(function(){try{var v=localStorage.getItem('min-todo:theme');if(v==='light'||v==='dark'){document.documentElement.dataset.theme=v;return;}}catch(e){}try{var m=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=m?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();`;

// Roten av appen. Lager-komponenten är server-renderad; sidan (`page.tsx`) är
// klient-renderad eftersom datat lever i webbläsarens localStorage.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
