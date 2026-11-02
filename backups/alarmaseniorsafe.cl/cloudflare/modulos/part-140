import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import "../_libs/mapbox-gl.mjs";
import { a as isMapboxConfigured, g as googleMapsUrl } from "./maps-BhXedqc-.mjs";
import { M as MapPin, E as ExternalLink } from "../_libs/lucide-react.mjs";
function LocationMap({
  lat,
  lng,
  label,
  markerColor = "#16a34a",
  className = "",
  heightClassName = "h-56"
}) {
  reactExports.useRef(null);
  reactExports.useRef(null);
  const mapsUrl = googleMapsUrl(lat, lng);
  const mapboxReady = isMapboxConfigured();
  reactExports.useEffect(() => {
    return;
  }, [lat, lng, label, mapboxReady, markerColor]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-2 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `relative w-full rounded-xl overflow-hidden border border-dashed border-border bg-slate-100 flex flex-col items-center justify-center gap-2 text-center px-4 ${heightClassName}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-8 h-8 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Mapa embebido no configurado. Usa el enlace para ver la ubicación." })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-sm", children: [
      mapboxReady,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: mapsUrl,
          target: "_blank",
          rel: "noreferrer",
          className: "inline-flex items-center gap-1 text-primary underline underline-offset-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3.5 h-3.5" }),
            "Navegar con Google Maps"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-mono", children: [
        lat.toFixed(5),
        ", ",
        lng.toFixed(5)
      ] })
    ] })
  ] });
}
export {
  LocationMap as L
};
