import { classifyProbe } from "@/lib/watch";

export function IncidentNotice({ status, streak }: { status: number | null; streak: number }) {
  const level = classifyProbe(status);
  if (level === "clear") return null;
  if (level === "warning") {
    return (
      <aside className="rounded-2xl bg-[#fbf3df] px-5 py-4 text-sm text-[#8a5a12]">
        <p className="font-medium">Aviso en el informe</p>
        <p className="mt-1">La página respondió que no existe (404). Queda marcado en amarillo. No llamamos por un 404.</p>
      </aside>
    );
  }
  return (
    <aside className="rounded-2xl bg-[#fde8e8] px-5 py-4 text-sm text-[#9f3a45]">
      <p className="font-medium">Incidente en el servidor</p>
      <p className="mt-1">
        {streak >= 2
          ? "Detectamos una interrupción. El aviso telefónico se reserva para este caso. WakeUp Dev todavía no está conectado, así que no se ha hecho ninguna llamada."
          : "Vimos un fallo de conexión o un error del servidor. Si se repite en la siguiente revisión, se prepara el aviso telefónico."}
      </p>
    </aside>
  );
}
