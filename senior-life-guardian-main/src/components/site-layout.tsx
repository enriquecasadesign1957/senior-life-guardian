import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Mail, Globe, Shield, BookOpen } from "lucide-react";
import logo from "@/assets/logo-senior-safe.png";
import { PLAN_KEY } from "@/lib/plans";
import { FIRST_MONTH_PROMO_CODE } from "@/lib/discount-codes";
import { isDemoMode } from "@/lib/demo/demo-config";

const defaultCheckoutSearch = {
  mode: "contratar" as const,
  plan: PLAN_KEY,
  periodo: "mensual" as const,
};

/** Altura reservada para la barra fija (padding-top del header). */
export const ANNOUNCEMENT_BAR_HEIGHT = "2.5rem";

export function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Promoción"
      className="fixed top-0 inset-x-0 z-[60] flex items-center justify-center px-4 text-center text-white text-xs sm:text-sm font-semibold tracking-wide leading-snug"
      style={{
        height: ANNOUNCEMENT_BAR_HEIGHT,
        background: "linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #ea580c 100%)",
      }}
    >
      <p className="max-w-5xl">
        <Link
          to="/checkout"
          search={{ mode: "contratar", plan: PLAN_KEY, periodo: "mensual", codigo: FIRST_MONTH_PROMO_CODE }}
          className="hover:underline underline-offset-2"
        >
          ✓ Sin permanencia · Primer mes con 50% descuento · Cancela cuando quieras
        </Link>
      </p>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "¿Qué es?", href: "/#que-es" },
    { label: "Funciones técnicas", href: "/#funciones" },
    { label: "Cómo funciona", href: "/como-funciona", isRoute: true },
    { label: "Planes", href: "/#planes" },
    { label: "Guía de uso", href: "/guia", isRoute: true },
    { label: "Contacto", href: "/#contacto" },
  ];
  return (
    <>
      <AnnouncementBar />
      <div aria-hidden className="shrink-0" style={{ height: ANNOUNCEMENT_BAR_HEIGHT }} />
      <header
        className="sticky z-50 backdrop-blur-xl bg-white/90 border-b border-border"
        style={{ top: ANNOUNCEMENT_BAR_HEIGHT }}
      >
      <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Alarma Senior Safe" className="h-10 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground font-medium">
          {links.map((l) =>
            l.isRoute ? (
              <Link key={l.href} to={l.href} className="hover:text-foreground transition-colors">{l.label}</Link>
            ) : (
              <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
            ),
          )}
        </div>
        <div className="hidden md:flex items-center gap-3">
          {isDemoMode() && (
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-amber-400/50 bg-amber-50 text-amber-900 text-sm font-semibold hover:bg-amber-100 transition"
            >
              Demo municipal
            </Link>
          )}
          <Link
            to="/guia"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--brand-petrol)]/30 text-[var(--brand-petrol-deep)] text-sm font-semibold hover:bg-[var(--brand-petrol)]/5 transition"
          >
            <BookOpen className="w-4 h-4" />
            Guía
          </Link>
          <Link to="/checkout" search={defaultCheckoutSearch} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--brand-petrol-deep)] text-white text-sm font-semibold hover:opacity-90 transition">
            Contratar
          </Link>
        </div>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-border px-6 py-5 flex flex-col gap-4 bg-white">
          {links.map((l) =>
            l.isRoute ? (
              <Link key={l.href} to={l.href} onClick={() => setOpen(false)} className="text-foreground py-1">{l.label}</Link>
            ) : (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-foreground py-1">{l.label}</a>
            ),
          )}
          <Link to="/guia" onClick={() => setOpen(false)} className="px-5 py-4 rounded-full border border-[var(--brand-petrol)]/30 text-[var(--brand-petrol-deep)] font-semibold text-center">
            Guía de instalación
          </Link>
          <Link to="/checkout" search={defaultCheckoutSearch} onClick={() => setOpen(false)} className="px-5 py-4 rounded-full bg-[var(--brand-petrol-deep)] text-white font-semibold text-center">Contratar</Link>
        </div>
      )}
    </header>
    </>
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
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4 font-bold">Producto</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="/#que-es" className="text-white/85 hover:text-white">¿Qué es?</a></li>
            <li><a href="/#funciones" className="text-white/85 hover:text-white">Funciones técnicas</a></li>
            <li><Link to="/como-funciona" className="text-white/85 hover:text-white">Cómo funciona</Link></li>
            <li><a href="/#planes" className="text-white/85 hover:text-white">Planes</a></li>
            <li><Link to="/guia" className="text-white/85 hover:text-white">Guía de instalación</Link></li>
            <li><Link to="/checkout" search={defaultCheckoutSearch} className="text-white/85 hover:text-white">Contratar</Link></li>
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
