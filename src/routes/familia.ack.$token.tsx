import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ackAlertByToken } from "@/lib/family-portal.functions";

export const Route = createFileRoute("/familia/ack/$token")({
  head: () => ({
    meta: [
      { title: "Confirmar alerta recibida — Senior Safe" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AckPage,
});

function AckPage() {
  const { token } = useParams({ from: "/familia/ack/$token" });
  const ack = useServerFn(ackAlertByToken);
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [nombre, setNombre] = useState("");
  const [msg, setMsg] = useState("");

  // Auto-confirma al cargar para no requerir clicks adicionales (link único).
  useEffect(() => {
    let alive = true;
    setState("sending");
    ack({ data: { token } })
      .then((r) => { if (alive) { setState("ok"); if (r.already) setMsg("Esta alerta ya había sido confirmada."); } })
      .catch((e) => { if (alive) { setState("err"); setMsg(e?.message ?? "Link inválido o expirado."); } });
    return () => { alive = false; };
  }, [token, ack]);

  const handleAddName = async () => {
    if (!nombre.trim()) return;
    setState("sending");
    try {
      await ack({ data: { token, nombre: nombre.trim() } });
      setState("ok");
      setMsg("");
    } catch (e: any) {
      setState("err"); setMsg(e?.message ?? "No se pudo guardar tu nombre.");
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
        {state === "sending" && <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />}
        {state === "ok" && (
          <>
            <CheckCircle2 className="w-20 h-20 mx-auto text-green-600 mb-3" />
            <h1 className="text-2xl font-bold mb-2">Alerta confirmada</h1>
            <p className="text-muted-foreground mb-4">Gracias. Le avisaremos al senior que ya viste la alerta.</p>
            {msg && <p className="text-sm text-amber-700 mb-3">{msg}</p>}
            <div className="text-left space-y-2">
              <Label htmlFor="n">¿Cómo te llamas? (opcional)</Label>
              <Input id="n" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Para que sepa quién confirmó" />
              <Button onClick={handleAddName} className="w-full" disabled={!nombre.trim()}>Guardar mi nombre</Button>
            </div>
            <Link to="/familia" search={{ redirect: undefined }} className="block mt-4 text-sm text-primary underline">Ir al portal familia</Link>
          </>
        )}
        {state === "err" && (
          <>
            <XCircle className="w-20 h-20 mx-auto text-red-600 mb-3" />
            <h1 className="text-2xl font-bold mb-2">No se pudo confirmar</h1>
            <p className="text-muted-foreground">{msg}</p>
            <Link to="/familia" search={{ redirect: undefined }} className="block mt-4 text-sm text-primary underline">Ir al portal familia</Link>
          </>
        )}
      </div>
    </div>
  );
}
