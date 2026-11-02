import { useEffect, useRef, useState } from "react";
import {
  EMERGENCY_CATEGORY_AUTO_DEFAULT,
  EMERGENCY_CATEGORY_AUTO_SEND_MS,
  type EmergencyCategory,
} from "@/lib/emergency-category";

const AUTO_SEND_SECONDS = Math.ceil(EMERGENCY_CATEGORY_AUTO_SEND_MS / 1000);

export function useEmergencyCategoryAutoSend(
  active: boolean,
  onAutoSend: (category: EmergencyCategory) => void,
) {
  const onAutoSendRef = useRef(onAutoSend);
  onAutoSendRef.current = onAutoSend;
  const [secondsLeft, setSecondsLeft] = useState(AUTO_SEND_SECONDS);

  useEffect(() => {
    if (!active) {
      setSecondsLeft(AUTO_SEND_SECONDS);
      return;
    }

    setSecondsLeft(AUTO_SEND_SECONDS);
    const tickId = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    const timeoutId = window.setTimeout(() => {
      onAutoSendRef.current(EMERGENCY_CATEGORY_AUTO_DEFAULT);
    }, EMERGENCY_CATEGORY_AUTO_SEND_MS);

    return () => {
      window.clearInterval(tickId);
      window.clearTimeout(timeoutId);
    };
  }, [active]);

  return { secondsLeft, autoSendSeconds: AUTO_SEND_SECONDS };
}
