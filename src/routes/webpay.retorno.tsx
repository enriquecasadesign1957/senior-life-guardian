import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, ArrowRight, MessageCircle } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { confirmWebpayTransaction } from "@/lib/webpay.functions";

type SearchParams = {
  token_ws?: string;
  TBK_TOKEN?: string;
  TBK_ORDEN_COMPRA?: string;
  TBK_ID_SESION?: string;
};

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
  const navigate = useNavigate();
  const confirm = useServerFn(confirmWebpayTransaction);

  const [state, setState] = useState<"loading" | "success" | "failed" | "cancelled">("loading");
  const [info, setInfo] = useState<{
    amount?: number | null;
    authorizationCode?: string | null;
    buyOrder?: string | null;
    cardLast4?: string | null;
  }>({});

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

            {state === "success" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: "color-mix(in oklab, #16a34a 14%, white)" }}>
                  <CheckCircle2 className="w-10 h-10" style={{ color: GREEN }} />
                </div>
                <h1 className="mt-6 text-3xl font-bold text-foreground">¡Pago aprobado!</h1>
                <p className="mt-3 text-muted-foreground">Tu suscripción Senior Safe está activa.</p>

                <div className="mt-6 text-left bg-muted/40 rounded-2xl p-5 text-sm space-y-1.5">
                  {info.amount != null && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Monto</span><span className="font-semibold">${info.amount.toLocaleString("es-CL")}</span></div>
                  )}
                  {info.buyOrder && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Orden</span><span className="font-mono">{info.buyOrder}</span></div>
                  )}
                  {info.authorizationCode && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Autorización</span><span className="font-mono">{info.authorizationCode}</span></div>
                  )}
                  {info.cardLast4 && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Tarjeta</span><span className="font-mono">•••• {info.cardLast4}</span></div>
                  )}
                </div>

                <button
                  onClick={() => navigate({ to: "/bienvenida-premium" })}
                  className="mt-7 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-white font-bold shadow-xl"
                  style={{ background: GREEN }}
                >
                  Continuar a la activación <ArrowRight className="w-5 h-5" />
                </button>
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
              </>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
