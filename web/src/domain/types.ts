/**
 * Domain model (framework-agnostic). Mengacu ke SPEC §9 (Data Model) dan
 * BRAINSTORM-01 (status UPCOMING / ALMOST_SOLD_OUT, "Your Queue").
 * Semua timestamp berupa ISO string UTC; harga dalam rupiah (integer).
 */

export type EventStatus =
  | "UPCOMING"
  | "AVAILABLE"
  | "ALMOST_SOLD_OUT"
  | "SOLD_OUT";

export interface Event {
  id: string;
  name: string;
  city: string;
  venue: string;
  startsAt: string;
  saleOpensAt: string;
  status: EventStatus;
}

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  /** Sisa stok yang bisa dibeli saat ini. */
  available: number;
}

/* ───────── Queue ───────── */

export type QueueState = "NONE" | "WAITING" | "ADMITTED" | "EXPIRED";

export interface QueueStatus {
  state: QueueState;
  position: number;
  /** Posisi awal saat join, dipakai untuk progress bar. */
  initialPosition: number;
  etaSeconds: number;
  /** Diisi saat ADMITTED: batas akhir TTL Booking (server-authoritative). */
  bookingExpiresAt?: string;
  /** Saran interval polling berikutnya dari server (SPEC §4.3). */
  retryAfterMs: number;
}

/* ───────── Booking ───────── */

export type BookingStatus = "HELD" | "PAID" | "EXPIRED";

export interface BookingItem {
  categoryId: string;
  categoryName: string;
  qty: number;
  unitPrice: number;
}

export interface Booking {
  id: string;
  /** Kode tampilan, mis. "RB-00912". */
  code: string;
  eventId: string;
  eventName: string;
  nik?: string;
  items: BookingItem[];
  totalAmount: number;
  status: BookingStatus;
  paymentExpiresAt: string;
}

export interface CreateBookingInput {
  eventId: string;
  nik: string;
  items: Array<{ categoryId: string; qty: number }>;
}

/* ───────── Payment ───────── */

export type PaymentMethodId = "VIRTUAL_ACCOUNT" | "E_WALLET" | "BANK_TRANSFER";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
}

/* ───────── "Your Queue" (BRAINSTORM §3.2) ───────── */

export type ActiveSessionKind = "WAITING" | "BOOKING" | "PAYMENT";

export interface ActiveSession {
  kind: ActiveSessionKind;
  eventId: string;
  eventName: string;
  /** Hanya untuk WAITING. */
  position?: number;
  /** Hanya untuk BOOKING & PAYMENT: batas waktu sesi. */
  expiresAt?: string;
  /** Hanya untuk PAYMENT. */
  bookingId?: string;
}
