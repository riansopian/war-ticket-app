import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashedPanel } from "@/components/shared/DashedPanel";
import type { Event } from "@/domain/types";
import { formatDate } from "@/lib/format";
import { eventStatusMeta } from "../eventStatusMeta";

interface EventCardProps {
  event: Event;
  onBuy: (event: Event) => void;
}

/** Kartu event (presentational). FR-02 / FR-03 + status UPCOMING & hampir habis. */
export function EventCard({ event, onBuy }: EventCardProps) {
  const meta = eventStatusMeta[event.status];
  return (
    <DashedPanel
      tone={meta.canBuy ? "highlight" : "neutral"}
      className="space-y-3"
      aria-disabled={!meta.canBuy}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold leading-tight">{event.name}</h3>
        <Badge variant={meta.badge} className="shrink-0 bg-opacity-100">
          {meta.label}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {formatDate(event.startsAt)} · {event.venue}
      </p>
      <Button disabled={!meta.canBuy} onClick={() => onBuy(event)}>
        {meta.cta(event)}
      </Button>
    </DashedPanel>
  );
}
