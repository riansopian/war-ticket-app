import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { BookingPage } from "@/features/booking/pages/BookingPage";
import { HomePage } from "@/features/events/pages/HomePage";
import { PaymentPage } from "@/features/payment/pages/PaymentPage";
import { PaymentResultPage } from "@/features/payment/pages/PaymentResultPage";
import { WaitingRoomPage } from "@/features/queue/pages/WaitingRoomPage";
import { AppLayout } from "./AppLayout";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events/:eventId/queue" element={<WaitingRoomPage />} />
          <Route path="/events/:eventId/booking" element={<BookingPage />} />
          <Route path="/pay/:bookingId" element={<PaymentPage />} />
          <Route path="/pay/:bookingId/result" element={<PaymentResultPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
