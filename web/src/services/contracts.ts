/**
 * Kontrak service (Dependency Inversion + Interface Segregation).
 * UI hanya bergantung pada interface ini. Implementasi mock ada di
 * `services/mock`; implementasi HTTP nyata (OpenAPI SPEC §10) tinggal
 * mengimplementasikan interface yang sama tanpa mengubah UI.
 */
import type {
  ActiveSession,
  Booking,
  CreateBookingInput,
  Event,
  PaymentMethod,
  PaymentMethodId,
  QueueStatus,
  TicketCategory,
} from "@/domain/types";

export interface EventService {
  list(): Promise<Event[]>;
  get(eventId: string): Promise<Event>;
  getCategories(eventId: string): Promise<TicketCategory[]>;
}

export interface QueueService {
  /** Idempoten: join ulang mengembalikan antrian yang sama (FR-10). */
  join(eventId: string): Promise<QueueStatus>;
  getStatus(eventId: string): Promise<QueueStatus>;
  leave(eventId: string): Promise<void>;
}

export interface BookingService {
  create(input: CreateBookingInput): Promise<Booking>;
  get(bookingId: string): Promise<Booking>;
}

export interface PaymentService {
  listMethods(): Promise<PaymentMethod[]>;
  /** Mengembalikan booking dengan status terbaru (PAID / EXPIRED). */
  pay(bookingId: string, methodId: PaymentMethodId): Promise<Booking>;
}

export interface SessionService {
  /** Seluruh sesi aktif user untuk kartu "Your Queue". */
  listActive(): Promise<ActiveSession[]>;
}

export interface Services {
  events: EventService;
  queue: QueueService;
  booking: BookingService;
  payment: PaymentService;
  session: SessionService;
}

/** Error bisnis yang bisa dipetakan UI ke pesan ramah (SPEC §10.3). */
export type ApiErrorCode =
  | "SALE_NOT_OPEN"
  | "SESSION_EXPIRED"
  | "OUT_OF_STOCK"
  | "QUOTA_EXCEEDED"
  | "INVALID_NIK"
  | "BOOKING_EXPIRED"
  | "NOT_FOUND";

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
