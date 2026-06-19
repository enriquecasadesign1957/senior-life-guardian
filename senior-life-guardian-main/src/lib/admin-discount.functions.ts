import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertAdminPin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeDiscountCodeInput, type DiscountCodeRow } from "@/lib/discount-codes";

const pinSchema = z.object({ pin: z.string().min(1).max(64) });

const createSchema = pinSchema.extend({
  code: z.string().trim().min(2).max(64),
  label: z.string().trim().min(2).max(200),
  partner_slug: z.string().trim().min(2).max(64),
  percent_off: z.number().int().min(1).max(100),
  applies_monthly: z.boolean().default(true),
  applies_annual: z.boolean().default(true),
  active: z.boolean().default(true),
  max_redemptions: z.number().int().min(1).nullable().optional(),
  valid_from: z.string().datetime().nullable().optional(),
  valid_until: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const updateSchema = pinSchema.extend({
  id: z.string().uuid(),
  active: z.boolean().optional(),
  max_redemptions: z.number().int().min(1).nullable().optional(),
  valid_until: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const DISCOUNT_SELECT =
  "id,code,label,partner_slug,percent_off,applies_monthly,applies_annual,active,max_redemptions,redemption_count,valid_from,valid_until,notes,created_at,updated_at";

export const adminListDiscountCodes = createServerFn({ method: "POST" })
  .inputValidator((input) => pinSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);
    const { data: rows, error } = await supabaseAdmin
      .from("discount_codes")
      .select(DISCOUNT_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { ok: true as const, codes: (rows ?? []) as DiscountCodeRow[] };
  });

export const adminCreateDiscountCode = createServerFn({ method: "POST" })
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);

    const code = normalizeDiscountCodeInput(data.code);
    if (!code) throw new Error("Código inválido.");

    const { data: existing } = await supabaseAdmin
      .from("discount_codes")
      .select("id")
      .ilike("code", code)
      .maybeSingle();
    if (existing) throw new Error("Ya existe un código con ese nombre.");

    const { data: row, error } = await supabaseAdmin
      .from("discount_codes")
      .insert({
        code,
        label: data.label,
        partner_slug: data.partner_slug,
        percent_off: data.percent_off,
        applies_monthly: data.applies_monthly,
        applies_annual: data.applies_annual,
        active: data.active,
        max_redemptions: data.max_redemptions ?? null,
        valid_from: data.valid_from ?? null,
        valid_until: data.valid_until ?? null,
        notes: data.notes ?? null,
      })
      .select(DISCOUNT_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return { ok: true as const, code: row as DiscountCodeRow };
  });

export const adminUpdateDiscountCode = createServerFn({ method: "POST" })
  .inputValidator((input) => updateSchema.parse(input))
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);

    const patch: Record<string, unknown> = {};
    if (data.active !== undefined) patch.active = data.active;
    if (data.max_redemptions !== undefined) patch.max_redemptions = data.max_redemptions;
    if (data.valid_until !== undefined) patch.valid_until = data.valid_until;
    if (data.notes !== undefined) patch.notes = data.notes;

    if (Object.keys(patch).length === 0) {
      throw new Error("Nada que actualizar.");
    }

    const { data: row, error } = await supabaseAdmin
      .from("discount_codes")
      .update(patch)
      .eq("id", data.id)
      .select(DISCOUNT_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return { ok: true as const, code: row as DiscountCodeRow };
  });
