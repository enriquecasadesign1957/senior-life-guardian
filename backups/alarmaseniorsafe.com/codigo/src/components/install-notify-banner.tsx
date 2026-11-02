import { Mail, MessageCircle } from "lucide-react";
import type { PostPaymentInstallNotifyResult } from "@/lib/post-payment-install-notify";

const GREEN = "#16a34a";

export function InstallNotifyBanner({
  notify,
}: {
  notify?: PostPaymentInstallNotifyResult | null;
}) {
  if (!notify?.sent) return null;

  return (
    <div
      className="rounded-2xl border p-4 text-sm space-y-2"
      style={{
        borderColor: "color-mix(in oklab, #16a34a 35%, white)",
        background: "color-mix(in oklab, #16a34a 8%, white)",
      }}
      role="status"
    >
      <p className="font-bold text-foreground flex items-center gap-2">
        <Mail className="w-4 h-4" style={{ color: GREEN }} />
        Enlace enviado al titular de la cuenta
      </p>
      <p className="text-muted-foreground leading-relaxed">
        {notify.emailSent && (
          <>
            Enviamos las instrucciones de instalación a{" "}
            <strong className="text-foreground">{notify.email}</strong>.
            {" "}
          </>
        )}
        {(notify.whatsappSent || notify.smsSent) && notify.telefonoMasked && (
          <>
            También al WhatsApp/teléfono{" "}
            <strong className="text-foreground">{notify.telefonoMasked}</strong>.
            {" "}
          </>
        )}
        Si pagaste por otra persona, ella puede instalar la app cuando tenga su celular — no
        necesita estar presente al momento del pago.
      </p>
      {(notify.whatsappSent || notify.smsSent) && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5 shrink-0" style={{ color: GREEN }} />
          Revisa también spam o solicitudes de mensajes desconocidos en el teléfono.
        </p>
      )}
    </div>
  );
}
