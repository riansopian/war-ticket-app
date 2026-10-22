import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "destructive";

const toneClass: Record<Tone, string> = {
  default: "bg-header text-header-foreground",
  success: "bg-success text-success-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

interface ScreenHeaderProps {
  icon?: ReactNode;
  title: ReactNode;
  /** Konten sisi kanan (mis. nama event, timer, tombol login). */
  right?: ReactNode;
  tone?: Tone;
}

/** Header bar gelap pada tiap layar (wireframe §9). */
export function ScreenHeader({
  icon,
  title,
  right,
  tone = "default",
}: ScreenHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-3 px-5 py-4 text-sm font-semibold",
        toneClass[tone],
      )}
    >
      <h1 className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h1>
      {right ? <div className="text-sm font-medium">{right}</div> : null}
    </header>
  );
}

interface ScreenCardProps {
  header: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Kontainer layar: header + body. Dipakai semua halaman agar tampilan konsisten. */
export function ScreenCard({
  header,
  children,
  className,
  bodyClassName,
}: ScreenCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border-2 border-header/90 bg-card shadow-xl shadow-slate-900/5",
        className,
      )}
    >
      {header}
      <div className={cn("space-y-4 p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
