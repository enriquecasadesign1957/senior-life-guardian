import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Schema = z.object({
  signupId: z.string().uuid(),
  battery_level: z.number().int().min(0).max(100).nullable().optional(),
  gps_enabled: z.boolean().nullable().optional(),
  internet_connected: z.boolean().nullable().optional(),
  app_version: z.string().max(40).nullable().optional(),
  last_lat: z.number().nullable().optional(),
  last_lng: z.number().nullable().optional(),
});

/** Upsert silencioso del estado del dispositivo. Una sola fila por senior. */
export const upsertHeartbeat = createServerFn({ method: "POST" })
  .inputValidator((input) => Schema.parse(input))
  .handler(async ({ data }) => {
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("device_status")
      .upsert(
        {
          contract_signup_id: data.signupId,
          last_seen_at: now,
          battery_level: data.battery_level ?? null,
          gps_enabled: data.gps_enabled ?? null,
          internet_connected: data.internet_connected ?? null,
          app_version: data.app_version ?? null,
          last_lat: data.last_lat ?? null,
          last_lng: data.last_lng ?? null,
          updated_at: now,
        },
        { onConflict: "contract_signup_id" },
      );
    if (error) throw error;
    return { ok: true, at: now };
  });
