/** PIN compartido para operaciones de administración (ADMIN_PIN o ADMIN_INBOX_PIN). */
export function assertAdminPin(pin: string): void {
  const expected =
    process.env.ADMIN_PIN?.trim() || process.env.ADMIN_INBOX_PIN?.trim();
  if (!expected) {
    throw new Error(
      "Admin no configurado (falta ADMIN_PIN o ADMIN_INBOX_PIN en el servidor).",
    );
  }
  if (pin !== expected) {
    throw new Error("PIN incorrecto.");
  }
}

export const ADMIN_PIN_SESSION_KEY = "seniorsafe_admin_pin";
