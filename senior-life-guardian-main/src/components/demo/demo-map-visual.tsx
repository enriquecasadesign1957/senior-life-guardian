import { MapPin } from "lucide-react";

const RED = "#dc2626";
const GREEN = "#16a34a";

type DemoMapVisualProps = {
  label?: string;
  lat?: number;
  lng?: number;
  showGeofence?: boolean;
  alertMode?: boolean;
  className?: string;
};

export function DemoMapVisual({
  label = "María · En casa",
  showGeofence = true,
  alertMode = false,
  className = "",
}: DemoMapVisualProps) {
  return (
    <div
      className={`relative aspect-[16/10] rounded-2xl overflow-hidden border border-border ${className}`}
      style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)" }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="none">
        <defs>
          <pattern id="demo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14,116,144,0.12)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="250" fill="url(#demo-grid)" />
        <path d="M 0 130 Q 120 100 220 140 T 400 110" stroke="rgba(14,116,144,0.35)" strokeWidth="6" fill="none" />
        {showGeofence && (
          <circle cx="200" cy="125" r="55" fill="none" stroke="rgba(34,197,94,0.45)" strokeWidth="2" strokeDasharray="6 4" />
        )}
      </svg>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {alertMode && (
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(220,38,38,0.35)" }} />
          )}
          <div
            className="relative w-12 h-12 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white"
            style={{ background: alertMode ? RED : GREEN }}
          >
            <MapPin className="w-5 h-5" />
          </div>
          <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white rounded-xl px-3 py-1.5 shadow-lg text-xs font-bold text-foreground border border-border">
            {label}
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-xl px-3 py-2 text-[11px] flex items-center gap-2 border border-border shadow-sm">
        <span className="w-2 h-2 rounded-full" style={{ background: alertMode ? RED : GREEN }} />
        <span className="font-semibold text-foreground">{alertMode ? "Alerta activa" : "GPS activo"}</span>
      </div>
    </div>
  );
}
