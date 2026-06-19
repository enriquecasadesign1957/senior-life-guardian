/**
 * Datasets demo alineados con el modelo real (contract_signups, alert_logs, etc.)
 */

export type DemoSenior = {
  id: string;
  nombre: string;
  edad: number;
  comuna: string;
  direccion: string;
  telefono: string;
  plan: string;
  subscription_status: "active";
  oneclick_card_last4: string;
};

export type DemoGuardian = {
  id: string;
  nombre: string;
  parentesco: string;
  telefono: string;
  recibe_sms: boolean;
  recibe_whatsapp: boolean;
  recibe_llamada: boolean;
  prioridad: number;
};

export type DemoAlert = {
  id: string;
  event_type: string;
  status: string;
  gps_lat: number;
  gps_lng: number;
  gps_accuracy: number;
  created_at: string;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  senior_id: string;
  senior_nombre: string;
  comuna: string;
};

export type DemoGpsPoint = {
  at: string;
  lat: number;
  lng: number;
  label: string;
};

export type DemoGeofence = {
  id: string;
  nombre: string;
  comuna: string;
  radio_m: number;
  activa: boolean;
};

export type DemoInstitution = {
  id: string;
  nombre: string;
  tipo: "municipalidad" | "salud" | "ong";
  comuna: string;
  usuarios_protegidos: number;
};

export type DemoOperator = {
  id: string;
  nombre: string;
  rol: "operador" | "supervisor";
  turno: string;
};

export const DEMO_MUNICIPALITY = {
  nombre: "Municipalidad Demo — Las Condes",
  slug: "las-condes",
  programa: "Vecino Senior Safe",
  codigo_descuento: "VECINO-LASCONDES",
};

export const DEMO_KPIS = {
  usuarios_protegidos: 1247,
  alertas_mes: 89,
  tiempo_respuesta_promedio_min: 4.2,
  casos_criticos_mes: 12,
  tasa_ack_pct: 94,
  cobertura_comunas: 8,
  familiares_vinculados: 3120,
  satisfaccion_pct: 96,
};

export const DEMO_SENIORS: DemoSenior[] = [
  {
    id: "demo-senior-1",
    nombre: "María González",
    edad: 78,
    comuna: "Las Condes",
    direccion: "Av. Apoquindo 4500",
    telefono: "+56912345678",
    plan: "unico",
    subscription_status: "active",
    oneclick_card_last4: "6623",
  },
  {
    id: "demo-senior-2",
    nombre: "Pedro Ramírez",
    edad: 82,
    comuna: "Providencia",
    direccion: "Av. Providencia 2100",
    telefono: "+56987654321",
    plan: "unico",
    subscription_status: "active",
    oneclick_card_last4: "7763",
  },
  {
    id: "demo-senior-3",
    nombre: "Carmen Soto",
    edad: 75,
    comuna: "Ñuñoa",
    direccion: "Irarrázaval 3400",
    telefono: "+56911223344",
    plan: "unico",
    subscription_status: "active",
    oneclick_card_last4: "6623",
  },
];

export const DEMO_GUARDIANS: DemoGuardian[] = [
  {
    id: "g1",
    nombre: "Ana González",
    parentesco: "Hija",
    telefono: "+56922334455",
    recibe_sms: true,
    recibe_whatsapp: true,
    recibe_llamada: true,
    prioridad: 1,
  },
  {
    id: "g2",
    nombre: "Luis González",
    parentesco: "Hijo",
    telefono: "+56933445566",
    recibe_sms: true,
    recibe_whatsapp: true,
    recibe_llamada: false,
    prioridad: 2,
  },
  {
    id: "g3",
    nombre: "Dr. Martínez",
    parentesco: "Médico",
    telefono: "+56944556677",
    recibe_sms: true,
    recibe_whatsapp: false,
    recibe_llamada: true,
    prioridad: 3,
  },
];

export const DEMO_ALERTS: DemoAlert[] = [
  {
    id: "alert-demo-1",
    event_type: "sos",
    status: "delivered",
    gps_lat: -33.4172,
    gps_lng: -70.6062,
    gps_accuracy: 12,
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    acknowledged_at: new Date(Date.now() - 1.9 * 3600_000).toISOString(),
    acknowledged_by: "Ana González",
    senior_id: "demo-senior-1",
    senior_nombre: "María González",
    comuna: "Las Condes",
  },
  {
    id: "alert-demo-2",
    event_type: "caida",
    status: "partial",
    gps_lat: -33.4263,
    gps_lng: -70.6156,
    gps_accuracy: 18,
    created_at: new Date(Date.now() - 26 * 3600_000).toISOString(),
    acknowledged_at: null,
    senior_id: "demo-senior-2",
    senior_nombre: "Pedro Ramírez",
    comuna: "Providencia",
  },
  {
    id: "alert-demo-3",
    event_type: "wellness",
    status: "delivered",
    gps_lat: -33.4569,
    gps_lng: -70.5973,
    gps_accuracy: 8,
    created_at: new Date(Date.now() - 48 * 3600_000).toISOString(),
    acknowledged_at: new Date(Date.now() - 47.5 * 3600_000).toISOString(),
    acknowledged_by: "Portal familia",
    senior_id: "demo-senior-3",
    senior_nombre: "Carmen Soto",
    comuna: "Ñuñoa",
  },
];

export const DEMO_GPS_HISTORY: DemoGpsPoint[] = [
  { at: "08:00", lat: -33.4172, lng: -70.6062, label: "Domicilio" },
  { at: "10:30", lat: -33.4185, lng: -70.6048, label: "Farmacia" },
  { at: "12:15", lat: -33.4198, lng: -70.6021, label: "Parque" },
  { at: "14:00", lat: -33.4172, lng: -70.6062, label: "Domicilio" },
];

/** Geocercas simuladas (no existen en BD producción; solo demo institucional). */
export const DEMO_GEOFENCES: DemoGeofence[] = [
  { id: "geo-1", nombre: "Hogar seguro", comuna: "Las Condes", radio_m: 200, activa: true },
  { id: "geo-2", nombre: "Centro médico", comuna: "Las Condes", radio_m: 150, activa: true },
  { id: "geo-3", nombre: "Zona comercial", comuna: "Providencia", radio_m: 300, activa: false },
];

export const DEMO_INSTITUTIONS: DemoInstitution[] = [
  {
    id: "inst-1",
    nombre: "Municipalidad de Las Condes",
    tipo: "municipalidad",
    comuna: "Las Condes",
    usuarios_protegidos: 412,
  },
  {
    id: "inst-2",
    nombre: "CESFAM Providencia Norte",
    tipo: "salud",
    comuna: "Providencia",
    usuarios_protegidos: 186,
  },
  {
    id: "inst-3",
    nombre: "Fundación Adulto Mayor",
    tipo: "ong",
    comuna: "Ñuñoa",
    usuarios_protegidos: 95,
  },
];

export const DEMO_OPERATORS: DemoOperator[] = [
  { id: "op-1", nombre: "Valentina Muñoz", rol: "supervisor", turno: "Mañana" },
  { id: "op-2", nombre: "Carlos Pérez", rol: "operador", turno: "Tarde" },
  { id: "op-3", nombre: "Daniela Rojas", rol: "operador", turno: "Noche" },
];

export const DEMO_ALERTS_BY_COMUNA = [
  { comuna: "Las Condes", alertas: 34 },
  { comuna: "Providencia", alertas: 22 },
  { comuna: "Ñuñoa", alertas: 18 },
  { comuna: "La Reina", alertas: 9 },
  { comuna: "Vitacura", alertas: 6 },
];

export const DEMO_ALERTS_BY_MONTH = [
  { mes: "Ene", alertas: 62, criticos: 8 },
  { mes: "Feb", alertas: 71, criticos: 9 },
  { mes: "Mar", alertas: 68, criticos: 7 },
  { mes: "Abr", alertas: 89, criticos: 12 },
  { mes: "May", alertas: 74, criticos: 10 },
  { mes: "Jun", alertas: 89, criticos: 12 },
];

export const DEMO_RESPONSE_TIME_TREND = [
  { semana: "S1", minutos: 5.1 },
  { semana: "S2", minutos: 4.8 },
  { semana: "S3", minutos: 4.5 },
  { semana: "S4", minutos: 4.2 },
];

export const DEMO_NAV_SECTIONS = [
  { to: "/demo/flujo", label: "Flujo SOS (pantallas)", desc: "Botón, tipo de ayuda, mensaje guardián y mapa" },
  { to: "/demo/ejecutivo", label: "Dashboard Ejecutivo", desc: "KPIs institucionales" },
  { to: "/demo/monitoreo", label: "Supervisión del programa", desc: "Vista conceptual de gestión municipal (no operativa)" },
  { to: "/demo/mapa", label: "Mapa de Emergencias", desc: "GPS y geocercas demo" },
  { to: "/demo/alertas", label: "Gestión de Alertas", desc: "Historial y cascada" },
  { to: "/demo/perfil", label: "Perfil de Usuario", desc: "Adulto mayor y plan" },
  { to: "/demo/reportes", label: "Reportes", desc: "Exportables institucionales" },
  { to: "/demo/analitica", label: "Analítica", desc: "Tendencias e impacto" },
  { to: "/demo/presentacion", label: "Modo Presentación", desc: "Tour guiado para reuniones" },
] as const;
