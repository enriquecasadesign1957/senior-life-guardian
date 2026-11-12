import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { ApiError, logError } from "./errors";

export function jsonError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Revisa los datos e inténtalo de nuevo." } },
      { status: 400 },
    );
  }
  const err = error instanceof Error ? error : undefined;
  const pg = error as { code?: string; severity?: string } | undefined;
  logError("unhandled", {
    name: err?.name ?? "unknown",
    message: err?.message?.slice(0, 200) ?? "unknown",
    code: typeof pg?.code === "string" ? pg.code : undefined,
  });
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "No pudimos completar eso." } },
    { status: 500 },
  );
}
