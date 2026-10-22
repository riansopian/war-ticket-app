import type { Event } from "@/domain/types";
import { EventCard } from "./EventCard";

interface EventListProps {
  events: Event[];
  onBuy: (event: Event) => void;
}

export function EventList({ events, onBuy }: EventListProps) {
  if (events.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Belum ada event yang dijual.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {events.map((e) => (
        <li key={e.id}>
          <EventCard event={e} onBuy={onBuy} />
        </li>
      ))}
    </ul>
  );
}
