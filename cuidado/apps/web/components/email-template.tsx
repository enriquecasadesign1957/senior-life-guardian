import React from "react";
import { formatCount } from "@/lib/explain";

export type DiagnosisEmailProps = {
  name?: string | null;
  siteUrl: string;
  reportUrl: string;
  performanceScore: number | null;
  revisions?: number | null;
  securityPatches?: number | null;
};

const ink = "#1c1917";
const pine = "#1f6b45";
const paper = "#f6f3ee";
const muted = "#57534e";

export function DiagnosisEmail({
  name,
  siteUrl,
  reportUrl,
  performanceScore,
  revisions,
  securityPatches,
}: DiagnosisEmailProps) {
  const greeting = cleanName(name);
  const score = scoreOrNull(performanceScore);
  const copies = positiveCount(revisions);
  const patches = positiveCount(securityPatches);
  const href = safeHttpUrl(reportUrl);

  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: paper }}>
      <tbody>
        <tr>
          <td align="center" style={{ padding: "24px 16px" }}>
            <table role="presentation" width="580" cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "580px" }}>
              <tbody>
                <tr>
                  <td style={{ fontFamily: "Georgia, serif", fontSize: "28px", lineHeight: "1.25", color: ink }}>
                    {greeting ? `Hola, ${greeting}.` : "Hola."}
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingTop: "16px", fontFamily: "system-ui, sans-serif", fontSize: "16px", lineHeight: "1.6", color: "#44403c" }}>
                    Ya medimos <strong>{siteUrl}</strong>. El informe está en castellano, para que veas cómo está tu página sin tecnicismos.
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingTop: "24px" }}>
                    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#ffffff", borderLeft: `4px solid ${pine}` }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: "16px 18px", fontFamily: "system-ui, sans-serif" }}>
                            <p style={{ margin: "0 0 10px", fontFamily: "Georgia, serif", fontSize: "18px", color: ink }}>
                              Resumen en el celular
                            </p>
                            <ul style={{ margin: 0, paddingLeft: "18px", color: muted, lineHeight: "1.6" }}>
                              <li>
                                Puntaje móvil:{" "}
                                <strong style={{ color: ink }}>{score === null ? "sin medición esta vez" : `${score} de 100`}</strong>
                              </li>
                              {copies === null ? null : (
                                <li>
                                  Copias viejas de tus páginas: <strong style={{ color: ink }}>{formatCount(copies)}</strong>
                                </li>
                              )}
                              {patches === null ? null : (
                                <li>
                                  Parches de seguridad pendientes: <strong style={{ color: ink }}>{formatCount(patches)}</strong>
                                </li>
                              )}
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingTop: "24px", fontFamily: "system-ui, sans-serif", fontSize: "15px", lineHeight: "1.6", color: "#44403c" }}>
                    <strong>Regla de oro:</strong> no reescribimos functions.php ni el resto del código, y no editamos el tema. Si un cambio no se puede deshacer de forma segura, no lo automatizamos. La limpieza se puede restaurar durante 7 días.
                  </td>
                </tr>
                {href ? (
                  <tr>
                    <td align="center" style={{ paddingTop: "28px" }}>
                      <a
                        href={href}
                        style={{
                          display: "inline-block",
                          backgroundColor: pine,
                          color: "#ffffff",
                          fontFamily: "system-ui, sans-serif",
                          fontSize: "15px",
                          fontWeight: 600,
                          textDecoration: "none",
                          padding: "12px 22px",
                          borderRadius: "999px",
                        }}
                      >
                        Ver el informe
                      </a>
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td style={{ paddingTop: "28px", borderTop: "1px solid #e7e5e4", fontFamily: "system-ui, sans-serif", fontSize: "12px", lineHeight: "1.5", color: "#a8a29e", textAlign: "center" }}>
                    CuidadoWeb — Tu WordPress limpio, vigilado y protegido.
                    <br />
                    Este mensaje es el análisis que pediste. No lo repetimos solos.
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function cleanName(value: string | null | undefined): string | null {
  if (!value) return null;
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
  if (!clean) return null;
  return clean.slice(0, 80);
}

function scoreOrNull(value: number | null): number | null {
  if (value === null || !Number.isInteger(value) || value < 0 || value > 100) return null;
  return value;
}

function positiveCount(value: number | null | undefined): number | null {
  if (value == null || !Number.isInteger(value) || value <= 0) return null;
  return value;
}

export function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
