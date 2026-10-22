const limits = [
  "No modificamos tu tema",
  "No alteramos functions.php",
  "No reescribimos el código con IA",
  "No actualizamos todos los plugins de golpe",
];

export function Reassurance() {
  return (
    <aside className="rounded-2xl bg-stone-100 px-5 py-5">
      <h2 className="text-base text-ink">Lo que no vamos a tocar</h2>
      <ul className="mt-3 space-y-2 text-sm text-stone-700">
        {limits.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}
