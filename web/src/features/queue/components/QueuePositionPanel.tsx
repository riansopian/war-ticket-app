import { DashedPanel } from "@/components/shared/DashedPanel";
import { formatNumber } from "@/lib/format";

/** Panel posisi antrian besar "#1.248" (FR-06). */
export function QueuePositionPanel({ position }: { position: number }) {
  return (
    <DashedPanel tone="highlight" className="space-y-1 py-6 text-center">
      <p className="text-sm text-muted-foreground">
        Posisi antrian Anda saat ini
      </p>
      <p
        className="text-5xl font-extrabold tabular-nums text-primary"
        aria-live="polite"
      >
        #{formatNumber(position)}
      </p>
      <p className="text-sm text-muted-foreground">dari depan antrian</p>
    </DashedPanel>
  );
}
