import { AdminCodesPanel } from "@/components/admin-codes-panel";
import { isAdminAuthenticated } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminCodigosPage() {
  const authed = await isAdminAuthenticated();
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:py-12">
      <AdminCodesPanel initiallyAuthed={authed} />
    </div>
  );
}
