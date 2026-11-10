import { createFileRoute } from "@tanstack/react-router";
import { EmergencySimulator } from "@/components/sales-demo/emergency-simulator";

export const Route = createFileRoute("/demo/flujo")({
  component: DemoFlujoPage,
});

function DemoFlujoPage() {
  return <EmergencySimulator embedded showIntro />;
}
