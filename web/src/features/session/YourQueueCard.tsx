import { Button } from "@/components/ui/button";
import { DashedPanel } from "@/components/shared/DashedPanel";
import { useCountdown } from "@/hooks/useCountdown";
import type { ActiveSession } from "@/domain/types";
import { formatCountdown, formatNumber } from "@/lib/format";

const KIND_LABEL: Record<ActiveSession["kind"], string> = {
  WAITING: "Sedang mengantre",
  BOOKING: "Pilih tiket",
  PAYMENT: "Menunggu pembayaran",
};

function Detail({ session }: { session: ActiveSession }) {
  const { remainingMs } = useCountdown(session.expiresAt);
  if (session.kind === "WAITING") {
    return <>Posisi #{formatNumber(session.position ?? 0)}</>;
  }
  return <>Sisa waktu {formatCountdown(remainingMs)}</>;
}

interface YourQueueCardProps {
  session: ActiveSession;
  onContinue: (session: ActiveSession) => void;
}

/** Satu baris sesi aktif pada "Your Queue" (BRAINSTORM §3.2). */
export function YourQueueCard({ session, onContinue }: YourQueueCardProps) {
  return (
    <DashedPanel
      tone="highlight"
      className="flex items-center justify-between gap-3 py-3"
    >
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          {KIND_LABEL[session.kind]}
        </p>
        <p className="truncate font-bold">{session.eventName}</p>
        <p className="text-sm text-muted-foreground tabular-nums">
          <Detail session={session} />
        </p>
      </div>
      <Button size="sm" onClick={() => onContinue(session)}>
        Lanjutkan
      </Button>
    </DashedPanel>
  );
}
