import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  addFamilyContact,
  deleteFamilyContact,
  listFamilyContacts,
  updateFamilyContact,
} from "@/lib/contacts-storage";
import { assertSeniorAccess, seniorAccessTokenSchema } from "@/lib/senior-access-auth";

const idSchema = z.string().uuid();
const contactInput = z.object({
  nombre: z.string().min(1).max(160),
  telefono: z.string().min(4).max(40),
  parentesco: z.string().min(1).max(60),
});

const authFields = {
  signupId: idSchema,
  accessToken: seniorAccessTokenSchema,
};

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list"), ...authFields }),
  z.object({ action: z.literal("add"), ...authFields, contact: contactInput }),
  z.object({
    action: z.literal("update"),
    ...authFields,
    id: idSchema,
    contact: contactInput,
  }),
  z.object({ action: z.literal("delete"), ...authFields, id: idSchema }),
]);

export const Route = createFileRoute("/api/public/family")({
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

        const data = parsed.data;

        try {
          await assertSeniorAccess(data.signupId, data.accessToken);
        } catch (e) {
          const message = e instanceof Error ? e.message : "unauthorized";
          return Response.json({ ok: false, error: message }, { status: 401 });
        }

        if (data.action === "list") {
          const contacts = await listFamilyContacts(data.signupId);
          return Response.json({ ok: true, contacts });
        }

        if (data.action === "add") {
          const result = await addFamilyContact(data.signupId, data.contact);
          if (!result.ok) {
            return Response.json({ ok: false, error: result.error }, { status: 400 });
          }
          return Response.json({ ok: true, contact: result.contact });
        }

        if (data.action === "update") {
          const result = await updateFamilyContact(data.signupId, data.id, data.contact);
          if (!result.ok) {
            return Response.json({ ok: false, error: result.error }, { status: 400 });
          }
          return Response.json({ ok: true, contact: result.contact });
        }

        const result = await deleteFamilyContact(data.signupId, data.id);
        if (!result.ok) {
          return Response.json({ ok: false, error: result.error }, { status: 400 });
        }
        return Response.json({ ok: true });
      },
    },
  },
});
