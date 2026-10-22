import { Ticket, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { ErrorState, LoadingState } from "@/components/shared/AsyncStates";
import { CountdownPanel } from "@/components/shared/CountdownPanel";
import { ScreenCard, ScreenHeader } from "@/components/shared/ScreenCard";
import { SummaryRow } from "@/components/shared/SummaryRow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAsync } from "@/hooks/useAsync";
import { useCountdown } from "@/hooks/useCountdown";
import { formatCountdown, formatRupiah } from "@/lib/format";
import { CategoryPicker } from "../components/CategoryPicker";
import { NikField } from "../components/NikField";
import { useBookingForm } from "../useBookingForm";

/** 9.3 Detail Ticket Page — FR-11…FR-19 */
export function BookingPage() {
  const { eventId = "" } = useParams();
  const navigate = useNavigate();
  const { events, queue } = useServices();

  const { data: event, error: eventError, loading: eventLoading } = useAsync(
    () => events.get(eventId),
    [events, eventId],
  );
  const { data: categories, error: catError, loading: catLoading } = useAsync(
    () => events.getCategories(eventId),
    [events, eventId],
  );

  const [bookingExpiresAt, setBookingExpiresAt] = useState<string>();

  // Ambil queue status untuk membaca bookingExpiresAt otoritatif server
  useEffect(() => {
    queue.getStatus(eventId).then((s) => {
      if (s.state === "ADMITTED" && s.bookingExpiresAt) {
        setBookingExpiresAt(s.bookingExpiresAt);
      } else if (s.state === "EXPIRED" || s.state === "NONE") {
        navigate(ROUTES.home, {
          replace: true,
          state: {
            notice: "Sesi antrian tidak aktif atau sudah berakhir. Silakan antre kembali.",
          },
        });
      }
    });
  }, [queue, eventId, navigate]);

  const handleExpire = () => {
    navigate(ROUTES.home, {
      replace: true,
      state: {
        notice: "Batas waktu booking 5 menit telah habis. Sesi Anda dilepas untuk antrian berikutnya.",
      },
    });
  };

  const { remainingMs } = useCountdown(bookingExpiresAt, handleExpire);

  const form = useBookingForm(eventId, categories ?? []);

  if (eventLoading || catLoading || !event || !categories) {
    return (
      <ScreenCard
        header={
          <ScreenHeader
            icon={<Ticket className="size-4" />}
            title="Pilih Tiket"
          />
        }
      >
        <LoadingState label="Menyiapkan data kategori tiket…" />
      </ScreenCard>
    );
  }

  if (eventError || catError) {
    return (
      <ScreenCard
        header={
          <ScreenHeader
            icon={<Ticket className="size-4" />}
            title="Pilih Tiket"
          />
        }
      >
        <ErrorState
          message="Gagal memuat kategori tiket. Silakan coba kembali."
          onRetry={() => window.location.reload()}
        />
      </ScreenCard>
    );
  }

  return (
    <ScreenCard
      header={
        <ScreenHeader
          icon={<Ticket className="size-4" />}
          title={event.name}
          right={
            <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-200">
              <Timer className="size-3.5" />
              Booking {formatCountdown(remainingMs)}
            </span>
          }
        />
      }
    >
      {/* 1. Countdown Box */}
      <CountdownPanel
        label="Selesaikan pemilihan sebelum"
        hint="Sesi booking berakhir otomatis jika idle"
        expiresAt={bookingExpiresAt}
        onExpire={handleExpire}
      />

      {/* 2. NIK Field */}
      <NikField
        value={form.nik}
        onChange={form.setNik}
        disabled={form.isSubmitting}
      />

      {/* 3. Section Title */}
      <div className="pt-1">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Pilih Kategori (maks. 3 tiket / NIK atau sesi)
        </h3>
      </div>

      {/* 4. Category Picker */}
      <CategoryPicker
        categories={categories}
        quantities={form.quantities}
        onChangeQty={form.handleQtyChange}
        disabled={form.isSubmitting}
      />

      {/* Error alert jika ada */}
      {form.error ? (
        <Alert variant="destructive">
          <AlertDescription>{form.error}</AlertDescription>
        </Alert>
      ) : null}

      {/* 5. Summary & CTA */}
      <div className="space-y-4 pt-3 border-t">
        <SummaryRow
          label={`Total (${form.totalTickets} tiket)`}
          value={formatRupiah(form.totalPrice)}
        />

        <Button
          className="w-full text-base font-bold shadow-md"
          size="lg"
          disabled={form.totalTickets === 0 || form.isSubmitting}
          onClick={form.submitBooking}
        >
          {form.isSubmitting
            ? "Memproses Reservasi…"
            : "Lanjut ke Pembayaran →"}
        </Button>
      </div>
    </ScreenCard>
  );
}
