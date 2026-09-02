#!/usr/bin/env node
/**
 * WakeUp Dev — Groq blog generator (Markdown + App Router manifest).
 *
 * Writes:
 *   wakeup-dev/web/content/blog/post-<timestamp>.md
 *   wakeup-dev/web/content/blog/<slug>.json
 *   wakeup-dev/web/lib/blog/generated.ts
 *
 * Usage (repo root or wakeup-dev/):
 *   node wakeup-dev/scripts/generate-post.mjs
 *   node wakeup-dev/scripts/generate-post.mjs --topic "Grafana webhook to phone"
 *   node wakeup-dev/scripts/generate-post.mjs --dry-run
 *
 * Env: GROQ_API_KEY (required), GROQ_BLOG_MODEL (optional)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WAKEUP_ROOT = path.resolve(__dirname, "..");
const WEB_ROOT = path.join(WAKEUP_ROOT, "web");
const CONTENT_DIR = path.join(WEB_ROOT, "content", "blog");
const MANIFEST_PATH = path.join(WEB_ROOT, "lib", "blog", "generated.ts");

const SITE = "https://wakeupdev.com";
const AUTHOR = "Enrique Drack";
const RESERVED_SLUGS = new Set(["case-study-senior-safe"]);
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
/** llama-3.1-8b-instant shut down 2026-08-16 on developer tier. */
const DEFAULT_MODEL = "openai/gpt-oss-20b";
const FALLBACK_MODELS = ["openai/gpt-oss-120b"];
const DISCUSSION_FALLBACK =
  "How do you cut on-call noise without adding another per-seat pager? Share the webhook and ACK pattern you actually run in production.";

const SYSTEM_PROMPT = `You are a senior SRE/DevOps engineer writing for WakeUp Dev (wakeupdev.com), a voice-first on-call platform: webhook ingest on Cloudflare Workers, Twilio phone cascade, digit-1 ACK (not call pickup), pay-per-alert with unlimited seats (no per-seat tax).

Write in English. Tone: technical, concise, high-signal for working developers. No listicles, no hype, no "as an AI".

Core themes (pick one sharp angle per post):
- incident management and on-call escalation
- monitoring with Grafana and UptimeRobot webhooks
- reducing alert fatigue (ACK, routing, not more channels)
- cost of on-call: eliminating per-seat pricing, unlimited seats, pay per voice alert

Return a JSON object only (no markdown fences) with this schema:
{
  "title": "staff-engineer title, not clickbait",
  "slug": "lowercase-kebab-case",
  "description": "SEO description under 220 characters",
  "tags": ["3-6 short tags"],
  "image_keywords": ["two or three precise English keywords for a technical cover photo, e.g. datacenter", "cyber-security"],
  "body_markdown": "full article in Markdown. Use ## / ### headings, paragraphs, at least one bullet list, at least one fenced code block. No HTML. No front matter. End with a short peer question for SREs."
}

Code samples must be realistic: POST https://api.wakeupdev.com/v1/alert with header x-api-key, Grafana/UptimeRobot webhook notes, or conceptual TwiML Gather digit 1. Do not invent private endpoints.`;

function parseArgs(argv) {
  const args = { dryRun: false, force: false, topic: null, slug: null };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dry-run") args.dryRun = true;
    else if (token === "--force") args.force = true;
    else if (token === "--topic") args.topic = argv[++i] ?? null;
    else if (token === "--slug") args.slug = argv[++i] ?? null;
  }
  return args;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key]) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function loadEnv() {
  loadEnvFile(path.join(WEB_ROOT, ".env.local"));
  loadEnvFile(path.join(WEB_ROOT, ".env"));
  loadEnvFile(path.join(WAKEUP_ROOT, ".dev.vars"));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function plainText(value, max = 4000) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/[`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function chileDateParts(date = new Date()) {
  const dateIso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
  }).format(date);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
  return { dateIso, dateLabel };
}

function parseJsonObject(text) {
  const trimmed = String(text ?? "").trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(unfenced);
}

function isModelNotFound(status, body) {
  if (status !== 404) return false;
  return /model_not_found|does not exist/i.test(body);
}

function modelQueue(preferred) {
  const queue = [];
  if (preferred) queue.push(preferred);
  for (const id of [DEFAULT_MODEL, ...FALLBACK_MODELS]) {
    if (!queue.includes(id)) queue.push(id);
  }
  return queue;
}

async function groqJson({
  apiKey,
  models,
  system,
  user,
  temperature,
  maxTokens,
}) {
  let lastError = null;
  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      const body = await response.text();
      if (!response.ok) {
        lastError = new Error(
          `Groq HTTP ${response.status}: ${body.slice(0, 400)}`,
        );
        if (isModelNotFound(response.status, body)) {
          console.warn(`Model unavailable, trying next: ${model}`);
          break;
        }
        if (response.status === 429 || response.status >= 500) continue;
        throw lastError;
      }

      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        lastError = new Error("Groq returned non-JSON HTTP body");
        continue;
      }

      const content = payload?.choices?.[0]?.message?.content;
      if (!content) {
        lastError = new Error("Groq response missing choices[0].message.content");
        continue;
      }

      try {
        return parseJsonObject(content);
      } catch (error) {
        lastError = error;
      }
    }
  }
  throw lastError ?? new Error("Groq JSON parse failed after 3 attempts");
}

function sanitizeKeywords(value, max = 8) {
  const list = Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(",")
        .map((item) => item.trim());
  return [
    ...new Set(list.map((item) => plainText(item, 60)).filter(Boolean)),
  ].slice(0, max);
}

function unsplashCoverUrl(keywords) {
  const query = keywords
    .slice(0, 3)
    .map((word) => word.replace(/\s+/g, "-").toLowerCase())
    .filter(Boolean)
    .join(",");
  const fallback = "server-room,monitoring";
  return `https://source.unsplash.com/1600x900/?${encodeURI(query || fallback)}`;
}

function yamlScalar(value) {
  const text = String(value ?? "");
  if (text === "") return '""';
  if (/[:#{}[\],&*?|!<>=%@`]/.test(text) || /^\s|\s$/.test(text)) {
    return JSON.stringify(text);
  }
  return text;
}

function toFrontMatter({ title, dateIso, tags, coverImage, canonicalUrl }) {
  const tagLines = tags.map((tag) => `  - ${yamlScalar(tag)}`).join("\n");
  return `---
title: ${yamlScalar(title)}
date: ${dateIso}
tags:
${tagLines || "  - sre"}
cover_image: ${yamlScalar(coverImage)}
canonical_url: ${yamlScalar(canonicalUrl)}
---
`;
}

function markdownToBlocks(markdown) {
  const lines = String(markdown ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      const buf = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      const code = buf.join("\n").trim().slice(0, 4000);
      if (code) blocks.push({ type: "code", code });
      continue;
    }

    if (line.startsWith("## ")) {
      const text = plainText(line.slice(3), 160);
      if (text) blocks.push({ type: "h2", text });
      i += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      const text = plainText(line.slice(4), 160);
      if (text) blocks.push({ type: "h3", text });
      i += 1;
      continue;
    }

    if (/^\s*[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) {
        const item = plainText(lines[i].replace(/^\s*[-*] /, ""), 400);
        if (item) items.push(item);
        i += 1;
      }
      if (items.length) blocks.push({ type: "ul", items });
      continue;
    }

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !/^\s*[-*] /.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    const text = plainText(para.join(" "), 2000);
    if (text) blocks.push({ type: "p", text });
  }

  if (!blocks.some((block) => block.type === "discussion")) {
    const last = blocks[blocks.length - 1];
    if (last?.type === "p" && /\?/.test(last.text)) {
      blocks[blocks.length - 1] = { type: "discussion", text: last.text };
    } else {
      blocks.push({ type: "discussion", text: DISCUSSION_FALLBACK });
    }
  }

  return blocks;
}

function existingJsonPosts() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, name), "utf8");
      return JSON.parse(raw);
    });
}

function existingTitles() {
  const titles = [
    "Case Study: Scaling Smart Teleassistance Voice Routing with Edge Compute and Zero-Cold-Start Cascades",
  ];
  for (const post of existingJsonPosts()) {
    if (post.title) titles.push(post.title);
  }
  return titles;
}

function existingSlugs() {
  const slugs = new Set(RESERVED_SLUGS);
  for (const post of existingJsonPosts()) {
    if (post.slug) slugs.add(post.slug);
  }
  return slugs;
}

function uniqueSlug(base, taken, force) {
  const root = slugify(base) || `sre-note-${chileDateParts().dateIso}`;
  if (force || !taken.has(root)) return root;
  for (let n = 2; n < 20; n += 1) {
    const candidate = `${root}-${n}`.slice(0, 80);
    if (!taken.has(candidate)) return candidate;
  }
  throw new Error(`Could not allocate a free slug from "${root}"`);
}

function validatePost(post) {
  if (!post.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
    throw new Error(`Invalid slug: ${post.slug}`);
  }
  if (RESERVED_SLUGS.has(post.slug)) {
    throw new Error(`Slug is reserved: ${post.slug}`);
  }
  if (post.title.length < 12 || post.description.length < 40) {
    throw new Error("Title or description too short");
  }
  const paragraphs = post.blocks.filter((block) => block.type === "p").length;
  const headings = post.blocks.filter((block) => block.type === "h2").length;
  const code = post.blocks.filter((block) => block.type === "code").length;
  if (paragraphs < 2 || headings < 1 || code < 1) {
    throw new Error(
      `Post too thin (p=${paragraphs}, h2=${headings}, code=${code})`,
    );
  }
}

function importIdent(slug) {
  const ident = `post_${slug.replace(/[^a-z0-9]+/g, "_")}`;
  return ident.replace(/^(\d)/, "_$1");
}

function writeManifest(posts) {
  const sorted = [...posts].sort((a, b) => a.slug.localeCompare(b.slug));
  const imports = sorted
    .map(
      (post) =>
        `import ${importIdent(post.slug)} from "../../content/blog/${post.slug}.json";`,
    )
    .join("\n");
  const list = sorted
    .map((post) => `  ${importIdent(post.slug)} as GeneratedPost,`)
    .join("\n");
  const source = `import type { GeneratedPost } from "./types";
${imports ? `${imports}\n` : ""}
/** Regenerated by \`generate-post.mjs\`. Do not edit by hand. */
export const generatedPosts: GeneratedPost[] = [
${list}
];
`;
  fs.writeFileSync(MANIFEST_PATH, source, "utf8");
}

function userPrompt({ topic, titles }) {
  const avoid = titles.length
    ? `Do not repeat these existing posts: ${titles.join(" | ")}`
    : "No generated posts yet besides the Senior Safe case study.";
  const focus = topic
    ? `Editor-requested angle: ${topic}`
    : "Pick one fresh production angle. Prefer Grafana or UptimeRobot webhooks, alert fatigue, or unlimited-seat on-call cost vs per-seat tools.";
  return `${focus}\n${avoid}\nKeep it specific to WakeUp Dev: POST /v1/alert, x-api-key, voice ACK, unlimited seats.`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadEnv();

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Missing GROQ_API_KEY. Set the GitHub Actions secret or web/.env.local",
    );
  }

  const models = modelQueue(process.env.GROQ_BLOG_MODEL?.trim());
  const taken = existingSlugs();
  const titles = existingTitles();

  console.log(`1/2 Drafting with Groq (${models.join(" → ")})…`);
  const draft = await groqJson({
    apiKey,
    models,
    temperature: 0.45,
    maxTokens: 4000,
    system: SYSTEM_PROMPT,
    user: userPrompt({ topic: args.topic, titles }),
  });

  const title = plainText(draft.title, 160);
  if (!title) throw new Error("Groq draft missing title");

  const slug = uniqueSlug(args.slug || draft.slug || title, taken, args.force);
  const tags = sanitizeKeywords(draft.tags, 6);
  const imageKeywords = sanitizeKeywords(draft.image_keywords, 3);
  if (imageKeywords.length < 2) {
    imageKeywords.push("datacenter", "monitoring");
  }
  const coverImage = unsplashCoverUrl(imageKeywords);
  const { dateIso, dateLabel } = chileDateParts();
  const canonicalUrl = `${SITE}/blog/${slug}`;
  const bodyMarkdown = String(draft.body_markdown ?? "").trim();
  if (bodyMarkdown.length < 400) {
    throw new Error("Groq body_markdown too short");
  }

  const post = {
    slug,
    title,
    description: plainText(draft.description, 280),
    keywords: tags.length ? tags : imageKeywords,
    coverImage,
    dateIso,
    dateLabel,
    author: AUTHOR,
    topic: plainText(args.topic || title, 400),
    blocks: markdownToBlocks(bodyMarkdown),
  };
  validatePost(post);

  const timestamp = Date.now();
  const mdName = `post-${timestamp}.md`;
  const markdown = `${toFrontMatter({
    title,
    dateIso,
    tags: post.keywords,
    coverImage,
    canonicalUrl,
  })}
${bodyMarkdown}
`;

  if (args.dryRun) {
    console.log("2/2 Dry run — not writing files.");
    console.log(
      JSON.stringify(
        {
          slug,
          title,
          file: mdName,
          cover_image: coverImage,
          canonical_url: canonicalUrl,
          blocks: post.blocks.length,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log("2/2 Writing Markdown, JSON, and generated.ts…");
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(path.join(CONTENT_DIR, mdName), markdown, "utf8");
  fs.writeFileSync(
    path.join(CONTENT_DIR, `${slug}.json`),
    `${JSON.stringify(post, null, 2)}\n`,
    "utf8",
  );

  const catalog = existingJsonPosts().filter((item) => item.slug !== slug);
  catalog.push(post);
  writeManifest(catalog);

  console.log(`Wrote content/blog/${mdName}`);
  console.log(`Wrote content/blog/${slug}.json`);
  console.log(`Cover: ${coverImage}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
