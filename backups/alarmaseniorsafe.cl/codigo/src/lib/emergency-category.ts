import { z } from "zod";

export const EMERGENCY_CATEGORY_IDS = ["salud", "accidente", "delincuencia"] as const;

export type EmergencyCategory = (typeof EMERGENCY_CATEGORY_IDS)[number];

/** Si el adulto mayor no elige categoría en el modal SOS, se envía con esta categoría. */
export const EMERGENCY_CATEGORY_AUTO_DEFAULT: EmergencyCategory = "salud";

export const EMERGENCY_CATEGORY_AUTO_SEND_MS = 10_000;

export const emergencyCategorySchema = z.enum(EMERGENCY_CATEGORY_IDS);

export const EMERGENCY_CATEGORIES: ReadonlyArray<{
  id: EmergencyCategory;
  label: string;
  subtitle: string;
  color: string;
}> = [
  {
    id: "salud",
    label: "Salud",
    subtitle: "Malestar, dolor o enfermedad",
    color: "#dc2626",
  },
  {
    id: "accidente",
    label: "Accidente",
    subtitle: "Caída, golpe o lesión",
    color: "#ea580c",
  },
  {
    id: "delincuencia",
    label: "Delincuencia",
    subtitle: "Robo, intruso o peligro",
    color: "#7c3aed",
  },
];

export function emergencyCategoryLabel(category: EmergencyCategory): string {
  return EMERGENCY_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

/** Línea para WhatsApp / SMS a la familia. */
export function emergencyCategoryMessageLine(category: EmergencyCategory): string {
  switch (category) {
    case "salud":
      return "Salud (malestar o enfermedad)";
    case "accidente":
      return "Accidente (caída o lesión)";
    case "delincuencia":
      return "Delincuencia (robo o peligro)";
    default:
      return emergencyCategoryLabel(category);
  }
}
