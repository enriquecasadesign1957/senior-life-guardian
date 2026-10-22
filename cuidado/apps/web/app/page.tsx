import { HomeForm } from "@/components/home-form";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Mira cómo está tu página</h1>
        <p className="text-stone-600">
          Pega la dirección. Te decimos, en castellano, qué la pone lenta. Si es WordPress, puedes conectar el sitio con un código.
        </p>
      </div>
      <HomeForm />
    </div>
  );
}
