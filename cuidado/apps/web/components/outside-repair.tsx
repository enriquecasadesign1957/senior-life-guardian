const cases = [
  "Pantalla blanca",
  "Hackeo o páginas que no creaste",
  "Bucle de redirección",
  "Correos que no salen",
  "Un editor que no guarda",
  "El hosting suspendió la cuenta",
];

export function OutsideRepair() {
  return (
    <aside className="rounded-2xl border border-stone-200 bg-white px-5 py-5">
      <h2 className="text-base text-ink">Lo que este informe no repara</h2>
      <ul className="mt-3 space-y-1 text-sm text-stone-700">
        {cases.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-6 text-stone-700">
        CuidadoWeb no limpia un hackeo, no reinstala el sitio y no toca el tema ni functions.php. Si un técnico lo
        revisa, para ese caso sirven Wordfence, Sucuri y MalCare. No las instalamos ni las ejecutamos.
      </p>
    </aside>
  );
}
