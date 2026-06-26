import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { resetTestData, resetMyAccountData } from "@/lib/admin-reset.functions";
import { AdminPinGate } from "@/components/admin-pin-gate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reset")({
  component: AdminResetPage,
  head: () => ({ meta: [{ title: "Admin · Reset datos de prueba" }] }),
});

function AdminResetPage() {
  return (
    <AdminPinGate
      title="Reset de datos"
      description="Operaciones destructivas de prueba. Requiere PIN de administración."
      onUnlockFailed={(m) => toast.error(m)}
    >
      {(pin) => <AdminResetInner pin={pin} />}
    </AdminPinGate>
  );
}

function AdminResetInner({ pin }: { pin: string }) {
  const reset = useServerFn(resetTestData);
  const resetMine = useServerFn(resetMyAccountData);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ deleted: number; emails: string[]; message: string } | null>(null);
  const [myEmail, setMyEmail] = useState("");
  const [myConfirm, setMyConfirm] = useState("");
  const [myLoading, setMyLoading] = useState(false);
  const [myResult, setMyResult] = useState<any>(null);

  const handleResetMine = async () => {
    if (myConfirm !== "RESET") return toast.error("Escribe RESET para confirmar");
    if (!myEmail.trim()) return toast.error("Ingresa tu email");
    setMyLoading(true);
    try {
      const res = await resetMine({ data: { confirm: "RESET", email: myEmail.trim(), pin } });
      setMyResult(res);
      if (res.ok) {
        // limpiar sesión local del mismo navegador
        try {
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith("seniorsafe") || k.startsWith("ss_")) localStorage.removeItem(k);
          });
          Object.keys(sessionStorage).forEach((k) => {
            if (k.startsWith("seniorsafe") || k.startsWith("ss_")) sessionStorage.removeItem(k);
          });
        } catch {}
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Error al resetear cuenta");
    } finally {
      setMyLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm !== "RESET") {
      toast.error("Escribe RESET para confirmar");
      return;
    }
    setLoading(true);
    try {
      const res = await reset({ data: { confirm: "RESET", pin } });
      setResult(res);
      toast.success(res.message);
    } catch (e: any) {
      toast.error(e?.message ?? "Error al resetear");
    } finally {
      setLoading(false);
    }
  };

  const clearLocalSession = () => {
    try {
      const keysToClear = [
        "seniorsafe_user",
        "seniorsafe_onboarding",
        "seniorsafe_contacts",
        "seniorsafe_pin",
        "seniorsafe_trial",
        "seniorsafe_purchase",
      ];
      keysToClear.forEach((k) => {
        sessionStorage.removeItem(k);
        localStorage.removeItem(k);
      });
      // Limpiar cualquier clave que empiece con seniorsafe_
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith("seniorsafe")) sessionStorage.removeItem(k);
      });
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("seniorsafe")) localStorage.removeItem(k);
      });
      toast.success("Sesión local limpiada");
    } catch {
      toast.error("No pudimos limpiar la sesión local");
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reset datos de prueba</h1>
          <p className="text-muted-foreground mt-2">
            Elimina signups en modo trial y datos asociados (contactos, PINs, transacciones no autorizadas).
            <br />
            <strong className="text-foreground">No toca</strong> cuentas pagadas ni suscripciones activas.
          </p>
        </div>

        <Card className="p-6 space-y-4 border-primary/40">
          <div>
            <h2 className="font-semibold text-foreground mb-2">🔁 Resetear SOLO mi cuenta (para repetir pruebas)</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Borra <strong>familiares, PIN y alertas</strong> de tu cuenta, y reinicia el onboarding y la activación de WhatsApp.
              <br />
              <strong className="text-foreground">No toca</strong> pagos, Webpay, otras cuentas ni configuraciones.
            </p>
            <Input
              type="email"
              value={myEmail}
              onChange={(e) => setMyEmail(e.target.value)}
              placeholder="tu-email@ejemplo.com"
              className="mb-3"
            />
            <Input
              value={myConfirm}
              onChange={(e) => setMyConfirm(e.target.value)}
              placeholder='Escribe "RESET" para confirmar'
              className="mb-3"
            />
            <Button
              onClick={handleResetMine}
              disabled={myLoading || myConfirm !== "RESET" || !myEmail.trim()}
              className="w-full"
            >
              {myLoading ? "Reseteando…" : "Resetear mi cuenta"}
            </Button>
          </div>

          {myResult && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-sm space-y-1">
              <p className="font-medium">{myResult.message}</p>
              {myResult.ok && (
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Familiares eliminados: {myResult.contactsDeleted}</li>
                  <li>PIN eliminado: {myResult.pinsDeleted}</li>
                  <li>Alertas eliminadas: {myResult.alertsDeleted}</li>
                  <li>Onboarding y WhatsApp reiniciados</li>
                </ul>
              )}
            </div>
          )}
        </Card>


        <Card className="p-6 space-y-4 border-destructive/30">
          <div>
            <h2 className="font-semibold text-foreground mb-2">⚠️ Eliminar datos de prueba en backend</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Escribe <code className="px-2 py-1 bg-muted rounded">RESET</code> para confirmar.
            </p>
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="RESET"
              className="mb-3"
            />
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={loading || confirm !== "RESET"}
              className="w-full"
            >
              {loading ? "Eliminando…" : "Eliminar datos de prueba"}
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
              <p className="font-medium">{result.message}</p>
              {result.emails.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                  {result.emails.map((e) => <li key={e}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-3">
          <h2 className="font-semibold text-foreground">Limpiar sesión local (navegador)</h2>
          <p className="text-sm text-muted-foreground">
            Borra <code>sessionStorage</code> y <code>localStorage</code> relacionados al onboarding
            para reiniciar el flujo desde cero en este dispositivo.
          </p>
          <Button variant="outline" onClick={clearLocalSession} className="w-full">
            Limpiar sesión local
          </Button>
        </Card>

        <Card className="p-6 space-y-3">
          <h2 className="font-semibold text-foreground">Reiniciar onboarding</h2>
          <p className="text-sm text-muted-foreground">
            Después de limpiar, ve al inicio para comenzar un onboarding nuevo.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="default" className="flex-1">
              <Link to="/">Ir al inicio</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/planes">Ver planes</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
