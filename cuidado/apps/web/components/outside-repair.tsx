const specialistMailto =
  "mailto:hola@cuidadoweb.com?subject=Problema%20grave%20en%20mi%20WordPress";

const cases = [
  "Posibles archivos infectados",
  "Hackeo",
  "Pantalla blanca",
  "El hosting suspendió la cuenta",
];

export function OutsideRepair() {
  return (
    <aside className="rounded-2xl border border-stone-200 bg-white px-5 py-5">
      <h2 className="text-base text-ink">Problemas graves</h2>
      <ul className="mt-3 space-y-1 text-sm text-stone-700">
        {cases.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-6 text-stone-700">
        En problemas graves de posibles archivos infectados, hackeo, pantalla blanca o un hosting suspendido, te derivamos con especialistas.
      </p>
      <a
        href={specialistMailto}
        className="mt-4 inline-block text-sm font-medium text-pine underline decoration-pine/40 underline-offset-4"
      >
        Pedir la derivación
      </a>
    </aside>
  );
}
