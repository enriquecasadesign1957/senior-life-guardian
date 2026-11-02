import { useEffect, useState } from "react";
import { readBatteryLevel, watchBatteryLevel } from "@/lib/device-telemetry";

/** Batería en vivo para la UI del adulto mayor (header / estado). */
export function useLiveBatteryLevel(enabled = true) {
  const [level, setLevel] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;

    const refresh = async () => {
      const value = await readBatteryLevel();
      if (alive) setLevel(value);
    };

    void refresh();
    const interval = setInterval(refresh, 60_000);
    const unwatch = watchBatteryLevel((value) => {
      if (alive) setLevel(value);
    });

    return () => {
      alive = false;
      clearInterval(interval);
      unwatch();
    };
  }, [enabled]);

  return level;
}
