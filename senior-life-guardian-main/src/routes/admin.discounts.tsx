import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Plus, RefreshCw } from "lucide-react";
import { AdminPinGate } from "@/components/admin-pin-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { DiscountCodeRow } from "@/lib/discount-codes";
import {
  adminCreateDiscountCode,
  adminListDiscountCodes,
  adminUpdateDiscountCode,
} from "@/lib/admin-discount.functions";

export const Route = createFileRoute("/admin/discounts")({
  component: AdminDiscountsPage,
  head: () => ({ meta: [{ title: "Admin · Descuentos — Senior Safe" }] }),
});

function AdminDiscountsPage() {
  return (
    <AdminPinGate
      title="Códigos de descuento"
      description="Convenios municipales y promociones aplicables en checkout."
      onUnlockFailed={(m) => toast.error(m)}
    >
      {(pin) => <AdminDiscountsInner pin={pin} />}
    </AdminPinGate>
  );
}

function AdminDiscountsInner({ pin }: { pin: string }) {
  const listFn = useServerFn(adminListDiscountCodes);
  const createFn = useServerFn(adminCreateDiscountCode);
  const updateFn = useServerFn(adminUpdateDiscountCode);

  const [codes, setCodes] = useState<DiscountCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [partnerSlug, setPartnerSlug] = useState("");
  const [percentOff, setPercentOff] = useState("15");
  const [appliesMonthly, setAppliesMonthly] = useState(true);
  const [appliesAnnual, setAppliesAnnual] = useState(true);
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [notes, setNotes] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listFn({ data: { pin } });
      setCodes(res.codes);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cargar códigos");
    } finally {
      setLoading(false);
    }
  }, [listFn, pin]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createCode = async () => {
    setCreating(true);
    try {
      await createFn({
        data: {
          pin,
          code: code.trim(),
          label: label.trim(),
          partner_slug: partnerSlug.trim(),
          percent_off: Number(percentOff),
          applies_monthly: appliesMonthly,
          applies_annual: appliesAnnual,
          max_redemptions: maxRedemptions ? Number(maxRedemptions) : null,
          notes: notes.trim() || null,
        },
      });
      toast.success("Código creado");
      setShowForm(false);
      setCode("");
      setLabel("");
      setPartnerSlug("");
      setNotes("");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo crear");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (row: DiscountCodeRow) => {
    try {
      await updateFn({ data: { pin, id: row.id, active: !row.active } });
      toast.success(row.active ? "Código desactivado" : "Código activado");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Códigos de descuento</h1>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button type="button" size="sm" onClick={() => setShowForm((s) => !s)}>
              <Plus className="w-4 h-4 mr-1" /> Nuevo
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {showForm && (
          <section className="p-5 rounded-2xl border bg-card space-y-4">
            <h2 className="font-bold">Crear código</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="code">Código</Label>
                <Input id="code" placeholder="VECINO-MAIPU" value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pct">Descuento %</Label>
                <Input
                  id="pct"
                  type="number"
                  min={1}
                  max={100}
                  value={percentOff}
                  onChange={(e) => setPercentOff(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="label">Nombre visible</Label>
                <Input
                  id="label"
                  placeholder="Convenio Municipalidad de Maipú"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="slug">Partner slug</Label>
                <Input
                  id="slug"
                  placeholder="maipu"
                  value={partnerSlug}
                  onChange={(e) => setPartnerSlug(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="max">Máx. usos (vacío = ilimitado)</Label>
                <Input
                  id="max"
                  type="number"
                  min={1}
                  value={maxRedemptions}
                  onChange={(e) => setMaxRedemptions(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={appliesMonthly} onCheckedChange={setAppliesMonthly} />
                Aplica mensual
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={appliesAnnual} onCheckedChange={setAppliesAnnual} />
                Aplica anual
              </label>
            </div>
            <div>
              <Label htmlFor="notes">Notas internas</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button type="button" disabled={creating} onClick={() => void createCode()}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Crear código
            </Button>
          </section>
        )}

        <section className="rounded-2xl border bg-card overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : codes.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No hay códigos. Crea el primero arriba.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">%</th>
                    <th className="p-3">Usos</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {codes.map((row) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="p-3">
                        <div className="font-mono font-bold">{row.code}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{row.label}</div>
                      </td>
                      <td className="p-3">{row.percent_off}%</td>
                      <td className="p-3">
                        {row.redemption_count}
                        {row.max_redemptions != null ? ` / ${row.max_redemptions}` : ""}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            row.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {row.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button type="button" variant="outline" size="sm" onClick={() => void toggleActive(row)}>
                          {row.active ? "Desactivar" : "Activar"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs text-muted-foreground">
          Los descuentos se aplican en checkout. El cobro mínimo con Transbank es $1 CLP (100% requiere cortesía
          admin en «Gratuidad»).
        </p>
      </main>
    </div>
  );
}
