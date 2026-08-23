"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Phone,
  PhoneCall,
  RefreshCw,
  Zap,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabaseClient";
import {
  OncallMembersPanel,
  type OncallMember,
} from "@/components/OncallMembersPanel";
import { OncallSchedulesPanel } from "@/components/OncallSchedulesPanel";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ProChileCheckout } from "@/components/ProChileCheckout";
import { useLanguage } from "@/components/LanguageProvider";
import type { OncallShift } from "@/lib/oncallTurnosCsv";
import {
  cn,
  formatDate,
  generateApiKey,
  sha256Hex,
} from "@/lib/utils";

const ALERT_ENDPOINT = "https://api.wakeupdev.com/v1/alert";
const ONCALL_ALERTAS_SELECT =
  "id, estado, orden_actual, texto_original, texto_voz, creado_en";
const ESTADOS_EN_CURSO = new Set(["TRIGGERED", "CALLING", "NO_ANSWER"]);

type Usuario = {
  id: string;
  email: string;
  telefono_verificado: string | null;
  creditos_disponibles: number;
};

type OncallEstado =
  | "TRIGGERED"
  | "CALLING"
  | "ACKNOWLEDGED"
  | "NO_ANSWER"
  | "EXHAUSTED"
  | "FAILED"
  | string;

type Alerta = {
  id: string;
  estado: OncallEstado;
  orden_actual: number;
  texto_original: string;
  texto_voz: string | null;
  creado_en: string;
};

type Props = {
  user: User;
  userId: string;
  initialUsuario: Usuario | null;
  initialAlertas: Alerta[];
  hasApiKey: boolean;
  billingAlready?: boolean;
  initialMembers?: OncallMember[];
  initialShifts?: OncallShift[];
};

function maskSecret(value: string) {
  if (value.length <= 10) return "••••••••";
  return `${value.slice(0, 6)}••••••••••••${value.slice(-4)}`;
}

export function DashboardClient({
  user,
  userId,
  initialUsuario,
  initialAlertas,
  hasApiKey,
  billingAlready = false,
  initialMembers = [],
  initialShifts = [],
}: Props) {
  const { t, locale } = useLanguage();
  const supabase = useMemo(() => createClient(), []);
  const [members, setMembers] = useState(initialMembers);
  const [usuario, setUsuario] = useState(initialUsuario);
  const [alertas, setAlertas] = useState(initialAlertas);
  const [telefono, setTelefono] = useState(
    initialUsuario?.telefono_verificado ?? ""
  );
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState<string | null>(null);

  const [rawKey, setRawKey] = useState<string | null>(null);
  const [keyExists, setKeyExists] = useState(hasApiKey);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keyBusy, setKeyBusy] = useState(false);
  const [keyMsg, setKeyMsg] = useState<string | null>(null);

  const [testBusy, setTestBusy] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const [testOk, setTestOk] = useState(false);

  const refreshAlertas = useCallback(async () => {
    const { data } = await supabase
      .from("oncall_alertas")
      .select(ONCALL_ALERTAS_SELECT)
      .eq("usuario_id", userId)
      .order("creado_en", { ascending: false })
      .limit(20);

    if (data) setAlertas(data as Alerta[]);
  }, [supabase, userId]);

  useEffect(() => {
    const channel = supabase
      .channel(`usuario-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "usuarios",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setUsuario(payload.new as Usuario);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  useEffect(() => {
    const channel = supabase
      .channel(`oncall-alertas-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "oncall_alertas",
          filter: `usuario_id=eq.${userId}`,
        },
        () => {
          void refreshAlertas();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshAlertas, supabase, userId]);

  useEffect(() => {
    const enCurso = alertas.some((a) => ESTADOS_EN_CURSO.has(a.estado));
    if (!enCurso) return;
    const timer = window.setInterval(() => {
      void refreshAlertas();
    }, 4000);
    return () => window.clearInterval(timer);
  }, [alertas, refreshAlertas]);

  async function savePhone() {
    setPhoneSaving(true);
    setPhoneMsg(null);
    const { error } = await supabase
      .from("usuarios")
      .update({ telefono_verificado: telefono.trim() || null })
      .eq("id", userId);

    setPhoneSaving(false);
    if (error) {
      setPhoneMsg(t("phoneSaveError"));
      return;
    }
    setPhoneMsg(t("phoneSaved"));
    setUsuario((prev) =>
      prev
        ? { ...prev, telefono_verificado: telefono.trim() || null }
        : prev
    );
  }

  async function createApiKey(): Promise<string | null> {
    const newKey = generateApiKey();
    const keyHash = await sha256Hex(newKey);

    await supabase
      .from("api_keys")
      .update({ activa: false })
      .eq("usuario_id", userId)
      .eq("activa", true);

    const { error } = await supabase.from("api_keys").insert({
      usuario_id: userId,
      key_hash: keyHash,
      activa: true,
    });

    if (error) return null;

    setRawKey(newKey);
    setKeyExists(true);
    setShowKey(true);
    return newKey;
  }

  async function regenerateApiKey() {
    setKeyBusy(true);
    setKeyMsg(null);
    setCopied(false);

    try {
      const newKey = await createApiKey();
      if (!newKey) {
        setKeyMsg(t("apiKeyRegenError"));
        return;
      }
      setKeyMsg(t("apiKeyRegenOk"));
    } catch {
      setKeyMsg(t("apiKeyGenError"));
    } finally {
      setKeyBusy(false);
    }
  }

  async function copyKey() {
    if (!rawKey) return;
    await navigator.clipboard.writeText(rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function fireTestCall() {
    setTestBusy(true);
    setTestMsg(null);
    setTestOk(false);

    try {
      if (!telefono.trim()) {
        setTestMsg(t("noPhoneBeforeTest"));
        return;
      }

      let key = rawKey;
      if (!key) {
        key = await createApiKey();
      }
      if (!key) {
        setTestMsg(t("apiKeyPrepareError"));
        return;
      }

      const response = await fetch(ALERT_ENDPOINT, {
        method: "POST",
        headers: {
          "x-api-key": key,
          "Content-Type": "text/plain",
        },
        body: "Prueba WakeUp Dev: llamada de prueba desde el dashboard.",
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        success?: boolean;
        accepted?: boolean;
        creditos_restantes?: number;
      };

      if (!response.ok && response.status !== 202) {
        setTestMsg(payload.error ?? t("apiResponded", { status: response.status }));
        return;
      }
      if (!payload.success && !payload.accepted) {
        setTestMsg(payload.error ?? t("apiResponded", { status: response.status }));
        return;
      }

      const remaining =
        typeof payload.creditos_restantes === "number"
          ? payload.creditos_restantes
          : Math.max(0, (usuario?.creditos_disponibles ?? 1) - 1);

      setUsuario((prev) =>
        prev ? { ...prev, creditos_disponibles: remaining } : prev
      );
      setTestOk(true);
      setTestMsg(t("testAccepted"));
      await refreshAlertas();
    } catch {
      setTestMsg(t("apiUnreachable"));
    } finally {
      setTestBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const displayKey = rawKey
    ? showKey
      ? rawKey
      : maskSecret(rawKey)
    : keyExists
      ? "wk_••••••••••••••••••••••••••••••••"
      : t("noApiKeyYet");

  const credits = usuario?.creditos_disponibles ?? 0;

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            WakeUp Dev
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {t("controlPanel")}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
          <p className="mt-2 font-mono text-xs text-zinc-600">
            {t("session")} {maskSecret(userId)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            type="button"
            onClick={signOut}
            className="rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
          >
            {t("signOut")}
          </button>
        </div>
      </header>

      {billingAlready ? (
        <p className="mb-6 rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          {t("billingAlready")}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-glow lg:col-span-1">
          <div className="flex items-center gap-2 text-zinc-400">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">{t("alertBalance")}</span>
          </div>
          <p className="mt-4 font-mono text-5xl font-semibold tabular-nums text-zinc-50">
            {credits}
          </p>
          <p className="mt-2 text-sm text-zinc-500">{t("creditsAvailable")}</p>
          <div className="mt-6">
            <ProChileCheckout variant="dashboard" />
          </div>
          <button
            type="button"
            onClick={fireTestCall}
            disabled={testBusy || credits <= 0}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-black transition hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-60"
          >
            {testBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PhoneCall className="h-4 w-4" />
            )}
            {t("fireTestCall")}
          </button>
          {testMsg && (
            <p
              className={cn(
                "mt-3 text-xs",
                testOk ? "text-accent" : "text-red-400"
              )}
            >
              {testMsg}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-zinc-400">
            <Phone className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">
              {t("emergencyPhone")}
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+56912345678"
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-zinc-50 outline-none ring-accent focus:ring-1"
            />
            <button
              type="button"
              onClick={savePhone}
              disabled={phoneSaving}
              className="shrink-0 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dim disabled:opacity-60"
            >
              {phoneSaving ? t("saving") : t("save")}
            </button>
          </div>
          {phoneMsg && (
            <p className="mt-2 text-xs text-zinc-400">{phoneMsg}</p>
          )}
        </section>

        <OncallMembersPanel
          userId={userId}
          supabase={supabase}
          initialMembers={members}
          onMembersChange={setMembers}
        />

        <OncallSchedulesPanel
          userId={userId}
          supabase={supabase}
          members={members}
          initialShifts={initialShifts}
        />

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <KeyRound className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">API Key</span>
            </div>
            <button
              type="button"
              onClick={regenerateApiKey}
              disabled={keyBusy}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 disabled:opacity-60"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", keyBusy && "animate-spin")}
              />
              {t("regenerateApiKey")}
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                readOnly
                value={displayKey}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2.5 pr-20 font-mono text-sm text-zinc-200 outline-none"
              />
              <div className="absolute inset-y-0 right-1 flex items-center gap-1">
                <button
                  type="button"
                  disabled={!rawKey}
                  onClick={() => setShowKey((v) => !v)}
                  className="rounded p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50 disabled:opacity-30"
                  aria-label={showKey ? t("hide") : t("show")}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  disabled={!rawKey}
                  onClick={copyKey}
                  className="rounded p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50 disabled:opacity-30"
                  aria-label={t("copy")}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-accent" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Header{" "}
            <code className="rounded bg-zinc-950 px-1.5 py-0.5 font-mono text-zinc-300">
              x-api-key
            </code>{" "}
            →{" "}
            <code className="font-mono text-zinc-300">
              POST {ALERT_ENDPOINT}
            </code>
            . {t("apiKeyHint")}{" "}
            <code className="font-mono">wk_</code>.
          </p>
          {keyMsg && <p className="mt-2 text-xs text-warn">{keyMsg}</p>}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-zinc-300">
              {t("recentAlerts")}
            </h2>
            <button
              type="button"
              onClick={refreshAlertas}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              {t("refresh")}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="pb-3 pr-4 font-medium">{t("date")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("status")}</th>
                  <th className="pb-3 pr-4 font-medium">{t("original")}</th>
                  <th className="pb-3 font-medium">{t("groq")}</th>
                </tr>
              </thead>
              <tbody>
                {alertas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 text-center text-zinc-500"
                    >
                      {t("noAlertsYet")}{" "}
                      <code className="font-mono text-zinc-400">
                        /v1/alert
                      </code>
                      .
                    </td>
                  </tr>
                ) : (
                  alertas.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-zinc-800/60 align-top"
                    >
                      <td className="whitespace-nowrap py-3 pr-4 font-mono text-xs text-zinc-400">
                        {formatDate(a.creado_en, locale)}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-6">
                        <StatusBadge
                          estado={a.estado}
                          ordenActual={a.orden_actual}
                        />
                      </td>
                      <td className="max-w-[240px] py-3 pr-4 text-zinc-400">
                        <span className="line-clamp-2">
                          {a.texto_original}
                        </span>
                      </td>
                      <td className="max-w-[280px] py-3 text-zinc-200">
                        <span className="line-clamp-2">
                          {a.texto_voz || "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function statusUi(
  estado: OncallEstado,
  t: (key: "statusAcknowledged" | "statusCalling" | "statusTriggered" | "statusNoAnswer" | "statusFailed") => string
): { label: string; className: string } {
  switch (estado) {
    case "ACKNOWLEDGED":
      return {
        label: t("statusAcknowledged"),
        className: "bg-accent/15 text-accent border-accent/30",
      };
    case "CALLING":
      return {
        label: t("statusCalling"),
        className: "bg-warn/15 text-warn border-warn/30",
      };
    case "TRIGGERED":
      return {
        label: t("statusTriggered"),
        className: "bg-zinc-800/80 text-zinc-300 border-zinc-600/40",
      };
    case "NO_ANSWER":
    case "EXHAUSTED":
      return {
        label: t("statusNoAnswer"),
        className: "bg-danger/15 text-danger border-danger/30",
      };
    case "FAILED":
      return {
        label: t("statusFailed"),
        className: "bg-danger/15 text-danger border-danger/30",
      };
    default:
      return {
        label: estado.replace(/_/g, " "),
        className: "bg-zinc-800/80 text-zinc-300 border-zinc-600/40",
      };
  }
}

function StatusBadge({
  estado,
  ordenActual,
}: {
  estado: OncallEstado;
  ordenActual: number;
}) {
  const { t } = useLanguage();
  const { label, className } = statusUi(estado, t);
  return (
    <span className="inline-flex min-w-[11rem] items-center gap-2.5 whitespace-nowrap">
      <span
        className={cn(
          "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
          className
        )}
      >
        {label}
      </span>
      <span className="rounded-md border border-zinc-300 bg-zinc-100 px-2 py-0.5 font-mono text-xs font-bold text-zinc-800 shadow-sm">
        {t("attemptN", { n: ordenActual })}
      </span>
    </span>
  );
}
