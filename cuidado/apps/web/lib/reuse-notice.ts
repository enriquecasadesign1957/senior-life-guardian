const CHILE = "America/Santiago";

export function formatChileDateTime(value: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: CHILE,
  }).format(value);
}

export function reuseNotice(againAt: Date, now: Date): { title: string; body: string } {
  if (againAt.getTime() <= now.getTime()) {
    return {
      title: "Este dominio ya tiene un informe",
      body: "Hay un informe cada 24 horas por dominio. Ya puedes pedir el siguiente.",
    };
  }
  return {
    title: "Este dominio ya tiene un informe",
    body: `Hay un informe cada 24 horas por dominio. Puedes pedir otro el ${formatChileDateTime(againAt)} (hora de Chile). Hasta esa hora te mostramos el que ya está.`,
  };
}
