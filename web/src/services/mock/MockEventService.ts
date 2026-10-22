import type { Event, TicketCategory } from "@/domain/types";
import { ApiError, type EventService } from "../contracts";
import { toEvent } from "./derive";
import { withDb } from "./withDb";

export class MockEventService implements EventService {
  list(): Promise<Event[]> {
    return withDb((db) => db.events.map(toEvent));
  }

  get(eventId: string): Promise<Event> {
    return withDb((db) => {
      const e = db.events.find((x) => x.id === eventId);
      if (!e) throw new ApiError("NOT_FOUND", "Event tidak ditemukan.");
      return toEvent(e);
    });
  }

  getCategories(eventId: string): Promise<TicketCategory[]> {
    return withDb((db) => {
      const e = db.events.find((x) => x.id === eventId);
      if (!e) throw new ApiError("NOT_FOUND", "Event tidak ditemukan.");
      return e.categories.map(({ id, name, price, available, description, tag }) => ({
        id,
        name,
        price,
        available,
        description,
        tag,
        isSoldOut: available <= 0,
      }));
    });
  }
}
