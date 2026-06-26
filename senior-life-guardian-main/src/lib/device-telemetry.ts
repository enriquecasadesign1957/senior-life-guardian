import { Capacitor } from "@capacitor/core";

const BATTERY_TIMEOUT_MS = 3_000;
const BATTERY_CACHE_KEY = "seniorsafe_battery_cache";
const BATTERY_CACHE_MAX_MS = 30 * 60 * 1000;

type BatteryCache = { level: number; at: number };

function cacheBattery(level: number) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(BATTERY_CACHE_KEY, JSON.stringify({ level, at: Date.now() } satisfies BatteryCache));
  } catch {
    /* quota */
  }
}

function readBatteryCache(): number | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(BATTERY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BatteryCache;
    if (
      typeof parsed.level !== "number" ||
      parsed.level < 0 ||
      parsed.level > 100 ||
      Date.now() - parsed.at > BATTERY_CACHE_MAX_MS
    ) {
      return null;
    }
    return parsed.level;
  } catch {
    return null;
  }
}

async function getBatteryViaCapacitor(): Promise<number | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { Device } = await import("@capacitor/device");
    const info = await Device.getBatteryInfo();
    if (typeof info.batteryLevel === "number" && info.batteryLevel >= 0) {
      return Math.round(info.batteryLevel * 100);
    }
  } catch (e) {
    console.warn("[battery] Capacitor Device:", e);
  }
  return null;
}

async function getBatteryViaWebApi(): Promise<number | null> {
  const getBattery = (navigator as Navigator & { getBattery?: () => Promise<{ level: number }> })
    .getBattery;
  if (!getBattery) return null;

  try {
    const bat = await Promise.race([
      getBattery.call(navigator),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), BATTERY_TIMEOUT_MS)),
    ]);
    if (!bat || typeof bat.level !== "number") return null;
    const level = Math.round(bat.level * 100);
    return level >= 0 && level <= 100 ? level : null;
  } catch {
    return null;
  }
}

/** Batería 0–100. null si no hay dato en este momento. */
export async function readBatteryLevel(): Promise<number | null> {
  const fromNative = await getBatteryViaCapacitor();
  if (fromNative != null) {
    cacheBattery(fromNative);
    return fromNative;
  }

  const fromWeb = await getBatteryViaWebApi();
  if (fromWeb != null) {
    cacheBattery(fromWeb);
    return fromWeb;
  }

  return readBatteryCache();
}

/**
 * Para heartbeat: devuelve lectura fresca o caché reciente.
 * undefined = no enviar (conservar valor en servidor).
 */
export async function readBatteryLevelForHeartbeat(): Promise<number | undefined> {
  const level = await readBatteryLevel();
  return level != null ? level : undefined;
}

export function readInternetConnected(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}

/** Escucha cambios de batería cuando el navegador lo permite. */
export function watchBatteryLevel(onChange: (level: number) => void): () => void {
  if (typeof navigator === "undefined") return () => {};

  let manager: { level: number; addEventListener: (t: string, fn: () => void) => void; removeEventListener: (t: string, fn: () => void) => void } | null = null;
  let handler: (() => void) | null = null;

  const attach = async () => {
    const getBattery = (navigator as Navigator & { getBattery?: () => Promise<typeof manager> }).getBattery;
    if (!getBattery) return;
    try {
      manager = await getBattery.call(navigator);
      if (!manager || typeof manager.level !== "number") return;
      handler = () => {
        const level = Math.round(manager!.level * 100);
        cacheBattery(level);
        onChange(level);
      };
      manager.addEventListener("levelchange", handler);
      handler();
    } catch {
      /* no disponible */
    }
  };

  void attach();

  return () => {
    if (manager && handler) manager.removeEventListener("levelchange", handler);
  };
}
