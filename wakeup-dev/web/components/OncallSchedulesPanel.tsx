"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarClock, Download, Loader2, Trash2, Upload } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import type { OncallMember } from "@/components/OncallMembersPanel";
import {
  flattenShifts,
  formatHora,
  ONCALL_MAX_SHIFTS,
  parseOncallTurnosCsv,
  type OncallShift,
  type OncallShiftDraft,
} from "@/lib/oncallTurnosCsv";
import { useLanguage } from "@/components/LanguageProvider";
import { dayLabel } from "@/lib/i18n";

export type { OncallShift };

type Props = {
  userId: string;
  supabase: SupabaseClient;
  members: OncallMember[];
  initialShifts: OncallShift[];
};

export function OncallSchedulesPanel({
  userId,
  supabase,
  members,
  initialShifts,
}: Props) {
  const { t, locale } = useLanguage();
  const [saved, setSaved] = useState(initialShifts);
  const [drafts, setDrafts] = useState<OncallShiftDraft[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const phones = useMemo(
    () => new Set(members.map((m) => m.telefono)),
    [members]
  );
  const validCount = drafts?.filter((r) => r.ok).length ?? 0;
  const invalidCount = (drafts?.length ?? 0) - validCount;

  const ingestFile = useCallback(
    async (file: File) => {
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
      const parsed = parseOncallTurnosCsv(text, phones);
      setFileName(file.name);
      setDrafts(parsed.rows);
      setWarning(
        members.length < 1 ? t("saveOncallFirst") : parsed.warning
      );
    },
    [members.length, phones, t]
  );

  async function reloadShifts() {
    const { data, error } = await supabase
      .from("oncall_turnos")
      .select(
        "id, dia_semana, hora_inicio, hora_fin, tz, activo, oncall_miembros ( nombre, telefono )"
      )
      .eq("usuario_id", userId)
      .order("dia_semana", { ascending: true })
      .order("hora_inicio", { ascending: true });
    if (error) return [];
    return flattenShifts(data);
  }

  async function saveShifts() {
    if (!drafts) return;
    const payload = drafts
      .filter((r) => r.ok)
      .map((r) => ({
        telefono: r.telefono,
        dia_semana: r.diaSemana,
        hora_inicio: r.horaInicio,
        hora_fin: r.horaFin,
        tz: r.tz,
      }));
    if (payload.length < 1) {
      setOkMsg(false);
      setMsg(t("noValidRows"));
      return;
    }
    setBusy(true);
    setMsg(null);
    const { data, error } = await supabase.rpc("guardar_turnos_oncall", {
      p_turnos: payload,
    });
    setBusy(false);
    if (error) {
      setOkMsg(false);
      const raw = error.message;
      setMsg(
        raw.includes("schema cache")
          ? t("missingShiftsMigration")
          : raw.includes("TELEFONO_NO_EN_EQUIPO")
            ? t("phonesNotInTeam")
            : raw
      );
      return;
    }
    setSaved(await reloadShifts());
    setDrafts(null);
    setFileName(null);
    setWarning(null);
    setOkMsg(true);
    setMsg(
      t("shiftsSaved", {
        n: typeof data === "number" ? data : payload.length,
      })
    );
  }

  async function removeSaved(id: string) {
    const { error } = await supabase
      .from("oncall_turnos")
      .delete()
      .eq("id", id)
      .eq("usuario_id", userId);
    if (error) {
      setOkMsg(false);
      setMsg(error.message);
      return;
    }
    setSaved((prev) => prev.filter((s) => s.id !== id));
  }

  const sortedSaved = useMemo(
    () =>
      [...saved].sort((a, b) => {
        if (a.dia_semana !== b.dia_semana) return a.dia_semana - b.dia_semana;
        return a.hora_inicio.localeCompare(b.hora_inicio);
      }),
    [saved]
  );

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 lg:col-span-3">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-zinc-400">
            <CalendarClock className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">{t("weeklyShifts")}</span>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-zinc-500">
            {t("weeklyShiftsHelp", { max: ONCALL_MAX_SHIFTS, dias: "dias" })}
          </p>
        </div>
        <a
          href="/ejemplo_oncall_turnos.csv"
          download="ejemplo_oncall_turnos.csv"
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
          {t("dropShiftsCsv")}
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          {t("csvShiftsFormat")}
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
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/80 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-3 py-2 font-medium">{t("day")}</th>
                  <th className="px-3 py-2 font-medium">{t("phone")}</th>
                  <th className="px-3 py-2 font-medium">{t("start")}</th>
                  <th className="px-3 py-2 font-medium">{t("end")}</th>
                  <th className="px-3 py-2 font-medium">{t("tz")}</th>
                  <th className="px-3 py-2 font-medium">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((row, idx) => (
                  <tr
                    key={`${row.telefono}-${row.diaSemana}-${idx}`}
                    className={cn(
                      "border-b border-zinc-800/60",
                      !row.ok && "bg-red-950/30"
                    )}
                  >
                    <td className="px-3 py-2 text-zinc-200">
                      {dayLabel(locale, row.diaSemana)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-zinc-300">
                      {row.telefono || "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-zinc-300">
                      {row.horaInicio || "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-zinc-300">
                      {row.horaFin || "—"}
                      {row.ok && row.horaFin < row.horaInicio ? (
                        <span className="ml-1 text-zinc-500">(+1)</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-400">{row.tz}</td>
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
            onClick={() => void saveShifts()}
            disabled={busy || validCount < 1}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("saveShifts")}
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
          {t("savedShifts", { n: sortedSaved.length })}
        </p>
        {sortedSaved.length === 0 ? (
          <p className="text-sm text-zinc-500">
            {t("noShiftsYet")}
          </p>
        ) : (
          <ul className="divide-y divide-zinc-800/80">
            {sortedSaved.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm text-zinc-200">
                    <span className="mr-2 font-mono text-xs text-zinc-500">
                      {dayLabel(locale, s.dia_semana)}
                    </span>
                    {s.nombre}
                  </p>
                  <p className="font-mono text-xs text-zinc-500">
                    {formatHora(s.hora_inicio)}–{formatHora(s.hora_fin)}
                    {s.hora_fin < s.hora_inicio ? " (+1)" : ""} · {s.tz} ·{" "}
                    {s.telefono}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeSaved(s.id)}
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
