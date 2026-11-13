"use client";

import { useEffect, useState } from "react";
import {
  formatClp,
  MARKET_COOKIE,
  PLAN_CLP_DEFAULT,
  RESCATE_CLP_DEFAULT,
  type PayMarket,
} from "@/lib/market";

function readCookie(): PayMarket {
  if (typeof document === "undefined") return "intl";
  const match = document.cookie.match(/(?:^|;\s*)cw_market=(cl|intl)(?:;|$)/i);
  return match?.[1]?.toLowerCase() === "cl" ? "cl" : "intl";
}

function writeCookie(market: PayMarket) {
  document.cookie = `${MARKET_COOKIE}=${market}; path=/; max-age=31536000; samesite=lax`;
}

export function PayMarketToggle({ className = "" }: { className?: string }) {
  const [market, setMarket] = useState<PayMarket>("intl");

  useEffect(() => {
    setMarket(readCookie());
  }, []);

  function choose(next: PayMarket) {
    writeCookie(next);
    setMarket(next);
  }

  return (
    <div className={`rounded-2xl border border-stone-200 bg-paper p-4 ${className}`}>
      <p className="text-sm font-medium text-ink">¿Cómo quieres pagar?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose("cl")}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            market === "cl" ? "bg-pine text-white" : "border border-stone-300 bg-white"
          }`}
        >
          Chile · Transbank
        </button>
        <button
          type="button"
          onClick={() => choose("intl")}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            market === "intl" ? "bg-pine text-white" : "border border-stone-300 bg-white"
          }`}
        >
          Internacional · Lemon
        </button>
      </div>
      <div className="mt-3 space-y-1 text-xs leading-5">
        <p className={market === "cl" ? "font-medium text-ink" : "text-stone-500"}>
          Chile · Transbank: Rescate {formatClp(RESCATE_CLP_DEFAULT)} · Plan {formatClp(PLAN_CLP_DEFAULT)}/mes (Webpay /
          Oneclick).
        </p>
        <p className={market === "intl" ? "font-medium text-ink" : "text-stone-500"}>
          Internacional · Lemon: Rescate $29 USD · Plan $19 USD/mes (Lemon Squeezy).
        </p>
      </div>
    </div>
  );
}

export function currentPayMarket(): PayMarket {
  return readCookie();
}
