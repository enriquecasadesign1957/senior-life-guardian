import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { sendPostPaymentInstallNotifications } from "@/lib/post-payment-install-notify";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";

const bodySchema = z.object({
  email: z.string().email().optional(),
  signupId: z.string().uuid().optional(),
  force: z.boolean().optional().default(true),
});

export const Route = createFileRoute("/api/cron/resend-install-instructions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
        const expected = process.env.CRON_SECRET?.trim();
        if (!expected || secret !== expected) {
          return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        }

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

        const { email, signupId, force } = parsed.data;
        if (!email && !signupId) {
          return Response.json({ ok: false, error: "email_or_signupId_required" }, { status: 400 });
        }

        let id = signupId ?? null;
        if (!id && email) {
          const { data } = await supabaseAdmin
            .from(CONTRACT_SIGNUPS_TABLE)
            .select("id")
            .ilike("email", email.trim())
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          id = data?.id ?? null;
        }

        if (!id) {
          return Response.json({ ok: false, error: "signup_not_found" }, { status: 404 });
        }

        if (force) {
          const { data: signupRow } = await supabaseAdmin
            .from(CONTRACT_SIGNUPS_TABLE)
            .select("payment_status, subscription_status, webpay_authorization_code, last_payment_at")
            .eq("id", id)
            .maybeSingle();

          if (
            signupRow?.webpay_authorization_code &&
            signupRow.payment_status !== "paid" &&
            signupRow.payment_status !== "comp"
          ) {
            await supabaseAdmin
              .from(CONTRACT_SIGNUPS_TABLE)
              .update({
                payment_status: "paid",
                subscription_status: "active",
                last_payment_at: signupRow.last_payment_at ?? new Date().toISOString(),
              })
              .eq("id", id);
          }
        }

        const result = await sendPostPaymentInstallNotifications(id, { force });
        return Response.json({ ok: result.sent, signupId: id, ...result }, { status: result.sent ? 200 : 502 });
      },
    },
  },
});
