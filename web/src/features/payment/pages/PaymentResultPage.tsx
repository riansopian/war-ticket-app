import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Download,
  MapPin,
  QrCode,
  RotateCcw,
  Ticket,
  User,
} from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { ErrorState, LoadingState } from "@/components/shared/AsyncStates";
import { DashedPanel } from "@/components/shared/DashedPanel";
import { ScreenCard, ScreenHeader } from "@/components/shared/ScreenCard";
import { SummaryRow } from "@/components/shared/SummaryRow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking, Event } from "@/domain/types";
import { formatDate, formatRupiah, formatTime } from "@/lib/format";

/** 9.5 Wireframe: Status Pasca-Pembayaran (Sukses & Expired) — FR-26…FR-28 */
export function PaymentResultPage() {
  const { bookingId = "" } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { booking: bookingService, events: eventService } = useServices();

  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [event, setEvent] = React.useState<Event | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isDownloaded, setIsDownloaded] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!bookingId) return;
    setIsLoading(true);
    setError(null);
    try {
      const b = await bookingService.get(bookingId);
      setBooking(b);
      const e = await eventService.get(b.eventId);
      setEvent(e);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat status pesanan.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, bookingService, eventService]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDownload = () => {
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  if (isLoading) {
    return (
      <ScreenCard
        header={
          <ScreenHeader
            icon={<Ticket className="size-4" />}
            title="Status Pembayaran"
          />
        }
      >
        <LoadingState label="Memeriksa status tiket Anda…" />
      </ScreenCard>
    );
  }

  if (error || !booking) {
    return (
      <ScreenCard
        header={
          <ScreenHeader
            icon={<AlertCircle className="size-4" />}
            title="Status Pembayaran"
            tone="destructive"
          />
        }
      >
        <ErrorState
          message={error || "Booking tidak ditemukan."}
          onRetry={loadData}
        />
      </ScreenCard>
    );
  }

  const isSuccess = booking.status === "PAID";
  const userNik = booking.nik || "3201123456780001";
  const maskedNik =
    userNik.length === 16
      ? `${userNik.slice(0, 4)}********${userNik.slice(12)}`
      : userNik;
  const totalTickets = booking.items.reduce((acc, i) => acc + i.qty, 0);

  return (
    <ScreenCard
      header={
        <ScreenHeader
          icon={
            isSuccess ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )
          }
          title={isSuccess ? "Pembayaran Berhasil!" : "Waktu Pembayaran Habis!"}
          right={`Order #${booking.id}`}
          tone={isSuccess ? "success" : "destructive"}
        />
      }
    >
      {isSuccess ? (
        /* ================= SUKSES (Wireframe 9.5 Kasus A) ================= */
        <div className="space-y-4">
          <Alert variant="default" className="border-emerald-200 bg-emerald-50 text-emerald-900">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <AlertDescription className="text-xs">
              Terima kasih! Tiket Anda telah berhasil diterbitkan. Salinan konfirmasi dan e-tiket telah dikirimkan ke email terdaftar.
            </AlertDescription>
          </Alert>

          {/* E-Tiket Dashed Panel (Wireframe 9.5) */}
          <DashedPanel
            tone="highlight"
            className="space-y-3.5 border-emerald-300 bg-emerald-50/30 p-4"
          >
            <div className="flex items-center justify-between border-b border-dashed border-emerald-300 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Ticket className="size-4 text-emerald-700" />
                <span className="text-xs font-black tracking-wider text-emerald-950 uppercase">
                  E-Tiket Resmi
                </span>
              </div>
              <Badge
                variant="success"
                className="font-mono text-[11px] font-bold"
              >
                #{booking.id}-VALID
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Event</span>
                <p className="text-sm font-bold text-slate-900">
                  {booking.eventName}
                </p>
              </div>

              {event ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="size-3" /> Jadwal
                    </span>
                    <p className="font-semibold text-slate-800">
                      {formatDate(event.startsAt)}, {formatTime(event.startsAt)} WIB
                    </p>
                  </div>
                  <div>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-3" /> Lokasi
                    </span>
                    <p className="font-semibold text-slate-800">
                      {event.venue}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Kategori & Qty</span>
                  {booking.items.map((i) => (
                    <p key={i.categoryId} className="font-semibold text-slate-900">
                      {i.categoryName} ({i.qty} Tiket)
                    </p>
                  ))}
                </div>
                <div>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <User className="size-3" /> NIK Pemesan
                  </span>
                  <p className="font-mono font-semibold text-slate-900">
                    {maskedNik}
                  </p>
                </div>
              </div>

              <div className="border-t border-dashed border-emerald-200 pt-2">
                <SummaryRow
                  label="Total Terbayar"
                  value={formatRupiah(booking.totalAmount)}
                  emphasis={true}
                />
              </div>
            </div>

            {/* Barcode / QR Simulation Box */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-emerald-300 bg-white p-3 text-center">
              <QrCode className="size-20 text-slate-800" />
              <div className="mt-1.5 font-mono text-[11px] font-bold tracking-widest text-slate-700">
                ||| | |||| | ||| |||| | ||
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Tunjukkan QR ini di Gate Masuk pada hari H untuk ditukar wristband.
              </p>
            </div>
          </DashedPanel>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              className="w-full bg-emerald-600 font-bold hover:bg-emerald-700"
              size="lg"
              onClick={handleDownload}
            >
              <Download className="mr-2 size-4" />
              {isDownloaded
                ? "E-Tiket Berhasil Diunduh!"
                : "Lihat / Unduh E-Tiket (PDF)"}
            </Button>

            <Button
              variant="outline"
              className="w-full font-semibold"
              onClick={() => navigate(ROUTES.home)}
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      ) : (
        /* ================= EXPIRED (Wireframe 9.5 Kasus B) ================= */
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">
              Batas waktu pembayaran 10 menit telah terlampaui. Alokasi {totalTickets} tiket Anda telah dilepas kembali ke kuota sistem.
            </AlertDescription>
          </Alert>

          <DashedPanel
            tone="neutral"
            className="space-y-3 border-destructive/60 bg-destructive/5 p-4"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-destructive">
              Status Order: DIBATALKAN
            </h4>
            <p className="text-xs text-muted-foreground">
              Pemesanan Anda untuk event{" "}
              <strong className="text-foreground">{booking.eventName}</strong> sudah tidak berlaku.
            </p>
            <div className="rounded border bg-white p-2.5 text-xs space-y-1">
              <div>
                <span className="text-muted-foreground">Kategori: </span>
                <span className="font-semibold text-slate-800">
                  {booking.items.map((i) => `${i.categoryName} (${i.qty}x)`).join(", ")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total: </span>
                <span className="font-semibold text-slate-800">
                  {formatRupiah(booking.totalAmount)}
                </span>
              </div>
            </div>
          </DashedPanel>

          <div className="space-y-2 pt-2">
            <Button
              className="w-full font-bold"
              size="lg"
              onClick={() => navigate(ROUTES.home)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Kembali ke Beranda
            </Button>

            {event ? (
              <Button
                variant="outline"
                className="w-full font-semibold"
                onClick={() => navigate(ROUTES.waitingRoom(event.id))}
              >
                <RotateCcw className="mr-2 size-4" />
                Coba Antre Ulang Event Ini
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </ScreenCard>
  );
}
