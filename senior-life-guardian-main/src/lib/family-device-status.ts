/** Heartbeat reciente = app abierta ahora (ping cada ~30 s). */
export const LIVE_HEARTBEAT_MS = 5 * 60 * 1000;
/** Con actividad en las últimas 24 h mostramos "Bien" (no exige app abierta). */
export const RECENT_ACTIVITY_MS = 24 * 60 * 60 * 1000;
/** Sin señal por más de 48 h → desconectado. */
export const DISCONNECTED_MS = 48 * 60 * 60 * 1000;

export type DeviceStatusRow = {
  last_seen_at: string;
  battery_level: number | null;
  gps_enabled: boolean | null;
  internet_connected: boolean | null;
  app_version: string | null;
  last_lat: number | null;
  last_lng: number | null;
  updated_at?: string | null;
};

export type AlertActivityRow = {
  created_at: string;
  gps_lat: number | null;
  gps_lng: number | null;
};

export type FamilyVisualStatus = "alert" | "disconnected" | "no_gps" | "ok" | "no_data" | "inactive";

export type FamilyDeviceView = {
  device: DeviceStatusRow | null;
  visualStatus: FamilyVisualStatus;
  isLiveConnected: boolean;
  lastActivityAt: string | null;
  lastActivitySource: "heartbeat" | "alert" | null;
};

function msSince(iso: string | null | undefined): number {
  if (!iso) return Infinity;
  return Date.now() - new Date(iso).getTime();
}

function maxIso(a: string | null | undefined, b: string | null | undefined): string | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

export function buildFamilyDeviceView(
  deviceRow: DeviceStatusRow | null,
  lastAlert: AlertActivityRow | null,
  isActiveAlert: boolean,
): FamilyDeviceView {
  const heartbeatAt = maxIso(deviceRow?.last_seen_at, deviceRow?.updated_at);
  const alertAt = lastAlert?.created_at ?? null;
  const heartbeatMs = msSince(heartbeatAt);
  const alertMs = msSince(alertAt);

  const hasHeartbeat = heartbeatAt != null;
  const hasAlert = alertAt != null;
  const isLiveConnected = hasHeartbeat && heartbeatMs <= LIVE_HEARTBEAT_MS;

  let lastActivitySource: FamilyDeviceView["lastActivitySource"] = null;
  if (isLiveConnected) {
    lastActivitySource = "heartbeat";
  } else if (hasAlert && (!hasHeartbeat || alertMs <= heartbeatMs)) {
    lastActivitySource = "alert";
  } else if (hasHeartbeat) {
    lastActivitySource = "heartbeat";
  }

  const lastActivityAt = maxIso(heartbeatAt, alertAt);

  let device: DeviceStatusRow | null = deviceRow;
  if (!device && lastAlert && lastActivityAt) {
    device = {
      last_seen_at: lastActivityAt,
      battery_level: null,
      gps_enabled: lastAlert.gps_lat != null && lastAlert.gps_lng != null,
      internet_connected: null,
      app_version: null,
      last_lat: lastAlert.gps_lat ?? null,
      last_lng: lastAlert.gps_lng ?? null,
    };
  } else if (device && lastActivityAt && device.last_seen_at !== lastActivityAt) {
    device = {
      ...device,
      last_seen_at: lastActivityAt,
      gps_enabled:
        device.gps_enabled ??
        (lastAlert?.gps_lat != null && lastAlert?.gps_lng != null ? true : null),
      last_lat: device.last_lat ?? lastAlert?.gps_lat ?? null,
      last_lng: device.last_lng ?? lastAlert?.gps_lng ?? null,
    };
  }

  const activityMs = msSince(lastActivityAt);
  const neverReported = !lastActivityAt;

  let visualStatus: FamilyVisualStatus;
  if (isActiveAlert) {
    visualStatus = "alert";
  } else if (neverReported) {
    visualStatus = "no_data";
  } else if (isLiveConnected || activityMs <= RECENT_ACTIVITY_MS) {
    visualStatus = device?.gps_enabled === false ? "no_gps" : "ok";
  } else if (activityMs <= DISCONNECTED_MS) {
    visualStatus = "inactive";
  } else {
    visualStatus = "disconnected";
  }

  return {
    device,
    visualStatus,
    isLiveConnected,
    lastActivityAt,
    lastActivitySource,
  };
}
