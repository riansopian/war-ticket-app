/**
 * Mock database untuk Booket Concert & Queue.
 * Disesuaikan persis dengan spesifikasi Figma Revamp 5 Layar.
 */

export interface CategoryRecord {
  id: string;
  name: string;
  price: number;
  available: number;
  held: number;
  description?: string;
  tag?: string;
  tier?: string;
  perks?: string;
}

export interface EventRecord {
  id: string;
  name: string;
  subtitle?: string;
  tourName?: string;
  city: string;
  venue: string;
  startsAt: string;
  saleOpensAt: string;
  capacityPerMin?: string;
  remainingTicketsText?: string;
  startingPrice?: number;
  gateInfo?: string;
  presalePhase?: string;
  totalCapacity?: number;
  soldCount?: number;
  fillPercent?: number;
  imageUrl?: string;
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
  customerPhone?: string;
  items: Array<{ categoryId: string; qty: number }>;
  status: "HELD" | "PAID" | "EXPIRED";
  paymentExpiresAt: number;
  vaNumber?: string;
  idempotencyKey?: string;
  gateInfo?: string;
  rowSeat?: string;
}

export interface DbState {
  events: EventRecord[];
  queues: Record<string, QueueRecord>;
  bookings: Record<string, BookingRecord>;
  bookingSeq: number;
}

const DB_KEY = "booket.mock.db.v3";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function seed(): DbState {
  const now = Date.now();
  const past = new Date(now - DAY).toISOString();
  const future1 = new Date(now + 23 * HOUR).toISOString();

  const cat = (
    id: string,
    name: string,
    price: number,
    available: number,
    held = 0,
    description?: string,
    tag?: string,
    tier?: string,
    perks?: string,
  ): CategoryRecord => ({
    id,
    name,
    price,
    available,
    held,
    description,
    tag,
    tier,
    perks,
  });

  return {
    bookingSeq: 882941,
    queues: {},
    bookings: {},
    events: [
      {
        id: "deploy-jumat-sore",
        name: "Deploy Jumat Sore Live 2025",
        subtitle: "LIVE ARENA SHOWCASE 2025",
        tourName: "Tur Musik Botani",
        city: "Jakarta Pusat",
        venue: "Stadion Madya GBK, Senayan, Jakarta",
        startsAt: "2025-12-14T18:30:00+07:00",
        saleOpensAt: past,
        capacityPerMin: "~75 tkt/menit",
        remainingTicketsText: "< 2.000 tiket",
        startingPrice: 400000,
        presalePhase: "Presale Fase 2",
        totalCapacity: 24000,
        soldCount: 22080,
        fillPercent: 92,
        gateInfo: "GATE 4B • LEVEL 1 (Stadion Madya GBK)",
        categories: [
          cat(
            "cat-vip",
            "VIP Sunset Lounge",
            2450000,
            85,
            12,
            "Akses jalur express botani, tempat duduk bertingkat, welcome refreshment & souvenir fan resmi.",
            "Sisa 85 Tiket",
            "PRIORITAS",
            "Free merchandise exclusive & premium lounge access",
          ),
          cat(
            "cat-front",
            "Festival Front Row",
            1350000,
            210,
            25,
            "Area berdiri posisi depan panggung utama sound system premium.",
            "Sisa 210",
            "STANDING",
            "Berdiri bebas tepat di depan panggung utama",
          ),
          cat(
            "cat-trib1",
            "Tribune Cat 1",
            950000,
            240,
            30,
            "Tempat duduk tribun tengah bernomor dengan pemandangan panggung menyeluruh & canopy berteduh.",
            "Sisa 240",
            "NUMBERED SEAT",
            "Nomor kursi tetap di tribun tengah bertingkat",
          ),
          cat(
            "cat-trib2",
            "Tribune Cat 2",
            650000,
            0,
            0,
            "Nomor kursi sayap kiri dan kanan.",
            "Habis",
            "UPPER LEVEL",
            "Nomor kursi sayap kiri dan kanan",
          ),
        ],
      },
      {
        id: "jakarta-indie-wave",
        name: "Jakarta Indie Wave Festival",
        tourName: "Festival Musik",
        city: "Jakarta Pusat",
        venue: "Istora Senayan, Jakarta",
        startsAt: "2025-01-10T19:00:00+07:00",
        saleOpensAt: future1,
        startingPrice: 250000,
        categories: [
          cat("jiw-gen", "General Admission", 250000, 500, 0),
        ],
      },
      {
        id: "sound-of-horizon",
        name: "Sound of Horizon 2025",
        tourName: "Tur Internasional",
        city: "Jakarta Utara",
        venue: "JIEXPO Kemayoran, Jakarta",
        startsAt: "2025-01-10T20:00:00+07:00",
        saleOpensAt: past,
        startingPrice: 350000,
        categories: [
          cat("soh-fest", "Festival", 350000, 120, 10),
        ],
      },
      {
        id: "sunset-symphony",
        name: "Sunset Symphony Tour 2025",
        tourName: "Tur Budaya",
        city: "Jakarta Pusat",
        venue: "Taman Ismail Marzuki, Jakarta",
        startsAt: "2025-03-15T19:30:00+07:00",
        saleOpensAt: past,
        startingPrice: 275000,
        categories: [
          cat("ss-aud", "Auditorium Utama", 275000, 80, 5),
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
    // quota exceeded / private mode
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
