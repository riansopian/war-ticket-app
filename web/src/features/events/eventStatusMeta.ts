import type { EventStatus, Event } from "@/domain/types";
import type { BadgeProps } from "@/components/ui/badge";
import { formatTime } from "@/lib/format";

interface EventStatusMeta {
  label: string;
  badge: NonNullable<BadgeProps["variant"]>;
  canBuy: boolean;
  cta: (event: Event) => string;
}

/**
 * Peta status → tampilan. Menambah status baru cukup menambah satu entri di
 * sini, tanpa menyentuh komponen (Open/Closed Principle).
 */
export const eventStatusMeta: Record<EventStatus, EventStatusMeta> = {
  AVAILABLE: {
    label: "Available",
    badge: "success",
    canBuy: true,
    cta: () => "Beli Tiket →",
  },
  ALMOST_SOLD_OUT: {
    label: "Hampir Habis",
    badge: "warning",
    canBuy: true,
    cta: () => "Beli Tiket →",
  },
  SOLD_OUT: {
    label: "Sold Out",
    badge: "destructive",
    canBuy: false,
    cta: () => "Tidak Tersedia",
  },
  UPCOMING: {
    label: "Segera",
    badge: "default",
    canBuy: false,
    cta: (e) => `Buka pukul ${formatTime(e.saleOpensAt)}`,
  },
};
