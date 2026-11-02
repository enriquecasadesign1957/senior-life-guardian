/**
 * Redirección oficial a la pasarela Webpay Plus (POST con token_ws).
 * @see https://www.transbankdevelopers.cl/documentacion/webpay-plus
 */
export function redirectToWebpayPlus(token: string, url: string): void {
  if (typeof document === "undefined") {
    throw new Error("redirectToWebpayPlus solo puede ejecutarse en el navegador");
  }
  if (!token?.trim() || !url?.trim()) {
    throw new Error("Faltan token o URL de Webpay");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.style.display = "none";

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "token_ws";
  input.value = token;
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
}
