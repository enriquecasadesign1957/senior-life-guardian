import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { requestPinResetCode } from "@/lib/pin-reset";

const bodySchema = z.object({
  signupId: z.string().uuid(),
});

export const Route = createFileRoute("/api/public/pin-reset-request")({
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

        const result = await requestPinResetCode(parsed.data.signupId);
        return Response.json(result, { status: result.ok ? 200 : 400 });
      },
    },
  },
});
