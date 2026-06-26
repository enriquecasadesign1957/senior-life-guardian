export const SOS_GPS_PRIMED_KEY = "seniorsafe_sos_gps_primed";

function primedKey(signupId: string): string {
  return `${SOS_GPS_PRIMED_KEY}_${signupId}`;
}

/** Primera pulsación del botón S.O.S completada (GPS solicitado sin enviar alertas). */
export function isSosGpsPrimed(signupId?: string | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (signupId && localStorage.getItem(primedKey(signupId)) === "1") return true;
    return localStorage.getItem(SOS_GPS_PRIMED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSosGpsPrimed(signupId?: string | null): void {
  try {
    if (signupId) localStorage.setItem(primedKey(signupId), "1");
    localStorage.setItem(SOS_GPS_PRIMED_KEY, "1");
  } catch {
    /* ignore */
  }
}
