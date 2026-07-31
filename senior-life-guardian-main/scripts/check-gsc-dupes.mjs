const urls = [
  "http://alarmaseniorsafe.cl/",
  "http://www.alarmaseniorsafe.cl/",
  "https://alarmaseniorsafe.cl/checkout",
  "https://alarmaseniorsafe.cl/checkout?mode=contratar&plan=unico&periodo=mensual",
  "https://alarmaseniorsafe.cl/app",
  "https://alarmaseniorsafe.cl/native",
  "https://alarmaseniorsafe.cl/planes/",
  "https://alarmaseniorsafe.cl/index.html",
  "https://senior-life-guardian.enriquecasadesign.workers.dev/",
];

for (const u of urls) {
  try {
    const r = await fetch(u, { redirect: "manual" });
    let can = "—";
    let robots = "—";
    const ct = r.headers.get("content-type") || "";
    if (r.status === 200 && ct.includes("html")) {
      const html = await r.text();
      can =
        html.match(/rel="canonical"[^>]*href="([^"]+)"/i)?.[1] || "MISSING";
      robots =
        html.match(/name="robots"[^>]*content="([^"]+)"/i)?.[1] || "default";
    }
    console.log(
      u,
      "→",
      r.status,
      r.headers.get("location") || "",
      "| can:",
      can,
      "| robots:",
      robots,
    );
  } catch (e) {
    console.log(u, "→ FAIL", e.cause?.code || e.message);
  }
}
