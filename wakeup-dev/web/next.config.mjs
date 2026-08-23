import path from "node:path";
import { fileURLToPath } from "node:url";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  env: {
    NEXT_PUBLIC_SITE_URL: isProd
      ? "https://wakeupdev.com"
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    NEXT_PUBLIC_LEMON_CHECKOUT_URL:
      process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ||
      "https://wakeupdev.lemonsqueezy.com/checkout/buy/23db93a7-936d-48d2-992f-c796d61c64a6",
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
