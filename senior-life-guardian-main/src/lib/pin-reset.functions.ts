import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requestPinResetCode, verifyPinResetCode } from "@/lib/pin-reset";

export const requestPinReset = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ signupId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => requestPinResetCode(data.signupId));

export const verifyPinReset = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: z.string().uuid(), code: z.string().regex(/^\d{6}$/) }).parse(input),
  )
  .handler(async ({ data }) => verifyPinResetCode(data.signupId, data.code));
