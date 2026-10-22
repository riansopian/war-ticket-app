import { ApiError } from "@/services/contracts";

/** Pesan ramah user (SPEC §10.3 / NFR-01): jangan tampilkan error mentah. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Terjadi gangguan. Silakan coba beberapa saat lagi.";
}
