#!/usr/bin/env node
/**
 * WakeUp Dev blog generator — Groq → structured JSON → App Router.
 *
 * Does NOT write TSX or HTML from the model (avoids quote breakage and XSS).
 * Posts land in content/blog/<slug>.json and lib/blog/generated.ts.
 *
 * Usage (from wakeup-dev/web):
 *   npm run generate-blog
 *   npm run generate-blog -- --dry-run
 *   npm run generate-blog -- --topic "Twilio Gather ACK vs AMD"
 *   npm run generate-blog -- --slug webhook-signature-rotation --force
 *
 * Env: GROQ_API_KEY, optional GROQ_BLOG_MODEL
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(WEB_ROOT, "..");
const CONTENT_DIR = path.join(WEB_ROOT, "content", "blog");
const MANIFEST_PATH = path.join(WEB_ROOT, "lib", "blog", "generated.ts");

const AUTHOR = "Enrique Drack";
const RESERVED_SLUGS = new Set(["case-study-senior-safe"]);
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const DISCUSSION_FALLBACK =
  "What are your thoughts on edge-based escalation handlers? How do you manage voicemail false positives in your current infrastructure shifts? This blog is open to architectural debates and feedback!";

const ALLOWED_BLOCK_TYPES = new Set([
  "p",
  "h2",
  "h3",
  "ul",
  "code",
  "discussion",
]);

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
  loadEnvFile(path.join(REPO_ROOT, ".dev.vars"));
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

function existingPosts() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, name), "utf8");
      return JSON.parse(raw);
    });
}

function existingSlugs() {
  const slugs = new Set(RESERVED_SLUGS);
  for (const post of existingPosts()) {
    if (post.slug) slugs.add(post.slug);
  }
  return slugs;
}

function parseJsonObject(text) {
  const trimmed = String(text ?? "").trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(unfenced);
}

async function groqJson({ apiKey, model, system, user, temperature, maxTokens }) {
  let lastError = null;
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
      lastError = new Error(`Groq HTTP ${response.status}: ${body.slice(0, 400)}`);
      continue;
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
  throw lastError ?? new Error("Groq JSON parse failed");
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

function sanitizeKeywords(value) {
  const list = Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(",")
        .map((item) => item.trim());
  return [...new Set(list.map((item) => plainText(item, 60)).filter(Boolean))].slice(
    0,
    8,
  );
}

function sanitizeBlocks(blocks) {
  const out = [];
  if (!Array.isArray(blocks)) return out;

  for (const raw of blocks) {
    if (!raw || typeof raw !== "object") continue;
    const type = String(raw.type ?? "");
    if (!ALLOWED_BLOCK_TYPES.has(type)) continue;

    if (type === "ul") {
      const items = Array.isArray(raw.items)
        ? raw.items.map((item) => plainText(item, 400)).filter(Boolean)
        : [];
      if (items.length) out.push({ type, items });
      continue;
    }

    if (type === "code") {
      const code = String(raw.code ?? "")
        .replace(/\r\n/g, "\n")
        .trim()
        .slice(0, 4000);
      if (code) out.push({ type, code });
      continue;
    }

    const text = plainText(raw.text, type === "p" || type === "discussion" ? 2000 : 160);
    if (text) out.push({ type, text });
  }

  if (!out.some((block) => block.type === "discussion")) {
    out.push({ type: "discussion", text: DISCUSSION_FALLBACK });
  }
  return out;
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
  if (paragraphs < 3 || headings < 2 || code < 1) {
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
  const list = sorted.map((post) => `  ${importIdent(post.slug)},`).join("\n");
  const source = `import type { GeneratedPost } from "./types";
${imports ? `${imports}\n` : ""}
/** Regenerated by \`npm run generate-blog\`. Do not edit by hand. */
export const generatedPosts: GeneratedPost[] = [
${list}
];
`;
  fs.writeFileSync(MANIFEST_PATH, source, "utf8");
}

function ideaSystem() {
  return `You are the Chief Technical Editor for WakeUp Dev (wakeupdev.com), a voice-first on-call alerting platform: Cloudflare Workers ingest, Twilio voice bridges, digit-1 ACK (not pickup), on-call cascades, pay-per-alert not per-seat.
Return a JSON object only: {"topic":"...","title":"...","slug":"url-safe-slug"}.
Titles must sound like Staff Engineer writing, not listicles. Slug is lowercase kebab-case. Do not wrap in markdown.`;
}

function ideaUser({ topic, existingTitles }) {
  const avoid = existingTitles.length
    ? `Do not repeat these existing posts: ${existingTitles.join(" | ")}`
    : "The existing flagship post is the Senior Safe teleassistance case study.";
  const focus = topic
    ? `The human editor requested this angle: ${topic}`
    : "Pick one fresh SRE/DevOps angle among: Cloudflare Workers voice alerts, SRE emergency routing, voicemail false positive mitigation, webhook auth thresholds, on-call cascade design, Twilio Gather ACK vs AMD, edge zero-cold-start paging.";
  return `${focus}\n${avoid}\nKeep it specific to production edge cases WakeUp Dev actually solves.`;
}

function bodySystem() {
  return `You are a Staff Engineer writing for WakeUp Dev. Return JSON only, no markdown fences.
Schema:
{
  "description": "one or two sentences, under 220 chars, for SEO",
  "keywords": ["three to six technical phrases"],
  "blocks": [
    {"type":"h2","text":"..."},
    {"type":"p","text":"..."},
    {"type":"ul","items":["..."]},
    {"type":"code","code":"..."},
    {"type":"h3","text":"..."},
    {"type":"discussion","text":"peer question for SRE/DevOps"}
  ]
}
Rules:
- English only.
- blocks is an array of typed objects. Never emit HTML tags.
- Include at least two h2, three p, one ul, and one code block.
- Code must be realistic: POST https://api.wakeupdev.com/v1/alert with header x-api-key, or conceptual TwiML Gather digit 1, or a Worker-style cascade note. No invented private endpoints.
- Last block should be type discussion inviting architectural debate (voicemail false positives, edge escalation).
- Do not mention that you are an AI.`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadEnv();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GROQ_API_KEY. Set it in web/.env.local or wakeup-dev/.dev.vars",
    );
  }
  const model = process.env.GROQ_BLOG_MODEL || DEFAULT_MODEL;
  const taken = existingSlugs();
  const existingTitles = [
    "Case Study: Scaling Smart Teleassistance Voice Routing with Edge Compute and Zero-Cold-Start Cascades",
    ...existingPosts().map((post) => post.title).filter(Boolean),
  ];

  console.log("1/3 Curating topic with Groq…");
  const idea = await groqJson({
    apiKey,
    model,
    temperature: 0.8,
    maxTokens: 600,
    system: ideaSystem(),
    user: ideaUser({ topic: args.topic, existingTitles }),
  });

  const title = plainText(idea.title, 160);
  const topic = plainText(idea.topic || args.topic || title, 400);
  if (!title) throw new Error("Groq idea missing title");

  const slug = uniqueSlug(args.slug || idea.slug || title, taken, args.force);
  if (!args.force && taken.has(slug)) {
    throw new Error(`Slug already exists: ${slug} (pass --force to overwrite)`);
  }

  console.log(`   Title: ${title}`);
  console.log(`   Slug:  ${slug}`);

  console.log("2/3 Drafting structured article…");
  const draft = await groqJson({
    apiKey,
    model,
    temperature: 0.35,
    maxTokens: 4500,
    system: bodySystem(),
    user: `Write the post.\nTitle: ${title}\nTopic: ${topic}\nSlug: ${slug}`,
  });

  const { dateIso, dateLabel } = chileDateParts();
  const post = {
    slug,
    title,
    description: plainText(draft.description, 280),
    keywords: sanitizeKeywords(draft.keywords),
    dateIso,
    dateLabel,
    author: AUTHOR,
    topic,
    blocks: sanitizeBlocks(draft.blocks),
  };
  validatePost(post);

  if (args.dryRun) {
    console.log("3/3 Dry run — not writing files.");
    console.log(JSON.stringify({ slug, title, description: post.description, keywords: post.keywords, blocks: post.blocks.length }, null, 2));
    return;
  }

  console.log("3/3 Writing content JSON + generated.ts manifest…");
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(CONTENT_DIR, `${slug}.json`),
    `${JSON.stringify(post, null, 2)}\n`,
    "utf8",
  );

  const catalog = existingPosts().filter((item) => item.slug !== slug);
  catalog.push(post);
  writeManifest(catalog);

  console.log(`Wrote content/blog/${slug}.json`);
  console.log("Next: npm run build  then  npm run deploy");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
