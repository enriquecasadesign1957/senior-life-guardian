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
  title: "WakeUp Dev — Voice-first on-call alerting",
  description:
    "Turn critical Grafana, UptimeRobot, and HTTP webhook alerts into phone calls with human acknowledgement and automatic escalation. Start free with 5 voice alerts.",
  openGraph: {
    title: "WakeUp Dev — Voice-first on-call alerting",
    description:
      "Webhook → phone call → press 1 to ACK → escalation. Built for DevOps and SRE on-call.",
    url: SITE,
    siteName: "WakeUp Dev",
    locale: "en_US",
    alternateLocale: ["es_CL"],
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "WakeUp Dev — Voice-first on-call alerting",
    description:
      "Critical alerts become phone calls. Human ACK. Automatic on-call escalation.",
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
