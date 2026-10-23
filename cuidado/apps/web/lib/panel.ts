import { formatCount } from "./explain";

export type ScoreTone = {
  label: string;
  shell: string;
  bar: string;
  ink: string;
};

export function scoreTone(score: number | null): ScoreTone {
  if (score === null || !Number.isInteger(score)) {
    return {
      label: "Sin puntaje esta vez",
      shell: "bg-white",
      bar: "bg-stone-300",
      ink: "text-ink",
    };
  }
  if (score >= 90) {
    return {
      label: "Va bien en el celular",
      shell: "bg-[#e7f3ec]",
      bar: "bg-pine",
      ink: "text-pine",
    };
  }
  if (score >= 50) {
    return {
      label: "Puede sentirse lenta",
      shell: "bg-[#fbf3df]",
      bar: "bg-[#c9892d]",
      ink: "text-[#8a5a12]",
    };
  }
  return {
    label: "Se siente lenta en el celular",
    shell: "bg-[#fde8e8]",
    bar: "bg-[#d36b76]",
    ink: "text-[#9f3a45]",
  };
}

export type JunkState = "unknown" | "clean" | "busy" | "full";

export function junkState(revisions: number | null): JunkState {
  if (revisions === null || !Number.isInteger(revisions) || revisions < 0) return "unknown";
  if (revisions === 0) return "clean";
  if (revisions < 100) return "busy";
  return "full";
}

export function junkBarPercent(revisions: number): number {
  if (revisions <= 0) return 8;
  if (revisions >= 1000) return 100;
  return Math.max(18, Math.min(100, Math.round((revisions / 1000) * 100)));
}

export type CleanupPreview = {
  headline: string;
  detail: string;
  blocked: boolean;
};

export function cleanupProjection(input: {
  revisions: number | null;
  expiredTransients: number | null;
  spamComments: number | null;
  bytes: number | null;
  overLimit: boolean;
}): CleanupPreview {
  if (input.overLimit) {
    return {
      blocked: true,
      headline: "Hay demasiada basura para quitarla de una vez.",
      detail: "Paramos antes de las 2.000 filas o los 32 MB. No tocamos pedidos, clientes, el tema ni functions.php.",
    };
  }
  const parts: string[] = [];
  if (input.revisions && input.revisions > 0) parts.push(`${formatCount(input.revisions)} copias viejas`);
  if (input.expiredTransients && input.expiredTransients > 0) {
    parts.push(`${formatCount(input.expiredTransients)} datos temporales vencidos`);
  }
  if (input.spamComments && input.spamComments > 0) parts.push(`${formatCount(input.spamComments)} comentarios de spam viejos`);
  const size = formatBytes(input.bytes);
  if (parts.length === 0) {
    return {
      blocked: false,
      headline: "No vimos copias viejas, datos temporales vencidos ni spam antiguo para quitar.",
      detail: "No tocamos pedidos, clientes, el tema ni functions.php.",
    };
  }
  const headline = size
    ? `Vamos a quitar ${parts.join(", ")}. Eso ocupa cerca de ${size}.`
    : `Vamos a quitar ${parts.join(", ")}.`;
  return {
    blocked: false,
    headline,
    detail: "No tocamos pedidos, clientes, el tema ni functions.php. Cuando la limpieza se aplique, se puede deshacer durante 7 días.",
  };
}

function formatBytes(bytes: number | null): string | null {
  if (bytes === null || !Number.isInteger(bytes) || bytes <= 0) return null;
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${mb.toLocaleString("es-CL", { maximumFractionDigits: 1 })} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString("es-CL")} KB`;
}