import {
  FAQ_CANCELLATION_POSITIVE_A,
  FAQ_CANCELLATION_POSITIVE_Q,
} from "@/components/trust-stack-chileno";
import { PLAN, formatPlanPrice } from "@/lib/plans";
import {
  CANCELLATION_POLICY_FAQ_ANSWER,
  CANCELLATION_POLICY_SUMMARY,
} from "@/lib/subscription-cancellation-policy";

export type LandingFaqItem = { q: string; a: string; highlight?: boolean };

export type LandingFaqSection = {
  title: string;
  items: LandingFaqItem[];
};

export const LANDING_FAQ_SECTIONS: LandingFaqSection[] = [
  {
    title: "Planes y pagos",
    items: [
      {
        q: FAQ_CANCELLATION_POSITIVE_Q,
        a: FAQ_CANCELLATION_POSITIVE_A,
        highlight: true,
      },
      {
        q: "¿Cuánto cuesta Senior Safe frente a una alarma médica tradicional?",
        a: `Senior Safe cuesta $${formatPlanPrice(PLAN.monthly)} al mes; una alarma médica tradicional con central de monitoreo, pulsera y permanencia cuesta entre $30.000 y $80.000 al mes. El plan único anual es $${formatPlanPrice(PLAN.yearly)} (${PLAN.yearlySavingsLabel.toLowerCase()}). Es teleasistencia móvil sobre el smartphone: sin hardware extra, sin contrato de amarre y con pago Webpay Plus. La diferencia de precio refleja una cascada de canales redundantes hacia la familia, no una mesa de operadores.`,
      },
      {
        q: "¿Existe algún contrato de amarre o permanencia?",
        a: `No, ninguno. Puede dar de baja el plan cuando lo desee, sin multas. ${CANCELLATION_POLICY_SUMMARY}`,
      },
      {
        q: "¿Hay reembolso si cancelo el plan?",
        a: CANCELLATION_POLICY_FAQ_ANSWER,
      },
      {
        q: "¿Cuáles son los medios de pago disponibles?",
        a: "Los pagos se realizan de manera 100% segura en línea a través de Webpay Plus, utilizando tarjetas de crédito, débito o prepago.",
      },
    ],
  },
  {
    title: "Funcionamiento",
    items: [
      {
        q: "¿Qué es exactamente Senior Safe?",
        a: "Senior Safe es una aplicación para smartphone que alerta a tu familia de inmediato ante emergencias mediante WhatsApp, SMS, llamada automática y ubicación GPS en cada alerta.",
      },
      {
        q: "¿Cómo funciona el sistema de alerta en cascada?",
        a: "La cascada de alertas Senior Safe (ecosystem_v3_cascade) es un protocolo de canales redundantes: SMS al instante, WhatsApp a los 15 segundos y llamada de voz a los 60 segundos si ningún guardián confirma. El GPS viaja en cada mensaje con enlace a Google Maps. Hasta tres guardianes reciben SMS y WhatsApp en paralelo; la llamada escala por prioridad solo si nadie confirma recepción. No notifica al SAMU (131) ni a Carabineros (133): alerta a la red familiar.",
      },
      {
        q: "¿A quién notifica la aplicación cuando ocurre una emergencia?",
        a: "Las alertas van directamente al núcleo familiar. Puedes configurar hasta 3 guardianes (hijos, nietos, vecinos o cuidadores) con orden de prioridad.",
      },
      {
        q: "¿Cuánto tarda en llegar una alerta a la familia?",
        a: "Desde que se presiona el botón SOS, la primera notificación se despacha en segundos a la red familiar.",
      },
    ],
  },
  {
    title: "Emergencias",
    items: [
      {
        q: "¿Cómo funciona la detección de caídas?",
        a: "La detección de caídas de Senior Safe es un protocolo automático del smartphone: el acelerómetro registra un impacto, valida 3 segundos de inmovilidad y da 30 segundos para cancelar antes de alertar a la familia. El celular debe ir con la persona; no cubre todos los deslizamientos lentos ni caídas si el teléfono está en la mesita, sin batería o sin permiso de movimiento. No es un dispositivo médico ISP ni reemplaza llamar al 131.",
      },
      {
        q: "¿La localización GPS funciona fuera de la casa?",
        a: "Sí. Cuando se envía una alerta, el sistema incluye coordenadas GPS con enlace a Google Maps para ubicar al adulto mayor en casa, en la calle o en terreno abierto.",
      },
      {
        q: "¿Es difícil de usar para un adulto mayor?",
        a: "No. Senior Safe tiene diseño Senior-First: botones grandes, textos claros y acciones visibles, pensado para operarse en segundos.",
      },
      {
        q: "¿Cómo descargo e instalo la app?",
        a: "En Android: descárgala desde Google Play (play.google.com/store/apps/details?id=cl.alarmaseniorsafe.app). Contrata el plan en alarmaseniorsafe.cl, inicia sesión con tu correo y configura guardianes. Guía completa: alarmaseniorsafe.cl/guia.",
      },
      {
        q: "¿Tienen atención en caso de dudas?",
        a: "Sí. Soporte por WhatsApp o en hola@alarmaseniorsafe.cl.",
      },
    ],
  },
];

/** Lista plana para FAQPage JSON-LD y acordeón. */
export function landingFaqFlatItems(): LandingFaqItem[] {
  return LANDING_FAQ_SECTIONS.flatMap((section) => section.items);
}
