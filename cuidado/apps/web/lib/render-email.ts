import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DiagnosisEmail, type DiagnosisEmailProps } from "@/components/email-template";

export function renderDiagnosisEmail(props: DiagnosisEmailProps): string {
  const body = renderToStaticMarkup(createElement(DiagnosisEmail, props));
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Informe de tu sitio</title></head><body style="margin:0;background:#f6f3ee;">${body}</body></html>`;
}
