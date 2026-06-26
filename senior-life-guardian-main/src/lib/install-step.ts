/** Pipeline post-pago: paid → install_link_sent → whatsapp_linked → app_opened → ready */

export const INSTALL_STEPS = [
  "pending",
  "paid",
  "install_link_sent",
  "whatsapp_linked",
  "app_opened",
  "ready",
] as const;

export type InstallStep = (typeof INSTALL_STEPS)[number];

const STEP_INDEX: Record<InstallStep, number> = {
  pending: 0,
  paid: 1,
  install_link_sent: 2,
  whatsapp_linked: 3,
  app_opened: 4,
  ready: 5,
};

export function installStepIndex(step: InstallStep | string | null | undefined): number {
  if (!step || !(step in STEP_INDEX)) return 0;
  return STEP_INDEX[step as InstallStep];
}

export function isInstallStep(value: string | null | undefined): value is InstallStep {
  return INSTALL_STEPS.includes(value as InstallStep);
}

export function maxInstallStep(a: InstallStep, b: InstallStep): InstallStep {
  return installStepIndex(a) >= installStepIndex(b) ? a : b;
}

export function canAdvanceInstallStep(
  from: InstallStep | string | null | undefined,
  to: InstallStep,
): boolean {
  return installStepIndex(to) > installStepIndex(from ?? "pending");
}

/** Días tras el 1.er S.O.S. (priming) para ofrecer sensor de caídas. */
export const FALL_SENSOR_DEFER_DAYS = 2;
