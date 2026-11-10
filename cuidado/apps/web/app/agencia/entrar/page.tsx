import { AgencyAuthForm } from "@/components/agency-auth-form";

export const dynamic = "force-dynamic";

export default function AgenciaEntrarPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <AgencyAuthForm />
      <p className="mt-6 text-sm text-stone-600">
        Si todavía no activaste la prueba, después de crear la cuenta ve a{" "}
        <a href="/#agencias" className="text-pine underline underline-offset-4">
          Agencias
        </a>{" "}
        con tu código de un solo uso.
      </p>
    </div>
  );
}
