import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  Shield, Lock, CreditCard, Clock, CheckCircle2, ArrowRight,
  Bell, MapPin, MessageCircle, Phone, Users, Heart, X, Loader2, AlertCircle,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Comenzar prueba gratuita — Senior Safe" },
      { name: "description", content: "Activa tu prueba gratuita de 7 días de Senior Safe. Sin cobros durante el período de prueba. Pago seguro Webpay." },
    ],
  }),
  component: CheckoutPage,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";

const PLANS = {
  basico: {
    key: "basico",
    name: "Básico",
    monthly: 5900,
    yearly: 65000,
    features: [
      { icon: Bell, label: "Botón de emergencia" },
      { icon: MessageCircle, label: "WhatsApp + SMS automáticos" },
      { icon: Phone, label: "Llamada automática" },
      { icon: MapPin, label: "Ubicación GPS" },
      { icon: Users, label: "1 familiar conectado" },
    ],
  },
  premium: {
    key: "premium",
    name: "Premium",
    monthly: 7900,
    yearly: 85000,
    features: [
      { icon: CheckCircle2, label: "Todo lo del plan Básico" },
      { icon: Users, label: "Múltiples familiares conectados" },
      { icon: Heart, label: "Monitoreo de inactividad" },
      { icon: Clock, label: "Historial de alertas" },
      { icon: Shield, label: "Soporte prioritario 24/7" },
    ],
  },
} as const;

const schema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre completo").max(100),
  email: z.string().trim().email("Correo inválido").max(255),
  phone: z.string().trim().min(8, "Ingresa un teléfono válido").max(20).regex(/^[0-9+\s-]+$/, "Solo números"),
  address: z.string().trim().max(200).optional().or(z.literal("")),
});

const fmt = (n: number) => n.toLocaleString("es-CL");

function CheckoutPage() {
  const navigate = useNavigate();
  const [planKey, setPlanKey] = useState<"basico" | "premium">("premium");
  const [yearly, setYearly] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const plan = PLANS[planKey];
  const price = yearly ? plan.yearly : plan.monthly;
  const savings = useMemo(() => plan.monthly * 12 - plan.yearly, [plan]);

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
    try {
      const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("trial_signups")
        .insert({
          nombre: r.data.name,
          email: r.data.email.toLowerCase(),
          telefono: r.data.phone,
          direccion: r.data.address || null,
          plan: planKey,
          periodo: yearly ? "anual" : "mensual",
          trial_active: true,
          trial_end: trialEnd,
          payment_status: "trial",
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505" || /duplicate|unique/i.test(error.message)) {
          setSubmitError("Este correo ya tiene una cuenta. Revisa tu email para continuar.");
        } else {
          setSubmitError("No pudimos crear tu cuenta. Verifica tu conexión e intenta de nuevo.");
        }
        setLoading(false);
        return;
      }

      // Pasar datos a la página de activación
      try {
        sessionStorage.setItem("seniorsafe_user", JSON.stringify({
          id: data.id,
          nombre: data.nombre,
          email: data.email,
          telefono: data.telefono,
          plan: data.plan,
          periodo: data.periodo,
          trial_active: data.trial_active,
          trial_end: data.trial_end,
        }));
      } catch { /* ignore storage errors */ }

      navigate({ to: "/activacion" });
    } catch (err) {
      console.error("Trial signup error:", err);
      setSubmitError("Error de conexión. Intenta nuevamente en unos segundos.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1" style={{ background: "var(--gradient-soft)" }}>
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: "color-mix(in oklab, var(--brand-petrol) 12%, white)", color: DEEP }}>
              <Lock className="w-4 h-4" /> Pago seguro · Sin cobro durante 7 días
            </div>
            <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Comienza tu prueba gratuita
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Activa Senior Safe en menos de 2 minutos. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_420px] gap-8">
              {/* FORM */}
              <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-7">
                {/* Plan selector */}
                <div>
                  <label className="text-sm font-bold text-foreground mb-3 block">1. Elige tu plan</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["basico", "premium"] as const).map((k) => {
                      const p = PLANS[k];
                      const active = planKey === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setPlanKey(k)}
                          className={`relative text-left rounded-2xl p-4 border-2 transition ${active ? "shadow-md" : "border-border hover:border-foreground/20"}`}
                          style={active ? { borderColor: "var(--brand-petrol)", background: "color-mix(in oklab, var(--brand-petrol) 6%, white)" } : undefined}
                        >
                          {k === "premium" && (
                            <span className="absolute -top-2 right-3 text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ background: GREEN }}>POPULAR</span>
                          )}
                          <div className="font-bold text-foreground">{p.name}</div>
                          <div className="text-sm text-muted-foreground">${fmt(p.monthly)} /mes</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Period selector */}
                <div>
                  <label className="text-sm font-bold text-foreground mb-3 block">2. Período de facturación</label>
                  <div className="inline-flex items-center bg-muted rounded-full p-1.5 w-full sm:w-auto">
                    <button type="button" onClick={() => setYearly(false)} className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-sm font-semibold transition ${!yearly ? "text-white" : "text-muted-foreground"}`} style={!yearly ? { background: DEEP } : undefined}>
                      Mensual
                    </button>
                    <button type="button" onClick={() => setYearly(true)} className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-sm font-semibold transition flex items-center justify-center gap-2 ${yearly ? "text-white" : "text-muted-foreground"}`} style={yearly ? { background: DEEP } : undefined}>
                      Anual
                      <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold" style={{ background: GREEN }}>-8%</span>
                    </button>
                  </div>
                </div>

                {/* Personal info */}
                <div>
                  <label className="text-sm font-bold text-foreground mb-3 block">3. Tus datos</label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Nombre completo" name="name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} placeholder="María González" />
                    <Field label="Email" name="email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errors.email} placeholder="maria@email.cl" />
                    <Field label="Teléfono" name="phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} error={errors.phone} placeholder="+56 9 ..." />
                    <Field label="Dirección (opcional)" name="address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} error={errors.address} placeholder="Calle, comuna, ciudad" />
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
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-5 rounded-full text-white font-bold text-base hover:scale-[1.01] transition shadow-xl disabled:opacity-80 disabled:cursor-wait disabled:hover:scale-100"
                  style={{ background: DEEP }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creando tu cuenta…
                    </>
                  ) : (
                    <>
                      Comenzar prueba gratuita
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-muted-foreground -mt-2">
                  Al continuar aceptas los <Link to="/terminos" className="underline">Términos</Link> y la <Link to="/privacidad" className="underline">Política de privacidad</Link>.
                </p>
              </form>

              {/* SUMMARY */}
              <aside className="space-y-5 lg:sticky lg:top-24 self-start">
                <div className="bg-card border border-border rounded-3xl p-6 md:p-7 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2">Resumen</div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-bold text-foreground">Plan {plan.name}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "color-mix(in oklab, #16a34a 14%, white)", color: GREEN }}>
                      7 días gratis
                    </span>
                  </div>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight text-foreground">${fmt(price)}</span>
                    <span className="text-muted-foreground text-sm">/{yearly ? "año" : "mes"}</span>
                  </div>
                  {yearly && (
                    <div className="mt-1 text-sm font-semibold" style={{ color: GREEN }}>
                      Ahorras ${fmt(savings)} al año
                    </div>
                  )}

                  <div className="mt-5 p-4 rounded-2xl border" style={{ borderColor: "color-mix(in oklab, #16a34a 30%, white)", background: "color-mix(in oklab, #16a34a 6%, white)" }}>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 mt-0.5 shrink-0" style={{ color: GREEN }} />
                      <div className="text-sm text-foreground leading-relaxed">
                        <strong>No se realizará cobro durante los primeros 7 días.</strong>
                        <br />
                        <span className="text-muted-foreground">Cancela en 1 clic antes que termine la prueba.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Incluye</div>
                    <ul className="space-y-2.5">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                          <f.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: PETROL }} />
                          <span>{f.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Trust */}
                <div className="bg-card border border-border rounded-3xl p-6 grid grid-cols-2 gap-4 shadow-sm">
                  <Trust icon={CreditCard} title="Webpay" sub="Pago en pesos CLP" />
                  <Trust icon={Lock} title="SSL 256-bit" sub="Datos cifrados" />
                  <Trust icon={Shield} title="Pago protegido" sub="Reembolso garantizado" />
                  <Trust icon={X} title="Sin permanencia" sub="Cancela cuando quieras" />
                </div>
              </aside>
            </div>
        </div>
      </main>
      <SiteFooter />
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

