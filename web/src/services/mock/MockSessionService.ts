import type { ActiveSession } from "@/domain/types";
import type { SessionService } from "../contracts";
import { computeQueueStatus } from "./derive";
import { withDb } from "./withDb";

export class MockSessionService implements SessionService {
  listActive(): Promise<ActiveSession[]> {
    return withDb((db) => {
      const sessions: ActiveSession[] = [];
      const nameOf = (id: string) =>
        db.events.find((e) => e.id === id)?.name ?? id;

      for (const q of Object.values(db.queues)) {
        const s = computeQueueStatus(q);
        if (s.state === "WAITING") {
          sessions.push({
            kind: "WAITING",
            eventId: q.eventId,
            eventName: nameOf(q.eventId),
            position: s.position,
          });
        } else if (s.state === "ADMITTED") {
          sessions.push({
            kind: "BOOKING",
            eventId: q.eventId,
            eventName: nameOf(q.eventId),
            expiresAt: s.bookingExpiresAt,
          });
        }
      }

      for (const b of Object.values(db.bookings)) {
        if (b.status === "HELD") {
          sessions.push({
            kind: "PAYMENT",
            eventId: b.eventId,
            eventName: nameOf(b.eventId),
            bookingId: b.id,
            expiresAt: new Date(b.paymentExpiresAt).toISOString(),
          });
        }
      }
      return sessions;
    });
  }
}
