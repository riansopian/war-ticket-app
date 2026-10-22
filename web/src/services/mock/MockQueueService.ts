import type { QueueStatus } from "@/domain/types";
import { ApiError, type QueueService } from "../contracts";
import { computeQueueStatus, deriveEventStatus } from "./derive";
import { withDb } from "./withDb";

export class MockQueueService implements QueueService {
  join(eventId: string): Promise<QueueStatus> {
    return withDb((db) => {
      const event = db.events.find((e) => e.id === eventId);
      if (!event) throw new ApiError("NOT_FOUND", "Event tidak ditemukan.");

      const status = deriveEventStatus(event);
      if (status === "UPCOMING") {
        throw new ApiError("SALE_NOT_OPEN", "Penjualan belum dibuka.");
      }
      if (status === "SOLD_OUT") {
        throw new ApiError("OUT_OF_STOCK", "Tiket sudah habis.");
      }

      // Idempoten (FR-10): antrian aktif dipertahankan; yang EXPIRED antre ulang.
      const existing = computeQueueStatus(db.queues[eventId]);
      if (existing.state === "WAITING" || existing.state === "ADMITTED") {
        return existing;
      }
      db.queues[eventId] = { eventId, joinedAt: Date.now() };
      return computeQueueStatus(db.queues[eventId]);
    });
  }

  getStatus(eventId: string): Promise<QueueStatus> {
    return withDb((db) => computeQueueStatus(db.queues[eventId]));
  }

  leave(eventId: string): Promise<void> {
    return withDb((db) => {
      delete db.queues[eventId];
    });
  }
}
