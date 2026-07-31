const urls = [
  "https://alarmaseniorsafe.cl/",
  "https://www.alarmaseniorsafe.cl/",
  "https://alarmaseniorsafe.cl/planes",
  "https://www.alarmaseniorsafe.cl/planes",
  "https://alarmaseniorsafe.cl/guia",
  "https://alarmaseniorsafe.cl/como-funciona",
  "https://alarmaseniorsafe.com/",
];

for (const u of urls) {
  const r = await fetch(u, { redirect: "manual" });
  let html = "";
  if (r.status === 200) html = await r.text();
  const m1 = html.match(/rel="canonical"[^>]*href="([^"]+)"/i);
  const m2 = html.match(/href="([^"]+)"[^>]*rel="canonical"/i);
  const can = m1?.[1] || m2?.[1] || "—";
  console.log(
    u,
    "→",
    r.status,
    r.headers.get("location") || "",
    "| canonical:",
    can,
  );
}
