import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy: onboarding movido a /app y /instalar-app. */
export const Route = createFileRoute("/activacion")({
  beforeLoad: () => {
    throw redirect({ to: "/app", search: { entrenamiento: "1" } });
  },
  head: () => ({
    meta: [{ title: "Redirigiendo — Senior Safe" }],
  }),
  component: () => null,
});
