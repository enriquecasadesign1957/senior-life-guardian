import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_PIN_SESSION_KEY } from "@/lib/admin-auth";

type AdminPinGateProps = {
  title: string;
  description?: string;
  children: (pin: string) => ReactNode;
  onUnlockFailed?: (message: string) => void;
};

export function AdminPinGate({ title, description, children, onUnlockFailed }: AdminPinGateProps) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(ADMIN_PIN_SESSION_KEY);
      if (saved) {
        setPin(saved);
        setUnlocked(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const unlock = () => {
    if (!pin.trim()) {
      onUnlockFailed?.("Ingresa el PIN de administración.");
      return;
    }
    try {
      sessionStorage.setItem(ADMIN_PIN_SESSION_KEY, pin.trim());
    } catch {
      /* ignore */
    }
    setUnlocked(true);
  };

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto mt-12 p-8 rounded-3xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6 text-muted-foreground" />
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <Input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          placeholder="PIN de administración"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && unlock()}
        />
        <Button type="button" className="w-full" onClick={unlock}>
          Entrar
        </Button>
      </div>
    );
  }

  return <>{children(pin)}</>;
}

export function clearAdminPinSession() {
  try {
    sessionStorage.removeItem(ADMIN_PIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
