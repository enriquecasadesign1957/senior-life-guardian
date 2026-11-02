import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const tz = { withTimezone: true, mode: "date" } as const;

export const siteStatus = pgEnum("site_status", ["pending", "connected", "revoked"]);
export const sitePlan = pgEnum("site_plan", ["none", "rescue", "cuidado"]);
export const scanStatus = pgEnum("scan_status", ["queued", "running", "ready", "failed"]);
export const findingSeverity = pgEnum("finding_severity", ["low", "medium", "high"]);
export const findingSource = pgEnum("finding_source", ["template", "model"]);

export const agencyInviteCodes = pgTable("agency_invite_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  seats: integer("seats").default(5).notNull(),
  maxUses: integer("max_uses").default(1).notNull(),
  usedCount: integer("used_count").default(0).notNull(),
  createdAt: timestamp("created_at", tz).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", tz),
  image: text("image"),
  agencyTrialSeats: integer("agency_trial_seats").default(0).notNull(),
  agencyTrialActivatedAt: timestamp("agency_trial_activated_at", tz),
  agencyTrialCodeId: uuid("agency_trial_code_id").references(() => agencyInviteCodes.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", tz).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", tz).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", tz).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

export const sites = pgTable(
  "sites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    baseUrl: text("base_url").notNull(),
    status: siteStatus("status").default("pending").notNull(),
    plan: sitePlan("plan").default("none").notNull(),
    agencySeat: boolean("agency_seat").default(false).notNull(),
    watchUntil: timestamp("watch_until", tz),
    rescueCheckoutId: text("rescue_checkout_id").unique(),
    connectedAt: timestamp("connected_at", tz),
    lastProbeStatus: integer("last_probe_status"),
    lastProbeAt: timestamp("last_probe_at", tz),
    probeStreak: integer("probe_streak").default(0).notNull(),
    createdAt: timestamp("created_at", tz).defaultNow().notNull(),
  },
  (table) => [unique("sites_user_base_url").on(table.userId, table.baseUrl)],
);

export const siteSecrets = pgTable("site_secrets", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteId: uuid("site_id")
    .notNull()
    .unique()
    .references(() => sites.id, { onDelete: "cascade" }),
  ciphertext: text("ciphertext").notNull(),
  iv: text("iv").notNull(),
  keyVersion: integer("key_version").default(1).notNull(),
  updatedAt: timestamp("updated_at", tz)
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const scanRuns = pgTable(
  "scan_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id").references(() => sites.id, { onDelete: "cascade" }),
    requestedUrl: text("requested_url").notNull(),
    strategy: text("strategy").default("mobile").notNull(),
    status: scanStatus("status").default("queued").notNull(),
    performanceScore: integer("performance_score"),
    lcpMs: integer("lcp_ms"),
    inpMs: integer("inp_ms"),
    clsMilli: integer("cls_milli"),
    summary: jsonb("summary"),
    error: text("error"),
    expiresAt: timestamp("expires_at", tz).notNull(),
    createdAt: timestamp("created_at", tz).defaultNow().notNull(),
  },
  (table) => [
    index("scan_runs_site_created").on(table.siteId, table.createdAt),
    index("scan_runs_url_expires").on(table.requestedUrl, table.expiresAt),
  ],
);

export const findings = pgTable(
  "findings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scanRunId: uuid("scan_run_id")
      .notNull()
      .references(() => scanRuns.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    severity: findingSeverity("severity").notNull(),
    plainTitle: text("plain_title").notNull(),
    whatItMeans: text("what_it_means").notNull(),
    ifIgnored: text("if_ignored").notNull(),
    actionId: text("action_id"),
    source: findingSource("source").notNull(),
    createdAt: timestamp("created_at", tz).defaultNow().notNull(),
  },
  (table) => [index("findings_scan_run").on(table.scanRunId)],
);

export const cleanupBatchStatus = pgEnum("cleanup_batch_status", ["applied", "undone"]);

export const cleanupBatches = pgTable(
  "cleanup_batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    pluginBatchId: text("plugin_batch_id").notNull().unique(),
    status: cleanupBatchStatus("status").default("applied").notNull(),
    revisions: integer("revisions").default(0).notNull(),
    expiredTransients: integer("expired_transients").default(0).notNull(),
    spamComments: integer("spam_comments").default(0).notNull(),
    bytes: integer("bytes").default(0).notNull(),
    appliedAt: timestamp("applied_at", tz).defaultNow().notNull(),
    undoUntil: timestamp("undo_until", tz).notNull(),
    undoneAt: timestamp("undone_at", tz),
  },
  (table) => [
    index("cleanup_batches_site_applied").on(table.siteId, table.appliedAt),
    index("cleanup_batches_site_undo").on(table.siteId, table.undoUntil),
  ],
);
