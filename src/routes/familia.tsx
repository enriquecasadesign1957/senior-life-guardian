import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestFamilyCode, verifyFamilyCode } from "@/lib/family-portal.functions";
import { readFamilyPortalSession, writeFamilyPortalSession } from "@/lib/family-session";

export const Route = createFileRoute("/familia")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Portal Familia — Senior Safe" },
      { name: "description", content: "Acceso para familiares y guardianes." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FamiliaLogin,
});

type Step = "phone" | "code";
const DEEP = "var(--brand-petrol-deep)";

function safeFamilyRedirect(redirect?: string) {
  if (!redirect || redirect === "/familia" || redirect.startsWith("/familia?"))
    return "/familia/dashboard";
  if (!redirect.startsWith("/familia")) return "/familia/dashboard";
  if (
    redirect.startsWith("/familia/dashboard") ||
    redirect.startsWith("/familia/guardianes") ||
    redirect.startsWith("/familia/ack/")
  )
    return redirect;
  return "/familia/dashboard";
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function FamiliaLogin() {
  const search = Route.useSearch();
  const reqCode = useServerFn(requestFamilyCode);
  const verifyCode = useServerFn(verifyFamilyCode);
  const redirectingRef = useRef(false);

  const [step, setStep] = useState<Step>("phone");
  const [telefono, setTelefono] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Destino post-login: respeta deep-link ?redirect=... si es seguro (mismo origen, ruta /familia).
  const safeRedirect = safeFamilyRedirect(search.redirect);

  const goToDestination = () => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    setRedirecting(true);
    // Navegación dura para garantizar el cambio de pantalla y limpiar cualquier estado pegado.
    try {
      window.location.replace(safeRedirect);
    } catch (error) {
      console.error(error);
    }
  };

  // Si ya hay sesión, ir directo al destino.
  useEffect(() => {
    const existing = readFamilyPortalSession();
    if (existing) goToDestination();
    else setSessionChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequest = async () => {
    if (!telefono.trim()) return toast.error("Ingresa tu teléfono.");
    setBusy(true);
    try {
      await reqCode({ data: { telefono } });
      toast.success("Te enviamos un código por WhatsApp/SMS.");
      setStep("code");
    } catch (e: unknown) {
      toast.error(errorMessage(e, "No pudimos enviar el código."));
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) return toast.error("Ingresa los 6 dígitos.");
    setBusy(true);
    try {
      const res = await verifyCode({ data: { telefono, code } });
      const session = writeFamilyPortalSession(res.session);
      toast.success(`Bienvenido${session.nombre ? `, ${session.nombre}` : ""}`);
      goToDestination();
    } catch (e: unknown) {
      toast.error(errorMessage(e, "No pudimos verificar el código."));
      setBusy(false);
    }
  };

  if (!sessionChecked || redirecting) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${DEEP}, #0a3540)` }}
      >
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-6 text-white"
      style={{ background: `linear-gradient(135deg, ${DEEP}, #0a3540)` }}
    >
      <Link
        to="/"
        className="self-start mb-4 inline-flex items-center gap-1 text-white/80 hover:text-white text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>
      <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mb-6 backdrop-blur-sm">
        <Shield className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-extrabold mb-1">Portal Familia</h1>
      <p className="text-white/80 text-center mb-8 max-w-xs">
        Accede para ver el estado de tu ser querido.
      </p>

      <div className="w-full max-w-sm space-y-3">
        {step === "phone" ? (
          <>
            <Label htmlFor="tel" className="text-white/90">
              Tu teléfono
            </Label>
            <Input
              id="tel"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+56 9 1234 5678"
              className="h-14 text-base bg-white text-foreground"
            />
            <Button
              onClick={handleRequest}
              disabled={busy}
              className="w-full h-14 text-lg font-bold"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviarme código"}
            </Button>
          </>
        ) : (
          <>
            <Label htmlFor="code" className="text-white/90">
              Código recibido (6 dígitos)
            </Label>
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="h-14 text-center text-2xl tracking-[0.5em] bg-white text-foreground"
            />
            <Button
              onClick={handleVerify}
              disabled={busy}
              className="w-full h-14 text-lg font-bold"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
              }}
              className="w-full text-sm text-white/70 underline mt-2"
            >
              Cambiar teléfono
            </button>
          </>
        )}
      </div>
    </div>
  );
}
