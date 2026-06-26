import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { readStoredPinHash } from "@/lib/pin-storage";
import { assertSeniorAccess, seniorAccessTokenSchema } from "@/lib/senior-access-auth";

const bodySchema = z.object({
  signupId: z.string().uuid(),
  accessToken: seniorAccessTokenSchema,
  pinHash: z.string().min(16).max(256),
});

export const Route = createFileRoute("/api/public/verify-pin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, configured: false, error: "invalid_json" }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ ok: false, configured: false, error: "invalid_payload" }, { status: 400 });
        }

        try {
          await assertSeniorAccess(parsed.data.signupId, parsed.data.accessToken);
        } catch (e) {
          const message = e instanceof Error ? e.message : "unauthorized";
          return Response.json({ ok: false, configured: false, error: message }, { status: 401 });
        }

        const stored = await readStoredPinHash(parsed.data.signupId);
        if (!stored) {
          return Response.json({ ok: false, configured: false });
        }

        return Response.json({
          ok: stored === parsed.data.pinHash,
          configured: true,
        });
      },
    },
  },
});
