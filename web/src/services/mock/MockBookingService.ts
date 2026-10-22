import { isValidNik, MAX_TICKETS_PER_ORDER } from "@/domain/rules";
import type { Booking, CreateBookingInput } from "@/domain/types";
import { ApiError, type BookingService } from "../contracts";
import { getMockConfig } from "./config";
import type { BookingRecord, DbState } from "./db";
import { computeQueueStatus } from "./derive";
import { withDb } from "./withDb";

/** Mapper record → DTO. Dipakai juga oleh MockPaymentService. */
export function toBooking(db: DbState, rec: BookingRecord): Booking {
  const event = db.events.find((e) => e.id === rec.eventId)!;
  const items = rec.items.map((i) => {
    const cat = event.categories.find((c) => c.id === i.categoryId)!;
    return {
      categoryId: i.categoryId,
      categoryName: cat.name,
      qty: i.qty,
      unitPrice: cat.price,
    };
  });
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const taxAmount = Math.round(subtotal * 0.1);
  const platformFee = items.length > 0 ? 10000 : 0;
  const totalAmount = subtotal + taxAmount + platformFee;

  const ticketCodes: string[] = [];
  let seq = 584210;
  for (const item of items) {
    for (let k = 0; k < item.qty; k++) {
      ticketCodes.push(`DJS-CAT1-${seq++}`);
    }
  }

  return {
    id: rec.id,
    code: rec.code,
    eventId: rec.eventId,
    eventName: event.name,
    tourName: event.tourName || "Sunset Sound Tour",
    nik: rec.nik || "3171052809960002",
    customerName: rec.customerName || "Budi Santoso",
    customerEmail: rec.customerEmail || "budi.santoso@deployjumat.id",
    items,
    subtotal,
    taxAmount,
    platformFee,
    totalAmount,
    status: rec.status,
    paymentExpiresAt: new Date(rec.paymentExpiresAt).toISOString(),
    vaNumber: rec.vaNumber || "8801 2398 4102 9312",
    idempotencyKey: rec.idempotencyKey || "IDEM-PAY-9842F",
    ticketCodes,
  };
}

export class MockBookingService implements BookingService {
  create(input: CreateBookingInput): Promise<Booking> {
    return withDb((db) => {
      const event = db.events.find((e) => e.id === input.eventId);
      if (!event) throw new ApiError("NOT_FOUND", "Event tidak ditemukan.");

      // NFR-07: tidak bisa bypass antrian tanpa slot aktif.
      const queue = computeQueueStatus(db.queues[input.eventId]);
      if (queue.state !== "ADMITTED") {
        throw new ApiError(
          "SESSION_EXPIRED",
          "Sesi booking berakhir. Silakan antre kembali.",
        );
      }
      if (!isValidNik(input.nik)) {
        throw new ApiError("INVALID_NIK", "NIK harus 16 digit angka.");
      }

      const items = input.items.filter((i) => i.qty > 0);
      const total = items.reduce((s, i) => s + i.qty, 0);
      if (total < 1 || total > MAX_TICKETS_PER_ORDER) {
        throw new ApiError(
          "QUOTA_EXCEEDED",
          `Maksimal ${MAX_TICKETS_PER_ORDER} tiket per pembelian.`,
        );
      }

      // Validasi semua dulu, baru mutasi (atomik seperti transaksi DB, SPEC §5.3).
      for (const item of items) {
        const cat = event.categories.find((c) => c.id === item.categoryId);
        if (!cat || cat.available < item.qty) {
          throw new ApiError(
            "OUT_OF_STOCK",
            "Stok kategori ini tidak mencukupi. Silakan pilih jumlah lain.",
          );
        }
      }
      for (const item of items) {
        const cat = event.categories.find((c) => c.id === item.categoryId)!;
        cat.available -= item.qty;
        cat.held += item.qty;
      }

      db.bookingSeq += 1;
      const rec: BookingRecord = {
        id: `bk-${db.bookingSeq}`,
        code: `DJS-2025-${db.bookingSeq}`,
        eventId: input.eventId,
        nik: input.nik,
        customerName: input.customerName || "Budi Santoso",
        customerEmail: input.customerEmail || "budi.santoso@deployjumat.id",
        items,
        status: "HELD",
        paymentExpiresAt: Date.now() + getMockConfig().paymentTtlMs,
        vaNumber: "8801 2398 4102 9312",
        idempotencyKey: "IDEM-PAY-9842F",
      };
      db.bookings[rec.id] = rec;
      // Slot antrian dilepas begitu booking dibuat (sesi pindah ke payment).
      delete db.queues[input.eventId];
      return toBooking(db, rec);
    });
  }

  get(bookingId: string): Promise<Booking> {
    return withDb((db) => {
      const rec = db.bookings[bookingId];
      if (!rec) throw new ApiError("NOT_FOUND", "Booking tidak ditemukan.");
      return toBooking(db, rec);
    });
  }
}
