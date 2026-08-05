const paths = [
  "/",
  "/planes",
  "/como-funciona",
  "/guia",
  "/privacidad",
  "/terminos",
  "/checkout",
  "/app",
  "/native",
  "/familia",
  "/simulador",
  "/instalar-app",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/og-senior-safe-v2.jpg",
  "/og-senior-safe.jpg",
  "/BingSiteAuth.xml",
];

const hosts = ["https://alarmaseniorsafe.cl", "https://www.alarmaseniorsafe.cl"];

for (const host of hosts) {
  console.log("\n===", host, "===");
  for (const path of paths) {
    const url = host + path;
    try {
      const r = await fetch(url, { redirect: "manual" });
      let can = "—";
      let robots = "—";
      if (r.status === 200 && (r.headers.get("content-type") || "").includes("text/html")) {
        const html = await r.text();
        can =
          html.match(/rel="canonical"[^>]*href="([^"]+)"/i)?.[1] ||
          html.match(/href="([^"]+)"[^>]*rel="canonical"/i)?.[1] ||
          "MISSING";
        robots =
          html.match(/name="robots"[^>]*content="([^"]+)"/i)?.[1] ||
          html.match(/content="([^"]+)"[^>]*name="robots"/i)?.[1] ||
          "default";
      }
      const loc = r.headers.get("location") || "";
      const flag =
        r.status >= 500 ? " ⚠️5xx" : can === "MISSING" ? " ⚠️NO-CANONICAL" : "";
      console.log(
        `${path} → ${r.status}${loc ? " " + loc : ""} | can:${can} | robots:${robots}${flag}`,
      );
    } catch (e) {
      console.log(path, "→ FAIL", e.message);
    }
  }
}
