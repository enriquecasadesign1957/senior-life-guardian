import type { ReactNode } from "react";

type DemoPhoneFrameProps = {
  children: ReactNode;
  accent?: string;
  className?: string;
  /** Contenido de borde a borde (mapas, chat). */
  flush?: boolean;
};

export function DemoPhoneFrame({
  children,
  accent = "var(--brand-petrol)",
  className = "",
  flush = false,
}: DemoPhoneFrameProps) {
  return (
    <div className={`relative mx-auto w-full max-w-[280px] aspect-[9/18] ${className}`}>
      <div className="absolute inset-0 rounded-[42px] shadow-2xl border-[10px] border-foreground bg-background overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground rounded-b-2xl z-20" />
        <div
          className={`absolute inset-0 z-10 ${flush ? "" : "flex items-center justify-center p-5 pt-8"}`}
          style={
            flush
              ? { background: "#f8fafc" }
              : {
                  background: `linear-gradient(160deg, color-mix(in oklab, ${accent} 14%, white), white 70%)`,
                }
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
