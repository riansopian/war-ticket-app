export const ROUTES = {
  home: "/",
  waitingRoom: (eventId = ":eventId") => `/events/${eventId}/queue`,
  booking: (eventId = ":eventId") => `/events/${eventId}/booking`,
  payment: (bookingId = ":bookingId") => `/pay/${bookingId}`,
  paymentResult: (bookingId = ":bookingId") => `/pay/${bookingId}/result`,
} as const;
