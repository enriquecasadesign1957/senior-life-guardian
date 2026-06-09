import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, MessageCircle, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  inboxListMessages,
  inboxListThreads,
  inboxSendReply,
} from "@/lib/whatsapp-inbox.functions";
import type { InboxMessage, InboxThread } from "@/lib/whatsapp-inbox";

const PIN_KEY = "seniorsafe_inbox_pin";

export const Route = createFileRoute("/admin/inbox")({
  component: AdminInboxPage,
  head: () => ({ meta: [{ title: "Bandeja WhatsApp — Senior Safe" }] }),
});

function formatPhone(p: string): string {
  const d = p.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("569")) {
    return `+56 9 ${d.slice(3, 7)} ${d.slice(7)}`;
  }
  return p.startsWith("+") ? p : `+${d}`;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function AdminInboxPage() {
  const listThreads = useServerFn(inboxListThreads);
  const listMessages = useServerFn(inboxListMessages);
  const sendReply = useServerFn(inboxSendReply);

  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PIN_KEY);
      if (saved) {
        setPin(saved);
        setUnlocked(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const refreshThreads = useCallback(async () => {
    if (!pin) return;
    setLoading(true);
    try {
      const res = await listThreads({ data: { pin, inbox: "commercial" } });
      setThreads(res as InboxThread[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cargar la bandeja.");
      setUnlocked(false);
      try {
        sessionStorage.removeItem(PIN_KEY);
      } catch {
        /* ignore */
      }
    } finally {
      setLoading(false);
    }
  }, [listThreads, pin]);

  const refreshMessages = useCallback(async () => {
    if (!pin || !selected) return;
    try {
      const res = await listMessages({
        data: { pin, peerPhone: selected, inbox: "commercial" },
      });
      setMessages(res as InboxMessage[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cargar el chat.");
    }
  }, [listMessages, pin, selected]);

  useEffect(() => {
    if (!unlocked || !pin) return;
    void refreshThreads();
    const t = setInterval(() => {
      void refreshThreads();
      if (selected) void refreshMessages();
    }, 20_000);
    return () => clearInterval(t);
  }, [unlocked, pin, selected, refreshThreads, refreshMessages]);

  useEffect(() => {
    if (selected) void refreshMessages();
  }, [selected, refreshMessages]);

  const handleUnlock = async () => {
    if (pin.length < 4) {
      toast.error("Ingresa el PIN de administrador.");
      return;
    }
    setLoading(true);
    try {
      await listThreads({ data: { pin, inbox: "commercial" } });
      try {
        sessionStorage.setItem(PIN_KEY, pin);
      } catch {
        /* ignore */
      }
      setUnlocked(true);
      await refreshThreads();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PIN incorrecto.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selected || !draft.trim()) return;
    setSending(true);
    try {
      await sendReply({
        data: { pin, peerPhone: selected, body: draft.trim(), inbox: "commercial" },
      });
      setDraft("");
      await refreshMessages();
      await refreshThreads();
      toast.success("Mensaje enviado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo enviar.");
    } finally {
      setSending(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-[#f0f7f9]">
        <div className="w-full max-w-sm bg-white rounded-3xl border p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-2xl bg-[#0d4f5c] text-white flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-foreground">Bandeja WhatsApp</h1>
              <p className="text-sm text-muted-foreground">Número comercial · solo admin</p>
            </div>
          </div>
          <label className="text-sm font-semibold text-foreground">PIN de acceso</label>
          <Input
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            className="mt-2 h-12 text-lg"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleUnlock();
            }}
            placeholder="••••"
          />
          <Button
            className="w-full mt-4 h-12 font-bold"
            style={{ background: "#16a34a" }}
            disabled={loading}
            onClick={() => void handleUnlock()}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
          </Button>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            No uses la app WhatsApp en el número API. Lee y responde desde aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background max-w-lg mx-auto w-full">
      <header className="sticky top-0 z-10 bg-[#0d4f5c] text-white px-4 py-3 flex items-center gap-3">
        {selected ? (
          <button
            type="button"
            className="p-2 -ml-2 rounded-xl hover:bg-white/10"
            onClick={() => setSelected(null)}
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <MessageCircle className="w-6 h-6 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold truncate">
            {selected ? formatPhone(selected) : "WhatsApp comercial"}
          </h1>
          <p className="text-xs text-white/80 truncate">
            {selected ? "Responde cuando quieras · la IA también atiende consultas" : "+56 9 7140 4580"}
          </p>
        </div>
        <button
          type="button"
          className="p-2 rounded-xl hover:bg-white/10"
          onClick={() => {
            void refreshThreads();
            if (selected) void refreshMessages();
          }}
          aria-label="Actualizar"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      {!selected ? (
        <main className="flex-1 overflow-y-auto">
          {threads.length === 0 && !loading && (
            <p className="p-6 text-center text-muted-foreground text-sm">
              Aún no hay mensajes guardados. Cuando alguien escriba al WhatsApp comercial, aparecerán aquí.
            </p>
          )}
          <ul>
            {threads.map((t) => (
              <li key={t.peer_phone}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-4 border-b hover:bg-muted/40 flex gap-3"
                  onClick={() => setSelected(t.peer_phone)}
                >
                  <span className="w-11 h-11 rounded-full bg-[#0d4f5c]/10 text-[#0d4f5c] flex items-center justify-center font-bold shrink-0">
                    {t.peer_phone.replace(/\D/g, "").slice(-2)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-bold block truncate">{formatPhone(t.peer_phone)}</span>
                    <span className="text-sm text-muted-foreground block truncate">{t.last_body}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(t.last_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        </main>
      ) : (
        <>
          <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#eef4f9]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  m.direction === "outbound"
                    ? "ml-auto bg-[#dcf8c6] text-foreground"
                    : "mr-auto bg-white text-foreground border"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1 text-right">
                  {formatTime(m.created_at)}
                </p>
              </div>
            ))}
          </main>
          <footer className="sticky bottom-0 border-t bg-white p-3 flex gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Input
              className="flex-1 h-12"
              placeholder="Escribe tu respuesta…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
            />
            <Button
              className="h-12 w-12 shrink-0"
              style={{ background: "#16a34a" }}
              disabled={sending || !draft.trim()}
              onClick={() => void handleSend()}
              aria-label="Enviar"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </footer>
        </>
      )}

      <div className="px-4 py-2 text-center border-t">
        <Link to="/admin/reset" className="text-xs text-muted-foreground underline">
          Admin
        </Link>
      </div>
    </div>
  );
}
