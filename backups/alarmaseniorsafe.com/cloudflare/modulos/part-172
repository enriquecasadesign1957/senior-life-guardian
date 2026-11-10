import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { m as Route$S, n as logTransbankTestToken } from "./router-FK5WbXyp.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { S as SiteHeader, a as SiteFooter } from "./site-layout-BSSgEBzk.mjs";
import { c as createSsrRpc } from "./createSsrRpc-14pD3De2.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { p as periodoSchema, a as planKeySchema } from "./plans-BJeLFmLc.mjs";
import { o as objectType, s as stringType, e as enumType } from "../_libs/zod.mjs";
import { p as persistSignupHandoff, a as markRequiresPwaInstall } from "./post-payment-BtVMraP6.mjs";
import { P as PostPaymentInstallScreen } from "./post-payment-install-screen-CIuEh8WZ.mjs";
import "./index.mjs";

import "../_libs/sonner.mjs";


import { L as LoaderCircle, ac as CircleX, b as MessageCircle } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "./maps-BhXedqc-.mjs";
import "./transbank-oneclick-mall-CC5wwzFZ.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




import "./ack-alert-hZc0eMx8.mjs";
import "./client.server-U_pH-Evd.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "./twilio-DNHuHEFY.mjs";
import "./zoho-smtp-lj0bCuK6.mjs";
import "./install-step-sync-65QKjQIB.mjs";
import "./signups-db-JWUtXpaW.mjs";
import "./twilio-inbound-_C02bj0d.mjs";
import "./account-lookup-CBKDZ0Aw.mjs";
import "./contacts-storage-DdsYD-uQ.mjs";
import "./phone-utils-D7EH6fht.mjs";
import "./senior-access-auth-Bmk7iyGS.mjs";
import "./discount-codes-BbIma2Cq.mjs";
import "./discount.functions-CbzrjeJP.mjs";
import "./whatsapp-inbox-CZiWC44X.mjs";
import "./admin-auth-5OIH6Qjw.mjs";
import "./post-payment-install-notify-6plkg_BS.mjs";
import "./transactional-email-html-C_kx3NhX.mjs";
import "./emergency-cascade-continuation-BhQV3eMZ.mjs";
import "./pin-reset-B5nhyHPX.mjs";
import "./subscription-renewal-CVyJ9Wsj.mjs";
import "./oneclick-renewal-charge-XKyXWH2D.mjs";
import "../_libs/react-email__render.mjs";
import "../_libs/prettier.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__heading.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/react-email__button.mjs";
import "../_libs/react-email__link.mjs";
import "../_libs/react-email__hr.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "./demo-config-D1XL_8ap.mjs";
import "./button-BC9oXVxV.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
import "./device-Dq_ZTBb-.mjs";
import "./whatsapp-activar-cta-CjTD6kty.mjs";
import "./install-notify-banner-CdM3Di4q.mjs";
createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  signupId: stringType().uuid(),
  plan: planKeySchema,
  periodo: periodoSchema
}).parse(input)).handler(createSsrRpc("dd46ac90a05be68c498e3572c702ea9c0bd77cc517a307b88b22786e8f5b4891"));
const confirmWebpayTransaction = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  token: stringType().min(8).max(128)
}).parse(input)).handler(createSsrRpc("30b4e1248a8269f53655ec205add83efa511f6c0264e59a0d741975db00cd817"));
const mockApproveWebpay = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  signupId: stringType().uuid().optional(),
  token: stringType().min(4).max(128).optional()
}).parse(input)).handler(createSsrRpc("3d83c7437c1ae898c4413cae576a77123c8756291e4eb33d1700f77b23f26cb5"));
createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  signupId: stringType().uuid(),
  periodo: enumType(["mensual", "anual"]),
  authorizationCode: stringType().max(64).optional()
}).parse(input)).handler(createSsrRpc("b3bd8a8169294987fd3f3dd9e5528b7d6d11ebfdeba8937c444f9613d6a27cf5"));
createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  signupId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("2220038786157b3a399966ebefb2c64d16c76a2ce1601e8a35bd4573f9d67886"));
const DEEP = "var(--brand-petrol-deep)";
function WebpayReturnPage() {
  const search = Route$S.useSearch();
  const confirm = useServerFn(confirmWebpayTransaction);
  const [state, setState] = reactExports.useState("loading");
  const [info, setInfo] = reactExports.useState({});
  const [mockBusy, setMockBusy] = reactExports.useState(false);
  const [signupId, setSignupId] = reactExports.useState(null);
  const [installNotify, setInstallNotify] = reactExports.useState(null);
  useServerFn(mockApproveWebpay);
  const readSignupId = () => {
    try {
      const raw = sessionStorage.getItem("seniorsafe_user");
      if (!raw) return null;
      return JSON.parse(raw)?.id ?? null;
    } catch {
      return null;
    }
  };
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!search.token_ws && search.TBK_TOKEN) {
        if (!cancelled) setState("cancelled");
        return;
      }
      if (!search.token_ws) {
        if (!cancelled) setState("failed");
        return;
      }
      logTransbankTestToken(search.token_ws);
      try {
        const r = await confirm({
          data: {
            token: search.token_ws
          }
        });
        if (cancelled) return;
        if (r.ok) {
          setInfo({
            amount: r.amount,
            authorizationCode: r.authorizationCode,
            buyOrder: r.buyOrder,
            cardLast4: r.cardLast4
          });
          const resolvedId = r.signupId ?? readSignupId();
          if (resolvedId) {
            persistSignupHandoff(resolvedId, {
              purchase_mode: "contratar",
              subscription_status: "active"
            });
          } else {
            try {
              const raw = sessionStorage.getItem("seniorsafe_user");
              if (raw) {
                const u = JSON.parse(raw);
                sessionStorage.setItem("seniorsafe_user", JSON.stringify({
                  ...u,
                  purchase_mode: "contratar",
                  subscription_status: "active"
                }));
              }
            } catch {
            }
          }
          setSignupId(resolvedId);
          setInstallNotify(r.installNotify ?? null);
          markRequiresPwaInstall();
          setState("success");
        } else {
          setState("failed");
        }
      } catch (e) {
        console.error("[webpay/retorno] confirm error", e);
        if (!cancelled) setState("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search.token_ws, search.TBK_TOKEN, confirm]);
  if (state === "success") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PostPaymentInstallScreen, { paymentSummary: info, signupId, showPaymentSuccess: true, trackConversion: true, installNotify });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1", style: {
      background: "var(--gradient-soft)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-xl mx-auto px-6 py-16 md:py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm text-center", children: [
      state === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-12 h-12 mx-auto animate-spin", style: {
          color: DEEP
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-6 text-2xl font-bold text-foreground", children: "Confirmando tu pago…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "No cierres ni recargues esta ventana." })
      ] }),
      (state === "failed" || state === "cancelled") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full flex items-center justify-center", style: {
          background: "color-mix(in oklab, #dc2626 12%, white)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-10 h-10 text-destructive" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-6 text-3xl font-bold text-foreground", children: state === "cancelled" ? "Pago cancelado" : "No se pudo procesar el pago" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: state === "cancelled" ? "No se realizó ningún cargo. Puedes intentarlo nuevamente." : "Tu tarjeta no fue cobrada. Inténtalo otra vez o contáctanos por WhatsApp." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-7 grid sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/checkout", search: {
            mode: "contratar"
          }, className: "inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-white font-bold shadow-xl", style: {
            background: DEEP
          }, children: "Reintentar pago" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://wa.me/56971404580?text=Hola%20Senior%20Safe%2C%20tuve%20un%20problema%20con%20mi%20pago", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-card border-2 border-border font-bold text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-5 h-5", style: {
              color: "#25D366"
            } }),
            " WhatsApp"
          ] })
        ] }),
        false
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
  ] });
}
export {
  WebpayReturnPage as component
};
