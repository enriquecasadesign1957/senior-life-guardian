import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  authorizeOneclickApprovedValidation,
  authorizeOneclickRenewal,
  authorizeOneclickTenMillionRejectValidation,
  getOneclickValidationInfo,
  lookupOneclickSignup,
  refundOneclickPayment,
  removeOneclickInscription,
  statusOneclickPayment,
} from "@/lib/oneclick.functions";
import { AdminPinGate } from "@/components/admin-pin-gate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/transbank-validacion")({
  component: TransbankValidationPage,
  head: () => ({ meta: [{ title: "Admin · Validación Transbank Oneclick" }] }),
});

type SignupRow = {
  id: string;
  nombre: string;
  email: string;
  payment_status: string;
  subscription_status: string;
  oneclick_username: string | null;
  oneclick_tbk_user: string | null;
  oneclick_inscription_status: string | null;
  oneclick_mall_buy_order: string | null;
  oneclick_store_buy_order: string | null;
  oneclick_card_last4: string | null;
  webpay_amount: number | null;
  webpay_authorization_code: string | null;
  renewal_date: string | null;
  created_at: string;
};

function TransbankValidationPage() {
  return (
    <AdminPinGate
      title="Validación Transbank"
      description="Panel interno Oneclick Mall. Requiere PIN de administración."
      onUnlockFailed={(m) => toast.error(m)}
    >
      {(pin) => <TransbankValidationInner pin={pin} />}
    </AdminPinGate>
  );
}

function TransbankValidationInner({ pin }: { pin: string }) {
  const loadInfo = useServerFn(getOneclickValidationInfo);
  const lookup = useServerFn(lookupOneclickSignup);
  const authorize = useServerFn(authorizeOneclickRenewal);
  const statusFn = useServerFn(statusOneclickPayment);
  const refundFn = useServerFn(refundOneclickPayment);
  const removeFn = useServerFn(removeOneclickInscription);
  const rejectTenMFn = useServerFn(authorizeOneclickTenMillionRejectValidation);
  const approveAuthFn = useServerFn(authorizeOneclickApprovedValidation);

  const [info, setInfo] = useState<Awaited<ReturnType<typeof loadInfo>> | null>(null);
  const [email, setEmail] = useState("");
  const [signupId, setSignupId] = useState("");
  const [rows, setRows] = useState<SignupRow[]>([]);
  const [selected, setSelected] = useState<SignupRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string>("");
  const [rejectBuyOrder, setRejectBuyOrder] = useState<string | null>(null);
  const [rejectMeta, setRejectMeta] = useState<string>("");
  const [approveBuyOrder, setApproveBuyOrder] = useState<string | null>(null);
  const [approveMeta, setApproveMeta] = useState<string>("");

  useEffect(() => {
    loadInfo({ data: { pin } }).then(setInfo).catch(() => {});
  }, [loadInfo, pin]);

  const handleLookup = async () => {
    setLoading(true);
    try {
      const res = await lookup({
        data: {
          email: email.trim() || undefined,
          signupId: signupId.trim() || undefined,
          pin,
        },
      });
      setRows((res.rows ?? []) as SignupRow[]);
      setSelected(((res.rows ?? [])[0] as SignupRow | undefined) ?? null);
      if (!res.rows?.length) toast.message("Sin resultados Oneclick para ese criterio.");
    } catch (e) {
      toast.error((e as Error)?.message ?? "Error al buscar");
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (key: string, fn: () => Promise<unknown>) => {
    setActionBusy(key);
    try {
      const res = await fn();
      setLastResult(JSON.stringify(res, null, 2));
      toast.success("Operación completada — revisa el resultado abajo.");
      await handleLookup();
    } catch (e) {
      setLastResult(String((e as Error)?.message ?? e));
      toast.error((e as Error)?.message ?? "Error en la operación");
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Validación Transbank · Oneclick Mall</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Panel interno para ejecutar casos de prueba antes de enviar evidencias a Transbank.
          </p>
        </div>
        <Link to="/admin/reset" className="text-sm underline text-muted-foreground">
          Admin reset
        </Link>
      </div>

      {info && (
        <Card className="p-5 space-y-3">
          <div className="text-sm grid sm:grid-cols-2 gap-2">
            <div>
              <strong>Ambiente:</strong> {info.environment}
            </div>
            <div>
              <strong>Oneclick habilitado:</strong> {info.enabled ? "Sí" : "No"}
            </div>
            <div>
              <strong>Código Mall:</strong> {info.mallCommerceCode || "—"}
            </div>
            <div>
              <strong>Código tienda:</strong> {info.storeCommerceCode || "—"}
            </div>
            <div className="sm:col-span-2">
              <strong>URL retorno inscripción:</strong> {info.returnUrl}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Para validación usa ambiente <strong>integración</strong> (
            <code>TRANSBANK_ENVIRONMENT=sandbox</code>) y{" "}
            <code>TRANSBANK_PAYMENT_MODE=oneclick_mall</code> con tus códigos Mall + tienda.
          </p>
          <a
            href={info.formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold underline"
          >
            Formulario de validación Transbank →
          </a>
        </Card>
      )}

      <Card className="p-5 space-y-4 border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20">
        <div>
          <h2 className="font-semibold text-lg">Prueba rápida · Cobro aprobado (crédito, $6.900)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Caso Transbank: authorize aprobado con tarjeta de crédito inscrita, 1 cuota, monto $6.900
            usando <strong>enriquecasadesign@gmail.com</strong>.
          </p>
        </div>
        <Button
          size="lg"
          className="w-full sm:w-auto"
          disabled={actionBusy !== null}
          onClick={() =>
            runAction("approve-auth", async () => {
              const res = await approveAuthFn({ data: { pin } });
              setApproveBuyOrder(res.mallBuyOrder);
              setApproveMeta(
                `auth: ${res.authorizationCode ?? "—"} · response_code: ${res.responseCode ?? "—"} · status: ${res.status ?? "—"} · store: ${res.storeBuyOrder}`,
              );
              return res;
            })
          }
        >
          {actionBusy === "approve-auth" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Ejecutando authorize…
            </>
          ) : (
            "Ejecutar cobro aprobado ($6.900)"
          )}
        </Button>
        {approveBuyOrder && (
          <div className="rounded-xl border-2 border-emerald-600 bg-background p-6 text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              buy_order PADRE — pegar en el formulario Transbank
            </p>
            <p className="text-3xl md:text-4xl font-mono font-bold tracking-wide break-all text-emerald-700 dark:text-emerald-400">
              {approveBuyOrder}
            </p>
            {approveMeta && <p className="text-xs font-mono text-muted-foreground">{approveMeta}</p>}
          </div>
        )}
      </Card>

      <Card className="p-5 space-y-4 border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/20">
        <div>
          <h2 className="font-semibold text-lg">Prueba rápida · Cobro rechazado $10.000.000</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Caso Transbank: authorize con monto $10.000.000 usando la última inscripción activa de{" "}
            <strong>enriquecasadesign@gmail.com</strong>. No modifica el checkout ni cobra de verdad.
          </p>
        </div>
        <Button
          size="lg"
          className="w-full sm:w-auto"
          disabled={actionBusy !== null}
          onClick={() =>
            runAction("reject-10m", async () => {
              const res = await rejectTenMFn({ data: { pin } });
              setRejectBuyOrder(res.mallBuyOrder);
              setRejectMeta(
                `response_code: ${res.responseCode ?? "—"} · status: ${res.status ?? "—"} · store: ${res.storeBuyOrder}`,
              );
              return res;
            })
          }
        >
          {actionBusy === "reject-10m" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Ejecutando authorize…
            </>
          ) : (
            "Ejecutar cobro rechazado ($10.000.000)"
          )}
        </Button>
        {rejectBuyOrder && (
          <div className="rounded-xl border-2 border-amber-600 bg-background p-6 text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              buy_order PADRE — pegar en el formulario Transbank
            </p>
            <p className="text-3xl md:text-4xl font-mono font-bold tracking-wide break-all text-amber-700 dark:text-amber-400">
              {rejectBuyOrder}
            </p>
            {rejectMeta && <p className="text-xs font-mono text-muted-foreground">{rejectMeta}</p>}
          </div>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="font-semibold">Tarjetas de prueba (integración)</h2>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>
            <strong>Crédito aprobada (Visa):</strong> {info?.testCards.approvedVisa} · CVV{" "}
            {info?.testCards.cvv}
          </li>
          <li>
            <strong>Crédito aprobada (Amex):</strong> {info?.testCards.approvedAmex} · CVV{" "}
            {info?.testCards.amexCvv}
          </li>
          <li>
            <strong>Crédito rechazada (Mastercard):</strong>{" "}
            {info?.testCards.rejectedCreditMastercard} · CVV {info?.testCards.cvv}
          </li>
          <li>
            <strong>Redcompra rechazada:</strong> {info?.testCards.rejectedRedcompra}
          </li>
          <li>
            <strong>RUT/clave Webpay:</strong> {info?.testCards.rut} / {info?.testCards.password}
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Oneclick Mall integración: Mall {info?.integrationCredentials.oneclickMallCode} · Tienda{" "}
          {info?.integrationCredentials.oneclickStoreCode}
        </p>
        <ol className="text-sm list-decimal pl-5 space-y-1">
          {(info?.validationCases ?? []).map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="font-semibold">Buscar contratación Oneclick</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            placeholder="Signup UUID (opcional)"
            value={signupId}
            onChange={(e) => setSignupId(e.target.value)}
          />
        </div>
        <Button onClick={handleLookup} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Buscar
        </Button>

        {rows.length > 0 && (
          <div className="space-y-2">
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelected(row)}
                className={`w-full text-left p-3 rounded-xl border text-sm ${
                  selected?.id === row.id ? "border-foreground bg-muted/40" : "border-border"
                }`}
              >
                <div className="font-semibold">{row.nombre}</div>
                <div className="text-muted-foreground">{row.email}</div>
                <div>
                  Mall BO: {row.oneclick_mall_buy_order ?? "—"} · Estado: {row.payment_status}
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {selected && (
        <Card className="p-5 space-y-4">
          <h2 className="font-semibold">Operaciones de validación</h2>
          <div className="text-xs font-mono bg-muted/50 p-3 rounded-lg overflow-x-auto">
            signupId: {selected.id}
            {"\n"}tbk_user: {selected.oneclick_tbk_user ?? "—"}
            {"\n"}mall_buy_order: {selected.oneclick_mall_buy_order ?? "—"}
            {"\n"}store_buy_order: {selected.oneclick_store_buy_order ?? "—"}
            {"\n"}monto: {selected.webpay_amount ?? "—"}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!selected.oneclick_tbk_user || actionBusy !== null}
              onClick={() =>
                runAction("authorize", () => authorize({ data: { signupId: selected.id, pin } }))
              }
            >
              {actionBusy === "authorize" ? "…" : "Cobrar (authorize)"}
            </Button>
            <Button
              variant="outline"
              disabled={!selected.oneclick_mall_buy_order || actionBusy !== null}
              onClick={() =>
                runAction("status", () =>
                  statusFn({ data: { mallBuyOrder: selected.oneclick_mall_buy_order!, pin } }),
                )
              }
            >
              {actionBusy === "status" ? "…" : "Consultar estado"}
            </Button>
            <Button
              variant="outline"
              disabled={
                !selected.oneclick_mall_buy_order ||
                !selected.oneclick_store_buy_order ||
                !selected.webpay_amount ||
                actionBusy !== null
              }
              onClick={() =>
                runAction("refund", () =>
                  refundFn({
                    data: {
                      mallBuyOrder: selected.oneclick_mall_buy_order!,
                      storeBuyOrder: selected.oneclick_store_buy_order!,
                      amount: selected.webpay_amount!,
                      pin,
                    },
                  }),
                )
              }
            >
              {actionBusy === "refund" ? "…" : "Anular (refund)"}
            </Button>
            <Button
              variant="destructive"
              disabled={!selected.oneclick_tbk_user || actionBusy !== null}
              onClick={() =>
                runAction("remove", () => removeFn({ data: { signupId: selected.id, pin } }))
              }
            >
              {actionBusy === "remove" ? "…" : "Eliminar inscripción"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Caso 1–3: haz checkout en{" "}
            <Link to="/checkout" className="underline">
              /checkout
            </Link>{" "}
            con tarjetas de prueba. Casos 4–6: usa los botones de arriba y copia las órdenes de
            compra al formulario Transbank.
          </p>
        </Card>
      )}

      {lastResult && (
        <Card className="p-5">
          <h2 className="font-semibold mb-2">Último resultado (evidencia)</h2>
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-muted/40 p-3 rounded-lg">
            {lastResult}
          </pre>
        </Card>
      )}
    </div>
  );
}
