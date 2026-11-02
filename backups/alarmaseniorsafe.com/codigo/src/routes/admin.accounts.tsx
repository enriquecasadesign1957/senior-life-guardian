import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Loader2, Search, Gift, Ban } from "lucide-react";
import { AdminPinGate } from "@/components/admin-pin-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  adminGrantFreeService,
  adminLookupAccount,
  adminRevokeFreeService,
} from "@/lib/admin-comp.functions";

export const Route = createFileRoute("/admin/accounts")({
  component: AdminAccountsPage,
  head: () => ({ meta: [{ title: "Admin · Gratuidad — Senior Safe" }] }),
});

type AccountRow = {
  id: string;
  nombre: string;
  email: string;
  payment_status: string;
  subscription_status: string;
  renewal_date: string | null;
  comp_reason: string | null;
  comp_granted_at: string | null;
  comp_granted_by: string | null;
  periodo: string;
  discount_code: string | null;
};

function AdminAccountsPage() {
  return (
    <AdminPinGate
      title="Gratuidad / cortesía"
      description="Activa Senior Safe sin cobro. Se envían automáticamente correo y WhatsApp/SMS con el enlace de instalación."
      onUnlockFailed={(m) => toast.error(m)}
    >
      {(pin) => <AdminAccountsInner pin={pin} />}
    </AdminPinGate>
  );
}

function AdminAccountsInner({ pin }: { pin: string }) {
  const lookup = useServerFn(adminLookupAccount);
  const grant = useServerFn(adminGrantFreeService);
  const revoke = useServerFn(adminRevokeFreeService);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<AccountRow | null>(null);
  const [reason, setReason] = useState("");
  const [grantedBy, setGrantedBy] = useState("");
  const [durationMonths, setDurationMonths] = useState("12");
  const [unlimited, setUnlimited] = useState(false);
  const [acting, setActing] = useState(false);

  const search = async () => {
    if (!email.trim()) return toast.error("Ingresa un email");
    setLoading(true);
    try {
      const res = await lookup({ data: { pin, email: email.trim() } });
      if (!res.ok) {
        setAccount(null);
        toast.error(res.message);
        return;
      }
      setAccount(res.account as AccountRow);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al buscar");
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const grantFree = async () => {
    if (!account) return;
    if (reason.trim().length < 3) return toast.error("Indica un motivo (mín. 3 caracteres)");
    setActing(true);
    try {
      const res = await grant({
        data: {
          pin,
          signupId: account.id,
          reason: reason.trim(),
          grantedBy: grantedBy.trim() || undefined,
          durationMonths: unlimited ? null : Number(durationMonths) || 12,
        },
      });
      toast.success(res.message, { duration: 8000 });
      await search();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo otorgar");
    } finally {
      setActing(false);
    }
  };

  const revokeFree = async () => {
    if (!account) return;
    setActing(true);
    try {
      const res = await revoke({
        data: { pin, signupId: account.id, reason: "Revocado desde panel admin" },
      });
      toast.success(res.message);
      await search();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo revocar");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/admin" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Gratuidad / cortesía</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <section className="p-5 rounded-2xl border bg-card space-y-3">
          <Label htmlFor="email">Buscar cuenta por email</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void search()}
            />
            <Button type="button" onClick={() => void search()} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </section>

        {account && (
          <>
            <section className="p-5 rounded-2xl border bg-card space-y-2 text-sm">
              <div className="font-bold text-lg">{account.nombre}</div>
              <div className="text-muted-foreground">{account.email}</div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Stat label="Pago" value={account.payment_status} />
                <Stat label="Suscripción" value={account.subscription_status} />
                <Stat label="Periodo" value={account.periodo} />
                <Stat
                  label="Renovación"
                  value={
                    account.renewal_date
                      ? new Date(account.renewal_date).toLocaleDateString("es-CL")
                      : "—"
                  }
                />
              </div>
              {account.payment_status === "comp" && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                  <strong>Cortesía activa.</strong>
                  {account.comp_reason && <div className="mt-1">{account.comp_reason}</div>}
                  {account.comp_granted_at && (
                    <div className="mt-1 opacity-80">
                      Desde {new Date(account.comp_granted_at).toLocaleString("es-CL")}
                      {account.comp_granted_by ? ` · ${account.comp_granted_by}` : ""}
                    </div>
                  )}
                </div>
              )}
              {account.discount_code && (
                <div className="text-xs text-muted-foreground">Descuento checkout: {account.discount_code}</div>
              )}
            </section>

            {account.payment_status !== "comp" ? (
              <section className="p-5 rounded-2xl border bg-card space-y-4">
                <h2 className="font-bold flex items-center gap-2">
                  <Gift className="w-4 h-4" /> Otorgar gratuidad
                </h2>
                <div>
                  <Label htmlFor="reason">Motivo</Label>
                  <Input
                    id="reason"
                    placeholder="Convenio municipal Maipú, beca social, cortesía soporte…"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="by">Otorgado por (opcional)</Label>
                  <Input
                    id="by"
                    placeholder="Tu nombre o equipo"
                    value={grantedBy}
                    onChange={(e) => setGrantedBy(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} />
                    Sin fecha de término
                  </label>
                  {!unlimited && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor="months" className="sr-only">
                        Meses
                      </Label>
                      <Input
                        id="months"
                        type="number"
                        min={1}
                        max={120}
                        className="w-24"
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground">meses</span>
                    </div>
                  )}
                </div>
                <Button type="button" className="w-full" disabled={acting} onClick={() => void grantFree()}>
                  {acting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Activar servicio gratuito
                </Button>
              </section>
            ) : (
              <Button type="button" variant="destructive" disabled={acting} onClick={() => void revokeFree()}>
                <Ban className="w-4 h-4 mr-2" />
                Revocar cortesía
              </Button>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-muted/50">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold capitalize">{value}</div>
    </div>
  );
}
