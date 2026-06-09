/**
 * Exporta respaldos de plataformas externas a disco (Supabase, Twilio, Cloudflare DNS).
 * Uso: node scripts/export-platform-backups.mjs [destino]
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import pg from "pg";

const appRoot = process.cwd();
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const destArg = process.argv[2];
const outRoot = path.resolve(destArg || `D:/Backups/SeniorSafe-platforms-${stamp}`);

function loadEnv() {
  const envPath = path.join(appRoot, ".env");
  const vars = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
    if (m) vars[m[1]] = m[2];
  }
  return { ...vars, ...process.env };
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, "utf8");
}

const env = loadEnv();
fs.mkdirSync(outRoot, { recursive: true });
console.log("Exportando a:", outRoot);

const CRITICAL_TABLES = [
  "contract_signups",
  "webpay_transactions",
  "emergency_contacts",
  "user_pins",
  "family_members",
  "family_login_codes",
  "alert_logs",
  "whatsapp_inbox_messages",
  "device_status",
  "email_send_log",
];

// --- Supabase ---
const pgClient = new pg.Client({
  connectionString: `postgresql://postgres.cgcnjnhifdmornedzpid:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`,
  ssl: { rejectUnauthorized: false },
});

const supabaseDir = path.join(outRoot, "supabase");
const tableStats = [];

try {
  await pgClient.connect();
  const { rows: allTables } = await pgClient.query(`
    select tablename from pg_tables
    where schemaname = 'public'
    order by tablename
  `);
  writeJson(path.join(supabaseDir, "_tables-public.json"), allTables.map((r) => r.tablename));

  for (const table of CRITICAL_TABLES) {
    try {
      const { rows } = await pgClient.query(`select * from public.${table} order by 1`);
      writeJson(path.join(supabaseDir, `${table}.json`), rows);
      tableStats.push({ table, rows: rows.length, ok: true });
      console.log(`  Supabase ${table}: ${rows.length} filas`);
    } catch (e) {
      tableStats.push({ table, ok: false, error: String(e.message || e) });
      console.warn(`  Supabase ${table}: omitida (${e.message || e})`);
    }
  }
} finally {
  await pgClient.end().catch(() => {});
}

writeJson(path.join(supabaseDir, "_export-summary.json"), {
  exported_at: new Date().toISOString(),
  project_ref: "cgcnjnhifdmornedzpid",
  tables: tableStats,
});

// --- Twilio ---
const twilioDir = path.join(outRoot, "twilio");
const sid = env.TWILIO_ACCOUNT_SID;
const token = env.TWILIO_AUTH_TOKEN;
const auth = Buffer.from(`${sid}:${token}`).toString("base64");

async function twilioGet(resource) {
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}${resource}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${resource} ${res.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text);
}

if (sid && token) {
  try {
    const account = await twilioGet(".json");
    writeJson(path.join(twilioDir, "account.json"), {
      sid: account.sid,
      friendly_name: account.friendly_name,
      status: account.status,
      type: account.type,
    });
    const numbers = await twilioGet("/IncomingPhoneNumbers.json?PageSize=50");
    writeJson(path.join(twilioDir, "incoming-phone-numbers.json"), numbers.incoming_phone_numbers || []);
    try {
      const msgs = await twilioGet("/Messages.json?PageSize=100");
      writeJson(path.join(twilioDir, "recent-messages-last-100.json"), msgs.messages || []);
    } catch (e) {
      writeText(path.join(twilioDir, "recent-messages-error.txt"), String(e));
    }
    console.log("  Twilio: cuenta, numeros y mensajes recientes exportados");
  } catch (e) {
    writeText(path.join(twilioDir, "error.txt"), String(e));
    console.warn("  Twilio:", e.message || e);
  }
} else {
  writeText(path.join(twilioDir, "error.txt"), "Faltan TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN en .env");
}

// --- Cloudflare DNS ---
const cfDir = path.join(outRoot, "cloudflare");
try {
  const dns = execSync(
    "npx cross-env NODE_OPTIONS=--use-system-ca wrangler dns record list --zone-name alarmaseniorsafe.cl --json",
    { cwd: appRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  writeJson(path.join(cfDir, "dns-alarmaseniorsafe.json"), JSON.parse(dns));
  console.log("  Cloudflare DNS exportado");
} catch (e) {
  const stderr = e.stderr?.toString?.() || "";
  writeText(
    path.join(cfDir, "dns-manual-instructions.txt"),
    [
      "No se pudo exportar DNS automaticamente.",
      String(e.message || e),
      stderr,
      "",
      "Manual: https://dash.cloudflare.com -> alarmaseniorsafe.cl -> DNS -> captura pantalla",
      "O instala wrangler logueado: npx wrangler login",
    ].join("\n"),
  );
  console.warn("  Cloudflare DNS: requiere captura manual o wrangler login");
}

try {
  const secrets = execSync("npm run cf:secrets", {
    cwd: appRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  writeText(path.join(cfDir, "worker-secret-names.txt"), secrets);
} catch (e) {
  writeText(path.join(cfDir, "worker-secret-names.txt"), String(e.message || e));
}

// --- Portales manuales (Transbank / Zoho) ---
writeText(
  path.join(outRoot, "MANUAL-PORTALES.txt"),
  `SENIOR SAFE - CREDENCIALES EN PORTALES WEB (respaldar manualmente)
Generado: ${new Date().toISOString()}

Estos datos NO siempre estan en .env. Guarda capturas o anota en lugar seguro:

TRANSBANK (https://www.transbank.cl / portal comercio)
- Usuario y clave del portal comercio
- Codigo comercio produccion: ver .env TRANSBANK_CC
- API Key produccion: ver .env TRANSBANK_API_KEY
- Certificados o documentacion del contrato comercial

ZOHO MAIL (https://mail.zoho.com)
- Usuario admin: hola@alarmaseniorsafe.cl
- Contrasena de aplicacion SMTP (secret Cloudflare ZOHO_SMTP_PASSWORD)
- Secret webhook correo (Cloudflare ZOHO_EMAIL_WEBHOOK_SECRET)
- Configuracion filtro/webhook POST -> https://alarmaseniorsafe.cl/api/public/zoho-email-webhook

TWILIO PLANTILLAS WHATSAPP
- Console: https://console.twilio.com -> Messaging -> WhatsApp templates
- Exportar capturas de plantillas aprobadas por Meta

NOTA: El archivo .env local y el backup de codigo ya contienen la mayoria de secretos tecnicos.
Cifra este disco con BitLocker.
`,
);

writeText(
  path.join(outRoot, "README.txt"),
  `Backup plataformas Senior Safe
Carpeta: ${outRoot}

supabase/     Datos JSON tablas criticas
twilio/       Cuenta, numeros, ultimos 100 mensajes
cloudflare/   DNS JSON (si wrangler OK) + nombres secretos Worker
MANUAL-PORTALES.txt  Lo que debes respaldar a mano en Transbank/Zoho
`,
);

console.log("\nListo:", outRoot);
