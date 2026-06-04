import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { PostPaymentInstallScreen } from "@/components/post-payment-install-screen";
import { isPwaStandalone } from "@/lib/device";
import { APP_ENTRENAMIENTO_SEARCH, clearRequiresPwaInstall } from "@/lib/post-payment";

const searchSchema = z.object({
  entrenamiento: z.string().optional(),
  ss: z.string().uuid().optional(),
  pago: z.enum(["ok"]).optional(),
});

export const Route = createFileRoute("/instalar-app")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Instalar Senior Safe — Paso final" },
      { name: "description", content: "Instala la aplicación en tu teléfono tras confirmar el pago." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InstalarAppPage,
});

function InstalarAppPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPwaStandalone()) {
      clearRequiresPwaInstall();
      navigate({ to: "/app", search: APP_ENTRENAMIENTO_SEARCH });
    }
  }, [navigate]);

  return (
    <PostPaymentInstallScreen
      signupId={search.ss ?? null}
      showPaymentSuccess={search.pago === "ok"}
    />
  );
}
