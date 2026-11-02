"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { CleanupPanel } from "@/components/cleanup-panel";
import { UndoBanner } from "@/components/undo-banner";

type UndoState = {
  batchId: string | null;
  undoUntil: string | null;
};

const CleanupUndoContext = createContext<{
  undo: UndoState;
  setUndo: (next: UndoState) => void;
} | null>(null);

export function CleanupUndoProvider({
  children,
  initialBatchId,
  initialUndoUntil,
}: {
  children: ReactNode;
  initialBatchId: string | null;
  initialUndoUntil: string | null;
}) {
  const [undo, setUndo] = useState<UndoState>({
    batchId: initialBatchId,
    undoUntil: initialUndoUntil,
  });
  return (
    <CleanupUndoContext.Provider value={{ undo, setUndo }}>{children}</CleanupUndoContext.Provider>
  );
}

function useCleanupUndo() {
  const ctx = useContext(CleanupUndoContext);
  if (!ctx) {
    throw new Error("CleanupUndoProvider requerido");
  }
  return ctx;
}

export function ConnectedUndoBanner({ siteId }: { siteId: string | null }) {
  const { undo } = useCleanupUndo();
  return <UndoBanner siteId={siteId} batchId={undo.batchId} undoUntil={undo.undoUntil} />;
}

export function ConnectedCleanupPanel({ siteId }: { siteId: string | null }) {
  const { setUndo } = useCleanupUndo();
  return (
    <CleanupPanel
      siteId={siteId}
      onApplied={({ batchId, undoUntil }) => setUndo({ batchId, undoUntil })}
    />
  );
}
