import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import {
  isValidNik,
  MAX_TICKETS_PER_ORDER,
  orderTotal,
  totalQuantity,
  type Quantities,
} from "@/domain/rules";
import type { TicketCategory } from "@/domain/types";
import { getErrorMessage } from "@/lib/errors";

export function useBookingForm(eventId: string, categories: TicketCategory[]) {
  const { booking } = useServices();
  const navigate = useNavigate();

  // NIK default mock jika ingin mempermudah demo, atau kosong
  const [nik, setNik] = useState("3171020304050001");
  const [quantities, setQuantities] = useState<Quantities>(() => {
    // Inisialisasi default 1 untuk kategori pertama yang tersedia jika ada
    const firstAvailable = categories.find((c) => c.available > 0);
    return firstAvailable ? { [firstAvailable.id]: 1 } : {};
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalTickets = totalQuantity(quantities);
  const totalPrice = orderTotal(categories, quantities);

  const handleQtyChange = (categoryId: string, qty: number) => {
    setError(null);
    setQuantities((prev) => {
      const next = { ...prev, [categoryId]: qty };
      if (qty <= 0) {
        delete next[categoryId];
      }
      return next;
    });
  };

  const validate = (): boolean => {
    if (!isValidNik(nik)) {
      setError("NIK harus berupa 16 digit angka valid.");
      return false;
    }
    if (totalTickets === 0) {
      setError("Silakan pilih minimal 1 tiket.");
      return false;
    }
    if (totalTickets > MAX_TICKETS_PER_ORDER) {
      setError(`Maksimal pembelian adalah ${MAX_TICKETS_PER_ORDER} tiket.`);
      return false;
    }
    setError(null);
    return true;
  };

  const submitBooking = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const items = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([categoryId, qty]) => ({ categoryId, qty }));

      const result = await booking.create({
        eventId,
        nik,
        items,
      });

      navigate(ROUTES.payment(result.id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    nik,
    setNik,
    quantities,
    handleQtyChange,
    totalTickets,
    totalPrice,
    error,
    isSubmitting,
    submitBooking,
  };
}
