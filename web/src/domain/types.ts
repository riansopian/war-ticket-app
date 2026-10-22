/**
 * Domain model (framework-agnostic).
 * Diperbarui untuk mendukung visual fidelity tinggi sesuai Revamp Figma.
 */

export type EventStatus =
  | "UPCOMING"
  | "AVAILABLE"
  | "ALMOST_SOLD_OUT"
  | "SOLD_OUT";

export interface Event {
  id: string;
  name: string;
  tourName?: string;
  city: string;
  venue: string;
  startsAt: string;
  saleOpensAt: string;
  status: EventStatus;
  capacityPerMin?: string;
  remainingTicketsText?: string;
  startingPrice?: number;
  gateInfo?: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  available: number;
  description?: string;
  tag?: string;
  isSoldOut?: boolean;
}

/* ───────── Queue ───────── */

export type QueueState = "NONE" | "WAITING" | "ADMITTED" | "EXPIRED";

export interface QueueStatus {
  state: QueueState;
  position: number;
  initialPosition: number;
  etaSeconds: number;
  token?: string;
  speedPerMin?: number;
  trafficStability?: string;
  bookingExpiresAt?: string;
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
  code: string;
  eventId: string;
  eventName: string;
  tourName?: string;
  nik?: string;
  customerName?: string;
  customerEmail?: string;
  items: BookingItem[];
  subtotal: number;
  taxAmount: number;
  platformFee: number;
  totalAmount: number;
  status: BookingStatus;
  paymentExpiresAt: string;
  vaNumber?: string;
  idempotencyKey?: string;
  ticketCodes?: string[];
}

export interface CreateBookingInput {
  eventId: string;
  nik: string;
  customerName?: string;
  customerEmail?: string;
  items: Array<{ categoryId: string; qty: number }>;
}

/* ───────── Payment ───────── */

export type PaymentMethodId = "VIRTUAL_ACCOUNT" | "E_WALLET" | "BANK_TRANSFER";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description?: string;
  badge?: string;
}

/* ───────── "Your Queue" ───────── */

export type ActiveSessionKind = "WAITING" | "BOOKING" | "PAYMENT";

export interface ActiveSession {
  kind: ActiveSessionKind;
  eventId: string;
  eventName: string;
  position?: number;
  expiresAt?: string;
  bookingId?: string;
}
