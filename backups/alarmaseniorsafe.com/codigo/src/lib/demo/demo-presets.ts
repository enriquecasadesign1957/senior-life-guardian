/**
 * Presets por institución/municipio para reuniones distintas.
 * URL: /demo?institucion=las-condes | providencia | nunoa | vitacura | maipu
 */
import type { DemoAlert } from "@/lib/demo/demo-data";
import {
  DEMO_ALERTS,
  DEMO_ALERTS_BY_COMUNA,
  DEMO_KPIS,
} from "@/lib/demo/demo-data";

export type DemoInstitutionPreset = {
  slug: string;
  label: string;
  municipality: {
    nombre: string;
    slug: string;
    programa: string;
    codigo_descuento: string;
  };
  kpis: typeof DEMO_KPIS;
  alertsByComuna: typeof DEMO_ALERTS_BY_COMUNA;
  alerts: DemoAlert[];
  meetingUrl: string;
};

const BASE_KPIS = { ...DEMO_KPIS };

export const DEMO_INSTITUTION_PRESETS: Record<string, DemoInstitutionPreset> = {
  "las-condes": {
    slug: "las-condes",
    label: "Las Condes",
    municipality: {
      nombre: "Municipalidad de Las Condes",
      slug: "las-condes",
      programa: "Programa Vecino Senior Safe",
      codigo_descuento: "VECINO-LASCONDES",
    },
    kpis: { ...BASE_KPIS, usuarios_protegidos: 1247, alertas_mes: 89 },
    alertsByComuna: DEMO_ALERTS_BY_COMUNA,
    alerts: DEMO_ALERTS,
    meetingUrl: "/demo?institucion=las-condes",
  },
  providencia: {
    slug: "providencia",
    label: "Providencia",
    municipality: {
      nombre: "Municipalidad de Providencia",
      slug: "providencia",
      programa: "Adulto Mayor Conectado",
      codigo_descuento: "VECINO-PROVIDENCIA",
    },
    kpis: { ...BASE_KPIS, usuarios_protegidos: 892, alertas_mes: 64, casos_criticos_mes: 9 },
    alertsByComuna: [
      { comuna: "Providencia", alertas: 28 },
      { comuna: "Las Condes", alertas: 14 },
      { comuna: "Ñuñoa", alertas: 12 },
    ],
    alerts: DEMO_ALERTS.map((a, i) =>
      i === 1 ? { ...a, comuna: "Providencia", senior_nombre: "Pedro Ramírez" } : a,
    ),
    meetingUrl: "/demo?institucion=providencia",
  },
  nunoa: {
    slug: "nunoa",
    label: "Ñuñoa",
    municipality: {
      nombre: "Municipalidad de Ñuñoa",
      slug: "nunoa",
      programa: "Red Mayor Segura",
      codigo_descuento: "VECINO-NUNOA",
    },
    kpis: { ...BASE_KPIS, usuarios_protegidos: 654, alertas_mes: 52, cobertura_comunas: 5 },
    alertsByComuna: [
      { comuna: "Ñuñoa", alertas: 22 },
      { comuna: "Providencia", alertas: 15 },
      { comuna: "Macul", alertas: 8 },
    ],
    alerts: DEMO_ALERTS,
    meetingUrl: "/demo?institucion=nunoa",
  },
  vitacura: {
    slug: "vitacura",
    label: "Vitacura",
    municipality: {
      nombre: "Municipalidad de Vitacura",
      slug: "vitacura",
      programa: "Senior Safe Vitacura",
      codigo_descuento: "VECINO-VITACURA",
    },
    kpis: { ...BASE_KPIS, usuarios_protegidos: 428, alertas_mes: 31, familiares_vinculados: 980 },
    alertsByComuna: [
      { comuna: "Vitacura", alertas: 18 },
      { comuna: "Las Condes", alertas: 8 },
    ],
    alerts: DEMO_ALERTS,
    meetingUrl: "/demo?institucion=vitacura",
  },
  maipu: {
    slug: "maipu",
    label: "Maipú",
    municipality: {
      nombre: "Municipalidad de Maipú",
      slug: "maipu",
      programa: "Adulto Mayor Protegido",
      codigo_descuento: "VECINO-MAIPU",
    },
    kpis: {
      ...BASE_KPIS,
      usuarios_protegidos: 2103,
      alertas_mes: 112,
      casos_criticos_mes: 18,
      cobertura_comunas: 12,
    },
    alertsByComuna: [
      { comuna: "Maipú", alertas: 45 },
      { comuna: "Estación Central", alertas: 22 },
    ],
    alerts: DEMO_ALERTS,
    meetingUrl: "/demo?institucion=maipu",
  },
};

export const DEMO_INSTITUTION_SLUGS = Object.keys(DEMO_INSTITUTION_PRESETS);

export function resolveDemoInstitution(slug?: string | null): DemoInstitutionPreset {
  const key = slug?.trim().toLowerCase() ?? "las-condes";
  return DEMO_INSTITUTION_PRESETS[key] ?? DEMO_INSTITUTION_PRESETS["las-condes"];
}
