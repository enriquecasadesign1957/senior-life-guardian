import type { NextRequest } from "next/server";

const PRODUCTION_ORIGIN = "https://wakeupdev.com";

/** OAuth must return to the public site, never a baked-in localhost URL. */
export function resolveAppOrigin(_request?: NextRequest) {
  return PRODUCTION_ORIGIN;
}
