"use client";

import { isAllowedCheckoutUrl } from "@/lib/rescue";

export type CheckoutStartBody = {
  url?: string;
  siteId?: string;
  provider?: "lemon" | "transbank_webpay" | "transbank_oneclick";
  token?: string;
  error?: { message?: string };
};

/** Abre Lemon (GET) o Transbank (POST form). */
export function followCheckout(body: CheckoutStartBody): boolean {
  if (body.provider === "transbank_webpay" && body.token && body.url) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = body.url;
    form.style.display = "none";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "token_ws";
    input.value = body.token;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    return true;
  }
  if (body.provider === "transbank_oneclick" && body.token && body.url) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = body.url;
    form.style.display = "none";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "TBK_TOKEN";
    input.value = body.token;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    return true;
  }
  if (typeof body.url === "string" && isAllowedCheckoutUrl(body.url)) {
    window.location.assign(body.url);
    return true;
  }
  return false;
}
