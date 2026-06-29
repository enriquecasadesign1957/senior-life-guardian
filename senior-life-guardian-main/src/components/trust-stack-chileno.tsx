import { Clock, Lock, MapPin, Shield } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Lock, label: "Pago seguro con Webpay Plus" },
  { icon: Shield, label: "Sin permanencia — Cancela cuando quieras" },
  { icon: Clock, label: "24/7 respuesta garantizada" },
  { icon: MapPin, label: "Cobertura nacional" },
] as const;

type TrustStackChilenoProps = {
  className?: string;
  /** Variante sobre fondo oscuro (hero/planes card). */
  variant?: "light" | "onDark";
};

export function TrustStackChileno({ className = "", variant = "light" }: TrustStackChilenoProps) {
  const isDark = variant === "onDark";

  return (
    <ul
      className={`grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 ${className}`}
      aria-label="Garantías del servicio"
    >
      {TRUST_ITEMS.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className={`flex flex-col items-center text-center gap-2 rounded-xl px-3 py-3 md:py-4 ${
            isDark
              ? "bg-white/10 border border-white/15"
              : "bg-card border border-border/80 shadow-sm"
          }`}
        >
          <span
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isDark ? "bg-white/15 text-white" : "bg-muted text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={2} aria-hidden />
          </span>
          <span
            className={`text-[11px] sm:text-xs font-semibold leading-snug max-w-[9.5rem] ${
              isDark ? "text-white/90" : "text-foreground"
            }`}
          >
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Copy FAQ — cancelación sin fricción (CRO). */
export const FAQ_CANCELLATION_POSITIVE_Q = "¿Cómo cancelo si no me convence?";
export const FAQ_CANCELLATION_POSITIVE_A =
  "Cancelas con un solo click desde tu panel, de forma inmediata y sin ningún tipo de cargo adicional.";

/** Testimonio narrativo destacado — Carmen R. */
export const FEATURED_TESTIMONIAL_CARMEN = {
  quote:
    "Mi papá tuvo una caída en la ducha a las 3am. Senior Safe alertó a mi hermana en 2 minutos. No quiero imaginar qué habría pasado sin esto.",
  name: "Carmen R.",
  role: "Hija",
} as const;
