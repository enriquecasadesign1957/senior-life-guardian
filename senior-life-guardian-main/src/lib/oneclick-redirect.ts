/**
 * Redirección a inscripción Oneclick Mall (POST con TBK_TOKEN).
 */
export function redirectToOneclickInscription(token: string, url: string): void {
  if (typeof document === "undefined") {
    throw new Error("redirectToOneclickInscription solo puede ejecutarse en el navegador");
  }
  if (!token?.trim() || !url?.trim()) {
    throw new Error("Faltan token o URL de Oneclick");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.style.display = "none";

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "TBK_TOKEN";
  input.value = token;
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
}
