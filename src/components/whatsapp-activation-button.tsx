import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "ss_whatsapp_activated";

interface Props {
  className?: string;
  fullWidth?: boolean;
}

/**
 * Botón reutilizable para acceder a /activar-whatsapp.
 * Muestra estado activado si localStorage indica que el usuario ya completó el paso.
 * Diseño grande y simple para adultos mayores.
 */
export function WhatsAppActivationButton({ className = "", fullWidth = true }: Props) {
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setActivated(true);
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setActivated(e.newValue === "1");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const base =
    "inline-flex items-center justify-center gap-3 rounded-2xl text-lg sm:text-xl font-bold shadow-lg hover:scale-[1.02] active:scale-100 transition px-6 py-4";
  const width = fullWidth ? "w-full" : "";

  if (activated) {
    return (
      <Link
        to="/activar-whatsapp"
        aria-label="WhatsApp ya activado — revisar configuración"
        className={`${base} ${width} ${className} text-white`}
        style={{ background: "#16a34a", minHeight: 64 }}
      >
        <CheckCircle2 className="w-7 h-7" />
        ✅ WhatsApp activado
      </Link>
    );
  }

  return (
    <Link
      to="/activar-whatsapp"
      aria-label="Activar alertas por WhatsApp"
      className={`${base} ${width} ${className} text-white`}
      style={{ background: "#25D366", minHeight: 64 }}
    >
      <MessageCircle className="w-7 h-7" fill="white" />
      📲 Activar WhatsApp
    </Link>
  );
}
