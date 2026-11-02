import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy: mock de marketing. El portal real es /familia. */
export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/familia" });
  },
  head: () => ({
    meta: [{ title: "Portal Familia — Senior Safe" }],
  }),
  component: () => null,
});
