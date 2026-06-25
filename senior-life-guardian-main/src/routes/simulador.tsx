import { createFileRoute, Link } from "@tanstack/react-router";
import { EmergencySimulator } from "@/components/sales-demo/emergency-simulator";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/simulador")({
  head: () => ({
    meta: [
      { title: "Simulador S.O.S — Senior Safe Chile" },
      {
        name: "description",
        content:
          "Demostración interactiva del botón de pánico y panel de envíos de Senior Safe. Sin conexión real.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SimuladorPage,
});

function SimuladorPage() {
  return (
    <>
      <Link
        to="/"
        className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/90 px-3 py-2 text-xs text-slate-300 backdrop-blur hover:text-white hover:bg-slate-800 shadow-lg"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al sitio
      </Link>
      <EmergencySimulator />
    </>
  );
}
