import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2, Download, Smartphone, Apple, KeyRound, Users,
  MapPin, Bell, ArrowRight, Shield, Plus, Trash2, X, Loader2,
  ShieldCheck, Heart, MessageCircle,
} from "lucide-react";

import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { WhatsAppFloat, WhatsAppButton } from "@/components/whatsapp-float";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/activacion")({
  head: () => ({
    meta: [
      { title: "Activación — Bienvenido a Senior Safe" },
      { name: "description", content: "Configura Senior Safe en 5 pasos guiados: instala la app, crea tu PIN, agrega familiares, activa GPS y prueba el botón de emergencia." },
    ],
  }),
  component: ActivacionPage,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";
const RED = "#dc2626";

type StepKey = "pin" | "contactos" | "gps" | "emergencia" | "app";
type TrialUser = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  plan: string;
  periodo: string;
  trial_active: boolean;
  trial_end: string;
};
type Contact = { id?: string; nombre: string; telefono: string; parentesco: string };

const STEPS: { key: StepKey; icon: any; color: string; title: string; desc: string }[] = [
  { key: "pin", icon: KeyRound, color: DEEP, title: "Crear tu PIN de seguridad", desc: "Un código de 4 dígitos fácil de recordar." },
  { key: "contactos", icon: Users, color: GREEN, title: "Agregar a tus familiares", desc: "Hasta 5 personas que recibirán las alertas." },
  { key: "gps", icon: MapPin, color: "#f59e0b", title: "Activar el GPS", desc: "Para enviar tu ubicación en emergencias." },
  { key: "emergencia", icon: Bell, color: RED, title: "Probar el botón de emergencia", desc: "Una prueba simple para asegurarnos que todo funciona." },
  { key: "app", icon: Smartphone, color: PETROL, title: "Descargar la aplicación", desc: "Último paso: abre Senior Safe en tu teléfono y empieza a usarla." },
];


// Lightweight hash for PIN (not crypto-grade, but avoids plain text)
async function hashPin(pin: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function fireConfetti() {
  const end = Date.now() + 1200;
  const colors = ["#0d4f5c", "#16a34a", "#f59e0b", "#dc2626"];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 65, origin: { x: 0 }, colors, scalar: 0.9 });
    confetti({ particleCount: 4, angle: 120, spread: 65, origin: { x: 1 }, colors, scalar: 0.9 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function ActivacionPage() {
  const [user, setUser] = useState<TrialUser | null>(null);
  const [completed, setCompleted] = useState<Record<StepKey, boolean>>({
    pin: false, contactos: false, gps: false, emergencia: false, app: false,
  });

  const [openStep, setOpenStep] = useState<StepKey | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const completeFiredRef = useRef(false);

  const total = STEPS.length;
  const doneCount = STEPS.filter(s => completed[s.key]).length;
  const progress = useMemo(() => Math.round((doneCount / total) * 100), [doneCount, total]);
  const allDone = doneCount === total;

  // Load user + persisted progress
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("seniorsafe_user");
      if (raw) setUser(JSON.parse(raw) as TrialUser);
      const prog = localStorage.getItem("seniorsafe_progress");
      if (prog) setCompleted(p => ({ ...p, ...JSON.parse(prog) }));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem("seniorsafe_progress", JSON.stringify(completed)); } catch {}
  }, [completed]);

  // Completion celebration
  useEffect(() => {
    if (allDone && !completeFiredRef.current) {
      completeFiredRef.current = true;
      fireConfetti();
      setTimeout(() => setShowComplete(true), 400);
    }
  }, [allDone]);

  const firstName = user?.nombre?.split(" ")[0] ?? "";
  const daysLeft = user?.trial_end
    ? Math.max(0, Math.ceil((new Date(user.trial_end).getTime() - Date.now()) / 86400000))
    : 7;

  const markDone = useCallback((key: StepKey) => {
    setCompleted(c => ({ ...c, [key]: true }));
    setOpenStep(null);
    toast.success("¡Paso completado!", { description: "Sigue así, lo estás haciendo genial." });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1" style={{ background: "var(--gradient-soft)" }}>
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white mb-5 shadow-lg" style={{ background: `linear-gradient(135deg, ${DEEP}, ${PETROL})` }}>
              <Shield className="w-10 h-10" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {user?.trial_active && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: "color-mix(in oklab, #16a34a 14%, white)", color: GREEN }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GREEN }} />
                  Trial activo · {daysLeft} días restantes
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: "color-mix(in oklab, var(--brand-petrol) 12%, white)", color: DEEP }}>
                <ShieldCheck className="w-3.5 h-3.5" /> Protección activa 24/7
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              {firstName ? <>Bienvenido(a), <span style={{ color: DEEP }}>{firstName}</span></> : "Bienvenido a Senior Safe"}
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-muted-foreground">
              {user ? `Tu plan ${user.plan} está activo. Configuremos tu red de cuidado.` : "Tu red de cuidado familiar ya está lista."}
            </p>
          </div>

          {/* Progress */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-7 shadow-sm mb-8">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-base font-bold text-foreground">Tu progreso</span>
              <span className="text-2xl font-bold tracking-tight" style={{ color: DEEP }}>{progress}%</span>
            </div>
            <div className="relative h-4 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${PETROL}, ${GREEN})` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full opacity-40 blur-md transition-all duration-700"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${PETROL}, ${GREEN})` }}
              />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {doneCount} de {total} pasos completados
            </div>
          </div>

          {/* Steps */}
          <ol className="space-y-4">
            {STEPS.map((s, i) => {
              const done = completed[s.key];
              return (
                <li
                  key={s.key}
                  className={`bg-card border-2 rounded-3xl p-5 md:p-6 transition ${done ? "" : "border-border"}`}
                  style={done ? { borderColor: GREEN, background: "color-mix(in oklab, #16a34a 5%, white)" } : undefined}
                >
                  <div className="flex items-start gap-5">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white" style={{ background: s.color }}>
                        <s.icon className="w-8 h-8" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-border flex items-center justify-center text-sm font-bold text-foreground">
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{s.title}</h3>
                      <p className="mt-1 text-base text-muted-foreground">{s.desc}</p>
                      <button
                        type="button"
                        onClick={() => setOpenStep(s.key)}
                        className={`mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-full text-base font-bold transition ${done ? "text-white" : "border-2 text-foreground hover:bg-muted"}`}
                        style={done ? { background: GREEN } : { borderColor: "var(--brand-petrol-deep)" }}
                      >
                        {done ? (<><CheckCircle2 className="w-5 h-5" /> Completado · Revisar</>) : (<>Comenzar paso <ArrowRight className="w-5 h-5" /></>)}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Help — WhatsApp 24/7 */}
          <div className="mt-10 bg-card border border-border rounded-3xl p-6 md:p-8 text-center shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" style={{ background: "color-mix(in oklab, #25D366 14%, white)", color: "#128C7E" }}>
              <MessageCircle className="w-3.5 h-3.5" /> Soporte humano 24/7
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">¿Necesitas ayuda con la configuración?</h3>
            <p className="mt-2 text-muted-foreground text-base">Escríbenos por WhatsApp. Te respondemos al instante, todos los días.</p>
            <div className="mt-6 flex justify-center">
              <WhatsAppButton variant="button" label="Abrir WhatsApp" />
            </div>
          </div>

          <div className="mt-8 text-center text-base text-muted-foreground">
            ¿Prefieres email? Escríbenos a <a href="mailto:hola@alarmaseniorsafe.cl" className="font-semibold" style={{ color: DEEP }}>hola@alarmaseniorsafe.cl</a>
          </div>

        </div>
      </main>
      <SiteFooter />

      {/* Step Modals */}
      <StepAppModal open={openStep === "app"} onClose={() => setOpenStep(null)} onDone={() => markDone("app")} userPhone={user?.telefono ?? null} />
      <StepPinModal open={openStep === "pin"} onClose={() => setOpenStep(null)} onDone={() => markDone("pin")} userId={user?.id ?? null} />
      <StepContactsModal open={openStep === "contactos"} onClose={() => setOpenStep(null)} onDone={() => markDone("contactos")} userId={user?.id ?? null} />
      <StepGpsModal open={openStep === "gps"} onClose={() => setOpenStep(null)} onDone={() => markDone("gps")} />
      <StepEmergencyModal open={openStep === "emergencia"} onClose={() => setOpenStep(null)} onDone={() => markDone("emergencia")} userName={firstName} />

      {/* Completion */}
      <CompletionModal open={showComplete} onClose={() => setShowComplete(false)} firstName={firstName} />
      <WhatsAppFloat />
    </div>
  );
}

/* ---------------- Step 1: Acceder a la app ---------------- */
const APP_URL = "https://senior-safe-link.lovable.app";

function StepAppModal({ open, onClose, onDone, userPhone }: { open: boolean; onClose: () => void; onDone: () => void; userPhone: string | null }) {
  const openApp = () => {
    window.open(APP_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2" style={{ background: PETROL }}>
            <Smartphone className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl">Accede a la aplicación Senior Safe</DialogTitle>
          <DialogDescription className="text-base">
            La aplicación de emergencia funciona desde tu navegador en cualquier teléfono o computador.
            Próximamente estará disponible también en Google Play y App Store.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button onClick={openApp} className="w-full h-14 text-lg font-bold rounded-2xl" style={{ background: DEEP, color: "white" }}>
            <ArrowRight className="w-5 h-5 mr-2" />
            Abrir la aplicación ahora
          </Button>

          <div className="rounded-2xl p-4 text-sm space-y-2" style={{ background: "color-mix(in oklab, var(--brand-petrol) 6%, white)", color: "var(--foreground)" }}>
            <p><strong>Guarda el acceso directo:</strong></p>
            <p>• <strong>Android (Chrome):</strong> abre la app y toca menú ⋮ → "Añadir a pantalla de inicio".</p>
            <p>• <strong>iPhone (Safari):</strong> abre la app y toca Compartir → "Añadir a pantalla de inicio".</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="relative rounded-2xl border-2 border-border p-4 text-center opacity-80">
              <Smartphone className="w-7 h-7 mx-auto mb-2" style={{ color: DEEP }} />
              <div className="font-bold text-foreground">Google Play</div>
              <span className="absolute -top-2 -right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">Próximamente</span>
            </div>
            <div className="relative rounded-2xl border-2 border-border p-4 text-center opacity-80">
              <Apple className="w-7 h-7 mx-auto mb-2" />
              <div className="font-bold text-foreground">App Store</div>
              <span className="absolute -top-2 -right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">Próximamente</span>
            </div>
          </div>

          <div className="rounded-2xl p-4 text-sm" style={{ background: "color-mix(in oklab, #16a34a 6%, white)", color: "var(--foreground)" }}>
            Te avisaremos por email y WhatsApp ({userPhone ?? "tu teléfono"}) en cuanto se publiquen las versiones nativas.
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onDone} className="w-full h-12 text-base font-bold rounded-full" style={{ background: GREEN, color: "white" }}>
            <CheckCircle2 className="w-5 h-5 mr-2" /> Listo, continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Step 2: PIN ---------------- */
function StepPinModal({ open, onClose, onDone, userId }: { open: boolean; onClose: () => void; onDone: () => void; userId: string | null }) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phase, setPhase] = useState<"create" | "confirm">("create");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setPin(""); setConfirm(""); setPhase("create"); } }, [open]);

  const current = phase === "create" ? pin : confirm;
  const setCurrent = (v: string) => phase === "create" ? setPin(v) : setConfirm(v);

  const press = (n: string) => { if (current.length < 4) setCurrent(current + n); };
  const back = () => setCurrent(current.slice(0, -1));

  useEffect(() => {
    if (phase === "create" && pin.length === 4) setTimeout(() => setPhase("confirm"), 200);
  }, [pin, phase]);

  const handleSave = async () => {
    if (confirm !== pin) {
      toast.error("Los PIN no coinciden", { description: "Intenta nuevamente." });
      setConfirm(""); setPin(""); setPhase("create");
      return;
    }
    setSaving(true);
    try {
      if (userId) {
        const pin_hash = await hashPin(pin, userId);
        await supabase.from("user_pins").insert({ trial_signup_id: userId, pin_hash });
      }
      try { localStorage.setItem("seniorsafe_pin_set", "true"); } catch {}
      onDone();
    } catch (e) {
      console.error(e);
      // Don't block onboarding on DB error
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2" style={{ background: DEEP }}>
            <KeyRound className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl">{phase === "create" ? "Crea tu PIN" : "Confirma tu PIN"}</DialogTitle>
          <DialogDescription className="text-base">
            {phase === "create" ? "Elige 4 dígitos fáciles de recordar." : "Vuelve a ingresar el mismo PIN para confirmar."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-3 my-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold" style={{ borderColor: current.length > i ? DEEP : "var(--border)", background: current.length > i ? "color-mix(in oklab, var(--brand-petrol) 8%, white)" : "white" }}>
              {current[i] ? "●" : ""}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {["1","2","3","4","5","6","7","8","9"].map(n => (
            <button key={n} type="button" onClick={() => press(n)} className="h-16 rounded-2xl text-2xl font-bold bg-muted hover:bg-accent transition active:scale-95">{n}</button>
          ))}
          <button type="button" onClick={() => { setPin(""); setConfirm(""); setPhase("create"); }} className="h-16 rounded-2xl text-sm font-bold bg-muted hover:bg-accent transition">Borrar</button>
          <button type="button" onClick={() => press("0")} className="h-16 rounded-2xl text-2xl font-bold bg-muted hover:bg-accent transition active:scale-95">0</button>
          <button type="button" onClick={back} className="h-16 rounded-2xl text-sm font-bold bg-muted hover:bg-accent transition">←</button>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={phase !== "confirm" || confirm.length !== 4 || saving}
            className="w-full h-12 text-base font-bold rounded-full"
            style={{ background: GREEN, color: "white" }}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 mr-2" /> Guardar PIN</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Step 3: Contacts ---------------- */
function StepContactsModal({ open, onClose, onDone, userId }: { open: boolean; onClose: () => void; onDone: () => void; userId: string | null }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState<Contact>({ nombre: "", telefono: "", parentesco: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      try {
        const raw = localStorage.getItem("seniorsafe_contacts");
        if (raw) setContacts(JSON.parse(raw));
      } catch {}
    }
  }, [open]);

  const persist = (next: Contact[]) => {
    setContacts(next);
    try { localStorage.setItem("seniorsafe_contacts", JSON.stringify(next)); } catch {}
  };

  const addContact = async () => {
    if (!form.nombre.trim() || !form.telefono.trim() || !form.parentesco.trim()) {
      toast.error("Completa todos los campos");
      return;
    }
    if (contacts.length >= 5) { toast.error("Máximo 5 contactos"); return; }
    setSaving(true);
    try {
      if (userId) {
        await supabase.from("emergency_contacts").insert({
          trial_signup_id: userId,
          nombre: form.nombre.trim(),
          telefono: form.telefono.trim(),
          parentesco: form.parentesco.trim(),
        });
      }
      persist([...contacts, { ...form }]);
      setForm({ nombre: "", telefono: "", parentesco: "" });
      toast.success("Contacto agregado");
    } catch (e) {
      console.error(e);
      persist([...contacts, { ...form }]);
      setForm({ nombre: "", telefono: "", parentesco: "" });
    } finally {
      setSaving(false);
    }
  };

  const removeContact = (idx: number) => persist(contacts.filter((_, i) => i !== idx));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2" style={{ background: GREEN }}>
            <Users className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl">Agrega a tus familiares</DialogTitle>
          <DialogDescription className="text-base">
            Estas personas recibirán alertas inmediatas. Puedes agregar hasta 5.
          </DialogDescription>
        </DialogHeader>

        {contacts.length > 0 && (
          <div className="space-y-2">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: GREEN }}>
                  {c.nombre[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground truncate">{c.nombre}</div>
                  <div className="text-sm text-muted-foreground truncate">{c.parentesco} · {c.telefono}</div>
                </div>
                <button onClick={() => removeContact(i)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {contacts.length < 5 && (
          <div className="space-y-3 pt-2 border-t border-border">
            <div>
              <Label className="text-sm font-bold">Nombre completo</Label>
              <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="María Pérez" className="h-12 text-base mt-1" />
            </div>
            <div>
              <Label className="text-sm font-bold">Teléfono</Label>
              <Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 1234 5678" className="h-12 text-base mt-1" />
            </div>
            <div>
              <Label className="text-sm font-bold">Parentesco</Label>
              <Input value={form.parentesco} onChange={e => setForm({ ...form, parentesco: e.target.value })} placeholder="Hija, hijo, esposo/a..." className="h-12 text-base mt-1" />
            </div>
            <Button onClick={addContact} disabled={saving} variant="outline" className="w-full h-12 rounded-full border-2" style={{ borderColor: GREEN, color: GREEN }}>
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5 mr-1" /> Agregar contacto</>}
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={onDone}
            disabled={contacts.length === 0}
            className="w-full h-12 text-base font-bold rounded-full"
            style={{ background: GREEN, color: "white" }}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" /> Continuar ({contacts.length} {contacts.length === 1 ? "contacto" : "contactos"})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Step 4: GPS ---------------- */
function StepGpsModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [status, setStatus] = useState<"idle" | "checking" | "granted" | "denied">("idle");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (open && "permissions" in navigator) {
      // @ts-ignore
      navigator.permissions.query({ name: "geolocation" }).then((p: any) => {
        if (p.state === "granted") setStatus("granted");
      }).catch(() => {});
    }
  }, [open]);

  const request = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Tu dispositivo no soporta GPS");
      return;
    }
    setStatus("checking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus("granted");
        toast.success("GPS activado correctamente");
      },
      () => { setStatus("denied"); toast.error("Permiso denegado", { description: "Actívalo desde la configuración del navegador." }); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2" style={{ background: "#f59e0b" }}>
            <MapPin className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl">Activar GPS</DialogTitle>
          <DialogDescription className="text-base">
            En caso de emergencia, tu ubicación exacta llegará automáticamente a tus familiares.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl p-4 text-sm space-y-2" style={{ background: "color-mix(in oklab, #f59e0b 8%, white)" }}>
            <div className="font-bold text-foreground">Cómo funciona:</div>
            <ol className="list-decimal pl-5 space-y-1 text-foreground">
              <li>Toca "Permitir GPS" abajo</li>
              <li>Tu navegador pedirá permiso — acepta</li>
              <li>Listo: tu ubicación viaja solo en emergencias</li>
            </ol>
          </div>

          <div className="text-center py-2">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold`} style={{
              background: status === "granted" ? "color-mix(in oklab, #16a34a 14%, white)" : status === "denied" ? "color-mix(in oklab, #dc2626 14%, white)" : "var(--muted)",
              color: status === "granted" ? GREEN : status === "denied" ? RED : "var(--muted-foreground)",
            }}>
              <span className="w-2 h-2 rounded-full" style={{ background: status === "granted" ? GREEN : status === "denied" ? RED : "var(--muted-foreground)" }} />
              {status === "granted" ? "GPS activo" : status === "denied" ? "GPS denegado" : status === "checking" ? "Detectando..." : "GPS inactivo"}
            </div>
            {coords && <div className="text-xs text-muted-foreground mt-2">Lat {coords.lat.toFixed(4)}, Lon {coords.lon.toFixed(4)}</div>}
          </div>

          {status !== "granted" && (
            <Button onClick={request} disabled={status === "checking"} className="w-full h-12 rounded-full" style={{ background: "#f59e0b", color: "white" }}>
              {status === "checking" ? <Loader2 className="w-5 h-5 animate-spin" /> : <><MapPin className="w-5 h-5 mr-2" /> Permitir GPS</>}
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onDone}
            disabled={status !== "granted"}
            className="w-full h-12 text-base font-bold rounded-full"
            style={{ background: GREEN, color: "white" }}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" /> Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Step 5: Emergency Test ---------------- */
function StepEmergencyModal({ open, onClose, onDone, userName }: { open: boolean; onClose: () => void; onDone: () => void; userName: string }) {
  const [phase, setPhase] = useState<"ready" | "sending" | "sent">("ready");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => { if (open) { setPhase("ready"); setCountdown(3); } }, [open]);

  const startTest = () => {
    setPhase("sending");
    setCountdown(3);
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(t);
          setTimeout(() => {
            setPhase("sent");
            toast.success("Alerta de prueba enviada", { description: "Tus familiares recibirían WhatsApp, SMS y llamada." });
          }, 400);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2" style={{ background: RED }}>
            <Bell className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl">Prueba de emergencia</DialogTitle>
          <DialogDescription className="text-base">
            Esta es una <strong>simulación segura</strong>. Verás cómo funcionaría una alerta real sin enviar mensajes a nadie.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {phase === "ready" && (
            <button
              onClick={startTest}
              className="relative mx-auto block w-40 h-40 rounded-full text-white font-bold text-xl shadow-2xl hover:scale-105 transition active:scale-95"
              style={{ background: `radial-gradient(circle at 30% 30%, #ef4444, ${RED})` }}
            >
              <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: RED }} />
              <span className="relative">SOS</span>
              <div className="text-xs font-normal mt-1">Toca para probar</div>
            </button>
          )}
          {phase === "sending" && (
            <div className="text-center">
              <div className="w-40 h-40 mx-auto rounded-full flex items-center justify-center text-white text-6xl font-bold animate-pulse" style={{ background: RED }}>
                {countdown}
              </div>
              <div className="mt-4 font-bold text-foreground">Enviando alerta de prueba...</div>
            </div>
          )}
          {phase === "sent" && (
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white" style={{ background: GREEN }}>
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="font-bold text-xl text-foreground">¡Alerta recibida!</div>
              <div className="text-sm text-muted-foreground">
                {userName ? `${userName}, en una emergencia real ` : "En una emergencia real "}
                tus familiares recibirían:
              </div>
              <div className="flex justify-center gap-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-full" style={{ background: "color-mix(in oklab, #25D366 14%, white)", color: "#128C7E" }}>WhatsApp</span>
                <span className="px-3 py-1 rounded-full" style={{ background: "color-mix(in oklab, var(--brand-petrol) 12%, white)", color: DEEP }}>SMS</span>
                <span className="px-3 py-1 rounded-full" style={{ background: "color-mix(in oklab, #dc2626 12%, white)", color: RED }}>Llamada</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onDone}
            disabled={phase !== "sent"}
            className="w-full h-12 text-base font-bold rounded-full"
            style={{ background: GREEN, color: "white" }}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" /> Finalizar configuración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Completion ---------------- */
function CompletionModal({ open, onClose, firstName }: { open: boolean; onClose: () => void; firstName: string }) {
  useEffect(() => { if (open) fireConfetti(); }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted"><X className="w-4 h-4" /></button>
        <div className="py-4 space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white shadow-2xl" style={{ background: `linear-gradient(135deg, ${DEEP}, ${GREEN})` }}>
            <ShieldCheck className="w-12 h-12" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: "color-mix(in oklab, #16a34a 14%, white)", color: GREEN }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GREEN }} /> Protección activa 24/7
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
            Senior Safe está<br />protegiéndote
          </h2>
          <p className="text-base text-muted-foreground px-4">
            {firstName ? `${firstName}, ` : ""}tu red de cuidado familiar está completa.
            Respira tranquilo: estaremos contigo las 24 horas, todos los días. <Heart className="w-4 h-4 inline" style={{ color: RED }} />
          </p>
          <Button
            onClick={() => window.open(APP_URL, "_blank", "noopener,noreferrer")}
            className="w-full h-12 text-base font-bold rounded-full"
            style={{ background: DEEP, color: "white" }}
          >
            <Download className="w-5 h-5 mr-1" /> Descargar aplicación
          </Button>
          <p className="text-xs text-muted-foreground px-4">
            Úsala gratis durante 7 días. Después se activa el cobro mensual o anual según tu plan.
          </p>
          <Link to="/" className="block text-sm text-muted-foreground hover:underline">Volver más tarde</Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
