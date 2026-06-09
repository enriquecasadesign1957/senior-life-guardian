import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { fetchAppConfiguration } from "@/lib/account-lookup";
import {
  addFamilyContact,
  deleteFamilyContact,
  listFamilyContacts,
  updateFamilyContact,
} from "@/lib/contacts-storage";
import { persistUserPin, readStoredPinHash } from "@/lib/pin-storage";
import { sendGuardianInvite } from "@/lib/guardians.functions";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";

const idSchema = z.string().uuid();
const contactInput = z.object({
  nombre: z.string().min(1).max(160),
  telefono: z.string().min(4).max(40),
  parentesco: z.string().min(1).max(60),
});

const appConfigInput = z.object({
  signupId: idSchema.optional(),
  email: z.string().email().max(255).optional(),
  telefono: z.string().min(4).max(40).optional(),
}).refine((data) => Boolean(data.signupId || data.email || data.telefono), {
  message: "Se requiere una cuenta para cargar la configuración.",
});

async function sendInviteBestEffort(
  signupId: string,
  contact: { id: string; nombre: string; telefono: string; parentesco: string },
): Promise<void> {
  try {
    const { data: senior } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select("nombre")
      .eq("id", signupId)
      .maybeSingle();

    await sendGuardianInvite({
      guardianTel: contact.telefono,
      guardianWa: null,
      guardianName: contact.nombre,
      seniorName: (senior as { nombre?: string } | null)?.nombre ?? "Tu familiar",
      parentesco: contact.parentesco,
      signupId,
      guardianId: contact.id,
    });
  } catch {
    /* best-effort */
  }
}

/** Carga la configuración existente para que la app no reinicie el onboarding. */
export const getAppConfiguration = createServerFn({ method: "POST" })
  .inputValidator((input) => appConfigInput.parse(input))
  .handler(async ({ data }) => fetchAppConfiguration(data));

/** Lista familiares del usuario (por contract_signup_id). */
export const listFamily = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ signupId: idSchema }).parse(input))
  .handler(async ({ data }) => {
    const contacts = await listFamilyContacts(data.signupId);
    return { contacts };
  });

export const addFamily = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, contact: contactInput }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await addFamilyContact(data.signupId, data.contact);
    if (!result.ok) throw new Error(result.error);

    const row = result.contact!;

    try {
      const { data: existingFm } = await supabaseAdmin
        .from("family_members")
        .select("id")
        .eq("contract_signup_id", data.signupId)
        .eq("telefono", row.telefono)
        .maybeSingle();
      if (!existingFm) {
        await supabaseAdmin.from("family_members").insert({
          contract_signup_id: data.signupId,
          nombre: row.nombre,
          telefono: row.telefono,
          parentesco: row.parentesco,
        });
      }
    } catch {
      /* silencioso */
    }

    await sendInviteBestEffort(data.signupId, row);
    return { contact: row };
  });

export const updateFamily = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, id: idSchema, contact: contactInput }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await updateFamilyContact(data.signupId, data.id, data.contact);
    if (!result.ok) throw new Error(result.error);
    return { contact: result.contact! };
  });

export const deleteFamily = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, id: idSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await deleteFamilyContact(data.signupId, data.id);
    if (!result.ok) throw new Error(result.error);
    return { ok: true };
  });

/**
 * Reenvía la invitación al Portal Familia para un guardián existente.
 * Reutiliza sendGuardianInvite (mismo canal WhatsApp + SMS). No duplica contactos.
 */
export const resendFamilyInvite = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, contactId: idSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const contacts = await listFamilyContacts(data.signupId);
    const contact = contacts.find((c) => c.id === data.contactId);
    if (!contact) throw new Error("Guardián no encontrado.");

    await sendInviteBestEffort(data.signupId, contact);
    return { ok: true };
  });

/** Crea/actualiza el PIN del usuario (hash ya calculado en cliente). */
export const setUserPin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, pinHash: z.string().min(16).max(256) }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await persistUserPin(data.signupId, data.pinHash);
    if (!result.ok) throw new Error(result.error ?? "pin_save_failed");
    return { ok: true };
  });

/** Verifica PIN (solo para configuraciones sensibles). */
export const verifyPin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: idSchema, pinHash: z.string().min(16).max(256) }).parse(input),
  )
  .handler(async ({ data }) => {
    const stored = await readStoredPinHash(data.signupId);
    if (!stored) return { ok: false, configured: false };
    return { ok: stored === data.pinHash, configured: true };
  });
