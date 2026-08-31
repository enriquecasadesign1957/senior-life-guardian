import { PRODUCTION_SITE_URL } from "@/lib/app-url";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  publishedAt: string; // ISO date YYYY-MM-DD
  updatedAt?: string;
  author: string;
  category: string;
  readingMinutes: number;
  coverImage: string;
  coverWidth: number;
  coverHeight: number;
  coverAlt: string;
  tags: string[];
};

/** Catálogo editorial Senior Safe (extensible). */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "alarma-sos-para-adultos-mayores-que-si-responde",
    title: "Alarma SOS para adultos mayores que sí responde",
    description:
      "Qué debe resolver una alarma SOS para adultos mayores: botón simple, GPS, alerta en cascada por WhatsApp, SMS y llamada, y una red familiar que confirma quién tomó el caso.",
    excerpt:
      "Del botón SOS a una alerta en cascada: WhatsApp, SMS, GPS y escalamiento si nadie confirma. Plan desde $6.900/mes, sin permanencia.",
    publishedAt: "2026-08-15",
    author: "Equipo Senior Safe",
    category: "Protección familiar",
    readingMinutes: 8,
    coverImage: "/images/blog-alarma-sos-responde.png",
    coverWidth: 1200,
    coverHeight: 630,
    coverAlt:
      "Adulto mayor sonriente en su living con smartphone Senior Safe",
    tags: ["SOS", "WhatsApp", "GPS", "adultos mayores", "Chile"],
  },
  {
    slug: "como-hablar-con-padres-seguridad-sin-perder-independencia",
    title:
      "¿No quiere usar un botón de pánico? Cómo hablar con tus padres sobre su seguridad sin que sientan que pierden su independencia",
    description:
      "Estrategias de comunicación para convencer a adultos mayores de usar teleasistencia móvil sin afectar su autonomía ni dignidad.",
    excerpt:
      "Cómo hablar de seguridad con mamá o papá sin collares estigmatizantes: red de guardianes en el celular, desde $6.900/mes.",
    publishedAt: "2026-08-09",
    author: "Equipo de Psicología y Bienestar Senior Safe",
    category: "Familia y bienestar",
    readingMinutes: 7,
    coverImage: "/images/blog-independencia-senior.jpg",
    coverWidth: 1200,
    coverHeight: 630,
    coverAlt:
      "Adulto mayor independiente en su taller con smartphone como red de protección familiar",
    tags: ["independencia", "familia", "teleasistencia", "conversación", "Chile"],
  },
  {
    slug: "revista-seguridad-destaca-lanzamiento-senior-safe",
    title:
      'Revista Seguridad destaca el lanzamiento de Senior Safe en Chile: "Tecnología con corazón"',
    description:
      "Reseña del reportaje de Revista Seguridad & Defensa sobre la plataforma chilena de teleasistencia con IA y algoritmo en cascada.",
    excerpt:
      "La Revista Seguridad & Defensa destaca a Senior Safe como alternativa accesible e inteligente frente a las alarmas tradicionales.",
    publishedAt: "2026-07-10",
    author: "Equipo Senior Safe",
    category: "Prensa",
    readingMinutes: 5,
    coverImage: "/images/blog-prensa-seguridad.jpg",
    coverWidth: 1200,
    coverHeight: 675,
    coverAlt:
      "Adulta mayor tranquila en su hogar con smartphone y teleasistencia Senior Safe",
    tags: ["prensa", "lanzamiento", "Revista Seguridad", "Chile"],
  },
  {
    slug: "como-la-ia-salva-vidas-emergencias-domesticas",
    title:
      "¿Cómo la Inteligencia Artificial y WhatsApp están salvando vidas ante emergencias domésticas en Chile?",
    description:
      "Cascada WhatsApp/SMS/llamada, tres botones de emergencia y GPS a Maps/Waze: cómo la IA familiar protege a adultos mayores sin amarras de $30.000–$80.000 mensuales.",
    excerpt:
      "Cascada WhatsApp/SMS/llamada, tres botones de emergencia y GPS a Maps/Waze: cómo la IA familiar protege a adultos mayores sin amarras de $30.000–$80.000 mensuales.",
    publishedAt: "2026-08-06",
    updatedAt: "2026-08-31",
    author: "Equipo de Producto Senior Safe",
    category: "Protección familiar",
    readingMinutes: 8,
    coverImage: "/images/blog-ia-teleasistencia.jpg",
    coverWidth: 1200,
    coverHeight: 675,
    coverAlt:
      "Adulto mayor independiente en su hogar utilizando teleasistencia inteligente con smartphone en Chile",
    tags: ["IA", "WhatsApp", "caídas", "teleasistencia", "infraestructura", "Chile"],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Más recientes primero (para el índice). */
export function getBlogPostsNewestFirst(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function blogPostPath(slug: string): string {
  return `/blog/${slug}`;
}

export function blogPostUrl(slug: string): string {
  return `${PRODUCTION_SITE_URL}${blogPostPath(slug)}`;
}

export function formatBlogDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
