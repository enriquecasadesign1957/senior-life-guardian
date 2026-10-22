import {
  ACTION_IDS,
  explainResultSchema,
  type ActionId,
  type ExplainResult,
  type ExplainedIssue,
} from "@cuidado/contract";

export type DraftFinding = {
  code: string;
  severity: "low" | "medium" | "high";
  count?: number;
  plainTitle: string;
  whatItMeans: string;
  ifIgnored: string;
  actionId: ActionId | null;
};

const ALLOWED = new Set<string>(ACTION_IDS);

export function formatCount(value: number): string {
  return new Intl.NumberFormat("es-CL").format(value);
}

export function templateSummary(issues: Array<Pick<DraftFinding, "plainTitle">>): string {
  const titles = issues.map((issue) => issue.plainTitle).slice(0, 3);
  if (titles.length === 0) return "Tu página cargó y no vimos un problema urgente en el celular.";
  const text = `Esto es lo que vimos: ${titles.join(". ")}.`;
  return text.length <= 400 ? text : `${text.slice(0, 397)}...`;
}

export function applyModelActions(drafts: DraftFinding[], raw: unknown): ExplainedIssue[] {
  const parsed = explainResultSchema.safeParse(raw);
  return drafts.map((draft) => {
    const fromModel = parsed.success
      ? parsed.data.issues.find((issue) => issue.code === draft.code)
      : undefined;
    const requested = fromModel?.actionId ?? null;
    const actionId = requested === draft.actionId && requested !== null && ALLOWED.has(requested)
      ? requested
      : draft.actionId;
    return {
      code: draft.code,
      severity: draft.severity,
      plainTitle: draft.plainTitle,
      whatItMeans: draft.whatItMeans,
      ifIgnored: draft.ifIgnored,
      actionId,
      source: "template" as const,
    };
  });
}

function safeSummary(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length === 0 || clean.length > 400) return fallback;
  if (/<\?php|functions\.php|wp-config/i.test(clean)) return fallback;
  return clean;
}

export async function explainFindings(
  drafts: DraftFinding[],
  complete?: (drafts: DraftFinding[]) => Promise<unknown>,
): Promise<ExplainResult> {
  const fallback = templateSummary(drafts);
  const issues = drafts.map((draft) => ({ ...draft, source: "template" as const }));
  if (!complete) {
    return { summary: fallback, issues };
  }
  try {
    const raw = await complete(drafts);
    const parsed = explainResultSchema.safeParse(raw);
    return {
      summary: safeSummary(parsed.success ? parsed.data.summary : undefined, fallback),
      issues: applyModelActions(drafts, raw),
    };
  } catch {
    return { summary: fallback, issues };
  }
}

export function buildDrafts(input: {
  heavyImages: boolean;
  renderBlocking: boolean;
  lcpMs: number | null;
  inpMs: number | null;
  clsMilli: number | null;
  revisions: number | null;
  expiredTransients: number | null;
  spamComments: number | null;
  innodb: boolean | null;
  overLimit: boolean;
}): DraftFinding[] {
  const drafts: DraftFinding[] = [];
  if (input.heavyImages) {
    drafts.push({
      code: "heavy_images",
      severity: "high",
      plainTitle: "Tienes fotos muy pesadas",
      whatItMeans: "Las imágenes de la portada tardan en bajar y la página se siente lenta en el celular.",
      ifIgnored: "Quien entra desde el teléfono puede irse antes de ver el contenido.",
      actionId: null,
    });
  }
  if (input.renderBlocking) {
    drafts.push({
      code: "render_blocking",
      severity: "medium",
      plainTitle: "Hay archivos que frenan la carga",
      whatItMeans: "Parte del estilo o del código se descarga antes de que se vea la página.",
      ifIgnored: "La portada tarda más en aparecer en el celular.",
      actionId: null,
    });
  }
  if (input.lcpMs !== null && input.lcpMs > 2500) {
    drafts.push({
      code: "slow_lcp",
      severity: "high",
      plainTitle: "Lo principal de la página tarda en verse",
      whatItMeans: `El contenido grande tarda ${(input.lcpMs / 1000).toLocaleString("es-CL", { maximumFractionDigits: 1 })} segundos en el celular.`,
      ifIgnored: "La visita se siente trabada aunque el resto del sitio esté bien.",
      actionId: null,
    });
  }
  if (input.inpMs !== null && input.inpMs > 200) {
    drafts.push({
      code: "poor_inp",
      severity: "medium",
      plainTitle: "La página responde tarde al tocarla",
      whatItMeans: "Entre un toque y la reacción de la página pasa demasiado tiempo.",
      ifIgnored: "Los botones y los menús se sienten duros en el celular.",
      actionId: null,
    });
  }
  if (input.clsMilli !== null && input.clsMilli > 100) {
    drafts.push({
      code: "high_cls",
      severity: "medium",
      plainTitle: "La página se mueve mientras carga",
      whatItMeans: "Los textos o los botones cambian de lugar cuando aparecen las fotos.",
      ifIgnored: "Alguien puede tocar el botón equivocado.",
      actionId: null,
    });
  }
  if (input.revisions !== null && input.revisions > 0) {
    drafts.push({
      code: "post_revisions",
      severity: input.revisions > 100 ? "high" : "medium",
      count: input.revisions,
      plainTitle: `Tienes ${formatCount(input.revisions)} copias viejas de tus páginas`,
      whatItMeans: "WordPress guarda una copia cada vez que editas. Esas copias ocupan la base de datos.",
      ifIgnored: "El escritorio y las copias de seguridad se ponen más lentos.",
      actionId: "purge_revisions",
    });
  }
  if (input.expiredTransients !== null && input.expiredTransients > 0) {
    drafts.push({
      code: "expired_transients",
      severity: "low",
      count: input.expiredTransients,
      plainTitle: `Hay ${formatCount(input.expiredTransients)} datos temporales vencidos`,
      whatItMeans: "Son restos de caché que ya no usa el sitio.",
      ifIgnored: "La base sigue cargando información que no sirve.",
      actionId: "purge_transients",
    });
  }
  if (input.spamComments !== null && input.spamComments > 0) {
    drafts.push({
      code: "spam_comments",
      severity: "medium",
      count: input.spamComments,
      plainTitle: `Tienes ${formatCount(input.spamComments)} comentarios de spam viejos`,
      whatItMeans: "Están en la carpeta de spam desde hace más de 30 días.",
      ifIgnored: "Siguen ocupando espacio aunque nadie los ve.",
      actionId: "purge_spam",
    });
  }
  if (input.innodb === false) {
    drafts.push({
      code: "innodb_unavailable",
      severity: "high",
      plainTitle: "La base de datos no permite una limpieza segura",
      whatItMeans: "El sitio no usa el motor InnoDB, que es el que permite borrar y deshacer sin trabar la web.",
      ifIgnored: "No vamos a limpiar este sitio hasta que la base esté en InnoDB.",
      actionId: null,
    });
  }
  if (input.overLimit) {
    drafts.push({
      code: "payload_limit",
      severity: "high",
      plainTitle: "Hay demasiada basura para limpiarla de una vez",
      whatItMeans: "El lote supera 2.000 filas o 32 MB. Paramos para no llenar el hosting.",
      ifIgnored: "Una limpieza de ese tamaño puede agotar el disco del servidor.",
      actionId: null,
    });
  }
  return drafts;
}
