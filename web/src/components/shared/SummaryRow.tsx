import { cn } from "@/lib/utils";

interface SummaryRowProps {
  label: string;
  value: string;
  emphasis?: boolean;
}

/** Baris "label ... nilai" untuk total/ringkasan. */
export function SummaryRow({ label, value, emphasis = true }: SummaryRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        emphasis ? "text-base font-bold" : "text-sm text-muted-foreground",
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
