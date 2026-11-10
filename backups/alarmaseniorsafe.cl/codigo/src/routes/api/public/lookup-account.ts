import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { fetchAppConfiguration } from "@/lib/account-lookup";

const bodySchema = z.object({
  email: z.string().email().max(255),
});

export const Route = createFileRoute("/api/public/lookup-account")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json(
            { configured: false, user: null, contacts: [], pinConfigured: false, error: "invalid_json" },
            { status: 400 },
          );
        }

        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { configured: false, user: null, contacts: [], pinConfigured: false, error: "invalid_email" },
            { status: 400 },
          );
        }

        const result = await fetchAppConfiguration({ email: parsed.data.email });
        const { accessToken: _token, ...safe } = result;
        return Response.json(safe, { status: result.configured ? 200 : 404 });
      },
    },
  },
});
