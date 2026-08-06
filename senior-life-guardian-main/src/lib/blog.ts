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
    slug: "como-la-ia-salva-vidas-emergencias-domesticas",
    title:
      "¿Cómo la Inteligencia Artificial y WhatsApp están salvando vidas ante emergencias domésticas en Chile?",
    description:
      "Explicación de cómo el algoritmo en cascada y los sensores móviles discriminan emergencias de salud, caídas o delincuencia en adultos mayores.",
    excerpt:
      "Cascada WhatsApp/SMS/llamada, tres botones de emergencia y GPS a Maps/Waze: cómo la IA familiar protege a adultos mayores sin amarras de $30.000–$80.000.",
    publishedAt: "2026-08-06",
    author: "Equipo de Tecnología Senior Safe",
    category: "Protección familiar",
    readingMinutes: 8,
    coverImage: "/images/blog-ia-teleasistencia.jpg",
    coverWidth: 1200,
    coverHeight: 675,
    coverAlt:
      "Teleasistencia familiar con inteligencia artificial para adultos mayores en Chile",
    tags: ["IA", "WhatsApp", "caídas", "teleasistencia", "Chile"],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
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
