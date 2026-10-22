import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuidado",
  description: "Diagnóstico en castellano para sitios WordPress.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
          <a href="/" className="text-lg font-semibold tracking-tight">
            Cuidado
          </a>
          <span className="text-sm text-stone-500">cuidadoweb.com</span>
        </header>
        <main className="mx-auto w-full max-w-3xl px-6 pb-16">{children}</main>
      </body>
    </html>
  );
}
