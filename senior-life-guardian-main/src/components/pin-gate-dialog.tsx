import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyPin, setUserPin } from "@/lib/family.functions";
import { readStoredSignupId } from "@/lib/post-payment";
import {
  hashPin,
  requestPinResetWithFallback,
  savePinErrorMessage,
  saveUserPinWithFallback,
  verifyPinResetWithFallback,
  verifyPinWithFallback,
} from "@/lib/pin-actions";
import { requestPinReset, verifyPinReset } from "@/lib/pin-reset.functions";
import { pinResetErrorMessage } from "@/lib/pin-reset";

const DEEP = "var(--brand-petrol-deep)";

export type PinGateDialogProps = {
  open: boolean;
  onClose: () => void;
  signupId: string | null;
  pinConfigured: boolean;
  onPinConfigured: () => void;
  onSuccess: () => void;
};

export function PinGateDialog({
  open,
  onClose,
  signupId,
  pinConfigured,
  onPinConfigured,
  onSuccess,
}: PinGateDialogProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [phase, setPhase] = useState<"verify" | "reset-code" | "create" | "confirm">("verify");
  const [busy, setBusy] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const confirmStartedRef = useRef(false);
  const verify = useServerFn(verifyPin);
  const savePin = useServerFn(setUserPin);
  const requestReset = useServerFn(requestPinReset);
  const verifyReset = useServerFn(verifyPinReset);

  const activeSignupId = signupId || readStoredSignupId();

  useEffect(() => {
    if (!open) return;
    setPin("");
    setConfirmPin("");
    setResetCode("");
    setEmailHint(null);
    setInlineError(null);
    confirmStartedRef.current = false;
    setPhase(pinConfigured ? "verify" : "create");
  }, [open, pinConfigured]);

  useEffect(() => {
    if (!open || phase !== "create" || pin.length !== 4) return;
    const t = setTimeout(() => setPhase("confirm"), 250);
    return () => clearTimeout(t);
  }, [open, phase, pin]);

  const startPinReset = async () => {
    if (!activeSignupId) {
      setInlineError("No encontramos tu cuenta. Inicia sesión con tu correo.");
      return;
    }
    setInlineError(null);
    setBusy(true);
    try {
      const res = await requestPinResetWithFallback(requestReset, activeSignupId);
      if (!res.ok) {
        setInlineError(pinResetErrorMessage(res.error));
        return;
      }
      setEmailHint(res.emailHint ?? null);
      setResetCode("");
      setPhase("reset-code");
      toast.success(`Código enviado a ${res.emailHint ?? "tu correo"}`);
    } catch (e) {
      console.error(e);
      setInlineError(pinResetErrorMessage("network_error"));
    } finally {
      setBusy(false);
    }
  };

  const submitResetCode = async () => {
    if (!activeSignupId) {
      setInlineError("No encontramos tu cuenta. Inicia sesión con tu correo.");
      return;
    }
    if (resetCode.length !== 6) {
      setInlineError("Ingresa los 6 dígitos del correo.");
      return;
    }
    setInlineError(null);
    setBusy(true);
    try {
      const res = await verifyPinResetWithFallback(verifyReset, activeSignupId, resetCode);
      if (!res.ok || !res.verified) {
        setInlineError(pinResetErrorMessage(res.error));
        setResetCode("");
        return;
      }
      toast.success("Código correcto. Crea tu PIN nuevo.");
      setPin("");
      setConfirmPin("");
      setPhase("create");
    } catch (e) {
      console.error(e);
      setInlineError(pinResetErrorMessage("network_error"));
    } finally {
      setBusy(false);
    }
  };

  const submitVerify = async () => {
    if (!activeSignupId) {
      setInlineError("No encontramos tu cuenta. Inicia sesión con tu correo.");
      toast.error("Sesión no encontrada.");
      return;
    }
    if (pin.length !== 4) {
      setInlineError("Ingresa los 4 dígitos.");
      return;
    }
    setInlineError(null);
    setBusy(true);
    try {
      const pinHash = await hashPin(pin, activeSignupId);
      const res = await verifyPinWithFallback(verify, activeSignupId, pinHash);
      if (!res.configured) {
        setPhase("create");
        setPin("");
        return;
      }
      if (!res.ok) {
        setInlineError("PIN incorrecto.");
        setPin("");
        return;
      }
      toast.success("PIN correcto.");
      onSuccess();
    } catch (e) {
      console.error(e);
      setInlineError("No pudimos verificar el PIN. Revisa tu conexión.");
      toast.error("No pudimos verificar el PIN.");
    } finally {
      setBusy(false);
    }
  };

  const submitCreate = () => {
    if (!activeSignupId) {
      setInlineError("No encontramos tu cuenta. Inicia sesión con tu correo.");
      return;
    }
    if (pin.length !== 4) {
      setInlineError("Elige 4 dígitos.");
      return;
    }
    setInlineError(null);
    setPhase("confirm");
    setConfirmPin("");
  };

  const submitConfirm = async () => {
    if (!activeSignupId) {
      setInlineError("No encontramos tu cuenta. Inicia sesión con tu correo.");
      toast.error("Sesión no encontrada.");
      return;
    }
    if (confirmPin !== pin) {
      setInlineError("Los PIN no coinciden. Intenta de nuevo.");
      setConfirmPin("");
      setPin("");
      setPhase("create");
      confirmStartedRef.current = false;
      return;
    }
    setInlineError(null);
    setBusy(true);
    try {
      const pinHash = await hashPin(pin, activeSignupId);
      const saved = await saveUserPinWithFallback(savePin, activeSignupId, pinHash);
      if (!saved.ok) {
        setInlineError(savePinErrorMessage(saved.error));
        toast.error(savePinErrorMessage(saved.error));
        confirmStartedRef.current = false;
        return;
      }
      onPinConfigured();
      toast.success("PIN creado. Ya puedes administrar familiares.");
      onSuccess();
    } catch (e) {
      console.error(e);
      setInlineError(savePinErrorMessage());
      toast.error("No pudimos guardar tu PIN.");
      confirmStartedRef.current = false;
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!open || phase !== "confirm" || confirmPin.length !== 4 || busy || confirmStartedRef.current) return;
    confirmStartedRef.current = true;
    void submitConfirm();
  }, [open, phase, confirmPin, busy]);

  const title =
    phase === "verify"
      ? "Ingresa tu PIN"
      : phase === "reset-code"
        ? "Código del correo"
        : phase === "create"
          ? "Crea tu PIN"
          : "Confirma tu PIN";

  const description =
    phase === "verify"
      ? "El PIN protege la edición de tu red familiar. La emergencia nunca pide PIN."
      : phase === "reset-code"
        ? emailHint
          ? `Enviamos un código de 6 dígitos a ${emailHint}. Revísalo (también en spam).`
          : "Enviamos un código de 6 dígitos a tu correo registrado."
        : phase === "create"
          ? "Elige 4 dígitos fáciles de recordar. Los usarás para agregar familiares."
          : "Vuelve a ingresar el mismo PIN para confirmar.";

  const isResetPhase = phase === "reset-code";
  const value = isResetPhase ? resetCode : phase === "confirm" ? confirmPin : pin;
  const maxLen = isResetPhase ? 6 : 4;

  const setValue = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, maxLen);
    if (isResetPhase) setResetCode(digits);
    else if (phase === "confirm") setConfirmPin(digits);
    else setPin(digits);
  };

  const onSubmit = () => {
    if (phase === "verify") return submitVerify();
    if (phase === "reset-code") return submitResetCode();
    if (phase === "create") return submitCreate();
    return submitConfirm();
  };

  const primaryLabel =
    phase === "verify"
      ? "Desbloquear"
      : phase === "reset-code"
        ? "Verificar código"
        : phase === "create"
          ? "Continuar"
          : "Guardar PIN";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm z-[100]">
        <DialogHeader>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2"
            style={{ background: DEEP }}
          >
            {isResetPhase ? <Mail className="w-7 h-7" /> : <KeyRound className="w-7 h-7" />}
          </div>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-base">{description}</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Input
            inputMode="numeric"
            autoFocus
            maxLength={maxLen}
            value={value}
            onChange={(e) => {
              setInlineError(null);
              setValue(e.target.value);
            }}
            placeholder={isResetPhase ? "000000" : "••••"}
            className={`text-center h-16 ${isResetPhase ? "text-2xl tracking-[0.4em]" : "text-3xl tracking-[0.6em]"}`}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
          />
          {inlineError && (
            <p className="mt-2 text-sm font-medium text-destructive text-center" role="alert">
              {inlineError}
            </p>
          )}
          {phase === "verify" && pinConfigured && (
            <button
              type="button"
              onClick={() => void startPinReset()}
              disabled={busy}
              className="mt-3 w-full text-sm font-semibold text-primary underline underline-offset-2 disabled:opacity-50"
            >
              Olvidé mi PIN — enviar código al correo
            </button>
          )}
          {phase === "reset-code" && (
            <button
              type="button"
              onClick={() => void startPinReset()}
              disabled={busy}
              className="mt-3 w-full text-sm font-semibold text-primary underline underline-offset-2 disabled:opacity-50"
            >
              Reenviar código
            </button>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row">
          {phase === "reset-code" && (
            <Button type="button" variant="ghost" className="sm:mr-auto" onClick={() => setPhase("verify")}>
              Volver al PIN
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={busy || value.length !== maxLen}
            style={{ background: DEEP }}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : primaryLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
