"use client";

import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Users, MapPin, Tag, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { completeCheckoutProfile } from "@/lib/complete-checkout-profile.functions";
import {
  clearCheckoutDraft,
  hasCheckoutDraftForSignup,
  readCheckoutDraft,
} from "@/lib/checkout-draft";
import { getServerErrorMessage } from "@/lib/server-error-message";
import { normalizeDiscountCodeInput } from "@/lib/discount-codes";

const DEEP = "var(--brand-petrol-deep)";
const PETROL = "var(--brand-petrol)";
const GREEN = "#16a34a";

const GUARDIAN_RELATIONS = [
  "Hijo/a",
  "Nieto/a",
  "Hermano/a",
  "Vecino/a",
  "Cuidador/a",
  "Otro familiar",
] as const;

const DONE_KEY = "seniorsafe_checkout_profile_done:";

function alreadyCompleted(signupId: string): boolean {
  try {
    return localStorage.getItem(`${DONE_KEY}${signupId}`) === "1";
  } catch {
    return false;
  }
}

function markCompleted(signupId: string) {
  try {
    localStorage.setItem(`${DONE_KEY}${signupId}`, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Formulario secundario post-pago: guardián, dirección y código institucional.
 * Solo se muestra si hay draft de checkout slim y aún no se completó.
 */
export function PostPaymentProfileForm({
  signupId,
}: {
  signupId: string | null;
}) {
  const completeProfile = useServerFn(completeCheckoutProfile);
  const [visible, setVisible] = useState(false);
  const [seniorPhone, setSeniorPhone] = useState<string | undefined>();

  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelation, setGuardianRelation] = useState<string>(GUARDIAN_RELATIONS[0]);
  const [address, setAddress] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!signupId) {
      setVisible(false);
      return;
    }
    if (alreadyCompleted(signupId)) {
      setVisible(false);
      return;
    }
    const draft = readCheckoutDraft();
    setSeniorPhone(draft?.phone);
    setVisible(hasCheckoutDraftForSignup(signupId));
  }, [signupId]);

  if (!visible || !signupId || done) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (guardianName.trim().length < 2) {
      setError("Ingresa el nombre del guardián.");
      return;
    }
    if (guardianPhone.trim().length < 8) {
      setError("Ingresa el teléfono del guardián.");
      return;
    }

    setLoading(true);
    try {
      await completeProfile({
        data: {
          signupId: signupId!,
          direccion: address.trim(),
          discountCode: normalizeDiscountCodeInput(discountCode),
          guardianName: guardianName.trim(),
          guardianPhone: guardianPhone.trim(),
          guardianRelation: guardianRelation.trim(),
          seniorPhone,
        },
      });
      markCompleted(signupId!);
      clearCheckoutDraft();
      setDone(true);
      toast.success("Guardián inscrito. Ya puedes instalar la app.");
    } catch (err) {
      setError(getServerErrorMessage(err, "No pudimos guardar los datos. Intenta de nuevo."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-3xl border border-border bg-card p-5 md:p-6 shadow-sm text-left space-y-4"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: PETROL }}
        >
          <Users className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Completa la red de protección
          </h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Inscribe al primer guardián (obligatorio para alertas). Dirección y código son
            opcionales.
          </p>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
          Nombre del guardián
        </label>
        <input
          value={guardianName}
          onChange={(e) => setGuardianName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base outline-none focus:border-foreground/40"
          placeholder="Carlos González"
          autoComplete="name"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
          Teléfono / WhatsApp del guardián
        </label>
        <input
          value={guardianPhone}
          onChange={(e) => setGuardianPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base outline-none focus:border-foreground/40"
          placeholder="+56 9 ..."
          inputMode="tel"
          autoComplete="tel"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
          Parentesco
        </label>
        <select
          value={guardianRelation}
          onChange={(e) => setGuardianRelation(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base outline-none focus:border-foreground/40"
        >
          {GUARDIAN_RELATIONS.map((rel) => (
            <option key={rel} value={rel}>
              {rel}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" aria-hidden /> Dirección (opcional)
        </label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base outline-none focus:border-foreground/40"
          placeholder="Calle, comuna, ciudad"
          autoComplete="street-address"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 inline-flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" aria-hidden /> Código institucional (opcional)
        </label>
        <input
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base outline-none focus:border-foreground/40 uppercase"
          placeholder="Código de convenio"
          autoComplete="off"
          spellCheck={false}
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          Si el descuento ya se aplicó al pagar, no es necesario volver a ingresarlo.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold text-white disabled:opacity-70"
        style={{ background: DEEP }}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Guardando…
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" style={{ color: GREEN }} />
            Guardar e instalar
          </>
        )}
      </button>
    </form>
  );
}
