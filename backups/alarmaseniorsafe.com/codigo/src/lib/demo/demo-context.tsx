import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DemoAlert } from "@/lib/demo/demo-data";
import {
  resolveDemoInstitution,
  type DemoInstitutionPreset,
} from "@/lib/demo/demo-presets";
import type { DemoEmergencyCase } from "@/lib/demo/demo-emergency-simulation";
import { runDemoEmergencyTimeline } from "@/lib/demo/demo-emergency-simulation";
import { isPresentationMode, setPresentationMode } from "@/lib/demo/demo-config";

type DemoContextValue = {
  preset: DemoInstitutionPreset;
  alerts: DemoAlert[];
  activeEmergency: DemoEmergencyCase | null;
  emergencyRunning: boolean;
  presentationMode: boolean;
  setPresentationMode: (v: boolean) => void;
  simulateEmergency: () => Promise<void>;
  cancelEmergency: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({
  children,
  institutionSlug,
}: {
  children: ReactNode;
  institutionSlug?: string | null;
}) {
  const preset = useMemo(() => resolveDemoInstitution(institutionSlug), [institutionSlug]);
  const [alerts, setAlerts] = useState<DemoAlert[]>(() => [...preset.alerts]);
  const [activeEmergency, setActiveEmergency] = useState<DemoEmergencyCase | null>(null);
  const [emergencyRunning, setEmergencyRunning] = useState(false);
  const [presentationMode, setPresentationModeState] = useState(() => isPresentationMode());
  const [abortRef, setAbortRef] = useState<AbortController | null>(null);

  const setPresentation = useCallback((v: boolean) => {
    setPresentationMode(v);
    setPresentationModeState(v);
  }, []);

  const cancelEmergency = useCallback(() => {
    abortRef?.abort();
    setAbortRef(null);
    setEmergencyRunning(false);
  }, [abortRef]);

  const simulateEmergency = useCallback(async () => {
    if (emergencyRunning) return;
    const ac = new AbortController();
    setAbortRef(ac);
    setEmergencyRunning(true);
    setActiveEmergency(null);

    try {
      const final = await runDemoEmergencyTimeline((c) => setActiveEmergency({ ...c }), ac.signal);
      setAlerts((prev) => [
        {
          id: final.id,
          event_type: "sos",
          status: "delivered",
          gps_lat: final.gps.lat,
          gps_lng: final.gps.lng,
          gps_accuracy: final.gps.accuracy,
          created_at: final.startedAt,
          acknowledged_at: final.closedAt ?? new Date().toISOString(),
          acknowledged_by: "Ana González (demo)",
          senior_id: "demo-senior-1",
          senior_nombre: final.seniorNombre,
          comuna: preset.municipality.slug === "las-condes" ? "Las Condes" : preset.label,
        },
        ...prev,
      ]);
    } catch {
      /* aborted */
    } finally {
      setEmergencyRunning(false);
      setAbortRef(null);
    }
  }, [emergencyRunning, preset.label, preset.municipality.slug]);

  const value = useMemo(
    () => ({
      preset,
      alerts,
      activeEmergency,
      emergencyRunning,
      presentationMode,
      setPresentationMode: setPresentation,
      simulateEmergency,
      cancelEmergency,
    }),
    [
      preset,
      alerts,
      activeEmergency,
      emergencyRunning,
      presentationMode,
      setPresentation,
      simulateEmergency,
      cancelEmergency,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo debe usarse dentro de DemoProvider");
  return ctx;
}
