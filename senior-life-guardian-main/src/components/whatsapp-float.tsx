import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

const WHATSAPP_NUMBER = "56971404580";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Senior Safe, tengo una consulta")}`;

export function WhatsAppFloat() {
  // Mount client-only to avoid SSR hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(t);
  }, []);

  if (!mounted || dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {showTooltip && (
        <div className="relative bg-white text-foreground text-sm font-medium px-4 py-3 rounded-2xl shadow-xl border border-border max-w-[240px] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="w-3 h-3" />
          </button>
          Soporte 24/7 · Escríbenos por WhatsApp
          <div className="absolute bottom-0 right-5 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-border" />
        </div>
      )}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setShowTooltip(false)}
        className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition duration-300 animate-in zoom-in duration-300"
        style={{ background: "#25D366" }}
        aria-label="Abrir WhatsApp soporte"
      >
        <MessageCircle className="w-8 h-8" fill="white" />
      </a>
    </div>
  );
}

export function WhatsAppButton({
  variant = "button",
  className,
  label = "WhatsApp soporte 24/7",
}: {
  variant?: "button" | "link" | "outline";
  className?: string;
  label?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-bold transition hover:scale-[1.02]";

  const styles =
    variant === "button"
      ? "px-8 py-5 rounded-full text-white text-lg shadow-xl"
      : variant === "outline"
        ? "px-6 py-3 rounded-full border-2 text-base"
        : "text-base gap-1.5";

  const colorStyle =
    variant === "button"
      ? { background: "#25D366" }
      : variant === "outline"
        ? { borderColor: "#25D366", color: "#128C7E" }
        : { color: "#128C7E" };

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className ?? ""}`}
      style={colorStyle}
    >
      <MessageCircle className="w-5 h-5" fill={variant === "button" ? "white" : "#25D366"} />
      {label}
    </a>
  );
}
