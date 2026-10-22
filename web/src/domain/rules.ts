/**
 * Business rules murni (tanpa React, tanpa I/O) → mudah di-unit-test.
 * Sumber: SPEC BR-01, FR-14, dan BRAINSTORM §3.6.
 */
import type { TicketCategory } from "./types";

/** BR-01: maksimal 3 tiket per pembelian/NIK per event. */
export const MAX_TICKETS_PER_ORDER = 3;

/** FR-15: NIK = 16 digit numerik. */
export const NIK_LENGTH = 16;

export function isValidNik(nik: string): boolean {
  return new RegExp(`^\\d{${NIK_LENGTH}}$`).test(nik);
}

export type Quantities = Record<string, number>;

export function totalQuantity(q: Quantities): number {
  return Object.values(q).reduce((sum, n) => sum + n, 0);
}

/**
 * Batas maksimum qty yang boleh dipilih untuk satu kategori:
 * min(sisa kuota order, stok kategori) dihitung dari pilihan kategori lain.
 */
export function maxSelectableQty(
  category: TicketCategory,
  quantities: Quantities,
): number {
  const selectedElsewhere = totalQuantity(quantities) - (quantities[category.id] ?? 0);
  const orderRoom = MAX_TICKETS_PER_ORDER - selectedElsewhere;
  return Math.max(0, Math.min(orderRoom, category.available));
}

export function orderTotal(
  categories: TicketCategory[],
  quantities: Quantities,
): number {
  return categories.reduce(
    (sum, c) => sum + c.price * (quantities[c.id] ?? 0),
    0,
  );
}
