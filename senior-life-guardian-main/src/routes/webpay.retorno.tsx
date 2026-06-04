import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, MessageCircle } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { confirmWebpayTransaction, mockApproveWebpay } from "@/lib/webpay.functions";
import { markRequiresPwaInstall } from "@/lib/post-payment";
import { PostPaymentInstallScreen } from "@/components/post-payment-install-screen";

type SearchParams = {
  token_ws?: string;
  TBK_TOKEN?: string;
  TBK_ORDEN_COMPRA?: string;
  TBK_ID_SESION?: string;
};

/** Imprime token_ws en la terminal del servidor (dev) para el formulario de validación Transbank. */
function logTransbankTestToken(token_ws: string | undefined | null) {
  if (!token_ws) return;
  console.log("\n===== TOKEN TRANSBANK DE PRUEBA =====\n", token_ws, "\n====================================\n");
}

export const Route = createFileRoute("/webpay/retorno")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    token_ws: typeof s.token_ws === "string" ? s.token_ws : undefined,
    TBK_TOKEN: typeof s.TBK_TOKEN === "string" ? s.TBK_TOKEN : undefined,
    TBK_ORDEN_COMPRA: typeof s.TBK_ORDEN_COMPRA === "string" ? s.TBK_ORDEN_COMPRA : undefined,
    TBK_ID_SESION: typeof s.TBK_ID_SESION === "string" ? s.TBK_ID_SESION : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Confirmando pago — Senior Safe" },
      { name: "robots", content: "noindex" },
    ],
  }),
  server: {
    handlers: {
      // Webpay vuelve por POST form-encoded. Convertimos a GET con query.
      POST: async ({ request }) => {
        const form = await request.formData();
        const params = new URLSearchParams();
        for (const [k, v] of form.entries()) {
          if (typeof v === "string") params.set(k, v);
        }
        logTransbankTestToken(params.get("token_ws"));
        const url = new URL(request.url);
        url.search = params.toString();
        return new Response(null, {
          status: 303,
          headers: { Location: url.pathname + "?" + params.toString() },
        });
      },
    },
  },
  component: WebpayReturnPage,
});

const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";

function WebpayReturnPage() {
  const search = Route.useSearch();
  const confirm = useServerFn(confirmWebpayTransaction);

  const [state, setState] = useState<"loading" | "success" | "failed" | "cancelled">("loading");
  const [info, setInfo] = useState<{
    amount?: number | null;
    authorizationCode?: string | null;
    buyOrder?: string | null;
    cardLast4?: string | null;
  }>({});
  const [mockBusy, setMockBusy] = useState(false);
  const mockApprove = useServerFn(mockApproveWebpay);

  const handleMockApprove = async () => {
    setMockBusy(true);
    try {
      let signupId: string | undefined;
      try {
        const raw = sessionStorage.getItem("seniorsafe_user");
        if (raw) signupId = JSON.parse(raw)?.id;
      } catch { /* ignore */ }
      const r = await mockApprove({ data: { token: search.token_ws, signupId } });
      setInfo({ authorizationCode: r.authorizationCode, buyOrder: r.buyOrder, cardLast4: "6623" });
      try {
        const raw = sessionStorage.getItem("seniorsafe_user");
        if (raw) {
          const u = JSON.parse(raw);
          sessionStorage.setItem("seniorsafe_user", JSON.stringify({
            ...u,
            purchase_mode: "contratar",
            subscription_status: "active",
          }));
        }
      } catch { /* ignore */ }
      markRequiresPwaInstall();
      setState("success");
    } catch (e) {
      console.error("[webpay/retorno] mock approve error", e);
      alert("No se pudo aprobar en modo desarrollo: " + ((e as Error)?.message || ""));
    } finally {
      setMockBusy(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Cancelación o timeout: Webpay envía TBK_TOKEN sin token_ws
      if (!search.token_ws && search.TBK_TOKEN) {
        if (!cancelled) setState("cancelled");
        return;
      }
      if (!search.token_ws) {
        if (!cancelled) setState("failed");
        return;
      }
      logTransbankTestToken(search.token_ws);
      try {
        const r = await confirm({ data: { token: search.token_ws } });
        if (cancelled) return;
        if (r.ok) {
          setInfo({
            amount: r.amount,
            authorizationCode: r.authorizationCode,
            buyOrder: r.buyOrder,
            cardLast4: r.cardLast4,
          });
          // Marcar suscripción activa en sessionStorage
          try {
            const raw = sessionStorage.getItem("seniorsafe_user");
            if (raw) {
              const u = JSON.parse(raw);
              sessionStorage.setItem("seniorsafe_user", JSON.stringify({
                ...u,
                purchase_mode: "contratar",
                subscription_status: "active",
              }));
            }
          } catch { /* ignore */ }
          markRequiresPwaInstall();
          setState("success");
        } else {
          setState("failed");
        }
      } catch (e) {
        console.error("[webpay/retorno] confirm error", e);
        if (!cancelled) setState("failed");
      }
    })();
    return () => { cancelled = true; };
  }, [search.token_ws, search.TBK_TOKEN, confirm]);

  if (state === "success") {
    return <PostPaymentInstallScreen paymentSummary={info} showPaymentSuccess />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1" style={{ background: "var(--gradient-soft)" }}>
        <div className="max-w-xl mx-auto px-6 py-16 md:py-24">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm text-center">
            {state === "loading" && (
              <>
                <Loader2 className="w-12 h-12 mx-auto animate-spin" style={{ color: DEEP }} />
                <h1 className="mt-6 text-2xl font-bold text-foreground">Confirmando tu pago…</h1>
                <p className="mt-2 text-muted-foreground">No cierres ni recargues esta ventana.</p>
              </>
            )}

            {(state === "failed" || state === "cancelled") && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: "color-mix(in oklab, #dc2626 12%, white)" }}>
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <h1 className="mt-6 text-3xl font-bold text-foreground">
                  {state === "cancelled" ? "Pago cancelado" : "No se pudo procesar el pago"}
                </h1>
                <p className="mt-3 text-muted-foreground">
                  {state === "cancelled"
                    ? "No se realizó ningún cargo. Puedes intentarlo nuevamente."
                    : "Tu tarjeta no fue cobrada. Inténtalo otra vez o contáctanos por WhatsApp."}
                </p>

                <div className="mt-7 grid sm:grid-cols-2 gap-3">
                  <Link to="/checkout" search={{ mode: "contratar" } as any} className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-white font-bold shadow-xl" style={{ background: DEEP }}>
                    Reintentar pago
                  </Link>
                  <a
                    href="https://wa.me/56971404580?text=Hola%20Senior%20Safe%2C%20tuve%20un%20problema%20con%20mi%20pago"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-card border-2 border-border font-bold text-foreground"
                  >
                    <MessageCircle className="w-5 h-5" style={{ color: "#25D366" }} /> WhatsApp
                  </a>
                </div>

                <div className="mt-6 pt-6 border-t border-dashed border-border text-left">
                  <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                    Modo desarrollo (sandbox)
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Si Transbank sandbox está inestable, puedes simular una aprobación
                    para continuar validando el flujo. No realiza ningún cobro real.
                  </p>
                  <button
                    onClick={handleMockApprove}
                    disabled={mockBusy}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border-2 font-semibold disabled:opacity-60"
                    style={{ borderColor: GREEN, color: GREEN, background: "color-mix(in oklab, #16a34a 6%, white)" }}
                  >
                    {mockBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {mockBusy ? "Aprobando…" : "Aprobar manualmente (mock)"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
