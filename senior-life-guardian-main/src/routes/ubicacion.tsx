import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Shield } from "lucide-react";
import { LocationMap } from "@/components/location-map";
import { isValidCoordinatePair, parseCoordinate } from "@/lib/maps";

export const Route = createFileRoute("/ubicacion")({
  head: () => ({
    meta: [
      { title: "Ubicación — Senior Safe" },
      { name: "description", content: "Mapa de ubicación compartida por Senior Safe." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  validateSearch: (raw: Record<string, unknown>) => ({
    lat: parseCoordinate(raw.lat),
    lng: parseCoordinate(raw.lng),
    nombre: typeof raw.nombre === "string" ? raw.nombre.trim() : "",
  }),
  component: UbicacionPage,
});

function UbicacionPage() {
  const { lat, lng, nombre } = Route.useSearch();
  const valid = lat != null && lng != null && isValidCoordinatePair(lat, lng);
  const label = nombre || "Ubicación compartida";

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      <header className="bg-[#dc2626] text-white px-4 py-4 shadow-md">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Shield className="w-7 h-7 shrink-0" aria-hidden />
          <div>
            <div className="font-bold text-lg leading-tight">Senior Safe</div>
            <div className="text-sm text-white/90">Ubicación de emergencia</div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full p-4 space-y-4">
        {!valid ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto" />
            <h1 className="font-bold text-lg">Ubicación no disponible</h1>
            <p className="text-sm text-muted-foreground">
              El enlace no incluye coordenadas válidas. Si recibiste una alerta, contacta directamente al adulto mayor o
              revisa el mensaje más reciente.
            </p>
            <Link to="/familia" className="inline-block text-sm font-semibold text-primary underline">
              Ir al portal familia
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h1 className="font-bold text-lg mb-1">{label}</h1>
              <p className="text-sm text-muted-foreground">
                Coordenadas compartidas por Senior Safe. Usa el mapa para orientarte o abre la navegación en tu teléfono.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <LocationMap lat={lat} lng={lng} label={label} markerColor="#dc2626" heightClassName="h-72" />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
