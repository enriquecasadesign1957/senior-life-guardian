import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { verifyPinResetCode } from "@/lib/pin-reset";

const bodySchema = z.object({
  signupId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/),
});

export const Route = createFileRoute("/api/public/pin-reset-verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_payload" }, { status: 400 });
        }

        const result = await verifyPinResetCode(parsed.data.signupId, parsed.data.code);
        return Response.json(result, { status: result.ok ? 200 : 400 });
      },
    },
  },
});
