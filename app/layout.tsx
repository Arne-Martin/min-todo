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

// Roten av appen. Lager-komponenten är server-renderad; sidan (`page.tsx`) är
// klient-renderad eftersom datat lever i webbläsarens localStorage.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
