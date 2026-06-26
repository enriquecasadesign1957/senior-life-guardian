import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { listFamilyContacts } from "@/lib/contacts-storage";
import { markInstallAppOpened, readInstallProgress } from "@/lib/install-step-sync";
import { readStoredPinHash } from "@/lib/pin-storage";
import { issueSeniorAccessToken } from "@/lib/senior-access-auth";
import type { InstallStep } from "@/lib/install-step";
import { phoneLookupCandidates } from "@/lib/phone-utils";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";

export type AccountUser = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  plan: string;
  periodo: string;
  purchase_mode: string;
  subscription_status: string;
  payment_status: string;
};

export type AccountContact = {
  id: string;
  nombre: string;
  telefono: string;
  parentesco: string;
  created_at: string;
};

export type AppConfigResult = {
  configured: boolean;
  user: AccountUser | null;
  contacts: AccountContact[];
  pinConfigured: boolean;
  whatsappActivated?: boolean;
  installStep?: InstallStep;
  onboardingCompleted?: boolean;
  sosPrimedAt?: string | null;
  fallSensorPromptedAt?: string | null;
  /** Token HMAC para operaciones autenticadas del dispositivo. */
  accessToken?: string;
  error?: string;
};

const SIGNUP_SELECT =
  "id,nombre,email,telefono,plan,periodo,purchase_mode,subscription_status,payment_status,whatsapp_activated";

/** Busca cuenta por id, email o teléfono sin lanzar excepciones (seguro para login). */
export async function fetchAppConfiguration(input: {
  signupId?: string;
  email?: string;
  telefono?: string;
}): Promise<AppConfigResult> {
  const empty: AppConfigResult = {
    configured: false,
    user: null,
    contacts: [],
    pinConfigured: false,
  };

  try {
    let query = supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select(SIGNUP_SELECT)
      .order("created_at", { ascending: false })
      .limit(1);

    if (input.signupId) {
      query = query.eq("id", input.signupId);
    } else if (input.email) {
      query = query.eq("email", input.email.trim().toLowerCase());
    } else if (input.telefono) {
      const candidates = phoneLookupCandidates(input.telefono);
      if (candidates.length === 0) return { ...empty, error: "missing_lookup" };
      query = query.in("telefono", candidates);
    } else {
      return { ...empty, error: "missing_lookup" };
    }

    const { data: rows, error: userError } = await query;
    if (userError) {
      console.error("[fetchAppConfiguration] signup lookup:", userError.message);
      return { ...empty, error: "lookup_failed" };
    }

    const user = (rows?.[0] ?? null) as (AccountUser & { whatsapp_activated?: boolean }) | null;
    if (!user) return empty;

    const contacts = (await listFamilyContacts(user.id)) as AccountContact[];
    let pinConfigured = false;

    const storedPin = await readStoredPinHash(user.id);
    pinConfigured = Boolean(storedPin);

    const accessToken = await issueSeniorAccessToken(user.id);
    await markInstallAppOpened(user.id).catch((e) => {
      console.warn("[fetchAppConfiguration] app_opened", e);
    });
    const progress = await readInstallProgress(user.id);

    return {
      configured: true,
      user,
      contacts,
      pinConfigured,
      whatsappActivated: user.whatsapp_activated === true,
      installStep: progress?.installStep ?? "pending",
      onboardingCompleted: progress?.onboardingCompleted ?? false,
      sosPrimedAt: progress?.sosPrimedAt ?? null,
      fallSensorPromptedAt: progress?.fallSensorPromptedAt ?? null,
      accessToken,
    };
  } catch (e) {
    console.error("[fetchAppConfiguration] unexpected:", e);
    return { ...empty, error: "server_error" };
  }
}
