/**
 * Konfigurasi simulasi. Waktu "nyata" mengikuti SPEC (TTL booking 5m, bayar 10m),
 * namun antrian dipercepat agar demo tidak menunggu lama.
 *
 *   ?fast=1  → TTL dipersingkat (booking 30s, bayar 40s) untuk demo skenario expired.
 *   ?fast=0  → kembali ke durasi normal.
 */
const FAST_KEY = "rusuh.mock.fast";

function isFast(): boolean {
  if (typeof window === "undefined") return false;
  const param = new URLSearchParams(window.location.search).get("fast");
  if (param === "1") sessionStorage.setItem(FAST_KEY, "1");
  if (param === "0") sessionStorage.removeItem(FAST_KEY);
  return sessionStorage.getItem(FAST_KEY) === "1";
}

export interface MockConfig {
  /** Posisi awal user saat join (sesuai wireframe 9.2: #1.248). */
  initialQueuePosition: number;
  /** Banyaknya antrian yang "maju" per detik. */
  admissionRatePerSec: number;
  bookingTtlMs: number;
  paymentTtlMs: number;
  /** Simulasi latensi jaringan. */
  latencyMs: number;
  paymentProcessingMs: number;
  /** Interval polling yang disarankan server. */
  retryAfterMs: number;
}

export function getMockConfig(): MockConfig {
  const fast = isFast();
  return {
    initialQueuePosition: 1248,
    admissionRatePerSec: 40,
    bookingTtlMs: fast ? 30_000 : 5 * 60_000,
    paymentTtlMs: fast ? 40_000 : 10 * 60_000,
    latencyMs: 200,
    paymentProcessingMs: 1500,
    retryAfterMs: 1000,
  };
}

export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
