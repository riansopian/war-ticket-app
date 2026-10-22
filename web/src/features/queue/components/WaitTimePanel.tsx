import { DashedPanel } from "@/components/shared/DashedPanel";

/** 240 → "± 4 menit", 30 → "± 30 detik" (FR-09, COULD). */
export function formatEta(seconds: number): string {
  if (seconds < 60) return `± ${Math.max(1, seconds)} detik`;
  return `± ${Math.ceil(seconds / 60)} menit`;
}

export function WaitTimePanel({ etaSeconds }: { etaSeconds: number }) {
  return (
    <DashedPanel className="space-y-1 text-center">
      <p className="text-sm text-muted-foreground">Estimasi waktu tunggu</p>
      <p className="text-lg font-bold">{formatEta(etaSeconds)}</p>
    </DashedPanel>
  );
}
