export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; code: string }
  | { type: "discussion"; text: string };

export type BlogIndexEntry = {
  slug: string;
  href: string;
  title: string;
  description: string;
  dateIso: string;
  dateLabel: string;
  author: string;
  generated?: boolean;
};

export type GeneratedPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  coverImage?: string;
  dateIso: string;
  dateLabel: string;
  author: string;
  topic: string;
  blocks: BlogBlock[];
};
