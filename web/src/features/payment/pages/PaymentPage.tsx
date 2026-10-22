import { ArrowLeft, CreditCard } from "lucide-react";
import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { ErrorState, LoadingState } from "@/components/shared/AsyncStates";
import { CountdownPanel } from "@/components/shared/CountdownPanel";
import { DashedPanel } from "@/components/shared/DashedPanel";
import { ScreenCard, ScreenHeader } from "@/components/shared/ScreenCard";
import { SummaryRow } from "@/components/shared/SummaryRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking, PaymentMethod, PaymentMethodId } from "@/domain/types";
import { formatRupiah } from "@/lib/format";
import { PaymentMethodSelector } from "../components/PaymentMethodSelector";

/** 9.4 Wireframe: Payment Page — FR-20…FR-25 */
export function PaymentPage() {
  const { bookingId = "" } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { booking: bookingService, payment: paymentService } = useServices();

  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [methods, setMethods] = React.useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] =
    React.useState<PaymentMethodId>("VIRTUAL_ACCOUNT");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    if (!bookingId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [b, m] = await Promise.all([
        bookingService.get(bookingId),
        paymentService.listMethods(),
      ]);
      setBooking(b);
      setMethods(m);
      if (m.length > 0 && !m.some((item) => item.id === selectedMethod)) {
        setSelectedMethod(m[0].id);
      }
      // Bila sudah berstatus akhir (PAID/EXPIRED), alihkan langsung ke halaman hasil
      if (b.status === "PAID" || b.status === "EXPIRED") {
        navigate(ROUTES.paymentResult(b.id), { replace: true });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data pembayaran.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, bookingService, paymentService, navigate, selectedMethod]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExpire = React.useCallback(() => {
    if (bookingId) {
      navigate(ROUTES.paymentResult(bookingId), { replace: true });
    }
  }, [bookingId, navigate]);

  const handlePay = async () => {
    if (!booking) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await paymentService.pay(booking.id, selectedMethod);
      navigate(ROUTES.paymentResult(updated.id), { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Pembayaran gagal diproses.",
      );
      try {
        const fresh = await bookingService.get(booking.id);
        setBooking(fresh);
        if (fresh.status === "EXPIRED") {
          navigate(ROUTES.paymentResult(fresh.id), { replace: true });
        }
      } catch {
        // ignore
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const header = (
    <ScreenHeader
      icon={<CreditCard className="size-4" />}
      title="Pembayaran Order"
      right={booking ? `#${booking.id}` : undefined}
    />
  );

  if (isLoading) {
    return (
      <ScreenCard header={header}>
        <LoadingState label="Menyiapkan rincian pembayaran…" />
      </ScreenCard>
    );
  }

  if (error && !booking) {
    return (
      <ScreenCard header={header}>
        <ErrorState message={error} onRetry={loadData} />
      </ScreenCard>
    );
  }

  if (!booking) return null;

  return (
    <ScreenCard header={header}>
      {/* Event Name & Status */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <span className="text-xs text-muted-foreground">Event</span>
          <h2 className="font-bold text-foreground sm:text-base">
            {booking.eventName}
          </h2>
        </div>
        <Badge variant="warning" className="uppercase font-semibold">
          Menunggu Pembayaran
        </Badge>
      </div>

      {/* Countdown Box Selesaikan Pembayaran (Wireframe 9.4) */}
      <CountdownPanel
        label="Selesaikan pembayaran sebelum:"
        hint="Selesaikan pembayaran sebelum batas waktu berakhir untuk mengamankan tiket Anda."
        expiresAt={booking.paymentExpiresAt}
        onExpire={handleExpire}
      />

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
          {error}
        </div>
      ) : null}

      {/* Metode Pembayaran (Wireframe 9.4) */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground">
          Pilih Metode Pembayaran
        </h3>
        <PaymentMethodSelector
          methods={methods}
          selectedMethod={selectedMethod}
          onSelectMethod={setSelectedMethod}
          disabled={isSubmitting}
        />
      </div>

      {/* Ringkasan Pembayaran (Wireframe 9.4) */}
      <DashedPanel tone="neutral" className="space-y-3 p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Ringkasan Pembayaran
        </h4>
        <div className="space-y-2">
          {booking.items.map((item) => (
            <SummaryRow
              key={item.categoryId}
              label={`${item.qty}x ${item.categoryName}`}
              value={formatRupiah(item.qty * item.unitPrice)}
              emphasis={false}
            />
          ))}
          <SummaryRow label="Biaya Layanan" value="Rp 0" emphasis={false} />
          <div className="border-t pt-2">
            <SummaryRow
              label="Total"
              value={formatRupiah(booking.totalAmount)}
              emphasis={true}
            />
          </div>
        </div>
      </DashedPanel>

      {/* Action Button */}
      <div className="space-y-3 pt-2">
        <Button
          className="w-full text-sm font-bold shadow-md"
          size="lg"
          onClick={handlePay}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Memproses Pembayaran…" : "Bayar Sekarang"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Pembayaran akan diverifikasi secara otomatis dalam 1-2 menit.
        </p>

        <div className="text-center">
          <Link
            to={ROUTES.home}
            className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 size-3.5" />
            Tinggalkan halaman & simpan di "Your Queue"
          </Link>
        </div>
      </div>
    </ScreenCard>
  );
}
