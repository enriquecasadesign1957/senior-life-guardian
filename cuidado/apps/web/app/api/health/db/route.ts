import { sql } from "drizzle-orm";
import { describeDatabaseUrl, getDb, getPool } from "@cuidado/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Smoke de conectividad Postgres sin filtrar secretos.
 * GET /api/health/db → { ok, provider, mode, host, port, lockOk }
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

  const base = {
    provider: info.provider,
    mode: info.mode,
    host: info.host,
    port: info.port,
    userShape: info.user.includes(".") ? "project-ref" : info.user || "empty",
  };

  try {
    const client = await getPool().connect();
    try {
      await client.query("SELECT 1 AS ok");
    } finally {
      client.release();
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { code?: string };
    return NextResponse.json(
      {
        ok: false,
        ...base,
        error: err.code ?? err.name ?? "connect_failed",
        message: typeof err.message === "string" ? err.message.slice(0, 160) : "connect_failed",
      },
      { status: 500 },
    );
  }

  try {
    await getDb().transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${42})`);
      await tx.execute(sql`SELECT 1`);
    });
    return NextResponse.json({ ok: true, ...base, lockOk: true });
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { code?: string };
    return NextResponse.json(
      {
        ok: false,
        ...base,
        lockOk: false,
        error: err.code ?? err.name ?? "lock_failed",
        message: typeof err.message === "string" ? err.message.slice(0, 160) : "lock_failed",
      },
      { status: 500 },
    );
  }
}
