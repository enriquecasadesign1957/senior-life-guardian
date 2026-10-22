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
