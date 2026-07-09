for (const path of ["/", "/planes", "/native", "/guia"]) {
  const html = await fetch("https://alarmaseniorsafe.cl" + path).then((r) => r.text());
  console.log(path, "len", html.length, "error-ui", html.includes("No pudimos cargar"), "hero", html.includes("Tu mam") || html.includes("Senior Safe"));
}
