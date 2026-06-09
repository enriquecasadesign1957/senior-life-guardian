/**
 * Simula avisos 7d, 1d y suspensión +3d para edrack.lasvegas@gmail.com
 * Restaura el estado original al finalizar.
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const EMAIL = "edrack.lasvegas@gmail.com";
const PHONE = "+56948454012";
const PROJECT_REF = "cgcnjnhifdmornedzpid";
const CRON_URL = "https://alarmaseniorsafe.cl/api/cron/process-subscription-renewals";
const CHILE_TZ = "America/Santiago";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  const vars = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
      if (m) vars[m[1]] = m[2];
    }
  }
  return { ...vars, ...process.env };
}

function chileDateKey(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHILE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function addChileDays(days) {
  const [y, m, d] = chileDateKey().split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d + days, 15, 0, 0);
  return new Date(utc).toISOString();
}

async function runCron(secret) {
  const r = await fetch(CRON_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  return { status: r.status, body: await r.json() };
}

const env = loadEnv();
const password = env.SUPABASE_DB_PASSWORD;
const cronSecret = env.CRON_SECRET;
if (!password || !cronSecret) {
  console.error("Faltan SUPABASE_DB_PASSWORD o CRON_SECRET en .env");
  process.exit(1);
}

const pooler = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`;
const client = new pg.Client({ connectionString: pooler, ssl: { rejectUnauthorized: false } });

const backup = {};
const log = [];

try {
  await client.connect();

  const { rows } = await client.query(
    `SELECT id, nombre, email, telefono, periodo, payment_status, subscription_status,
            renewal_date, renewal_reminder_7d_for, renewal_reminder_1d_for,
            suspended_at, suspension_email_sent_at
     FROM contract_signups WHERE lower(email) = lower($1) LIMIT 1`,
    [EMAIL],
  );

  if (!rows.length) {
    console.error(`No se encontró cuenta con email ${EMAIL}`);
    process.exit(1);
  }

  const acc = rows[0];
  Object.assign(backup, acc);
  console.log("Cuenta:", acc.id);
  console.log("Email:", acc.email, "| Tel:", acc.telefono);
  console.log("Estado actual:", acc.subscription_status, "| renewal:", acc.renewal_date);

  if (acc.telefono?.replace(/\D/g, "") !== PHONE.replace(/\D/g, "")) {
    console.warn(`AVISO: teléfono en BD (${acc.telefono}) difiere del solicitado (${PHONE})`);
  }

  async function setRenewalState({ renewalIso, status = "active", clearFlags = true }) {
    await client.query(
      `UPDATE contract_signups SET
         renewal_date = $2,
         subscription_status = $3,
         renewal_reminder_7d_for = ${clearFlags ? "NULL" : "renewal_reminder_7d_for"},
         renewal_reminder_1d_for = ${clearFlags ? "NULL" : "renewal_reminder_1d_for"},
         suspended_at = ${clearFlags ? "NULL" : "suspended_at"},
         suspension_email_sent_at = ${clearFlags ? "NULL" : "suspension_email_sent_at"},
         payment_status = 'paid'
       WHERE id = $1`,
      [acc.id, renewalIso, status],
    );
  }

  // --- Escenario 1: aviso 7 días antes ---
  const renewal7 = addChileDays(7);
  await setRenewalState({ renewalIso: renewal7 });
  const cron7 = await runCron(cronSecret);
  const row7 = await client.query(
    `SELECT renewal_reminder_7d_for, renewal_reminder_1d_for, subscription_status
     FROM contract_signups WHERE id = $1`,
    [acc.id],
  );
  log.push({
    scenario: "aviso_7d",
    renewal_date: renewal7,
    cron: cron7,
    after: row7.rows[0],
  });
  console.log("\n[1] Aviso 7d:", JSON.stringify({ cron: cron7.body, after: row7.rows[0] }));

  // --- Escenario 2: aviso 1 día antes ---
  const renewal1 = addChileDays(1);
  await setRenewalState({ renewalIso: renewal1 });
  const cron1 = await runCron(cronSecret);
  const row1 = await client.query(
    `SELECT renewal_reminder_7d_for, renewal_reminder_1d_for, subscription_status
     FROM contract_signups WHERE id = $1`,
    [acc.id],
  );
  log.push({
    scenario: "aviso_1d",
    renewal_date: renewal1,
    cron: cron1,
    after: row1.rows[0],
  });
  console.log("\n[2] Aviso 1d:", JSON.stringify({ cron: cron1.body, after: row1.rows[0] }));

  // --- Escenario 3: suspensión +3 días sin pago ---
  const renewalOverdue = addChileDays(-3);
  await setRenewalState({ renewalIso: renewalOverdue });
  const cronSusp = await runCron(cronSecret);
  const rowSusp = await client.query(
    `SELECT subscription_status, suspended_at, suspension_email_sent_at
     FROM contract_signups WHERE id = $1`,
    [acc.id],
  );
  log.push({
    scenario: "suspension_3d",
    renewal_date: renewalOverdue,
    cron: cronSusp,
    after: rowSusp.rows[0],
  });
  console.log("\n[3] Suspensión:", JSON.stringify({ cron: cronSusp.body, after: rowSusp.rows[0] }));

  // --- Restaurar estado original ---
  await client.query(
    `UPDATE contract_signups SET
       renewal_date = $2,
       subscription_status = $3,
       renewal_reminder_7d_for = $4,
       renewal_reminder_1d_for = $5,
       suspended_at = $6,
       suspension_email_sent_at = $7,
       payment_status = $8
     WHERE id = $1`,
    [
      acc.id,
      backup.renewal_date,
      backup.subscription_status,
      backup.renewal_reminder_7d_for,
      backup.renewal_reminder_1d_for,
      backup.suspended_at,
      backup.suspension_email_sent_at,
      backup.payment_status,
    ],
  );
  console.log("\n[OK] Estado original restaurado.");

  const ok7 = cron7.body.reminders7d >= 1 && row7.rows[0].renewal_reminder_7d_for;
  const ok1 = cron1.body.reminders1d >= 1 && row1.rows[0].renewal_reminder_1d_for;
  const okSusp =
    cronSusp.body.suspended >= 1 &&
    rowSusp.rows[0].subscription_status === "suspended" &&
    rowSusp.rows[0].suspension_email_sent_at;

  console.log("\n--- RESUMEN SIMULACIÓN ---");
  console.log(ok7 ? "✓ Email 7 días antes (cron + flag BD)" : "✗ Falló aviso 7d");
  console.log(ok1 ? "✓ Email 1 día antes (cron + flag BD)" : "✗ Falló aviso 1d");
  console.log(okSusp ? "✓ Suspensión +3d + email (cron + BD)" : "✗ Falló suspensión");
  console.log("Revisa la bandeja de", EMAIL, "(y spam) — 3 correos de prueba.");

  process.exit(ok7 && ok1 && okSusp ? 0 : 1);
} catch (e) {
  console.error("Error:", e.message);
  if (backup.id) {
    try {
      await client.query(
        `UPDATE contract_signups SET
           renewal_date = $2, subscription_status = $3,
           renewal_reminder_7d_for = $4, renewal_reminder_1d_for = $5,
           suspended_at = $6, suspension_email_sent_at = $7, payment_status = $8
         WHERE id = $1`,
        [
          backup.id,
          backup.renewal_date,
          backup.subscription_status,
          backup.renewal_reminder_7d_for,
          backup.renewal_reminder_1d_for,
          backup.suspended_at,
          backup.suspension_email_sent_at,
          backup.payment_status,
        ],
      );
      console.log("Estado restaurado tras error.");
    } catch {}
  }
  process.exit(1);
} finally {
  await client.end();
}
