/**
 * Fungsi turunan murni di atas DbState (status event, status antrian, expiry).
 * Dipisah dari service agar tiap service tetap kecil (SRP).
 */
import type {
  Event,
  EventStatus,
  QueueStatus,
} from "@/domain/types";
import { getMockConfig } from "./config";
import type { BookingRecord, DbState, EventRecord, QueueRecord } from "./db";

export function deriveEventStatus(e: EventRecord, now = Date.now()): EventStatus {
  if (now < new Date(e.saleOpensAt).getTime()) return "UPCOMING";
  const available = e.categories.reduce((s, c) => s + c.available, 0);
  const held = e.categories.reduce((s, c) => s + c.held, 0);
  if (available + held === 0) return "SOLD_OUT";
  // BRAINSTORM §3.5: hampir habis jika sisa kuota < tiket yang sedang diproses.
  if (available < held) return "ALMOST_SOLD_OUT";
  return "AVAILABLE";
}

export function toEvent(e: EventRecord): Event {
  return {
    id: e.id,
    name: e.name,
    city: e.city,
    venue: e.venue,
    startsAt: e.startsAt,
    saleOpensAt: e.saleOpensAt,
    status: deriveEventStatus(e),
  };
}

/** Status antrian dihitung deterministik dari waktu join (tanpa timer di server palsu). */
export function computeQueueStatus(
  q: QueueRecord | undefined,
  now = Date.now(),
): QueueStatus {
  const cfg = getMockConfig();
  if (!q) {
    return {
      state: "NONE",
      position: 0,
      initialPosition: cfg.initialQueuePosition,
      etaSeconds: 0,
      retryAfterMs: cfg.retryAfterMs,
    };
  }
  const elapsedSec = (now - q.joinedAt) / 1000;
  const position = Math.max(
    0,
    Math.ceil(cfg.initialQueuePosition - elapsedSec * cfg.admissionRatePerSec),
  );
  const admittedAt =
    q.joinedAt + (cfg.initialQueuePosition / cfg.admissionRatePerSec) * 1000;
  // TTL Booking mulai sejak giliran tiba (BRAINSTORM §3.3), bukan sejak halaman dibuka.
  const bookingExpiresAt = admittedAt + cfg.bookingTtlMs;

  const base = {
    position,
    initialPosition: cfg.initialQueuePosition,
    etaSeconds: Math.ceil(position / cfg.admissionRatePerSec),
    retryAfterMs: cfg.retryAfterMs,
  };
  if (position > 0) return { ...base, state: "WAITING" };
  if (now <= bookingExpiresAt) {
    return {
      ...base,
      state: "ADMITTED",
      bookingExpiresAt: new Date(bookingExpiresAt).toISOString(),
    };
  }
  return { ...base, state: "EXPIRED" };
}

/**
 * Lazy expiry (SPEC §5.6): booking HELD yang lewat TTL dibatalkan dan stok
 * dikembalikan. Mengembalikan true jika ada perubahan.
 */
export function expireBookingIfNeeded(
  db: DbState,
  booking: BookingRecord,
  now = Date.now(),
): boolean {
  if (booking.status !== "HELD" || now <= booking.paymentExpiresAt) return false;
  booking.status = "EXPIRED";
  const event = db.events.find((e) => e.id === booking.eventId);
  for (const item of booking.items) {
    const cat = event?.categories.find((c) => c.id === item.categoryId);
    if (cat) {
      cat.held = Math.max(0, cat.held - item.qty);
      cat.available += item.qty;
    }
  }
  return true;
}

export function sweepExpired(db: DbState): boolean {
  let changed = false;
  for (const b of Object.values(db.bookings)) {
    changed = expireBookingIfNeeded(db, b) || changed;
  }
  return changed;
}
