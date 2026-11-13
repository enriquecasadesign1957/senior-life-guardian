import { z } from "zod";

export const MAX_CLEANUP_ROWS = 2000;
export const MAX_CLEANUP_BYTES = 32 * 1024 * 1024;
export const DIAGNOSIS_TTL_MS = 24 * 60 * 60 * 1000;
export const PAIR_TTL_MS = 10 * 60 * 1000;
export const RESCUE_WATCH_MS = 30 * 24 * 60 * 60 * 1000;
export const WATCH_INTERVAL_MS = 15 * 60 * 1000;
export const AGENCY_TRIAL_SEATS = 5;
export const AGENCY_INVITE_DEFAULT_DAYS = 7;
export const AGENCY_INVITE_DAY_OPTIONS = [1, 3, 7, 14, 30] as const;

export const agencyTrialActivateSchema = z.object({
  code: z.string().trim().min(4).max(64),
});

export const agencyTrialClaimSchema = z.object({
  siteId: z.string().uuid(),
});

export const agencyAccountSchema = z.object({
  email: z.string().trim().email().max(180),
  password: z.string().min(8).max(72),
});

export const adminLoginSchema = z.object({
  secret: z.string().trim().min(8).max(200),
});

export const adminCreateInviteSchema = z.object({
  note: z.string().trim().max(120).optional(),
  seats: z.number().int().min(1).max(40).optional(),
  validDays: z.union([z.literal(1), z.literal(3), z.literal(7), z.literal(14), z.literal(30)]).optional(),
});

export const ACTION_IDS = [
  "purge_transients",
  "purge_revisions",
  "purge_spam",
  "update_plugin",
] as const;

export const actionIdSchema = z.enum(ACTION_IDS);

export const sitePlanSchema = z.enum(["none", "rescue", "cuidado"]);
export const findingSeveritySchema = z.enum(["low", "medium", "high"]);

export const pairRequestSchema = z.object({
  baseUrl: z.string().trim().min(4).max(300),
  pairCode: z.string().trim().regex(/^[a-f0-9]{32}$/),
});

export const diagnoseRequestSchema = z.object({
  url: z.string().trim().min(4).max(300),
});

export const cleanupSimulateSchema = z.object({
  siteId: z.string().uuid(),
});

export const cleanupApplySchema = z.object({
  siteId: z.string().uuid(),
});

export const cleanupUndoSchema = z.object({
  siteId: z.string().uuid(),
  batchId: z.string().uuid(),
});

export const rescueCheckoutSchema = z
  .object({
    siteId: z.string().uuid().optional(),
    url: z.string().trim().min(4).max(300).optional(),
    returnPath: z
      .string()
      .regex(/^\/informe\/[0-9a-fA-F-]{36}$/)
      .optional(),
  })
  .refine((value) => Boolean(value.siteId || (value.url && value.url.trim().length >= 4)), {
    message: "Escribe la dirección del sitio.",
  });

export const payloadCountsSchema = z.object({
  revisions: z.number().int().nonnegative(),
  expiredTransients: z.number().int().nonnegative(),
  spamComments: z.number().int().nonnegative(),
});

export const payloadBytesSchema = z.object({
  revisions: z.number().int().nonnegative(),
  expiredTransients: z.number().int().nonnegative(),
  spamComments: z.number().int().nonnegative(),
});

export const cleanupApplyResultSchema = z.object({
  batchId: z.string().uuid(),
  undoUntil: z.string().min(1),
  counts: payloadCountsSchema,
  bytes: payloadBytesSchema.optional(),
});

export const snapshotSchema = z.object({
  siteName: z.string(),
  homeUrl: z.string(),
  wpVersion: z.string(),
  phpVersion: z.string(),
  engine: z.string(),
  innodb: z.literal(true),
  counts: payloadCountsSchema,
  bytes: payloadBytesSchema,
});

export const pluginErrorSchema = z.object({
  code: z.enum(["INNODB_REQUIRED", "PAYLOAD_LIMIT", "PAIR_EXPIRED", "PAIR_INVALID", "UNAUTHORIZED"]),
  message: z.string(),
  counts: payloadCountsSchema.optional(),
});

export const explainedIssueSchema = z.object({
  code: z.string().min(1).max(64),
  severity: findingSeveritySchema,
  plainTitle: z.string().min(1).max(180),
  whatItMeans: z.string().min(1).max(500),
  ifIgnored: z.string().min(1).max(500),
  actionId: actionIdSchema.nullable(),
  source: z.enum(["template", "model"]),
});

export const explainResultSchema = z.object({
  summary: z.string().min(1).max(400),
  issues: z.array(explainedIssueSchema),
});

export type ActionId = z.infer<typeof actionIdSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
export type ExplainedIssue = z.infer<typeof explainedIssueSchema>;
export type ExplainResult = z.infer<typeof explainResultSchema>;
export type PayloadCounts = z.infer<typeof payloadCountsSchema>;
export type PayloadBytes = z.infer<typeof payloadBytesSchema>;

export function payloadOverLimit(counts: PayloadCounts, bytes: PayloadBytes): boolean {
  const keys = ["revisions", "expiredTransients", "spamComments"] as const;
  return keys.some((key) => counts[key] > MAX_CLEANUP_ROWS || bytes[key] > MAX_CLEANUP_BYTES);
}
