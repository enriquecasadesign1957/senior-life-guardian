import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { persistUserPin } from "@/lib/pin-storage";

const bodySchema = z.object({
  signupId: z.string().uuid(),
  pinHash: z.string().min(16).max(256),
});

export const Route = createFileRoute("/api/public/save-pin")({
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

        const result = await persistUserPin(parsed.data.signupId, parsed.data.pinHash);
        return Response.json(result, { status: result.ok ? 200 : 500 });
      },
    },
  },
});
