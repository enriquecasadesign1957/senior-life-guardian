import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageCircle,
  XCircle,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { finishOneclickCheckout } from "@/lib/oneclick.functions";
import {
  mapOneclickCheckoutToVoucher,
  ONECLICK_VALIDATION_VOUCHER,
  type OneclickVoucherDisplay,
} from "@/lib/oneclick-voucher";
import { markRequiresPwaInstall, persistSignupHandoff } from "@/lib/post-payment";
import { WhatsAppActivarCta } from "@/components/whatsapp-activar-cta";

type SearchParams = {
  TBK_TOKEN?: string;
  validacion_voucher?: "1" | "0";
};

type PageState = "loading" | "success" | "failed";

const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";

function logOneclickToken(token: string | undefined | null) {
  if (!token) return;
  console.log(
    "\n===== TOKEN ONECLICK INSCRIPCIÓN (TBK_TOKEN) =====\n",
    token,
    "\n==================================================\n",
  );
}

function readSignupIdFromSession(): string | null {
  try {
    const raw = sessionStorage.getItem("seniorsafe_user");
    if (!raw) return null;
    return JSON.parse(raw)?.id ?? null;
  } catch {
    return null;
  }
}

const VOUCHER_ROWS: { key: keyof OneclickVoucherDisplay; label: string }[] = [
  { key: "monto", label: "Monto" },
  { key: "codigoAutorizacion", label: "Código de autorización" },
  { key: "tarjeta", label: "Tarjeta" },
  { key: "ordenCompraMall", label: "Orden de Compra Mall (Padre)" },
  { key: "ordenCompraTienda", label: "Orden de Compra Tienda (Hija)" },
];

function OneclickSuccessView({
  voucher,
  signupId,
  isValidationPreview,
}: {
  voucher: OneclickVoucherDisplay;
  signupId: string | null;
  isValidationPreview: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      <SiteHeader />
      <main
        className="flex-1 flex items-center justify-center px-5 py-12 md:py-16"
        style={{ background: "var(--gradient-soft)" }}
      >
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-3xl shadow-lg overflow-hidden">
            <div className="px-6 pt-8 pb-6 text-center border-b border-border bg-white">
              <div
                className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ background: "color-mix(in oklab, #16a34a 14%, white)" }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: GREEN }} />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                ¡Pago confirmado!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Tu suscripción Senior Safe está activa. Inscripción Oneclick Mall y primer cobro
                registrados correctamente.
              </p>
            </div>

            <div className="px-6 py-6">
              <div className="rounded-2xl bg-muted/60 border border-border p-4 space-y-3 text-sm">
                <p className="text-center text-xs font-bold uppercase tracking-wide text-foreground pb-1 border-b border-border/80">
                  {voucher.tituloVoucher}
                </p>
                {VOUCHER_ROWS.map(({ key, label }) => (
                  <div key={key} className="flex justify-between gap-4 items-start">
                    <span className="text-muted-foreground shrink-0">{label}</span>
                    <span className="font-semibold text-foreground font-mono text-xs text-right break-all">
                      {voucher[key]}
                    </span>
                  </div>
                ))}
              </div>
              {isValidationPreview && (
                <p className="mt-3 text-[11px] text-center text-muted-foreground">
                  Vista de validación Transbank · datos de prueba integración
                </p>
              )}
            </div>

            <div className="px-6 pb-2">
              <WhatsAppActivarCta compact />
            </div>

            <div className="px-6 pb-8">
              <Link
                to="/instalar-app"
                search={{
                  entrenamiento: "1",
                  pago: "ok",
                  ...(signupId ? { ss: signupId } : {}),
                }}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg transition hover:opacity-95"
                style={{ background: DEEP }}
              >
                Continuar a la activación
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function OneclickReturnPage() {
  const search = Route.useSearch();
  const finish = useServerFn(finishOneclickCheckout);

  const isValidationPreview = search.validacion_voucher === "1";

  const [pageState, setPageState] = useState<PageState>(
    isValidationPreview ? "success" : "loading",
  );
  const [voucher, setVoucher] = useState<OneclickVoucherDisplay | null>(
    isValidationPreview ? { ...ONECLICK_VALIDATION_VOUCHER } : null,
  );
  const [signupId, setSignupId] = useState<string | null>(() =>
    isValidationPreview ? readSignupIdFromSession() : null,
  );

  useEffect(() => {
    if (isValidationPreview) return;

    let cancelled = false;

    (async () => {
      if (!search.TBK_TOKEN) {
        if (!cancelled) setPageState("failed");
        return;
      }

      logOneclickToken(search.TBK_TOKEN);

      try {
        const result = await finish({ data: { token: search.TBK_TOKEN } });
        if (cancelled) return;

        if (result.ok) {
          setVoucher(
            mapOneclickCheckoutToVoucher({
              amount: result.amount,
              authorizationCode: result.authorizationCode,
              mallBuyOrder: result.mallBuyOrder,
              storeBuyOrder: result.storeBuyOrder,
              cardLast4: result.cardLast4,
            }),
          );

          const resolvedSignupId = result.signupId ?? readSignupIdFromSession();
          if (resolvedSignupId) {
            persistSignupHandoff(resolvedSignupId, {
              purchase_mode: "contratar",
              subscription_status: "active",
            });
          }

          setSignupId(resolvedSignupId);
          markRequiresPwaInstall();
          setPageState("success");
          return;
        }

        setPageState("failed");
      } catch (error) {
        console.error("[oneclick/retorno] finish error", error);
        if (!cancelled) setPageState("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isValidationPreview, search.TBK_TOKEN, finish]);

  const resolvedVoucher = useMemo(() => {
    if (isValidationPreview) return { ...ONECLICK_VALIDATION_VOUCHER };
    return voucher;
  }, [isValidationPreview, voucher]);

  if (isValidationPreview && import.meta.env.PROD) {
    return <Navigate to="/" replace />;
  }

  if (pageState === "success" && resolvedVoucher) {
    return (
      <OneclickSuccessView
        voucher={resolvedVoucher}
        signupId={signupId}
        isValidationPreview={isValidationPreview}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1" style={{ background: "var(--gradient-soft)" }}>
        <div className="max-w-xl mx-auto px-6 py-16 md:py-24">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm text-center">
            {pageState === "loading" && (
              <>
                <Loader2 className="w-12 h-12 mx-auto animate-spin" style={{ color: DEEP }} />
                <h1 className="mt-6 text-2xl font-bold text-foreground">
                  Confirmando tarjeta y primer pago…
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Procesando inscripción Oneclick Mall con Transbank. No cierres esta ventana.
                </p>
              </>
            )}

            {pageState === "failed" && (
              <>
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                  style={{ background: "color-mix(in oklab, #dc2626 12%, white)" }}
                >
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <h1 className="mt-6 text-3xl font-bold text-foreground">
                  No se pudo inscribir la tarjeta o cobrar
                </h1>
                <p className="mt-3 text-muted-foreground">
                  Tu tarjeta no fue inscrita o el cobro fue rechazado. Puedes intentarlo nuevamente.
                </p>
                <div className="mt-7 grid sm:grid-cols-2 gap-3">
                  <Link
                    to="/checkout"
                    search={{ mode: "contratar" } as never}
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-white font-bold shadow-xl"
                    style={{ background: DEEP }}
                  >
                    Reintentar
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

export const Route = createFileRoute("/oneclick/retorno")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    TBK_TOKEN: typeof s.TBK_TOKEN === "string" ? s.TBK_TOKEN : undefined,
    validacion_voucher:
      s.validacion_voucher === "1" || s.validacion_voucher === "0"
        ? s.validacion_voucher
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Comprobante Webpay Oneclick — Senior Safe" },
      { name: "robots", content: "noindex" },
    ],
  }),
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData();
        const params = new URLSearchParams();
        for (const [k, v] of form.entries()) {
          if (typeof v === "string") params.set(k, v);
        }
        logOneclickToken(params.get("TBK_TOKEN"));
        const url = new URL(request.url);
        url.search = params.toString();
        return new Response(null, {
          status: 303,
          headers: { Location: `${url.pathname}?${params.toString()}` },
        });
      },
    },
  },
  component: OneclickReturnPage,
});
