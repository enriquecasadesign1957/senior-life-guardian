import { describeDatabaseUrl, getPool } from "@cuidado/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Smoke de conectividad Postgres sin filtrar secretos.
 * GET /api/health/db → { ok, provider, mode, host, port }
 */
export async function GET(): Promise<NextResponse> {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL_missing" },
      { status: 500 },
    );
  }

  let info;
  try {
    info = describeDatabaseUrl(raw);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "DATABASE_URL_invalid",
        message: error instanceof Error ? error.message.slice(0, 160) : "invalid",
      },
      { status: 500 },
    );
  }

  try {
    const client = await getPool().connect();
    try {
      await client.query("SELECT 1 AS ok");
    } finally {
      client.release();
    }
    return NextResponse.json({
      ok: true,
      provider: info.provider,
      mode: info.mode,
      host: info.host,
      port: info.port,
      userShape: info.user.includes(".") ? "project-ref" : info.user || "empty",
    });
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { code?: string };
    return NextResponse.json(
      {
        ok: false,
        provider: info.provider,
        mode: info.mode,
        host: info.host,
        port: info.port,
        userShape: info.user.includes(".") ? "project-ref" : info.user || "empty",
        error: err.code ?? err.name ?? "connect_failed",
        message: typeof err.message === "string" ? err.message.slice(0, 160) : "connect_failed",
      },
      { status: 500 },
    );
  }
}
