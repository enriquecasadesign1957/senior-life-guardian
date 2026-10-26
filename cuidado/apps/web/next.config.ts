import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["@cuidado/db", "@cuidado/contract"],
  // The git root, so the traced app path stays cuidado/apps/web.
  // Tracing from cuidado/ shortens it to apps/web and Vercel misses Next.js.
  outputFileTracingRoot: path.resolve(appDir, "../../.."),
};

export default nextConfig;
