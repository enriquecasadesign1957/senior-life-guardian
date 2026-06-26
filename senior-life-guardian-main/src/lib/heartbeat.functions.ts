import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { syncDeviceStatus } from "@/lib/device-status-sync";
import { assertSeniorAccess, seniorAccessTokenSchema } from "@/lib/senior-access-auth";

const Schema = z.object({
  signupId: z.string().uuid(),
  accessToken: seniorAccessTokenSchema,
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
    await assertSeniorAccess(data.signupId, data.accessToken);
    const result = await syncDeviceStatus({
      contractSignupId: data.signupId,
      ...(data.battery_level != null ? { battery_level: data.battery_level } : {}),
      gps_enabled: data.gps_enabled ?? null,
      // Si el ping llegó al servidor, hay conexión a internet.
      internet_connected: data.internet_connected ?? true,
      app_version: data.app_version ?? null,
      last_lat: data.last_lat ?? null,
      last_lng: data.last_lng ?? null,
    });
    return result;
  });
