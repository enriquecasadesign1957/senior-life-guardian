"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Download,
  Loader2,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import {
  ONCALL_MAX_MEMBERS,
  parseOncallCsv,
  type OncallDraft,
} from "@/lib/oncallCsv";

export type OncallMember = {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  orden_escalamiento: number;
  activo: boolean;
};

type Props = {
  userId: string;
  supabase: SupabaseClient;
  initialMembers: OncallMember[];
  onMembersChange?: (rows: OncallMember[]) => void;
};

export function OncallMembersPanel({
  userId,
  supabase,
  initialMembers,
  onMembersChange,
}: Props) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(initialMembers);
  const [drafts, setDrafts] = useState<OncallDraft[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const validCount = drafts?.filter((r) => r.ok).length ?? 0;
  const invalidCount = (drafts?.length ?? 0) - validCount;

  const ingestFile = useCallback(async (file: File) => {
    setMsg(null);
    setOkMsg(false);
    const lower = file.name.toLowerCase();
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
      setDrafts(null);
      setFileName(file.name);
      setWarning(t("excelWarning"));
      return;
    }
    const text = await file.text();
    const parsed = parseOncallCsv(text);
    setFileName(file.name);
    setDrafts(parsed.rows);
    setWarning(parsed.warning);
  }, [t]);

  async function saveMembers() {
    if (!drafts) return;
    const payload = drafts
      .filter((r) => r.ok)
      .map((r) => ({
        nombre: r.nombre,
        telefono: r.telefono,
        email: r.email || null,
        orden: r.orden,
        activo: true,
      }));
    if (payload.length < 1) {
      setOkMsg(false);
      setMsg(t("noValidRows"));
      return;
    }
    setBusy(true);
    setMsg(null);
    const { data, error } = await supabase.rpc("guardar_miembros_oncall", {
      p_miembros: payload,
    });
    setBusy(false);
    if (error) {
      setOkMsg(false);
      setMsg(
        error.message.includes("schema cache")
          ? t("missingMembersMigration")
          : error.message
      );
      return;
    }
    const { data: rows } = await supabase
      .from("oncall_miembros")
      .select("id, nombre, telefono, email, orden_escalamiento, activo")
      .eq("usuario_id", userId)
      .order("orden_escalamiento", { ascending: true });
    const next = (rows as OncallMember[]) ?? [];
    setSaved(next);
    onMembersChange?.(next);
    setDrafts(null);
    setFileName(null);
    setWarning(null);
    setOkMsg(true);
    setMsg(
      t("membersSaved", {
        n: typeof data === "number" ? data : payload.length,
      })
    );
  }

  async function removeSaved(id: string) {
    const { error } = await supabase
      .from("oncall_miembros")
      .delete()
      .eq("id", id)
      .eq("usuario_id", userId);
    if (error) {
      setOkMsg(false);
      setMsg(error.message);
      return;
    }
    setSaved((prev) => {
      const next = prev.filter((m) => m.id !== id);
      onMembersChange?.(next);
      return next;
    });
  }

  const sortedSaved = useMemo(
    () =>
      [...saved].sort(
        (a, b) => a.orden_escalamiento - b.orden_escalamiento
      ),
    [saved]
  );

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 lg:col-span-3">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Users className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">{t("oncallTeam")}</span>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-zinc-500">
            {t("oncallTeamHelp", { max: ONCALL_MAX_MEMBERS, orden: "orden" })}
          </p>
        </div>
        <a
          href="/ejemplo_oncall.csv"
          download="ejemplo_oncall.csv"
          className="inline-flex items-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
        >
          <Download className="h-4 w-4" />
          {t("downloadTemplate")}
        </a>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) void ingestFile(file);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 text-center transition",
          dragOver
            ? "border-accent bg-accent/10"
            : "border-zinc-700 bg-zinc-950/60 hover:border-zinc-500"
        )}
      >
        <Upload className="h-6 w-6 text-zinc-500" />
        <p className="mt-3 text-sm text-zinc-300">
          {t("dropCsv")}
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          {t("csvMembersFormat")}
        </p>
        <input
          type="file"
          accept=".csv,text/csv,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void ingestFile(file);
            e.target.value = "";
          }}
        />
      </label>

      {fileName ? (
        <p className="mt-3 font-mono text-xs text-zinc-500">{fileName}</p>
      ) : null}
      {warning ? (
        <p className="mt-2 text-xs text-amber-400">{warning}</p>
      ) : null}

      {drafts && drafts.length > 0 ? (
        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-zinc-300">
              {t("previewValid", { n: validCount })}
              {invalidCount > 0 ? (
                <span className="text-red-400">
                  {t("previewInvalid", { n: invalidCount })}
                </span>
              ) : null}
            </p>
            <button
              type="button"
              onClick={() => {
                setDrafts(null);
                setFileName(null);
                setWarning(null);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              {t("cancelImport")}
            </button>
          </div>
          <div className="overflow-x-auto rounded-md border border-zinc-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/80 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-3 py-2 font-medium">{t("order")}</th>
                  <th className="px-3 py-2 font-medium">{t("name")}</th>
                  <th className="px-3 py-2 font-medium">{t("phone")}</th>
                  <th className="px-3 py-2 font-medium">{t("email")}</th>
                  <th className="px-3 py-2 font-medium">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((row, idx) => (
                  <tr
                    key={`${row.telefono}-${idx}`}
                    className={cn(
                      "border-b border-zinc-800/60",
                      !row.ok && "bg-red-950/30"
                    )}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-zinc-400">
                      {row.orden}
                    </td>
                    <td className="px-3 py-2 text-zinc-200">{row.nombre || "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs text-zinc-300">
                      {row.telefono || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-400">
                      {row.email || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {row.ok ? (
                        <span className="text-accent">{t("ready")}</span>
                      ) : (
                        <span className="text-red-400">{row.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() => void saveMembers()}
            disabled={busy || validCount < 1}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("saveMembers")}
          </button>
        </div>
      ) : null}

      {msg ? (
        <p
          className={cn(
            "mt-3 text-xs",
            okMsg ? "text-accent" : "text-red-400"
          )}
        >
          {msg}
        </p>
      ) : null}

      <div className="mt-8 border-t border-zinc-800 pt-5">
        <p className="mb-3 text-sm font-medium text-zinc-300">
          {t("savedTeam", { n: sortedSaved.length })}
        </p>
        {sortedSaved.length === 0 ? (
          <p className="text-sm text-zinc-500">
            {t("noMembersYet")}
          </p>
        ) : (
          <ul className="divide-y divide-zinc-800/80">
            {sortedSaved.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm text-zinc-200">
                    <span className="mr-2 font-mono text-xs text-zinc-500">
                      #{m.orden_escalamiento}
                    </span>
                    {m.nombre}
                  </p>
                  <p className="font-mono text-xs text-zinc-500">
                    {m.telefono}
                    {m.email ? ` · ${m.email}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeSaved(m.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-zinc-800 px-2 py-1.5 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("remove")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
