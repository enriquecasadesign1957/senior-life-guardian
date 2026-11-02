import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  listWhatsAppThreadMessages,
  listWhatsAppThreads,
  sendWhatsAppInboxReply,
} from "@/lib/whatsapp-inbox";

const pinSchema = z.string().min(4).max(64);

export const inboxListThreads = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ pin: pinSchema, inbox: z.enum(["commercial", "alerts"]).optional() }).parse(input),
  )
  .handler(async ({ data }) => listWhatsAppThreads(data.pin, data.inbox ?? "commercial"));

export const inboxListMessages = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        pin: pinSchema,
        peerPhone: z.string().min(8),
        inbox: z.enum(["commercial", "alerts"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) =>
    listWhatsAppThreadMessages(data.pin, data.peerPhone, data.inbox ?? "commercial"),
  );

export const inboxSendReply = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        pin: pinSchema,
        peerPhone: z.string().min(8),
        body: z.string().min(1).max(1600),
        inbox: z.enum(["commercial", "alerts"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const res = await sendWhatsAppInboxReply({
      pin: data.pin,
      peerPhone: data.peerPhone,
      body: data.body,
      inbox: data.inbox,
    });
    if (!res.ok) throw new Error(res.error ?? "No se pudo enviar.");
    return { ok: true as const };
  });
