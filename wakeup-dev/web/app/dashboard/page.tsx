import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import { LanguageProvider } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabaseServer";
import type { OncallMember } from "@/components/OncallMembersPanel";
import { flattenShifts, type OncallShift } from "@/lib/oncallTurnosCsv";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const { billing } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?auth=required");
  }

  const [
    { data: usuario },
    { data: alertas },
    { data: keys },
    membersRes,
    shiftsRes,
  ] =
    await Promise.all([
      supabase
        .from("usuarios")
        .select("id, email, telefono_verificado, creditos_disponibles")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("oncall_alertas")
        .select(
          "id, estado, orden_actual, texto_original, texto_voz, creado_en"
        )
        .eq("usuario_id", user.id)
        .order("creado_en", { ascending: false })
        .limit(20),
      supabase
        .from("api_keys")
        .select("id")
        .eq("usuario_id", user.id)
        .eq("activa", true)
        .limit(1),
      supabase
        .from("oncall_miembros")
        .select("id, nombre, telefono, email, orden_escalamiento, activo")
        .eq("usuario_id", user.id)
        .order("orden_escalamiento", { ascending: true }),
      supabase
        .from("oncall_turnos")
        .select(
          "id, dia_semana, hora_inicio, hora_fin, tz, activo, oncall_miembros ( nombre, telefono )"
        )
        .eq("usuario_id", user.id)
        .order("dia_semana", { ascending: true })
        .order("hora_inicio", { ascending: true }),
    ]);
  const initialMembers = (membersRes.error ? [] : membersRes.data) as
    | OncallMember[]
    | null;
  const initialShifts: OncallShift[] = shiftsRes.error
    ? []
    : flattenShifts(shiftsRes.data);

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-30" />
      <LanguageProvider>
        <DashboardClient
          user={user}
          userId={user.id}
          initialUsuario={usuario}
          initialAlertas={alertas ?? []}
          hasApiKey={(keys?.length ?? 0) > 0}
          initialMembers={initialMembers ?? []}
          initialShifts={initialShifts}
          billingAlready={billing === "already"}
        />
      </LanguageProvider>
    </main>
  );
}
