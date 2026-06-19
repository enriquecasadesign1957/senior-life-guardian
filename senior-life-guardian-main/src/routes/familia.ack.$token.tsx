import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { buildLegacyAckAlertUrl } from "@/lib/ack-alert";

/** Enlaces antiguos /familia/ack/... redirigen a la API pública GET (fiable desde SMS). */
export const Route = createFileRoute("/familia/ack/$token")({
  head: () => ({
    meta: [
      { title: "Confirmar alerta recibida — Senior Safe" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AckRedirectPage,
});

function AckRedirectPage() {
  const { token } = Route.useParams();

  useEffect(() => {
    window.location.replace(buildLegacyAckAlertUrl(token));
  }, [token]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Confirmando alerta…</p>
    </div>
  );
}
