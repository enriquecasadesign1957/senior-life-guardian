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
  logError("unhandled", { name: error instanceof Error ? error.name : "unknown" });
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "No pudimos completar eso." } },
    { status: 500 },
  );
}
