import { chromium } from "playwright";

const url = process.argv[2] || "https://alarmaseniorsafe.cl/";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
const pageErrors = [];

page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
});
page.on("pageerror", (err) => pageErrors.push(`pageerror: ${err.message}\n${err.stack || ""}`));

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

const bodyText = await page.locator("body").innerText();
const hasErrorUi = bodyText.includes("No pudimos cargar esta página");

console.log(JSON.stringify({ url, hasErrorUi, bodySnippet: bodyText.slice(0, 400), errors, pageErrors }, null, 2));

await browser.close();
