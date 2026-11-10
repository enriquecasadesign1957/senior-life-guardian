const paths = ["/", "/robots.txt", "/sitemap.xml", "/planes", "/privacidad"];

for (const path of paths) {
  for (const host of ["alarmaseniorsafe.com", "www.alarmaseniorsafe.com"]) {
    const url = `https://${host}${path}`;
    const res = await fetch(url, { redirect: "manual" });
    const loc = res.headers.get("location") ?? "";
    let snippet = "";
    if (res.status === 200) {
      const t = await res.text();
      snippet = t.slice(0, 80).replace(/\s+/g, " ");
    }
    console.log(`${url} → ${res.status}${loc ? " " + loc : ""}${snippet ? " | " + snippet : ""}`);
  }
}
