const html = await fetch("https://alarmaseniorsafe.cl/").then((r) => r.text());
console.log("len", html.length);
console.log("ssr hero", html.includes("Tu mamá protegida") || html.includes("Tu mam"));
console.log("ssr error", html.includes("No pudimos cargar"));
const scripts = [...html.matchAll(/src="(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);
console.log("scripts", scripts.slice(0, 8));
for (const s of scripts.slice(0, 3)) {
  const st = await fetch("https://alarmaseniorsafe.cl" + s).then((r) => r.status);
  console.log(st, s);
}
