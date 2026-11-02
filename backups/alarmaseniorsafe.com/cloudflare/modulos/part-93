import process from "node:process";
function assertAdminPin(pin) {
  const expected = process.env.ADMIN_PIN?.trim() || process.env.ADMIN_INBOX_PIN?.trim();
  if (!expected) {
    throw new Error(
      "Admin no configurado (falta ADMIN_PIN o ADMIN_INBOX_PIN en el servidor)."
    );
  }
  if (pin !== expected) {
    throw new Error("PIN incorrecto.");
  }
}
const ADMIN_PIN_SESSION_KEY = "seniorsafe_admin_pin";
export {
  ADMIN_PIN_SESSION_KEY as A,
  assertAdminPin as a
};
