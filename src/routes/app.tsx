import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Shield, MapPin, Users, Battery, Wifi, Bell, CheckCircle2,
  X, Home, Settings, Heart, MessageCircle, Navigation, Clock,
  Plus, Pencil, Trash2, KeyRound, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  listFamily, addFamily, updateFamily, deleteFamily, verifyPin,
} from "@/lib/family.functions";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Senior Safe — Mi protección" },
      { name: "description", content: "Pide ayuda en un solo toque. Tu red familiar te protege 24/7." },
    ],
  }),
  component: AppHome,
});

const DEEP = "var(--brand-petrol-deep)";
const PETROL = "var(--brand-petrol)";
const GREEN = "#16a34a";
const RED = "#dc2626";

type Stage = "idle" | "confirm" | "sending" | "sent";
type Contact = { id: string; nombre: string; parentesco: string; telefono: string };

const PALETTE = ["#0ea5e9", "#a855f7", "#f59e0b", "#16a34a", "#dc2626"];
const colorFor = (i: number) => PALETTE[i % PALETTE.length];
const initialOf = (n: string) => (n.trim()[0] ?? "?").toUpperCase();

async function hashPin(pin: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function AppHome() {
  const [stage, setStage] = useState<Stage>("idle");
  const [countdown, setCountdown] = useState(5);
  const [deliveredTo, setDeliveredTo] = useState<number>(0);

  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  const [manageOpen, setManageOpen] = useState(false);
  const [pinGateOpen, setPinGateOpen] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);

  const list = useServerFn(listFamily);

  // Load user from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("seniorsafe_user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.id) setUserId(u.id);
        if (u?.nombre) setUserName(String(u.nombre).split(" ")[0]);
      }
    } catch {}
  }, []);

  // Load contacts when userId is ready
  useEffect(() => {
    if (!userId) { setLoadingContacts(false); return; }
    let alive = true;
    (async () => {
      setLoadingContacts(true);
      try {
        const res = await list({ data: { signupId: userId } });
        if (alive) setContacts(res.contacts as Contact[]);
      } catch (e) {
        console.error(e);
        if (alive) toast.error("No pudimos cargar tu red familiar.");
      } finally {
        if (alive) setLoadingContacts(false);
      }
    })();
    return () => { alive = false; };
  }, [userId, list]);

  const familyCount = contacts.length;

  // Countdown for auto-confirm (NO PIN — accesible bajo estrés)
  useEffect(() => {
    if (stage !== "confirm") return;
    setCountdown(5);
    if ("vibrate" in navigator) navigator.vibrate?.(80);
    const id = setInterval(() => {
      setCountdown((c) => {
        if ("vibrate" in navigator) navigator.vibrate?.(30);
        if (c <= 1) { clearInterval(id); setStage("sending"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [stage]);

  useEffect(() => {
    if (stage !== "sending") return;
    setDeliveredTo(0);
    if ("vibrate" in navigator) navigator.vibrate?.([100, 60, 100]);
    const total = Math.max(1, familyCount);
    const ticks: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < total; i++) {
      ticks.push(setTimeout(() => setDeliveredTo(i + 1), 500 + i * 450));
    }
    ticks.push(setTimeout(() => setStage("sent"), 500 + total * 450 + 300));
    return () => ticks.forEach(clearTimeout);
  }, [stage, familyCount]);

  const requestManage = () => {
    if (pinUnlocked) setManageOpen(true);
    else setPinGateOpen(true);
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef4f9 100%)" }}>
      <header className="px-5 pt-5 pb-3 flex items-center justify-between max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: DEEP }}>
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-base font-bold text-foreground leading-tight">Senior Safe</div>
            <div className="text-sm text-muted-foreground">Hola{userName ? `, ${userName}` : ""}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-foreground" aria-label="Estado del dispositivo">
          <span className="inline-flex items-center gap-1 text-sm font-bold"><Battery className="w-4 h-4" aria-hidden="true" /> 82%</span>
          <span className="inline-flex items-center gap-1 text-sm font-bold" aria-label="Conectado a Wi-Fi"><Wifi className="w-4 h-4" aria-hidden="true" /></span>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-5 pb-6 max-w-md mx-auto w-full">
        {/* Status banner */}
        <section
          aria-label="Estado actual"
          className="rounded-3xl p-5 mb-6 text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${GREEN}, #15803d)` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>
            <div>
              <div className="text-2xl font-bold leading-tight">Estás segura</div>
              <div className="text-sm text-white/90">
                {familyCount > 0 ? "Red familiar configurada" : "Aún sin familiares conectados"}
              </div>
            </div>
          </div>
        </section>

        {/* GIANT EMERGENCY BUTTON — sin PIN */}
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <button
            type="button"
            onClick={() => {
              if ("vibrate" in navigator) navigator.vibrate?.(120);
              setStage("confirm");
            }}
            aria-label="Botón de emergencia. Pulsa para pedir ayuda a tu familia"
            className="relative group focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300 rounded-full"
          >
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(220,38,38,0.25)" }} aria-hidden="true" />
            <span className="absolute -inset-3 rounded-full" style={{ background: "rgba(220,38,38,0.10)" }} aria-hidden="true" />
            <span
              className="relative flex flex-col items-center justify-center w-72 h-72 sm:w-80 sm:h-80 rounded-full text-white font-bold shadow-[0_30px_70px_-20px_rgba(220,38,38,0.7)] active:scale-95 transition"
              style={{ background: `radial-gradient(circle at 30% 25%, #ef4444, ${RED} 60%, #991b1b)` }}
            >
              <Bell className="w-20 h-20 mb-3" strokeWidth={2.5} aria-hidden="true" />
              <span className="text-3xl tracking-wide">EMERGENCIA</span>
              <span className="mt-1 text-base font-semibold text-white/85">Toca para pedir ayuda</span>
            </span>
          </button>
          <p className="mt-4 text-center text-sm text-muted-foreground max-w-[18rem]">
            {familyCount > 0 ? (
              <>Avisaremos a <strong className="text-foreground">{familyCount} familiar{familyCount === 1 ? "" : "es"}</strong> con tu ubicación exacta.</>
            ) : (
              <>Agrega un familiar en <strong className="text-foreground">Tu red familiar</strong> para que reciba tus alertas.</>
            )}
          </p>
        </div>

        {/* GPS card */}
        <section aria-label="Tu ubicación actual" className="bg-card border border-border rounded-3xl overflow-hidden mb-4 shadow-sm">
          <div
            className="relative h-32"
            style={{
              background:
                "radial-gradient(circle at 50% 60%, rgba(16,185,129,0.25), transparent 60%), repeating-linear-gradient(0deg, rgba(15,76,98,0.06) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(15,76,98,0.06) 0 1px, transparent 1px 24px), linear-gradient(180deg, #f1f5f9, #e2e8f0)",
            }}
            aria-hidden="true"
          >
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-white/80" />
            <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-white/80" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute inset-0 -m-3 rounded-full animate-ping" style={{ background: "rgba(34,197,94,0.45)" }} />
              <span className="relative flex w-7 h-7 rounded-full items-center justify-center text-white shadow-lg" style={{ background: GREEN }}>
                <MapPin className="w-4 h-4" />
              </span>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: PETROL }}>
              <Navigation className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">GPS activo</div>
              <div className="text-lg font-bold text-foreground truncate">En casa · Las Condes</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" aria-hidden="true" /> Actualizado hace 1 min
              </div>
            </div>
          </div>
        </section>

        {/* Family card */}
        <section aria-label="Familiares conectados" className="bg-card border border-border rounded-3xl p-4 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: DEEP }} aria-hidden="true" />
              <h2 className="font-bold text-foreground text-base">Tu red familiar</h2>
            </div>
            {familyCount > 0 && (
              <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full" style={{ background: GREEN }}>
                {familyCount} conectado{familyCount === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {loadingContacts ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando familiares…
            </div>
          ) : familyCount === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              Aún no has agregado familiares. Usa “Administrar familiares” para añadirlos.
            </div>
          ) : (
            <ul className="space-y-2">
              {contacts.map((f, i) => (
                <li key={f.id} className="flex items-center gap-3 py-1.5">
                  <span
                    aria-hidden="true"
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ background: colorFor(i) }}
                  >
                    {initialOf(f.nombre)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-foreground leading-tight truncate">{f.nombre}</div>
                    <div className="text-sm text-muted-foreground truncate">{f.parentesco} · recibe WhatsApp</div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} aria-label="En línea" />
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={requestManage}
            disabled={!userId}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-foreground font-bold text-sm hover:bg-muted transition disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" /> Administrar familiares
          </button>
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            Para editar tu red pediremos tu PIN. La emergencia nunca pide PIN.
          </p>
        </section>

        <nav aria-label="Navegación principal" className="grid grid-cols-3 gap-2 bg-card rounded-3xl p-2 border border-border shadow-sm">
          <NavItem icon={Home} label="Inicio" active />
          <NavItem icon={Heart} label="Familia" onClick={requestManage} />
          <NavItem icon={Settings} label="Ajustes" onClick={requestManage} />
        </nav>

        <Link to="/" className="text-center text-sm text-muted-foreground mt-4 hover:text-foreground underline-offset-4 hover:underline">
          Volver al sitio web
        </Link>
      </main>

      {/* PIN gate */}
      <PinGateDialog
        open={pinGateOpen}
        signupId={userId}
        onClose={() => setPinGateOpen(false)}
        onSuccess={() => { setPinUnlocked(true); setPinGateOpen(false); setManageOpen(true); }}
      />

      {/* Manage family */}
      <ManageFamilyDialog
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        signupId={userId}
        contacts={contacts}
        setContacts={setContacts}
      />

      {/* Emergency overlay */}
      {stage !== "idle" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-dialog-title"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in"
        >
          <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-md p-7 text-center">
            {stage === "confirm" && (
              <>
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(220,38,38,0.25)" }} aria-hidden="true" />
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: RED }}>
                    <Bell className="w-12 h-12" aria-hidden="true" />
                  </div>
                </div>
                <h2 id="emergency-dialog-title" className="text-3xl font-bold text-foreground tracking-tight">
                  ¿Necesitas ayuda?
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  Avisaremos a tu familia por WhatsApp con tu ubicación.
                </p>

                <div className="mt-6 flex items-center justify-center" aria-live="polite" aria-atomic="true">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="44" fill="none" stroke={RED} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 44}
                        strokeDashoffset={2 * Math.PI * 44 * (1 - countdown / 5)}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-foreground tabular-nums">{countdown}</span>
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">segundos</span>
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setStage("sending")}
                    className="w-full py-5 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-red-300"
                    style={{ background: RED }}
                  >
                    SÍ, NECESITO AYUDA
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage("idle")}
                    className="w-full py-5 rounded-2xl bg-muted text-foreground text-xl font-bold active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-slate-300"
                  >
                    Estoy bien, cancelar
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStage("idle")}
                  aria-label="Cerrar"
                  className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition focus-visible:ring-2 focus-visible:ring-foreground"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </>
            )}

            {stage === "sending" && (
              <>
                <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white mb-5 shadow-lg animate-pulse" style={{ background: RED }}>
                  <MessageCircle className="w-12 h-12" aria-hidden="true" />
                </div>
                <h2 id="emergency-dialog-title" className="text-2xl font-bold text-foreground tracking-tight">
                  Avisando a tu familia
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">Enviando WhatsApp con tu ubicación…</p>

                <ul className="mt-6 space-y-2 text-left" aria-live="polite" aria-atomic="false">
                  {(contacts.length > 0 ? contacts : [{ id: "x", nombre: "Tu familiar", parentesco: "—", telefono: "" }]).map((f, i) => {
                    const done = i < deliveredTo;
                    return (
                      <li
                        key={f.id}
                        className="flex items-center gap-3 py-2 px-3 rounded-2xl transition"
                        style={{ background: done ? "rgba(22,163,74,0.08)" : "hsl(var(--muted))" }}
                      >
                        <span
                          aria-hidden="true"
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                          style={{ background: colorFor(i) }}
                        >
                          {initialOf(f.nombre)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-foreground truncate">{f.nombre}</div>
                          <div className="text-xs text-muted-foreground truncate">{f.parentesco}</div>
                        </div>
                        {done ? (
                          <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: GREEN }}>
                            <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> Avisado
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-muted-foreground/40 border-t-foreground animate-spin" aria-label="Enviando" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {stage === "sent" && (
              <>
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(22,163,74,0.30)" }} aria-hidden="true" />
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: GREEN }}>
                    <CheckCircle2 className="w-12 h-12" aria-hidden="true" />
                  </div>
                </div>
                <h2 id="emergency-dialog-title" className="text-3xl font-bold text-foreground tracking-tight">
                  Ayuda en camino
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  Tu familia recibió la alerta con tu ubicación.
                </p>

                <div className="mt-5 rounded-2xl bg-muted p-4 text-left">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
                    <MapPin className="w-4 h-4" style={{ color: GREEN }} aria-hidden="true" />
                    Compartiste tu ubicación
                  </div>
                  <div className="text-sm text-muted-foreground">En casa · Las Condes</div>
                </div>

                <button
                  type="button"
                  onClick={() => setStage("idle")}
                  className="mt-6 w-full py-5 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-slate-300"
                  style={{ background: DEEP }}
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-3 rounded-2xl text-sm font-semibold transition ${active ? "text-white" : "text-muted-foreground hover:bg-muted"}`}
      style={active ? { background: DEEP } : undefined}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      {label}
    </button>
  );
}

/* ---------- PIN Gate ---------- */
function PinGateDialog({
  open, onClose, signupId, onSuccess,
}: { open: boolean; onClose: () => void; signupId: string | null; onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const verify = useServerFn(verifyPin);

  useEffect(() => { if (open) setPin(""); }, [open]);

  const submit = async () => {
    if (!signupId) { toast.error("Sesión no encontrada."); return; }
    if (pin.length !== 4) { toast.error("Ingresa los 4 dígitos."); return; }
    setBusy(true);
    try {
      const pinHash = await hashPin(pin, signupId);
      const res = await verify({ data: { signupId, pinHash } });
      if (!res.configured) {
        toast.info("Aún no has creado tu PIN. Configúralo en la activación.");
        onClose();
        return;
      }
      if (!res.ok) { toast.error("PIN incorrecto."); setPin(""); return; }
      toast.success("PIN correcto.");
      onSuccess();
    } catch (e) {
      console.error(e);
      toast.error("No pudimos verificar el PIN.");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2" style={{ background: DEEP }}>
            <KeyRound className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl">Ingresa tu PIN</DialogTitle>
          <DialogDescription className="text-base">
            El PIN protege la edición de tu red familiar y los ajustes. La emergencia nunca pide PIN.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Input
            inputMode="numeric"
            autoFocus
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            className="text-center text-3xl tracking-[0.6em] h-16"
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={busy || pin.length !== 4} style={{ background: DEEP }}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Desbloquear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Manage Family ---------- */
function ManageFamilyDialog({
  open, onClose, signupId, contacts, setContacts,
}: {
  open: boolean; onClose: () => void; signupId: string | null;
  contacts: Contact[]; setContacts: (c: Contact[]) => void;
}) {
  const [form, setForm] = useState<{ nombre: string; telefono: string; parentesco: string }>({ nombre: "", telefono: "", parentesco: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const add = useServerFn(addFamily);
  const upd = useServerFn(updateFamily);
  const del = useServerFn(deleteFamily);

  const resetForm = () => { setForm({ nombre: "", telefono: "", parentesco: "" }); setEditingId(null); };

  const submit = async () => {
    if (!signupId) return;
    if (!form.nombre.trim() || !form.telefono.trim() || !form.parentesco.trim()) {
      toast.error("Completa todos los campos"); return;
    }
    setBusy(true);
    try {
      if (editingId) {
        const res = await upd({ data: { signupId, id: editingId, contact: form } });
        setContacts(contacts.map(c => c.id === editingId ? (res.contact as Contact) : c));
        toast.success("Familiar actualizado");
      } else {
        if (contacts.length >= 5) { toast.error("Máximo 5 familiares."); return; }
        const res = await add({ data: { signupId, contact: form } });
        setContacts([...contacts, res.contact as Contact]);
        toast.success("Familiar agregado");
      }
      resetForm();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "No pudimos guardar el familiar.");
    } finally { setBusy(false); }
  };

  const startEdit = (c: Contact) => {
    setEditingId(c.id);
    setForm({ nombre: c.nombre, telefono: c.telefono, parentesco: c.parentesco });
  };

  const remove = async (c: Contact) => {
    if (!signupId) return;
    if (!confirm(`¿Eliminar a ${c.nombre}?`)) return;
    setBusy(true);
    try {
      await del({ data: { signupId, id: c.id } });
      setContacts(contacts.filter(x => x.id !== c.id));
      if (editingId === c.id) resetForm();
      toast.success("Familiar eliminado");
    } catch (e) {
      console.error(e); toast.error("No pudimos eliminar.");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && (onClose(), resetForm())}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2" style={{ background: GREEN }}>
            <Users className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl">Administrar familiares</DialogTitle>
          <DialogDescription className="text-base">
            Edita, agrega o elimina hasta 5 personas que reciben tus alertas.
          </DialogDescription>
        </DialogHeader>

        {contacts.length > 0 && (
          <ul className="space-y-2 mb-4">
            {contacts.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: colorFor(i) }}>
                  {initialOf(c.nombre)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground truncate">{c.nombre}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.parentesco} · {c.telefono}</div>
                </div>
                <button type="button" onClick={() => startEdit(c)} className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center" aria-label={`Editar ${c.nombre}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => remove(c)} className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-red-600" aria-label={`Eliminar ${c.nombre}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-3 border-t border-border pt-4">
          <h3 className="font-bold text-foreground">{editingId ? "Editar familiar" : "Agregar familiar"}</h3>
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Pedro" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Parentesco</Label>
              <Input value={form.parentesco} onChange={(e) => setForm({ ...form, parentesco: e.target.value })} placeholder="Hijo, Hija…" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 …" />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 mt-4">
          {editingId && <Button variant="outline" onClick={resetForm}>Cancelar edición</Button>}
          <Button onClick={submit} disabled={busy} style={{ background: GREEN }}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              editingId ? <><CheckCircle2 className="w-4 h-4 mr-1" /> Guardar cambios</>
                        : <><Plus className="w-4 h-4 mr-1" /> Agregar</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
