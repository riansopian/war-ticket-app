import type { Booking, PaymentMethod, PaymentMethodId } from "@/domain/types";
import { ApiError, type PaymentService } from "../contracts";
import { delay, getMockConfig } from "./config";
import { expireBookingIfNeeded } from "./derive";
import { toBooking } from "./MockBookingService";
import { withDb } from "./withDb";

const METHODS: PaymentMethod[] = [
  {
    id: "VIRTUAL_ACCOUNT",
    group: "VIRTUAL_ACCOUNT",
    label: "Virtual Account (BCA VA)",
    description: "Konfirmasi instan otomatis tanpa bukti transfer",
    badge: "Tersambung API",
  },
  {
    id: "E_WALLET",
    group: "E_WALLET",
    label: "Instant QRIS",
    description: "Gopay, OVO, Dana, ShopeePay, LinkAja",
    badge: "AUTO",
  },
  {
    id: "BANK_TRANSFER",
    group: "CARD",
    label: "Kartu Kredit / Debit Online",
    description: "Visa, Mastercard, JCB (3D Secure OTP)",
  },
];

export class MockPaymentService implements PaymentService {
  async listMethods(): Promise<PaymentMethod[]> {
    await delay(getMockConfig().latencyMs);
    return METHODS;
  }

  async pay(bookingId: string, _methodId: PaymentMethodId): Promise<Booking> {
    await delay(getMockConfig().paymentProcessingMs);
    return withDb((db) => {
      const rec = db.bookings[bookingId];
      if (!rec) throw new ApiError("NOT_FOUND", "Booking tidak ditemukan.");

      expireBookingIfNeeded(db, rec);
      if (rec.status === "EXPIRED") {
        throw new ApiError("BOOKING_EXPIRED", "Waktu pembayaran sudah habis.");
      }

      // Idempoten (FR-25): bayar ulang booking PAID tidak berefek.
      if (rec.status === "HELD") {
        const event = db.events.find((e) => e.id === rec.eventId)!;
        for (const item of rec.items) {
          const cat = event.categories.find((c) => c.id === item.categoryId)!;
          cat.held = Math.max(0, cat.held - item.qty); // HELD → SOLD
        }
        rec.status = "PAID";
      }
      return toBooking(db, rec);
    });
  }
}
