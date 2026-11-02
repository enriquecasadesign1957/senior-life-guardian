import {
  AlertTriangle,
  Bell,
  ExternalLink,
  Heart,
  MapPin,
  Navigation,
  Shield,
} from "lucide-react";
import { EMERGENCY_CATEGORIES, type EmergencyCategory } from "@/lib/emergency-category";
import { DemoPhoneFrame } from "@/components/demo/demo-phone-frame";
import { DemoMapVisual } from "@/components/demo/demo-map-visual";
import {
  buildDemoGuardianAlertMessage,
  demoGuardianRecipient,
  demoSeniorName,
  DEMO_FLOW_GPS,
} from "@/lib/demo/demo-flow-messages";

const RED = "#dc2626";

const CATEGORY_ICONS = {
  salud: Heart,
  accidente: AlertTriangle,
  delincuencia: Shield,
} as const;

export function DemoFlowEmergencyButtonScreen() {
  return (
    <DemoPhoneFrame accent={RED}>
      <div className="text-center w-full">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Pantalla del adulto mayor
        </p>
        <button type="button" className="relative mx-auto block focus:outline-none" aria-label="Botón de emergencia">
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(220,38,38,0.25)" }}
            aria-hidden="true"
          />
          <span
            className="absolute -inset-2 rounded-full"
            style={{ background: "rgba(220,38,38,0.10)" }}
            aria-hidden="true"
          />
          <span
            className="relative flex flex-col items-center justify-center w-40 h-40 rounded-full text-white font-bold shadow-[0_20px_50px_-15px_rgba(220,38,38,0.7)]"
            style={{ background: `radial-gradient(circle at 30% 25%, #ef4444, ${RED} 60%, #991b1b)` }}
          >
            <Bell className="w-12 h-12 mb-1.5" strokeWidth={2.5} aria-hidden="true" />
            <span className="text-lg tracking-wide">EMERGENCIA</span>
            <span className="text-[10px] font-semibold text-white/85">Toca para pedir ayuda</span>
          </span>
        </button>
        <p className="mt-4 text-[11px] text-muted-foreground leading-snug px-2">
          Avisaremos a <strong className="text-foreground">3 guardianes</strong> (SMS, WhatsApp y llamada escalonada).
        </p>
      </div>
    </DemoPhoneFrame>
  );
}

type DemoFlowCategoryScreenProps = {
  selected?: EmergencyCategory;
  onSelect?: (category: EmergencyCategory) => void;
};

export function DemoFlowCategoryScreen({ selected, onSelect }: DemoFlowCategoryScreenProps) {
  return (
    <DemoPhoneFrame accent={RED}>
      <div className="w-full text-center">
        <div className="relative w-14 h-14 mx-auto mb-3">
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(220,38,38,0.25)" }}
            aria-hidden="true"
          />
          <div
            className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
            style={{ background: RED }}
          >
            <Bell className="w-7 h-7" aria-hidden="true" />
          </div>
        </div>
        <h3 className="text-sm font-bold text-foreground leading-tight">¿Qué tipo de ayuda necesitas?</h3>
        <p className="mt-1.5 text-[10px] text-muted-foreground mb-3">Toca una opción y avisaremos a tu familia al instante.</p>
        <div className="space-y-1.5">
          {EMERGENCY_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.id];
            const active = selected === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelect?.(category.id)}
                className={`w-full py-2.5 px-2.5 rounded-xl text-white text-left font-bold shadow-md flex items-center gap-2 transition ring-2 ${
                  active ? "ring-white scale-[1.02]" : "ring-transparent"
                }`}
                style={{ background: category.color }}
              >
                <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs leading-tight">{category.label}</span>
                  <span className="block text-[9px] font-medium text-white/90">{category.subtitle}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 w-full py-2 rounded-xl bg-muted text-muted-foreground font-semibold text-[10px]">
          Cancelar — estoy bien
        </div>
      </div>
    </DemoPhoneFrame>
  );
}

type DemoFlowGuardianMessageScreenProps = {
  category?: EmergencyCategory;
  channel?: "sms" | "whatsapp";
};

export function DemoFlowGuardianMessageScreen({
  category = "salud",
  channel = "whatsapp",
}: DemoFlowGuardianMessageScreenProps) {
  const guardian = demoGuardianRecipient();
  const body = buildDemoGuardianAlertMessage(category);
  const isWa = channel === "whatsapp";

  return (
    <DemoPhoneFrame flush accent={isWa ? "#16a34a" : "#64748b"}>
      <div className="flex flex-col h-full pt-8">
        <div
          className="px-3 py-2.5 flex items-center gap-2 border-b border-border shrink-0"
          style={{ background: isWa ? "#075e54" : "#f1f5f9" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: isWa ? "#128c7e" : "#64748b" }}
          >
            SS
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-bold truncate ${isWa ? "text-white" : "text-foreground"}`}>
              Senior Safe
            </div>
            <div className={`text-[10px] truncate ${isWa ? "text-white/75" : "text-muted-foreground"}`}>
              Para: {guardian.nombre} ({guardian.parentesco})
            </div>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-3 space-y-2"
          style={{ background: isWa ? "#ece5dd" : "#ffffff" }}
        >
          <p className="text-[9px] text-center text-muted-foreground">Ahora · {isWa ? "WhatsApp" : "SMS"}</p>
          <div
            className={`max-w-[92%] rounded-2xl px-3 py-2 text-[10px] leading-relaxed whitespace-pre-wrap shadow-sm ${
              isWa ? "bg-white text-foreground rounded-tl-none" : "bg-slate-100 text-foreground ml-auto rounded-tr-none"
            }`}
          >
            {body}
          </div>
          <p className="text-[9px] text-muted-foreground text-center">
            El guardián puede confirmar con el enlace o respondiendo por WhatsApp.
          </p>
        </div>
      </div>
    </DemoPhoneFrame>
  );
}

export function DemoFlowGeolocationScreen() {
  return (
    <DemoPhoneFrame flush accent="#4285f4">
      <div className="flex flex-col h-full pt-8">
        <div className="px-3 py-2 bg-white border-b border-border flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-foreground truncate">Ubicación de {demoSeniorName()}</div>
            <div className="text-[9px] text-muted-foreground truncate">{DEMO_FLOW_GPS.label}</div>
          </div>
        </div>

        <div className="flex-1 relative min-h-0">
          <DemoMapVisual
            label={`${demoSeniorName()} · SOS`}
            lat={DEMO_FLOW_GPS.lat}
            lng={DEMO_FLOW_GPS.lng}
            alertMode
            showGeofence={false}
            className="absolute inset-0 h-full w-full aspect-auto rounded-none border-0"
          />
        </div>

        <div className="bg-white border-t border-border p-3 shrink-0 space-y-2">
          <div className="flex items-start gap-2">
            <Navigation className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-bold text-foreground">{DEMO_FLOW_GPS.label}</div>
              <div className="text-[9px] text-muted-foreground">
                GPS ±{DEMO_FLOW_GPS.accuracy} m · {DEMO_FLOW_GPS.lat.toFixed(4)}, {DEMO_FLOW_GPS.lng.toFixed(4)}
              </div>
            </div>
          </div>
          <a
            href={DEMO_FLOW_GPS.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-white text-[11px] font-bold"
            style={{ background: "#4285f4" }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir en Google Maps
          </a>
        </div>
      </div>
    </DemoPhoneFrame>
  );
}
