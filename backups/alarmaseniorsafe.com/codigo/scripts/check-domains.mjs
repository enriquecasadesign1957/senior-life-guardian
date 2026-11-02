const urls = [
  "https://alarmaseniorsafe.com/",
  "https://www.alarmaseniorsafe.com/",
  "https://alarmaseniorsafe.cl/",
  "https://www.alarmaseniorsafe.cl/",
];

for (const url of urls) {
  const res = await fetch(url, { redirect: "manual" });
  const final = res.headers.get("location");
  const html = res.status < 400 ? await res.text() : "";
  const canonical = html.match(/rel="canonical"[^>]*href="([^"]+)"/i)?.[1] ?? "—";
  const ogUrl = html.match(/property="og:url"[^>]*content="([^"]+)"/i)?.[1] ?? "—";
  const robots = html.match(/name="robots"[^>]*content="([^"]+)"/i)?.[1] ?? "—";
  console.log("\n" + url);
  console.log("  status:", res.status, final ? `→ ${final}` : "");
  console.log("  server:", res.headers.get("server") ?? "—");
  console.log("  cf-ray:", res.headers.get("cf-ray") ?? "—");
  console.log("  canonical:", canonical);
  console.log("  og:url:", ogUrl);
  console.log("  robots meta:", robots);
}

for (const url of [
  "https://alarmaseniorsafe.com/robots.txt",
  "https://alarmaseniorsafe.cl/robots.txt",
]) {
  const res = await fetch(url);
  const text = await res.text();
  console.log("\n" + url);
  console.log("  status:", res.status);
  console.log("  snippet:", text.slice(0, 120).replace(/\n/g, " "));
}
