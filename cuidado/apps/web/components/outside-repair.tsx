import { specialistAction, specialistDisclosure, specialistHref } from "@/lib/specialist-referral";

export function OutsideRepair() {
  return (
    <aside className="rounded-2xl border border-stone-200 bg-white px-5 py-5">
      <h2 className="text-base text-ink">Si el sitio está caído o suspendido</h2>
      <p className="mt-3 text-sm leading-6 text-stone-700">
        Si hay pantalla blanca, hackeo o el hosting suspendió la cuenta, CuidadoWeb no modifica los archivos PHP ni
        interviene el código infectado. Te derivamos con especialistas en desinfección manual.
      </p>
      <a
        href={specialistHref}
        className="mt-4 inline-block text-sm font-medium text-pine underline decoration-pine/40 underline-offset-4"
      >
        {specialistAction}
      </a>
      <p className="mt-2 text-xs leading-5 text-stone-500">{specialistDisclosure}</p>
    </aside>
  );
}
