import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface DashedPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** `highlight` = ungu (aktif/penting); `neutral` = abu (sekunder/nonaktif). */
  tone?: "highlight" | "neutral";
  interactive?: boolean;
}

/** Panel ber-border putus-putus, gaya khas wireframe. */
export function DashedPanel({
  tone = "neutral",
  interactive = false,
  className,
  ...props
}: DashedPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed p-4 transition-colors",
        tone === "highlight"
          ? "border-primary/70 bg-accent"
          : "border-slate-300 bg-slate-50",
        interactive && "cursor-pointer hover:border-primary",
        className,
      )}
      {...props}
    />
  );
}
