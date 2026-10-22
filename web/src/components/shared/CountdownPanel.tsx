import { useCountdown } from "@/hooks/useCountdown";
import { formatCountdown } from "@/lib/format";
import { DashedPanel } from "./DashedPanel";

interface CountdownPanelProps {
  label: string;
  hint: string;
  /** Timestamp absolut dari server. */
  expiresAt: string | undefined;
  onExpire?: () => void;
}

/**
 * Panel countdown besar berwarna merah. Dipakai di Booking (5 mnt) dan
 * Payment (10 mnt) → satu komponen, dua konteks (DRY / OCP).
 */
export function CountdownPanel({
  label,
  hint,
  expiresAt,
  onExpire,
}: CountdownPanelProps) {
  const { remainingMs } = useCountdown(expiresAt, onExpire);
  return (
    <DashedPanel
      tone="highlight"
      className="space-y-1 py-5 text-center"
      role="timer"
      aria-live="off"
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-4xl font-extrabold tabular-nums text-destructive">
        {formatCountdown(remainingMs)}
      </p>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </DashedPanel>
  );
}
