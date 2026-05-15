import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Phone, Mail, Globe, Shield } from "lucide-react";
import logo from "@/assets/logo-senior-safe.png";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "¿Qué es?", href: "/#que-es" },
    { label: "Cómo funciona", href: "/#como" },
    { label: "Funciones", href: "/#funciones" },
    { label: "Planes", href: "/#planes" },
    { label: "Contacto", href: "/#contacto" },
  ];
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-border">
      <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Alarma Senior Safe" className="h-10 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground font-medium">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </div>
        <a href="/#prueba" className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--brand-petrol-deep)] text-white text-sm font-semibold hover:opacity-90 transition">
          Probar gratis
        </a>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-border px-6 py-5 flex flex-col gap-4 bg-white">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-foreground py-1">{l.label}</a>
          ))}
          <a href="/#prueba" onClick={() => setOpen(false)} className="px-5 py-4 rounded-full bg-[var(--brand-petrol-deep)] text-white font-semibold text-center">Probar gratis</a>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="text-white bg-[var(--brand-petrol-deep)]">
      <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="bg-white inline-flex p-3 rounded-xl">
            <img src={logo} alt="Alarma Senior Safe" className="h-12 w-auto" />
          </div>
          <p className="mt-5 text-sm text-white/75 max-w-sm leading-relaxed">
            Tecnología con corazón. Cuidando a quienes nos cuidaron toda la vida.
          </p>
          <div className="mt-5 space-y-2 text-sm text-white/85">
            <div className="flex items-center gap-2"><Globe className="w-4 h-4" /><span>alarmaseniorsafe.cl</span></div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>hola@alarmaseniorsafe.cl</span></div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>+56 9 7140 4580</span></div>
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4 font-bold">Producto</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="/#que-es" className="text-white/85 hover:text-white">¿Qué es?</a></li>
            <li><a href="/#como" className="text-white/85 hover:text-white">Cómo funciona</a></li>
            <li><a href="/#planes" className="text-white/85 hover:text-white">Planes</a></li>
            <li><a href="/#prueba" className="text-white/85 hover:text-white">Prueba gratis</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4 font-bold">Legal</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/privacidad" className="text-white/85 hover:text-white">Política de privacidad</Link></li>
            <li><Link to="/terminos" className="text-white/85 hover:text-white">Términos y condiciones</Link></li>
            <li><a href="/#contacto" className="text-white/85 hover:text-white">Contacto</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between gap-2 text-sm text-white/60">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> © 2026 Alarma Senior Safe. Todos los derechos reservados.</span>
          <span>Hecho en Chile · Soporte 24/7</span>
        </div>
      </div>
    </footer>
  );
}
