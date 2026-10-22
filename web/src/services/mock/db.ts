/**
 * "Database" in-memory yang dipersist ke localStorage supaya sesi antrian/booking
 * bertahan saat refresh (FR-10) dan bisa dilanjutkan dari "Your Queue".
 * Diperbarui untuk mendukung data set realistik Figma Revamp.
 */

export interface CategoryRecord {
  id: string;
  name: string;
  price: number;
  available: number;
  held: number;
  description?: string;
  tag?: string;
}

export interface EventRecord {
  id: string;
  name: string;
  tourName?: string;
  city: string;
  venue: string;
  startsAt: string;
  saleOpensAt: string;
  capacityPerMin?: string;
  remainingTicketsText?: string;
  startingPrice?: number;
  gateInfo?: string;
  categories: CategoryRecord[];
}

export interface QueueRecord {
  eventId: string;
  joinedAt: number;
  token?: string;
}

export interface BookingRecord {
  id: string;
  code: string;
  eventId: string;
  nik?: string;
  customerName?: string;
  customerEmail?: string;
  items: Array<{ categoryId: string; qty: number }>;
  status: "HELD" | "PAID" | "EXPIRED";
  paymentExpiresAt: number;
  vaNumber?: string;
  idempotencyKey?: string;
}

export interface DbState {
  events: EventRecord[];
  queues: Record<string, QueueRecord>;
  bookings: Record<string, BookingRecord>;
  bookingSeq: number;
}

const DB_KEY = "rusuh.mock.db.v2";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function seed(): DbState {
  const now = Date.now();
  const past = new Date(now - DAY).toISOString();
  const future1 = new Date(now + 23 * HOUR + 45 * 60000).toISOString();
  const future2 = new Date(now + 3 * DAY).toISOString();

  const cat = (
    id: string,
    name: string,
    price: number,
    available: number,
    held = 0,
    description?: string,
    tag?: string,
  ): CategoryRecord => ({ id, name, price, available, held, description, tag });

  return {
    bookingSeq: 88191,
    queues: {},
    bookings: {},
    events: [
      {
        id: "deploy-jumat-sore",
        name: "Deploy Jumat Sore Live 2025",
        tourName: "Sunset Sound Tour",
        city: "Jakarta Pusat",
        venue: "Stadion Madya GBK, Jakarta Pusat",
        startsAt: "2025-12-14T18:30:00+07:00",
        saleOpensAt: past,
        capacityPerMin: "~1.200 org/mnt",
        remainingTicketsText: "2.100 tiket (Tersisa 32%)",
        startingPrice: 400000,
        gateInfo: "Stadion Madya GBK Gate B (Pintu Selatan)",
        categories: [
          cat(
            "cat-1",
            "CAT 1 Sunset Floor",
            950000,
            412,
            18,
            "Standing Festival • Area Depan Panggung",
            "Tersedia: 412 tiket",
          ),
          cat(
            "cat-vip",
            "VIP Sunset Lounge",
            1850000,
            42,
            6,
            "Numbered Seat • Free Lounge Access & F&B",
            "Stok Terbatas: 42",
          ),
          cat(
            "cat-2",
            "CAT 2 Tribune Seated",
            650000,
            180,
            12,
            "Free Seating • Pemandangan Panggung Center",
            "Tersedia: 180 tiket",
          ),
          cat(
            "cat-3",
            "CAT 3 Tribune Upper",
            400000,
            0,
            0,
            "Tribun Atas Sayap Kiri & Kanan",
            "HABIS / SOLD OUT",
          ),
        ],
      },
      {
        id: "indie-soundscape",
        name: "Indie Soundscape Festival 2025",
        tourName: "Indoor Stage Edition",
        city: "Jakarta Pusat",
        venue: "Tennis Indoor Senayan, Jakarta",
        startsAt: "2025-12-20T19:00:00+07:00",
        saleOpensAt: future1,
        startingPrice: 350000,
        categories: [
          cat("is-fest", "Festival", 550000, 300, 0),
          cat("is-trib", "Tribun", 350000, 200, 0),
        ],
      },
      {
        id: "java-rock-wave",
        name: "Java Rock Wave 2025",
        tourName: "Heavy Sound Open Space",
        city: "Jakarta Utara",
        venue: "JIExpo Kemayoran Open Space",
        startsAt: "2025-11-18T12:00:00+07:00",
        saleOpensAt: future2,
        startingPrice: 500000,
        categories: [
          cat("jrw-rock", "Rock Pit", 800000, 500, 0),
          cat("jrw-gen", "General Admission", 500000, 800, 0),
        ],
      },
      {
        id: "sunset-acoustic",
        name: "The Sunset Acoustic Sessions",
        tourName: "Intimate Hall",
        city: "Jakarta Pusat",
        venue: "Taman Ismail Marzuki (TIM), Jakarta",
        startsAt: "2025-10-10T19:00:00+07:00",
        saleOpensAt: past,
        startingPrice: 450000,
        categories: [
          cat("sa-hall", "All Seating Hall", 450000, 0, 0),
        ],
      },
    ],
  };
}

export function loadDb(): DbState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) {
      const fresh = seed();
      saveDb(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as DbState;
    if (!parsed.events || !parsed.queues || !parsed.bookings) {
      const fresh = seed();
      saveDb(fresh);
      return fresh;
    }
    return parsed;
  } catch {
    return seed();
  }
}

export function saveDb(state: DbState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded / private mode — fallback in-memory
  }
}

export function resetDb(): DbState {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(DB_KEY);
    } catch {
      // ignore
    }
  }
  const fresh = seed();
  saveDb(fresh);
  return fresh;
}

export const resetMockDb = resetDb;
