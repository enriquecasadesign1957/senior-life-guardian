export type WatchSite = {
  plan: "none" | "rescue" | "cuidado";
  watchUntil: Date | null;
};

export function isWatchActive(site: WatchSite, now: Date): boolean {
  if (site.plan === "cuidado") return true;
  if (site.plan === "rescue") {
    if (!site.watchUntil) return false;
    return now.getTime() < site.watchUntil.getTime();
  }
  return false;
}

export function rescueWatchUntil(paidAt: Date): Date {
  return new Date(paidAt.getTime() + 30 * 24 * 60 * 60 * 1000);
}

export type ProbeLevel = "clear" | "warning" | "outage";

export function classifyProbe(status: number | null): ProbeLevel {
  if (status === 404) return "warning";
  if (status === null || status >= 500) return "outage";
  return "clear";
}

export function nextProbeStreak(previous: number, level: ProbeLevel): number {
  if (level !== "outage") return 0;
  if (!Number.isInteger(previous) || previous < 0) return 1;
  return Math.min(previous + 1, 8);
}

export function watchDaysRemaining(until: Date, now: Date): number {
  const ms = until.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}
