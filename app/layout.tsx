import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Startupia | Piensa en grande. Empieza inteligente.",
  description: "Un ecosistema para validar, construir y hacer crecer startups con tecnología y acompañamiento."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <header className="site-header">
          <Link href="/" className="brand" aria-label="Startupia - Inicio">
            <span aria-hidden="true" className="brand-symbol">✧</span> startupia
          </Link>
          <nav aria-label="Navegación principal">
            <Link href="/#solucion">Solución</Link>
            <Link href="/mentors">Mentors</Link>
            <Link href="/login" className="button button-small">Acceder</Link>
          </nav>
        </header>
        <main id="contenido">{children}</main>
        <footer className="site-footer"><span>Startupia © 2026</span><span>Piensa en grande. Empieza inteligente.</span></footer>
      </body>
    </html>
  );
}
