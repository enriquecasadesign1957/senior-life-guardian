"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import {
  normalizeCuponCode,
  PLAN_CHILE_CLP,
  PLAN_INTL_USD_CENTS,
  type CuponPlan,
  type CuponQuote,
} from "@/lib/planChile";

function emptyQuote(plan: CuponPlan): CuponQuote {
  return {
    valido: false,
    codigo: null,
    porcentaje: null,
    monto_clp: plan === "internacional" ? PLAN_INTL_USD_CENTS : PLAN_CHILE_CLP,
  };
}

export function useCuponQuote(
  code: string,
  plan: CuponPlan = "chile"
): {
  quote: CuponQuote;
  checking: boolean;
} {
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
  const [quote, setQuote] = useState<CuponQuote>(() => emptyQuote(plan));
  const [checking, setChecking] = useState(false);
  const base =
    plan === "internacional" ? PLAN_INTL_USD_CENTS : PLAN_CHILE_CLP;

  useEffect(() => {
    const normalized = normalizeCuponCode(code);
    if (!normalized) {
      setQuote(emptyQuote(plan));
      setChecking(false);
      return;
    }
    if (!supabase) {
      setQuote({ ...emptyQuote(plan), codigo: normalized });
      return;
    }

    let cancelled = false;
    setChecking(true);
    const timer = window.setTimeout(() => {
      void Promise.resolve(
        supabase.rpc("validar_cupon_oncall", {
          p_codigo: normalized,
          p_base_clp: base,
          p_plan: plan,
        })
      )
        .then(({ data }) => {
          if (cancelled) return;
          const row = Array.isArray(data) ? data[0] : data;
          const parsed: CuponQuote = {
            valido: Boolean(row?.valido),
            codigo:
              typeof row?.codigo === "string" ? row.codigo : normalized,
            porcentaje:
              typeof row?.porcentaje === "number" ? row.porcentaje : null,
            monto_clp:
              typeof row?.monto_clp === "number" ? row.monto_clp : base,
          };
          setQuote(parsed);
          setChecking(false);
        })
        .catch(() => {
          if (cancelled) return;
          setQuote({ ...emptyQuote(plan), codigo: normalized });
          setChecking(false);
        });
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [base, code, plan, supabase]);

  return { quote, checking };
}
