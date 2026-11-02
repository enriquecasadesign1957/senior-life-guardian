import { useEffect, useState } from "react";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import {
  WHATSAPP_ACTIVATED_EVENT,
  WHATSAPP_ACTIVATED_STORAGE_KEY,
  isWhatsAppActivatedLocally,
} from "@/lib/whatsapp-activation-local";
import { whatsAppActivarUrl } from "@/lib/whatsapp-commercial-activation";

interface Props {
  className?: string;
  fullWidth?: boolean;
  /** Si true, no muestra nada cuando ya está vinculado (flujo auto en 1.ª pulsación S.O.S). */
  hideWhenActivated?: boolean;
}

/**
 * Enlace a WhatsApp comercial (+56 9 7140 4580) con ACTIVAR prellenado.
 * Tras la 1.ª pulsación S.O.S se oculta automáticamente.
 */
export function WhatsAppActivationButton({
  className = "",
  fullWidth = true,
  hideWhenActivated = true,
}: Props) {
  const [activated, setActivated] = useState(() => isWhatsAppActivatedLocally());

  useEffect(() => {
    const sync = () => setActivated(isWhatsAppActivatedLocally());
    sync();
    window.addEventListener(WHATSAPP_ACTIVATED_EVENT, sync);
    const onStorage = (e: StorageEvent) => {
      if (e.key === WHATSAPP_ACTIVATED_STORAGE_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(WHATSAPP_ACTIVATED_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (activated && hideWhenActivated) return null;

  const base =
    "inline-flex items-center justify-center gap-3 rounded-2xl text-lg sm:text-xl font-bold shadow-lg hover:scale-[1.02] active:scale-100 transition px-6 py-4";
  const width = fullWidth ? "w-full" : "";

  if (activated) {
    return (
      <a
        href={whatsAppActivarUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ya activado — revisar en WhatsApp"
        className={`${base} ${width} ${className} text-white`}
        style={{ background: "#16a34a", minHeight: 64 }}
      >
        <CheckCircle2 className="w-7 h-7" />
        ✅ WhatsApp activado
      </a>
    );
  }

  return (
    <a
      href={whatsAppActivarUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Vincular WhatsApp con Senior Safe"
      className={`${base} ${width} ${className} text-white`}
      style={{ background: "#25D366", minHeight: 64 }}
    >
      <MessageCircle className="w-7 h-7" fill="white" />
      📲 Vincular WhatsApp
    </a>
  );
}
