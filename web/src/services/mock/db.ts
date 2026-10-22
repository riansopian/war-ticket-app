/**
 * "Database" in-memory yang dipersist ke localStorage supaya sesi antrian/booking
 * bertahan saat refresh (FR-10) dan bisa dilanjutkan dari "Your Queue".
 */

export interface CategoryRecord {
  id: string;
  name: string;
  price: number;
  available: number;
  /** Stok yang sedang di-hold (booking/payment berjalan). */
  held: number;
}

export interface EventRecord {
  id: string;
  name: string;
  city: string;
  venue: string;
  startsAt: string;
  saleOpensAt: string;
  categories: CategoryRecord[];
}

export interface QueueRecord {
  eventId: string;
  joinedAt: number;
}

export interface BookingRecord {
  id: string;
  code: string;
  eventId: string;
  nik?: string;
  items: Array<{ categoryId: string; qty: number }>;
  status: "HELD" | "PAID" | "EXPIRED";
  paymentExpiresAt: number;
}

export interface DbState {
  events: EventRecord[];
  queues: Record<string, QueueRecord>;
  bookings: Record<string, BookingRecord>;
  bookingSeq: number;
}

const DB_KEY = "rusuh.mock.db.v1";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function seed(): DbState {
  const now = Date.now();
  const past = new Date(now - DAY).toISOString();
  const cat = (
    id: string,
    name: string,
    price: number,
    available: number,
    held = 0,
  ): CategoryRecord => ({ id, name, price, available, held });

  return {
    bookingSeq: 911,
    queues: {},
    bookings: {},
    events: [
      {
        id: "konser-a",
        name: "Konser A — Jakarta",
        city: "Jakarta",
        venue: "GBK",
        startsAt: "2026-12-25T19:00:00+07:00",
        saleOpensAt: past,
        categories: [
          cat("vip", "VIP", 1_500_000, 12, 4),
          cat("festival", "Festival", 850_000, 240, 20),
          cat("tribune", "Tribune", 500_000, 0),
        ],
      },
      {
        id: "konser-b",
        name: "Konser B — Bandung",
        city: "Bandung",
        venue: "GOR Saparua",
        startsAt: "2027-01-10T19:00:00+07:00",
        saleOpensAt: past,
        categories: [
          cat("vip", "VIP", 1_300_000, 0),
          cat("festival", "Festival", 750_000, 0),
        ],
      },
      {
        id: "konser-c",
        name: "Konser C — Surabaya",
        city: "Surabaya",
        venue: "GOR",
        startsAt: "2027-02-02T19:00:00+07:00",
        saleOpensAt: past,
        categories: [
          cat("vip", "VIP", 1_200_000, 30),
          cat("festival", "Festival", 700_000, 300),
          cat("tribune", "Tribune", 400_000, 150),
        ],
      },
      {
        id: "konser-d",
        name: "Konser D — Yogyakarta",
        city: "Yogyakarta",
        venue: "Stadion Mandala Krida",
        startsAt: "2027-03-14T19:00:00+07:00",
        // Belum dibuka: tampil sebagai "Buka pukul ..." (BRAINSTORM §3.1)
        saleOpensAt: new Date(now + 2 * HOUR).toISOString(),
        categories: [
          cat("vip", "VIP", 1_800_000, 100),
          cat("festival", "Festival", 950_000, 500),
        ],
      },
      {
        id: "konser-e",
        name: "Konser E — Medan",
        city: "Medan",
        venue: "Stadion Teladan",
        startsAt: "2027-04-03T19:00:00+07:00",
        saleOpensAt: past,
        // Hampir habis: sisa kuota < tiket yang sedang diproses (BRAINSTORM §3.5)
        categories: [
          cat("vip", "VIP", 2_000_000, 3, 8),
          cat("festival", "Festival", 900_000, 4, 10),
        ],
      },
    ],
  };
}

export function loadDb(): DbState {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as DbState;
  } catch {
    /* data korup → seed ulang */
  }
  const fresh = seed();
  saveDb(fresh);
  return fresh;
}

export function saveDb(db: DbState): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function resetMockDb(): void {
  localStorage.removeItem(DB_KEY);
}
