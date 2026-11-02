import { useEffect, useRef } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { googleMapsUrl, isMapboxConfigured, mapboxAccessToken } from "@/lib/maps";

type LocationMapProps = {
  lat: number;
  lng: number;
  label?: string;
  markerColor?: string;
  className?: string;
  heightClassName?: string;
};

export function LocationMap({
  lat,
  lng,
  label,
  markerColor = "#16a34a",
  className = "",
  heightClassName = "h-56",
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapsUrl = googleMapsUrl(lat, lng);
  const mapboxReady = isMapboxConfigured();

  useEffect(() => {
    if (!mapboxReady || !containerRef.current) return;

    const token = mapboxAccessToken();
    if (!token) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 15,
      interactive: true,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    const marker = new mapboxgl.Marker({ color: markerColor }).setLngLat([lng, lat]).addTo(map);
    if (label) {
      marker.setPopup(new mapboxgl.Popup({ offset: 24, closeButton: false }).setText(label));
      marker.togglePopup();
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, label, mapboxReady, markerColor]);

  return (
    <div className={`space-y-2 ${className}`}>
      {mapboxReady ? (
        <div
          ref={containerRef}
          className={`w-full rounded-xl overflow-hidden border border-border shadow-sm ${heightClassName}`}
          role="img"
          aria-label={label ?? "Mapa de ubicación"}
        />
      ) : (
        <div
          className={`relative w-full rounded-xl overflow-hidden border border-dashed border-border bg-slate-100 flex flex-col items-center justify-center gap-2 text-center px-4 ${heightClassName}`}
        >
          <MapPin className="w-8 h-8 text-primary" />
          <p className="text-sm text-muted-foreground">
            Mapa embebido no configurado. Usa el enlace para ver la ubicación.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {mapboxReady && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
            <MapPin className="w-3.5 h-3.5" />
            Mapa Mapbox
          </span>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary underline underline-offset-2"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Navegar con Google Maps
        </a>
        <span className="text-xs text-muted-foreground font-mono">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
      </div>
    </div>
  );
}
