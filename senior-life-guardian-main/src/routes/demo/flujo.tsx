import { createFileRoute } from "@tanstack/react-router";
import { SosFlowScreensPage } from "@/components/demo/sos-flow-screens-page";

export const Route = createFileRoute("/demo/flujo")({
  component: DemoFlujoPage,
});

function DemoFlujoPage() {
  return <SosFlowScreensPage />;
}
