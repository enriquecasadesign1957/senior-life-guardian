import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, Loader2, Edit2, Save, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { readFamilyPortalSession, type FamilyPortalSession } from "@/lib/family-session";
import {
  listGuardiansForFamily,
  addGuardianForFamily,
  updateGuardianForFamily,
  deleteGuardianForFamily,
  toggleGuardianActiveForFamily,
} from "@/lib/guardians.functions";
import { MAX_GUARDIANS } from "@/lib/guardian-limits";

export const Route = createFileRoute("/familia/guardianes")({
  head: () => ({
    meta: [
      { title: "Mis Guardianes — Senior Safe" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: GuardiansPage,
});

type Guardian = {
  id: string;
  nombre: string;
  telefono: string;
  whatsapp: string | null;
  parentesco: string;
  prioridad: number;
  activo: boolean;
  tipo_contacto: string;
  recibe_sms: boolean;
  recibe_whatsapp: boolean;
  recibe_llamada: boolean;
};

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const msg = error.message;
    if (/Sesión inválida|Portal Familia/i.test(msg)) {
      return "Sesión expirada. Vuelve a ingresar al Portal Familia con tu teléfono.";
    }
    return msg;
  }
  return fallback;
}

function familyAuth(session: FamilyPortalSession) {
  return {
    family_member_id: session.family_member_id,
    contract_signup_id: session.contract_signup_id,
    session_token: session.token,
  };
}

function GuardiansPage() {
  const navigate = useNavigate();
  const list = useServerFn(listGuardiansForFamily);
  const add = useServerFn(addGuardianForFamily);
  const update = useServerFn(updateGuardianForFamily);
  const del = useServerFn(deleteGuardianForFamily);
  const toggle = useServerFn(toggleGuardianActiveForFamily);

  const [session, setSession] = useState<FamilyPortalSession | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Guardian>>({
    nombre: "",
    telefono: "",
    parentesco: "",
    prioridad: 1,
    activo: true,
    tipo_contacto: "familiar",
    recibe_sms: true,
    recibe_whatsapp: true,
    recibe_llamada: true,
  });

  useEffect(() => {
    const stored = readFamilyPortalSession();
    if (!stored) {
      navigate({ to: "/familia", search: { redirect: "/familia/guardianes" }, replace: true });
      return;
    }
    setSession(stored);
  }, [navigate]);

  const reload = async (current: FamilyPortalSession) => {
    try {
      const res = await list({ data: familyAuth(current) });
      setGuardians(res.guardians as Guardian[]);
      setLoadError(null);
    } catch (e: unknown) {
      const message = errorMessage(e, "No pudimos cargar tus guardianes.");
      setLoadError(message);
      setGuardians([]);
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    reload(session).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const resetForm = () =>
    setForm({
      nombre: "",
      telefono: "",
      parentesco: "",
      prioridad: 1,
      activo: true,
      tipo_contacto: "familiar",
      recibe_sms: true,
      recibe_whatsapp: true,
      recibe_llamada: true,
    });

  const handleAdd = async () => {
    if (!session || !form.nombre || !form.telefono || !form.parentesco) {
      return toast.error("Completa nombre, teléfono y parentesco.");
    }
    try {
      await add({ data: { ...familyAuth(session), guardian: form } });
      toast.success("Guardián agregado");
      setShowAdd(false);
      resetForm();
      reload(session);
    } catch (e: unknown) {
      toast.error(errorMessage(e, "Error al agregar."));
    }
  };

  const handleSave = async (id: string) => {
    if (!session) return;
    try {
      await update({ data: { ...familyAuth(session), id, guardian: form } });
      toast.success("Actualizado");
      setEditing(null);
      resetForm();
      reload(session);
    } catch (e: unknown) {
      toast.error(errorMessage(e, "Error al guardar."));
    }
  };

  const handleDelete = async (id: string) => {
    if (!session) return;
    if (!confirm("¿Eliminar este guardián?")) return;
    try {
      await del({ data: { ...familyAuth(session), id } });
      reload(session);
    } catch (e: unknown) {
      toast.error(errorMessage(e, "Error."));
    }
  };

  const handleToggle = async (id: string, activo: boolean) => {
    if (!session) return;
    await toggle({ data: { ...familyAuth(session), id, activo } });
    reload(session);
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/familia/dashboard" search={{ redirect: undefined }} className="inline-flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <h1 className="font-bold">Mis Guardianes</h1>
          <Button
            size="sm"
            disabled={guardians.length >= MAX_GUARDIANS}
            onClick={() => {
              if (guardians.length >= MAX_GUARDIANS) {
                toast.error(`Máximo ${MAX_GUARDIANS} guardianes.`);
                return;
              }
              resetForm();
              setShowAdd(true);
              setEditing(null);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Agregar
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-3">
        {loadError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800">
            {loadError}
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => session && reload(session)}
            >
              Reintentar
            </Button>
          </div>
        )}

        {showAdd && (
          <GuardianForm
            form={form}
            setForm={setForm}
            onCancel={() => {
              setShowAdd(false);
              resetForm();
            }}
            onSave={handleAdd}
            title="Nuevo guardián"
          />
        )}

        {guardians.length >= MAX_GUARDIANS && (
          <p className="text-sm text-muted-foreground bg-white rounded-2xl p-4 border">
            Ya tienes {MAX_GUARDIANS} guardianes (máximo). En emergencias se notifica a los 3 prioritarios por SMS, WhatsApp y llamada escalonada.
          </p>
        )}

        {guardians.length === 0 && !showAdd && (
          <div className="bg-white rounded-2xl p-8 text-center text-muted-foreground">
            Aún no hay guardianes. Agrega al menos uno para recibir alertas.
          </div>
        )}

        {guardians.map((g) =>
          editing === g.id ? (
            <GuardianForm
              key={g.id}
              form={form}
              setForm={setForm}
              onCancel={() => {
                setEditing(null);
                resetForm();
              }}
              onSave={() => handleSave(g.id)}
              title={`Editar ${g.nombre}`}
            />
          ) : (
            <div
              key={g.id}
              className={`bg-white rounded-2xl p-4 shadow-sm ${!g.activo ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{g.nombre}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">
                      {g.parentesco}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      P{g.prioridad}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    📱 {g.telefono}
                    {g.whatsapp && g.whatsapp !== g.telefono ? ` • WA ${g.whatsapp}` : ""}
                  </div>
                  <div className="flex gap-2 mt-2 text-xs">
                    {g.recibe_whatsapp && <Badge>WhatsApp</Badge>}
                    {g.recibe_sms && <Badge>SMS</Badge>}
                    {g.recibe_llamada && <Badge>Llamada</Badge>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Switch checked={g.activo} onCheckedChange={(v) => handleToggle(g.id, v)} />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setForm(g);
                        setEditing(g.id);
                        setShowAdd(false);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(g.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ),
        )}
      </main>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full inline-flex items-center gap-1">
      <Check className="w-3 h-3" />
      {children}
    </span>
  );
}

function GuardianForm({
  form,
  setForm,
  onCancel,
  onSave,
  title,
}: {
  form: Partial<Guardian>;
  setForm: (f: Partial<Guardian>) => void;
  onCancel: () => void;
  onSave: () => void;
  title: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-primary/30">
      <h3 className="font-bold mb-3">{title}</h3>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label>Nombre</Label>
          <Input
            value={form.nombre ?? ""}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Parentesco</Label>
            <Input
              value={form.parentesco ?? ""}
              onChange={(e) => setForm({ ...form, parentesco: e.target.value })}
              placeholder="Hijo, esposa..."
            />
          </div>
          <div>
            <Label>Prioridad (1-10)</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={form.prioridad ?? 1}
              onChange={(e) => setForm({ ...form, prioridad: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input
            value={form.telefono ?? ""}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            placeholder="+56 9 ..."
          />
        </div>
        <div>
          <Label>WhatsApp (si es distinto)</Label>
          <Input
            value={form.whatsapp ?? ""}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            placeholder="Opcional"
          />
        </div>
        <div className="space-y-2 pt-2">
          <ToggleRow
            label="Recibir WhatsApp"
            value={form.recibe_whatsapp ?? true}
            onChange={(v) => setForm({ ...form, recibe_whatsapp: v })}
          />
          <ToggleRow
            label="Recibir SMS"
            value={form.recibe_sms ?? true}
            onChange={(v) => setForm({ ...form, recibe_sms: v })}
          />
          <ToggleRow
            label="Recibir llamada"
            value={form.recibe_llamada ?? true}
            onChange={(v) => setForm({ ...form, recibe_llamada: v })}
          />
          <ToggleRow
            label="Activo"
            value={form.activo ?? true}
            onChange={(v) => setForm({ ...form, activo: v })}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" /> Cancelar
          </Button>
          <Button className="flex-1" onClick={onSave}>
            <Save className="w-4 h-4 mr-1" /> Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
