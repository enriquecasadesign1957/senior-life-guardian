/**
 * Envía plantilla Content a revisión Meta/WhatsApp y muestra estado.
 *   node scripts/submit-whatsapp-template-approval.mjs [ContentSid] [name] [category]
 *
 * Ejemplo:
 *   node scripts/submit-whatsapp-template-approval.mjs HX9e516e69530a4cfd113f3276b0d1393c senior_safe_emergency_alert_v3 UTILITY
 */
const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

const contentSid =
  process.argv[2]?.trim() || "HX9e516e69530a4cfd113f3276b0d1393c";
const templateName =
  process.argv[3]?.trim() || "senior_safe_emergency_alert_v3";
const category = process.argv[4]?.trim() || "UTILITY";

if (!accountSid || !authToken) {
  console.error("Faltan TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN");
  process.exit(1);
}

const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

async function twilioFetch(url, init = {}) {
  const resp = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await resp.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { ok: resp.ok, status: resp.status, data };
}

async function fetchApprovalStatus() {
  const r = await twilioFetch(
    `https://content.twilio.com/v1/Content/${contentSid}/ApprovalRequests`,
  );
  console.log("\n--- Estado actual ---");
  console.log(JSON.stringify(r.data, null, 2));
  return r;
}

async function submitApproval() {
  const r = await twilioFetch(
    `https://content.twilio.com/v1/Content/${contentSid}/ApprovalRequests/whatsapp`,
    {
      method: "POST",
      body: JSON.stringify({ name: templateName, category }),
    },
  );
  console.log("\n--- Envío a Meta ---");
  console.log("HTTP", r.status, JSON.stringify(r.data, null, 2));
  return r;
}

async function main() {
  console.log("ContentSid:", contentSid);
  console.log("name:", templateName, "| category:", category);

  await fetchApprovalStatus();

  const current = await twilioFetch(
    `https://content.twilio.com/v1/Content/${contentSid}/ApprovalRequests`,
  );
  const wa = current.data?.whatsapp;
  const status = (wa?.status || "").toLowerCase();

  if (status === "approved") {
    console.log("\n✅ Ya está APPROVED. No hace falta reenviar.");
    return;
  }

  if (status === "pending" || status === "received") {
    console.log("\n⏳ Ya está en revisión Meta (", wa?.status, "). Espera aprobación.");
    return;
  }

  await submitApproval();
  await fetchApprovalStatus();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
