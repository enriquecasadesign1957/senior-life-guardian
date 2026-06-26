import { Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { whatsAppAnyReplyUrl } from "@/lib/whatsapp-commercial-activation";
import { SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164 } from "@/lib/twilio";

type Props = {
  className?: string;
  /** Texto más corto para pantallas con poco espacio */
  compact?: boolean;
};

/**
 * CTA post-pago: abre WhatsApp; cualquier respuesta del titular pagado activa alertas.
 */
export function WhatsAppActivarCta({ className = "", compact = false }: Props) {
  const waUrl = whatsAppAnyReplyUrl();
  const digits = SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164.replace(/\D/g, "");
  const displayNumber = digits.startsWith("569")
    ? `+56 9 ${digits.slice(3, 7)} ${digits.slice(7)}`
    : `+${digits}`;

  const copyHint = async () => {
    try {
      await navigator.clipboard.writeText("Hola");
      toast.success("Copiado: Hola");
    } catch {
      toast.error("Escribe Hola, Sí u OK en WhatsApp");
    }
  };

  return (
    <section
      className={`rounded-3xl border-2 p-5 md:p-6 space-y-4 shadow-lg ${className}`}
      style={{
        borderColor: "#25D366",
        background: "linear-gradient(180deg, #ffffff 0%, color-mix(in oklab, #25D366 8%, white) 100%)",
      }}
      aria-label="Activar WhatsApp con Senior Safe"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
          style={{ background: "#25D366" }}
        >
          <MessageCircle className="w-6 h-6" fill="white" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-foreground leading-tight">
            {compact ? "Vincular WhatsApp" : "Paso 2: Vincular WhatsApp"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Responde con Sí, Hola, OK o cualquier mensaje.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border-2 border-border px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-base md:text-lg font-semibold text-foreground leading-snug">
          Cualquier respuesta activa tu cuenta
        </span>
        <Button variant="outline" size="sm" onClick={copyHint} className="shrink-0">
          <Copy className="w-4 h-4 mr-1" />
          Ejemplo
        </Button>
      </div>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-white text-lg font-bold shadow-xl hover:opacity-95 transition"
        style={{ background: "#25D366", minHeight: 56 }}
      >
        <MessageCircle className="w-6 h-6" fill="white" />
        Abrir WhatsApp
      </a>

      {!compact && (
        <p className="text-xs text-center text-muted-foreground">
          Se abrirá WhatsApp al {displayNumber}. Envía el mensaje y listo — no hace falta escribir ACTIVAR.
        </p>
      )}
    </section>
  );
}
