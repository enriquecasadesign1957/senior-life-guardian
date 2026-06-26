import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  markFallSensorPrompted,
  markInstallAppOpened,
  markInstallSosPrimed,
  readInstallProgress,
} from "@/lib/install-step-sync";
import { assertSeniorAccess, seniorAccessTokenSchema } from "@/lib/senior-access-auth";

const signupSchema = z.object({
  signupId: z.string().uuid(),
  accessToken: seniorAccessTokenSchema,
});

export const getInstallProgress = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ signupId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const progress = await readInstallProgress(data.signupId);
    return (
      progress ?? {
        installStep: "pending" as const,
        onboardingCompleted: false,
        appOpenedAt: null,
        sosPrimedAt: null,
        fallSensorPromptedAt: null,
      }
    );
  });

export const reportAppOpened = createServerFn({ method: "POST" })
  .inputValidator((input) => signupSchema.parse(input))
  .handler(async ({ data }) => {
    await assertSeniorAccess(data.signupId, data.accessToken);
    await markInstallAppOpened(data.signupId);
    return readInstallProgress(data.signupId);
  });

export const reportSosPrimed = createServerFn({ method: "POST" })
  .inputValidator((input) => signupSchema.parse(input))
  .handler(async ({ data }) => {
    await assertSeniorAccess(data.signupId, data.accessToken);
    await markInstallSosPrimed(data.signupId);
    return readInstallProgress(data.signupId);
  });

export const reportFallSensorPrompted = createServerFn({ method: "POST" })
  .inputValidator((input) => signupSchema.parse(input))
  .handler(async ({ data }) => {
    await assertSeniorAccess(data.signupId, data.accessToken);
    await markFallSensorPrompted(data.signupId);
    return { ok: true as const };
  });
