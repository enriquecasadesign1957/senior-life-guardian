import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { OG_IMAGE, SITE } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "WakeUp Dev — Alertas de voz para DevOps",
  description:
    "Alertas de voz para DevOps y SRE: Grafana, UptimeRobot y webhooks HTTP se vuelven llamadas con confirmación en el 1. Not a mass-notification or fire-alarm system.",
  verification: {
    google: "ciRyBlAs47bLhpzWXXccWP8zW9TLWvrG4qnQ7FaonKM",
  },
  openGraph: {
    title: "WakeUp Dev — Alertas de voz para DevOps",
    description:
      "Grafana, UptimeRobot y webhooks HTTP se vuelven llamadas con confirmación en el 1. On-call voice alerts for DevOps and SRE.",
    url: SITE,
    siteName: "WakeUp Dev",
    locale: "en_US",
    alternateLocale: ["es_CL"],
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "WakeUp Dev — Alertas de voz para DevOps",
    description:
      "Alertas de voz para DevOps. Critical alerts become phone calls with press-1 acknowledgement.",
    images: [OG_IMAGE.url],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
