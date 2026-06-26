import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { isSignupPaymentComplete } from "@/lib/whatsapp-commercial-activation";
import {
  type InstallStep,
  canAdvanceInstallStep,
  installStepIndex,
  isInstallStep,
  maxInstallStep,
} from "@/lib/install-step";

export type InstallStepRow = {
  id: string;
  install_step?: string | null;
  payment_status?: string | null;
  subscription_status?: string | null;
  whatsapp_activated?: boolean | null;
  onboarding_completed?: boolean | null;
  install_instructions_sent_at?: string | null;
  app_opened_at?: string | null;
  sos_primed_at?: string | null;
  fall_sensor_prompted_at?: string | null;
  created_at?: string | null;
};

function isMissingInstallStepColumn(message: string): boolean {
  return (
    message.includes("install_step") ||
    message.includes("app_opened_at") ||
    message.includes("sos_primed_at") ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("42703")
  );
}

function isPaidRow(row: InstallStepRow): boolean {
  if (isSignupPaymentComplete(row.payment_status)) return true;
  const sub = row.subscription_status ?? "";
  return sub === "active" || sub === "comp";
}

export function inferInstallStep(row: InstallStepRow): InstallStep {
  let step: InstallStep = "pending";
  if (isPaidRow(row)) step = "paid";
  if (row.install_instructions_sent_at) step = maxInstallStep(step, "install_link_sent");
  if (row.whatsapp_activated) step = maxInstallStep(step, "whatsapp_linked");
  if (row.app_opened_at) step = maxInstallStep(step, "app_opened");
  if (row.sos_primed_at || row.onboarding_completed || row.install_step === "ready") {
    step = "ready";
  }
  if (isInstallStep(row.install_step) && installStepIndex(row.install_step) > installStepIndex(step)) {
    step = row.install_step;
  }
  return step;
}

async function loadInstallRow(signupId: string): Promise<InstallStepRow | null> {
  const { data, error } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select(
      "id, install_step, payment_status, subscription_status, whatsapp_activated, onboarding_completed, install_instructions_sent_at, app_opened_at, sos_primed_at, fall_sensor_prompted_at, created_at",
    )
    .eq("id", signupId)
    .maybeSingle();

  if (error) {
    if (isMissingInstallStepColumn(error.message ?? "")) return null;
    throw error;
  }
  return data as InstallStepRow | null;
}

/** Avanza install_step solo hacia adelante. */
export async function advanceInstallStep(
  signupId: string,
  target: InstallStep,
  extra?: Record<string, unknown>,
): Promise<{ ok: boolean; step?: InstallStep; skipped?: boolean }> {
  const row = await loadInstallRow(signupId);
  if (!row) return { ok: false };

  const current = inferInstallStep(row);
  if (!canAdvanceInstallStep(current, target) && current !== target) {
    if (installStepIndex(current) >= installStepIndex(target)) {
      return { ok: true, step: current, skipped: true };
    }
  }

  const next = maxInstallStep(current, target);
  const patch: Record<string, unknown> = {
    install_step: next,
    install_step_updated_at: new Date().toISOString(),
    ...extra,
  };

  if (next === "ready") {
    patch.onboarding_completed = true;
  }

  const { error } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).update(patch).eq("id", signupId);
  if (error) {
    if (isMissingInstallStepColumn(error.message ?? "")) return { ok: false };
    console.error("[install-step] advance", error.message);
    return { ok: false };
  }
  return { ok: true, step: next };
}

/** Recalcula install_step desde columnas existentes (backfill / reparación). */
export async function syncInstallStep(signupId: string): Promise<InstallStep | null> {
  const row = await loadInstallRow(signupId);
  if (!row) return null;

  const inferred = inferInstallStep(row);
  const current = isInstallStep(row.install_step) ? row.install_step : "pending";
  const next = maxInstallStep(current, inferred);

  if (installStepIndex(next) === installStepIndex(current) && row.onboarding_completed === (next === "ready")) {
    return next;
  }

  const patch: Record<string, unknown> = {
    install_step: next,
    install_step_updated_at: new Date().toISOString(),
  };
  if (next === "ready") patch.onboarding_completed = true;

  const { error } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).update(patch).eq("id", signupId);
  if (error && !isMissingInstallStepColumn(error.message ?? "")) {
    console.error("[install-step] sync", error.message);
  }
  return next;
}

export async function markInstallPaid(signupId: string): Promise<void> {
  await advanceInstallStep(signupId, "paid");
}

export async function markInstallLinkSent(signupId: string): Promise<void> {
  await advanceInstallStep(signupId, "install_link_sent");
}

export async function markInstallWhatsAppLinked(signupId: string): Promise<void> {
  await advanceInstallStep(signupId, "whatsapp_linked");
}

export async function markInstallAppOpened(signupId: string): Promise<void> {
  const now = new Date().toISOString();
  await advanceInstallStep(signupId, "app_opened", {
    app_opened_at: now,
  });
}

export async function markInstallSosPrimed(signupId: string): Promise<void> {
  const now = new Date().toISOString();
  await advanceInstallStep(signupId, "ready", {
    sos_primed_at: now,
    onboarding_completed: true,
  });
}

export async function markFallSensorPrompted(signupId: string): Promise<void> {
  const row = await loadInstallRow(signupId);
  if (!row) return;
  const { error } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .update({ fall_sensor_prompted_at: new Date().toISOString() })
    .eq("id", signupId);
  if (error && !isMissingInstallStepColumn(error.message ?? "")) {
    console.error("[install-step] fall_sensor_prompted", error.message);
  }
}

export async function readInstallProgress(signupId: string): Promise<{
  installStep: InstallStep;
  onboardingCompleted: boolean;
  appOpenedAt: string | null;
  sosPrimedAt: string | null;
  fallSensorPromptedAt: string | null;
} | null> {
  const row = await loadInstallRow(signupId);
  if (!row) {
    return {
      installStep: "pending",
      onboardingCompleted: false,
      appOpenedAt: null,
      sosPrimedAt: null,
      fallSensorPromptedAt: null,
    };
  }
  const installStep = await syncInstallStep(signupId);
  return {
    installStep: installStep ?? inferInstallStep(row),
    onboardingCompleted: Boolean(row.onboarding_completed) || inferInstallStep(row) === "ready",
    appOpenedAt: row.app_opened_at ?? null,
    sosPrimedAt: row.sos_primed_at ?? null,
    fallSensorPromptedAt: row.fall_sensor_prompted_at ?? null,
  };
}
