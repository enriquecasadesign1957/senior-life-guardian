export type MobileMetrics = {
  performanceScore: number | null;
  lcpMs: number | null;
  inpMs: number | null;
  clsMilli: number | null;
  heavyImages: boolean;
  renderBlocking: boolean;
};

type Audit = { score?: number | null; numericValue?: number | null };

export function readPsiPayload(body: unknown): MobileMetrics {
  const root = body as {
    lighthouseResult?: {
      categories?: { performance?: { score?: number | null } };
      audits?: Record<string, Audit | undefined>;
    };
  };
  const audits = root.lighthouseResult?.audits ?? {};
  const score = root.lighthouseResult?.categories?.performance?.score;
  const lcp = audits["largest-contentful-paint"]?.numericValue;
  const inp = audits["interaction-to-next-paint"]?.numericValue;
  const cls = audits["cumulative-layout-shift"]?.numericValue;
  const imageScore = audits["modern-image-formats"]?.score ?? audits["uses-optimized-images"]?.score;
  const blocking = audits["render-blocking-resources"]?.score;
  return {
    performanceScore: typeof score === "number" ? Math.round(score * 100) : null,
    lcpMs: typeof lcp === "number" ? Math.round(lcp) : null,
    inpMs: typeof inp === "number" ? Math.round(inp) : null,
    clsMilli: typeof cls === "number" ? Math.round(cls * 1000) : null,
    heavyImages: typeof imageScore === "number" ? imageScore < 0.9 : false,
    renderBlocking: typeof blocking === "number" ? blocking < 0.9 : false,
  };
}

export async function fetchMobileMetrics(url: string): Promise<MobileMetrics> {
  const key = process.env.GOOGLE_PSI_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_PSI_API_KEY is not set");
  }
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  endpoint.searchParams.append("category", "performance");
  endpoint.searchParams.set("key", key);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40_000);
  try {
    const response = await fetch(endpoint, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`PSI ${response.status}`);
    }
    return readPsiPayload(await response.json());
  } finally {
    clearTimeout(timer);
  }
}
