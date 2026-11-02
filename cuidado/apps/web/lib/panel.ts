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
  steps: string[];
  wins: string[];
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
      headline: "Hay demasiada basura acumulada para vaciarla de un solo golpe.",
      detail:
        "Paramos antes de las 2.000 filas o los 32 MB para no saturar el hosting. No tocamos pedidos, clientes, el tema ni functions.php.",
      steps: [],
      wins: [],
    };
  }

  const steps: string[] = [];
  const parts: string[] = [];
  if (input.revisions && input.revisions > 0) {
    parts.push(`${formatCount(input.revisions)} copias viejas de páginas y entradas`);
    steps.push(
      `Borrar una por una las ${formatCount(input.revisions)} revisiones antiguas que WordPress guardó cada vez que editaste.`,
    );
    steps.push("Dejar solo la versión publicada: sin borradores fantasma ni historial basura en la base.");
  }
  if (input.expiredTransients && input.expiredTransients > 0) {
    parts.push(`${formatCount(input.expiredTransients)} datos temporales vencidos`);
    steps.push(
      `Vaciar ${formatCount(input.expiredTransients)} restos de caché y opciones temporales que ya caducaron y siguen ocupando filas.`,
    );
  }
  if (input.spamComments && input.spamComments > 0) {
    parts.push(`${formatCount(input.spamComments)} comentarios de spam viejos`);
    steps.push(
      `Eliminar ${formatCount(input.spamComments)} comentarios de spam con más de 30 días que nadie ve y siguen hinchando la tabla.`,
    );
  }

  const size = formatBytes(input.bytes);
  if (parts.length === 0) {
    return {
      blocked: false,
      headline: "Esta base ya está limpia: no vimos copias viejas, temporales vencidos ni spam antiguo para quitar.",
      detail: "No tocamos pedidos, clientes, el tema ni functions.php.",
      steps: [],
      wins: ["La base ya no arrastra ese peso muerto medido."],
    };
  }

  const headline = size
    ? `Vamos a barrer ${parts.join(", ")}. Eso son cerca de ${size} de peso muerto saliendo de la base.`
    : `Vamos a barrer ${parts.join(", ")} hasta dejar la base sin ese lastre.`;

  const wins = [
    "La base queda más liviana: menos filas basura en cada respaldo y en cada consulta del escritorio.",
    "Los respaldos pesan menos y se hacen más simples de guardar.",
    "El panel de WordPress deja de arrastrar revisiones y caché vencido que nadie usa.",
    "Las páginas publicadas, los pedidos y el tema siguen exactamente como están.",
  ];
  if (size) {
    wins.unshift(`Recuperas del orden de ${size} que hoy solo alimentan basura interna.`);
  }

  return {
    blocked: false,
    headline,
    detail:
      "Cuando la limpieza se aplique, se puede deshacer durante 7 días. Pasado ese plazo, lo borrado no vuelve. No tocamos pedidos, clientes, el tema ni functions.php. Todavía no se ejecuta sola: primero ves el lote completo.",
    steps,
    wins,
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
