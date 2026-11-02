import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export function notificationsSupportedInBrowser(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/** Solicita permiso de notificaciones (nativo o web). */
export async function requestAppNotifications(): Promise<{
  granted: boolean;
  mode: "web" | "native" | "unsupported";
}> {
  if (Capacitor.isNativePlatform()) {
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display === "granted") return { granted: true, mode: "native" };
      const req = await LocalNotifications.requestPermissions();
      return { granted: req.display === "granted", mode: "native" };
    } catch {
      return { granted: false, mode: "native" };
    }
  }

  if (!notificationsSupportedInBrowser()) {
    return { granted: false, mode: "unsupported" };
  }

  const permission = await Notification.requestPermission();
  return { granted: permission === "granted", mode: "web" };
}
