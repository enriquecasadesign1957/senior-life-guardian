import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { z } from "zod";
import {
  Shield, Lock, CreditCard, Clock, CheckCircle2, ArrowRight,
  Bell, MapPin, MessageCircle, Users, Heart, Loader2, AlertCircle, Tag,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { createPurchaseSignup } from "@/lib/purchase-signup.functions";
import { validateDiscountViaApi } from "@/lib/validate-discount-api";
import { initOneclickCheckout } from "@/lib/oneclick.functions";
import { redirectToOneclickInscription } from "@/lib/oneclick-redirect";
import { initWebpayTransaction, mockApproveWebpay } from "@/lib/webpay.functions";
import { redirectToWebpayPlus } from "@/lib/webpay-redirect";
import { markRequiresPwaInstall, POST_PAYMENT_INSTALL_PATH } from "@/lib/post-payment";
import { saveCheckoutDraft } from "@/lib/checkout-draft";
import {
  PLAN,
  PLAN_KEY,
  annualSavingsClp,
  formatPlanPrice,
  normalizePlanKey,
  planKeySchema,
  periodoSchema,
} from "@/lib/plans";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { toast } from "sonner";
import { CANCELLATION_POLICY_BULLETS } from "@/lib/subscription-cancellation-policy";
import {
  RECURRING_BILLING_DISCLOSURE_BULLETS,
  RECURRING_BILLING_DISCLOSURE_FOOTER,
  RECURRING_BILLING_SUPPORT_EMAIL,
  RECURRING_BILLING_TERMS_LINK_LABEL,
  SENIOR_SAFE_TERMS_CANCELLATION_URL,
} from "@/lib/recurring-billing-consent";
import { normalizeDiscountCodeInput, type PublicDiscountPreview } from "@/lib/discount-codes";
import { getServerErrorMessage } from "@/lib/server-error-message";
import { buildPrivatePageMeta } from "@/lib/seo";

const searchSchema = z.object({
  mode: z
    .enum(["trial", "contratar"])
    .optional()
    .default("contratar")
    .transform((m) => (m === "trial" ? "contratar" : m)),
  plan: planKeySchema.optional().default(PLAN_KEY).transform(normalizePlanKey),
  periodo: periodoSchema.optional().default("mensual"),
  codigo: z.string().trim().max(64).optional(),
});

/** Defaults seguros: query inválida (crawlers/ads) no debe devolver 5xx. */
function parseCheckoutSearch(raw: Record<string, unknown>) {
  const parsed = searchSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  const planRaw = typeof raw.plan === "string" ? raw.plan : undefined;
  const periodoRaw = typeof raw.periodo === "string" ? raw.periodo : undefined;
  const codigoRaw =
    typeof raw.codigo === "string" ? raw.codigo.trim().slice(0, 64) || undefined : undefined;

  const planOk = planKeySchema.safeParse(planRaw);
  const periodoOk = periodoSchema.safeParse(periodoRaw);

  return {
    mode: "contratar" as const,
    plan: planOk.success ? normalizePlanKey(planOk.data) : PLAN_KEY,
    periodo: periodoOk.success ? periodoOk.data : ("mensual" as const),
    codigo: codigoRaw,
  };
}

export const Route = createFileRoute("/checkout")({
  validateSearch: (s) => parseCheckoutSearch(s as Record<string, unknown>),
  head: () =>
    buildPrivatePageMeta(
      "Contratar Senior Safe — Checkout seguro",
      "Contrata Senior Safe con pago seguro Webpay Plus. Activación inmediata tras confirmar el pago.",
    ),
  component: CheckoutPage,
});


const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";

const CHECKOUT_FEATURE_ICONS = [Bell, MessageCircle, MapPin, Users, Heart, Clock, Shield] as const;

const phoneField = z
  .string()
  .trim()
  .min(8, "Ingresa un teléfono válido")
  .max(20)
  .regex(/^[0-9+\s-]+$/, "Solo números");

/** Checkout slim: solo 3 campos críticos antes de Oneclick. */
const schema = z.object({
  email: z.string().trim().email("Correo inválido").max(255),
  phone: phoneField,
  name: z.string().trim().min(2, "Ingresa el nombre del adulto mayor").max(100),
});

const fmt = formatPlanPrice;

function CheckoutPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/checkout" });
  const createPurchase = useServerFn(createPurchaseSignup);
  const initWebpay = useServerFn(initWebpayTransaction);
  const initOneclick = useServerFn(initOneclickCheckout);
  const mockApprove = useServerFn(mockApproveWebpay);

  const [yearly, setYearly] = useState(search.periodo === "anual");
  const [form, setForm] = useState({
    email: "",
    phone: "",
    name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);
  const [discountInput, setDiscountInput] = useState(() =>
    search.codigo ? normalizeDiscountCodeInput(search.codigo) : "",
  );
  const [appliedDiscount, setAppliedDiscount] = useState<PublicDiscountPreview | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const discountRequestRef = useRef(0);
  const urlCodigoAppliedRef = useRef(false);
  const discountEmailRef = useRef("");

  const listPrice = yearly ? PLAN.yearly : PLAN.monthly;
  const price = appliedDiscount?.finalPrice ?? listPrice;
  const savings = useMemo(() => annualSavingsClp(), []);
  const planKey = PLAN_KEY;
  const periodo = yearly ? "anual" : "mensual";

  const applyDiscountCode = useCallback(async (
    rawCode?: string,
    periodoOverride?: "mensual" | "anual",
    emailOverride?: string,
  ) => {
    const code = normalizeDiscountCodeInput(rawCode ?? discountInput);
    if (!code) {
      setAppliedDiscount(null);
      setDiscountError(null);
      return;
    }

    const activePeriodo = periodoOverride ?? periodo;
    const email = (emailOverride ?? form.email).trim().toLowerCase();
    const requestId = ++discountRequestRef.current;

    setDiscountLoading(true);
    setDiscountError(null);
    try {
      const discount = await validateDiscountViaApi(code, planKey, activePeriodo, email || undefined);
      if (requestId !== discountRequestRef.current) return;

      setAppliedDiscount(discount);
      setDiscountInput(discount.code);
      discountEmailRef.current = email;
      toast.success(`Convenio aplicado: ${discount.percentOff}% de descuento`);
    } catch (err) {
      if (requestId !== discountRequestRef.current) return;
      setAppliedDiscount(null);
      setDiscountError(getServerErrorMessage(err, "No pudimos validar el código."));
    } finally {
      if (requestId === discountRequestRef.current) {
        setDiscountLoading(false);
      }
    }
  }, [discountInput, periodo, planKey, form.email]);

  useEffect(() => {
    const code = search.codigo ? normalizeDiscountCodeInput(search.codigo) : "";
    if (!code || urlCodigoAppliedRef.current) return;
    urlCodigoAppliedRef.current = true;
    const activePeriodo = search.periodo === "anual" ? "anual" : "mensual";
    void applyDiscountCode(code, activePeriodo);
  }, [search.codigo, search.periodo, applyDiscountCode]);

  useEffect(() => {
    if (!discountError?.toLowerCase().includes("correo")) return;
    const code = normalizeDiscountCodeInput(discountInput);
    const email = form.email.trim().toLowerCase();
    if (!code || !z.string().email().safeParse(email).success) return;
    const timer = setTimeout(() => void applyDiscountCode(code, periodo, email), 400);
    return () => clearTimeout(timer);
  }, [form.email, discountInput, discountError, periodo, applyDiscountCode]);

  useEffect(() => {
    const email = form.email.trim().toLowerCase();
    if (!appliedDiscount || !discountEmailRef.current) return;
    if (email === discountEmailRef.current) return;
    if (!z.string().email().safeParse(email).success) return;
    setAppliedDiscount(null);
    setDiscountError("Cambiaste tu correo. Vuelve a aplicar el código promocional.");
  }, [form.email, appliedDiscount]);

  const setBillingPeriod = (nextYearly: boolean) => {
    setYearly(nextYearly);
    if (appliedDiscount) {
      void applyDiscountCode(appliedDiscount.code, nextYearly ? "anual" : "mensual");
    }
  };

  const handleMockApprove = async () => {
    setSubmitError(null);
    const r = schema.safeParse(form);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      toast.error("Completa tus datos para simular el pago");
      return;
    }
    setErrors({});
    setMockLoading(true);
    try {
      const { signup } = await createPurchase({ data: {
        nombre: r.data.name,
        email: r.data.email.toLowerCase(),
        telefono: r.data.phone,
        direccion: null,
        plan: planKey,
        periodo,
        discountCode: appliedDiscount?.code ?? "",
        recurringBillingConsent: true,
      } });

      saveCheckoutDraft({
        email: r.data.email,
        phone: r.data.phone,
        seniorName: r.data.name,
        signupId: signup.id,
      });

      const mock = await mockApprove({ data: { signupId: signup.id } });

      try {
        const userPayload = {
          id: signup.id, nombre: signup.nombre, email: signup.email, telefono: signup.telefono,
          plan: signup.plan, periodo: signup.periodo,
          purchase_mode: "contratar",
          subscription_status: "active",
        };
        sessionStorage.setItem("seniorsafe_user", JSON.stringify(userPayload));
        localStorage.setItem("seniorsafe_user_backup", JSON.stringify(userPayload));
      } catch { /* ignore */ }

      markRequiresPwaInstall();
      toast.success(`Pago mock aprobado (${mock.authorizationCode})`);
      navigate({
        to: POST_PAYMENT_INSTALL_PATH,
        search: { pago: "ok", ss: signup.id },
      });
    } catch (err) {
      console.error("Mock approve error:", err);
      setSubmitError((err as Error)?.message || "No se pudo simular el pago (mock).");
      setMockLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const r = schema.safeParse(form);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    const baseData = {
      nombre: r.data.name,
      email: r.data.email.toLowerCase(),
      telefono: r.data.phone,
      direccion: null as string | null,
      plan: planKey,
      periodo,
      discountCode: appliedDiscount?.code ?? "",
      recurringBillingConsent: true,
    };

    try {
      const { signup, alreadyPaid } = await createPurchase({ data: baseData });
      saveCheckoutDraft({
        email: r.data.email,
        phone: r.data.phone,
        seniorName: r.data.name,
        signupId: signup.id,
      });
      try {
        const userPayload = {
          id: signup.id, nombre: signup.nombre, email: signup.email, telefono: signup.telefono,
          plan: signup.plan, periodo: signup.periodo,
          purchase_mode: "contratar",
        };
        sessionStorage.setItem("seniorsafe_user", JSON.stringify(userPayload));
        localStorage.setItem("seniorsafe_user_backup", JSON.stringify(userPayload));
      } catch { /* ignore */ }

      if (alreadyPaid) {
        setLoading(false);
        toast.message("Ya tienes una suscripción activa.", {
          description: "Te llevamos a instalar o abrir la app.",
        });
        navigate({
          to: POST_PAYMENT_INSTALL_PATH,
          search: { ss: signup.id },
        });
        return;
      }

      let useOneclick = false;
      try {
        const oc = await initOneclick({
          data: {
            signupId: signup.id,
            plan: planKey,
            periodo: periodo as "mensual" | "anual",
          },
        });
        useOneclick = true;
        const tbkToken = oc.tbkToken ?? oc.token;
        if (!oc.url || !tbkToken) {
          throw new Error("Transbank no devolvió la URL o el token de inscripción Oneclick.");
        }
        setLoading(false);
        setRedirecting(true);
        toast.message("Redirigiendo a Oneclick…", {
          description: "Inscribirás tu tarjeta en Transbank para pagos recurrentes.",
        });
        redirectToOneclickInscription(tbkToken, oc.url);
        return;
      } catch (oneclickErr) {
        if (import.meta.env.DEV) {
          throw oneclickErr;
        }
        const msg = (oneclickErr as Error)?.message ?? "";
        if (!msg.includes("Oneclick Mall no está habilitado")) {
          throw oneclickErr;
        }
      }

      if (useOneclick) return;

      const wp = await initWebpay({
        data: {
          signupId: signup.id,
          plan: planKey,
          periodo: periodo as "mensual" | "anual",
        },
      });

      const tokenWs = wp?.token_ws ?? wp?.token;
      if (!wp?.url || !tokenWs) {
        throw new Error("Transbank no devolvió la URL o el token de la pasarela.");
      }

      setLoading(false);
      setRedirecting(true);
      toast.message("Redirigiendo a Webpay Plus…", {
        description: "Serás llevado a la pasarela oficial de Transbank para pagar.",
      });

      redirectToWebpayPlus(tokenWs, wp.url);
    } catch (err) {
      console.error("Checkout error:", err);
      const msg = err instanceof Error ? err.message : "";
      setSubmitError(
        msg
          ? msg
          : "No pudimos iniciar el pago con Oneclick. Intenta nuevamente o contáctanos por WhatsApp.",
      );
      setLoading(false);
      setRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1" style={{ background: "var(--gradient-soft)" }}>
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: "color-mix(in oklab, var(--brand-petrol) 12%, white)", color: DEEP }}>
              <Lock className="w-4 h-4" /> Pago seguro Oneclick · Transbank
            </div>
            <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Contrata Senior Safe
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Solo 3 datos y pagas con Oneclick (Transbank) en menos de 30 segundos. El guardián se
              inscribe después del pago.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_420px] gap-8">
              {/* FORM */}
              <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-7">
                <div>
                  <label className="text-sm font-bold text-foreground mb-3 block">1. {PLAN.displayName}</label>
                  <div
                    className="rounded-2xl p-4 border-2 shadow-md"
                    style={{ borderColor: "var(--brand-petrol)", background: "color-mix(in oklab, var(--brand-petrol) 6%, white)" }}
                  >
                    <div className="font-bold text-foreground">{PLAN.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      ${fmt(PLAN.monthly)} /mes · ${fmt(PLAN.yearly)} /año ({PLAN.yearlySavingsLabel.toLowerCase()})
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-foreground mb-3 block">2. Período de facturación</label>
                  <div className="inline-flex items-center bg-muted rounded-full p-1.5 w-full sm:w-auto">
                    <button type="button" onClick={() => setBillingPeriod(false)} className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-sm font-semibold transition ${!yearly ? "text-white" : "text-muted-foreground"}`} style={!yearly ? { background: DEEP } : undefined}>
                      Mensual · ${fmt(PLAN.monthly)}
                    </button>
                    <button type="button" onClick={() => setBillingPeriod(true)} className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-sm font-semibold transition flex items-center justify-center gap-2 ${yearly ? "text-white" : "text-muted-foreground"}`} style={yearly ? { background: DEEP } : undefined}>
                      Anual · ${fmt(PLAN.yearly)}
                      <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold" style={{ background: GREEN }}>{PLAN.yearlySavingsLabel.toUpperCase()}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">3. Datos para pagar e instalar</label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Solo 3 datos. Guardián, dirección y código institucional se completan después del pago (menos de 1 minuto).
                  </p>
                  <div className="space-y-4">
                    <Field
                      label="Email del comprador / pagador"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                      error={errors.email}
                      placeholder="tu@email.cl"
                    />
                    <Field
                      label="Teléfono / WhatsApp del comprador"
                      name="phone"
                      value={form.phone}
                      onChange={(v) => setForm({ ...form, phone: v })}
                      error={errors.phone}
                      placeholder="+56 9 ..."
                    />
                    <Field
                      label="Nombre completo del adulto mayor"
                      name="name"
                      value={form.name}
                      onChange={(v) => setForm({ ...form, name: v })}
                      error={errors.name}
                      placeholder="María González"
                    />
                  </div>
                  {appliedDiscount && (
                    <div
                      className="mt-4 p-4 rounded-2xl border text-sm"
                      style={{
                        borderColor: "color-mix(in oklab, #16a34a 30%, white)",
                        background: "color-mix(in oklab, #16a34a 6%, white)",
                        color: GREEN,
                      }}
                    >
                      <div className="font-bold text-foreground flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Convenio {appliedDiscount.code} aplicado
                      </div>
                      <div className="text-muted-foreground mt-1">
                        {appliedDiscount.percentOff}% de descuento · Ahorras ${fmt(appliedDiscount.discountAmount)}
                      </div>
                    </div>
                  )}
                  {discountLoading && (
                    <p className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Validando convenio…
                    </p>
                  )}
                  {discountError && <p className="mt-2 text-xs text-destructive">{discountError}</p>}
                </div>

                <div>
                  <label className="text-sm font-bold text-foreground mb-3 block">
                    Cobros recurrentes Oneclick
                  </label>
                  <div
                    className="rounded-2xl border p-4 md:p-5 space-y-3 text-sm text-muted-foreground leading-relaxed"
                    style={{
                      borderColor: "color-mix(in oklab, var(--brand-petrol) 22%, white)",
                      background: "color-mix(in oklab, var(--brand-petrol) 4%, white)",
                    }}
                  >
                    <p className="font-semibold text-foreground">
                      Al pagar autorizas los cobros automáticos de tu suscripción
                    </p>
                    <ul className="space-y-2 list-disc pl-4">
                      {RECURRING_BILLING_DISCLOSURE_BULLETS.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <p>{RECURRING_BILLING_DISCLOSURE_FOOTER}</p>
                    <p>
                      <a
                        href={SENIOR_SAFE_TERMS_CANCELLATION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline"
                        style={{ color: DEEP }}
                      >
                        {RECURRING_BILLING_TERMS_LINK_LABEL}
                      </a>
                      {" · "}
                      Cancelar:{" "}
                      <a
                        href={`mailto:${RECURRING_BILLING_SUPPORT_EMAIL}`}
                        className="font-semibold underline"
                        style={{ color: DEEP }}
                      >
                        {RECURRING_BILLING_SUPPORT_EMAIL}
                      </a>
                    </p>
                  </div>
                </div>

                {submitError && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || redirecting}
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-5 rounded-full text-white font-bold text-base hover:scale-[1.01] transition shadow-xl disabled:opacity-80 disabled:cursor-wait disabled:hover:scale-100"
                  style={{ background: GREEN }}
                >
                  {loading || redirecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {redirecting ? "Abriendo pasarela Oneclick…" : "Conectando con Transbank…"}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pagar con Oneclick · ${fmt(price)}
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-muted-foreground -mt-2">
                  Al continuar aceptas los <Link to="/terminos" className="underline">Términos</Link> y la <Link to="/privacidad" className="underline">Política de privacidad</Link>.
                </p>

                {!import.meta.env.PROD && (
                  <div className="mt-4 pt-5 border-t border-dashed border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] uppercase tracking-wide font-bold text-muted-foreground">
                        QA · Modo desarrollo (sandbox)
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "color-mix(in oklab, #f59e0b 16%, white)", color: "#92400e" }}>
                        NO PRODUCCIÓN
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Simula una aprobación de pago sin pasar por Webpay. Crea la suscripción,
                      activa el onboarding y habilita el Portal Familia. No realiza ningún cobro real.
                    </p>
                    <button
                      type="button"
                      onClick={handleMockApprove}
                      disabled={mockLoading || loading}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border-2 font-semibold text-sm disabled:opacity-60"
                      style={{ borderColor: GREEN, color: GREEN, background: "color-mix(in oklab, #16a34a 6%, white)" }}
                    >
                      {mockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {mockLoading ? "Aprobando…" : "Aprobar manualmente (mock)"}
                    </button>
                  </div>
                )}
              </form>

              {/* SUMMARY */}
              <aside className="space-y-5 lg:sticky lg:top-24 self-start">
                <div className="bg-card border border-border rounded-3xl p-6 md:p-7 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">Resumen</div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-bold text-foreground">{PLAN.displayName}</h3>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: "color-mix(in oklab, #16a34a 14%, white)", color: GREEN }}
                    >
                      Pago previo obligatorio
                    </span>
                  </div>

                  <div className="mt-5 flex items-baseline gap-1.5 flex-wrap">
                    {appliedDiscount && (
                      <span className="text-lg text-muted-foreground line-through mr-1">${fmt(listPrice)}</span>
                    )}
                    <span className="text-4xl font-bold tracking-tight text-foreground">${fmt(price)}</span>
                    <span className="text-muted-foreground text-sm">/{yearly ? "año" : "mes"}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="mt-2 text-sm font-semibold" style={{ color: GREEN }}>
                      Convenio {appliedDiscount.code}: −{appliedDiscount.percentOff}% (−${fmt(appliedDiscount.discountAmount)})
                    </div>
                  )}
                  {yearly && (
                    <div className="mt-1 text-sm font-semibold" style={{ color: GREEN }}>
                      {PLAN.yearlySavingsLabel} (${fmt(savings)} menos que 12 meses)
                    </div>
                  )}

                  <div
                    className="mt-5 p-4 rounded-2xl border"
                    style={{
                      borderColor: "color-mix(in oklab, #16a34a 30%, white)",
                      background: "color-mix(in oklab, #16a34a 6%, white)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 mt-0.5 shrink-0" style={{ color: GREEN }} />
                      <div className="text-sm text-foreground leading-relaxed">
                        <strong>Acceso tras confirmar el pago en Transbank.</strong>
                        <br />
                        <span className="text-muted-foreground">
                          Luego practicas el botón de emergencia en modo simulación (sin Twilio).
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Incluye</div>
                    <ul className="space-y-2.5">
                      {PLAN.features.map((label, i) => {
                        const Icon = CHECKOUT_FEATURE_ICONS[i] ?? CheckCircle2;
                        return (
                        <li key={label} className="flex items-start gap-3 text-sm text-foreground">
                          <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: PETROL }} />
                          <span>{label}</span>
                        </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Trust */}
                <div className="bg-card border border-border rounded-3xl p-6 grid grid-cols-2 gap-4 shadow-sm">
                  <Trust icon={CreditCard} title="Oneclick" sub="Pago en CLP" />
                  <Trust icon={Lock} title="SSL 256-bit" sub="Datos cifrados" />
                  <Trust icon={MessageCircle} title="Soporte 24/7" sub="WhatsApp directo" />
                  <Trust icon={X} title="Sin permanencia" sub="Sin cargo extra al cancelar" />
                </div>

                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3">
                    Cancelación y reembolsos
                  </div>
                  <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed list-disc pl-4">
                    {CANCELLATION_POLICY_BULLETS.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Al continuar aceptas esta política y nuestros{" "}
                    <Link to="/terminos" className="font-semibold underline" style={{ color: DEEP }}>
                      Términos y Condiciones
                    </Link>
                    .
                  </p>
                </div>
              </aside>
            </div>
        </div>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}

function Field({
  label, name, value, onChange, error, type = "text", placeholder,
}: { label: string; name: string; value: string; onChange: (v: string) => void; error?: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={name} className="text-xs font-semibold text-muted-foreground mb-1.5 block">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground text-base outline-none transition focus:border-foreground/40 ${error ? "border-destructive" : "border-border"}`}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Trust({ icon: Icon, title, sub }: { icon: typeof Shield; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "color-mix(in oklab, var(--brand-petrol) 10%, white)", color: DEEP }}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-foreground truncate">{title}</div>
        <div className="text-[11px] text-muted-foreground truncate">{sub}</div>
      </div>
    </div>
  );
}
