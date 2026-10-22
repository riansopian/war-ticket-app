import { ROUTES } from "@/app/routes";
import type { ActiveSession } from "@/domain/types";

/** Tujuan "Lanjutkan" untuk tiap jenis sesi aktif. */
export function sessionHref(session: ActiveSession): string {
  switch (session.kind) {
    case "WAITING":
      return ROUTES.waitingRoom(session.eventId);
    case "BOOKING":
      return ROUTES.booking(session.eventId);
    case "PAYMENT":
      return ROUTES.payment(session.bookingId);
  }
}
