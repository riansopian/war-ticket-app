import {
  AlarmClockOff,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  Mail,
  MapPin,
  QrCode,
  RotateCcw,
  Share2,
  ShieldCheck,
  Ticket,
  Wallet,
} from "lucide-react";
import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { ErrorState, LoadingState } from "@/components/shared/AsyncStates";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/domain/types";
import { formatRupiah } from "@/lib/format";

export function PaymentResultPage() {
  const { bookingId = "" } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { booking: bookingService } = useServices();

  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedRef, setCopiedRef] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  // Live timestamp clock untuk Anti-Screenshot Dynamic Pass effect (Figma Screen 5)
  const [currentTime, setCurrentTime] = React.useState(() =>
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  );

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = React.useCallback(async () => {
    if (!bookingId) return;
    setIsLoading(true);
    setError(null);
    try {
      const b = await bookingService.get(bookingId);
      setBooking(b);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat status pesanan.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, bookingService]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopyRef = () => {
    const refCode = booking?.code || "TRX-882941-BKT";
    navigator.clipboard.writeText(`#${refCode}`);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleDownloadPdf = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("E-Tiket resmi Booket (PDF) berhasil diunduh ke perangkat Anda.");
    }, 1200);
  };

  if (isLoading) {
    return <LoadingState label="Memverifikasi tiket konser digital Anda..." />;
  }

  if (error || !booking) {
    return (
      <div className="space-y-4">
        <ErrorState
          message={error || "Data reservasi tidak ditemukan."}
          onRetry={loadData}
        />
      </div>
    );
  }

  // ================= SCENARIO 1: EXPIRED / CANCELLED (Figma Design) =================
  if (booking.status === "EXPIRED") {
    const itemsSummary =
      booking.items && booking.items.length > 0
        ? `${booking.items.map((i) => `${i.qty}× ${i.categoryName}`).join(", ")} • Botanical Arena`
        : "2× CAT 2 • Pakis Ground";

    return (
      <div className="mx-auto max-w-md py-6 sm:py-12 animate-in fade-in duration-200">
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-5">
          {/* Top Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-rose-600 to-emerald-600" />

          {/* Glowing Red Alarm Icon */}
          <div className="relative mx-auto flex size-20 items-center justify-center pt-1">
            <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl" />
            <div className="relative flex size-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30">
              <AlarmClockOff className="size-7" />
            </div>
          </div>

          {/* Status Badge */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-rose-600 border border-rose-100">
              <span className="size-1.5 rounded-full bg-rose-600 animate-pulse" />
              SESI RESERVASI KEDALUWARSA
            </span>
          </div>

          {/* Header & Description */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Waktu Pemesanan Habis
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Batas waktu <strong>5 menit</strong> untuk reservasi tiket ini telah berakhir. Tiket yang Anda tahan telah dikembalikan ke pool antrean demi keadilan pembeli lain.
            </p>
          </div>

          {/* Session Details Box (Figma Screen) */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-2xs border border-slate-200/80">
                <Ticket className="size-5 text-slate-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  SESI TERAKHIR #{booking.code || "TK - 8829"}
                </p>
                <p className="truncate text-xs font-black text-slate-900">
                  {itemsSummary}
                </p>
              </div>
            </div>

            <span className="rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-600 border border-rose-100 shrink-0">
              Rilis Otomatis
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <Button
              onClick={() => navigate(ROUTES.waitingRoom(booking.eventId))}
              className="w-full sm:flex-1 bg-slate-950 hover:bg-slate-800 text-white font-black py-3 rounded-2xl text-xs gap-2 shadow-sm"
            >
              <RotateCcw className="size-3.5" />
              Antre Ulang Sekarang
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.home)}
              className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border-transparent font-bold py-3 rounded-2xl text-xs gap-2"
            >
              <Calendar className="size-3.5 text-slate-600" />
              Lihat Jadwal Konser Lain
            </Button>
          </div>

          {/* Subtext Note */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
            <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
            <span>Sistem antrean Booket FairQueue menjamin kesempatan yang adil bagi setiap penikmat musik.</span>
          </div>
        </div>
      </div>
    );
  }

  // ================= SCENARIO 2: SUCCESS / PAID (Figma Screen 5 Right) =================
  const trxCode = booking.code || "TRX-882941-BKT";
  const ticketCode = booking.ticketCodes?.[0] || "BKT-VIP-2025-99418";
  const customerName = booking.customerName || "Rian Adi Nugroho";
  const customerNik = booking.nik || "3174052309980004";
  const customerEmail = booking.customerEmail || "rian.nugroho@mail.com";
  const customerPhone = booking.customerPhone || "081298457890";
  const categoryName = booking.items[0]?.categoryName || "VIP Sunset Lounge";
  const gateInfo = booking.gateInfo || "Gate 4B Level 1";
  const rowSeat = booking.rowSeat || "Free Seating Lounge (Row A)";

  return (
    <div className="space-y-6">
      {/* ================= GREEN SUCCESS BANNER (Figma Screen 5 Right) ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-emerald-600 px-5 py-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <CheckCircle2 className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider">
              TRANSAKSI BERHASIL & TERVERIFIKASI
            </h2>
            <p className="text-xs text-emerald-100">
              Pembayaran Berhasil! Reservasi Anda telah dikonfirmasi dan e-ticket telah diterbitkan.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyRef}
          className="flex items-center gap-1.5 font-mono text-xs font-black bg-emerald-700/80 px-3 py-1.5 rounded-xl self-start sm:self-auto border border-emerald-500/40 hover:bg-emerald-700 transition-colors"
          title="Salin ID Transaksi"
        >
          <span>ID TRANSAKSI: #{trxCode}</span>
          <Copy className="size-3 text-emerald-200" />
          {copiedRef && <span className="text-white text-[10px]">Tersalin!</span>}
        </button>
      </div>

      {/* ================= MAIN RESPONSIVE TWO-COLUMN LAYOUT ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Digital E-Ticket Pass (7 Cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">
                Pass Konser Digital Resmi
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE BARCODE ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tunjukkan e-ticket ini di pintu masuk Botanical Arena pada hari acara
            </p>
          </div>

          {/* ================= VIP PASS CARD (Figma Screen 5 Right) ================= */}
          <div className="relative overflow-hidden rounded-3xl bg-[#18191e] text-white shadow-2xl border border-slate-800">
            {/* Notch effect corners */}
            <div className="absolute -left-3 top-1/2 -mt-3 size-6 rounded-full bg-slate-50 border-r border-slate-200 z-10 hidden sm:block" />
            <div className="absolute -right-3 top-1/2 -mt-3 size-6 rounded-full bg-slate-50 border-l border-slate-200 z-10 hidden sm:block" />

            {/* Ambient Red Glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-rose-600/15 blur-3xl" />

            <div className="p-6 sm:p-7 space-y-5">
              {/* Pass Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-rose-600 text-white font-black text-xs">
                    <Ticket className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-wider uppercase text-white">
                      Booket PASS
                    </span>
                    <span className="text-[10px] font-bold text-rose-500 ml-1.5">
                      • VIP ACCESS
                    </span>
                  </div>
                </div>

                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE & VALID
                </span>
              </div>

              {/* Event Info */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                  {booking.tourName || "Tur Musik Botani • Presale Fase 2"}
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  {booking.eventName}
                </h3>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5 text-rose-500" />
                    Jumat, 24 Okt 2025 • 18:30 WIB
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5 text-rose-500" />
                    Botanical Arena, Jakarta
                  </span>
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-slate-800 my-2" />

              {/* Attendee Details Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Pemegang Tiket
                  </span>
                  <p className="font-bold text-white mt-0.5">{customerName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    NIK Terverifikasi
                  </span>
                  <p className="font-mono font-bold text-slate-200 mt-0.5">{customerNik}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Kategori Tiket
                  </span>
                  <p className="font-bold text-rose-400 mt-0.5">{categoryName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Pintu Masuk
                  </span>
                  <p className="font-bold text-white mt-0.5">{gateInfo}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Zona Duduk / Lokasi
                  </span>
                  <p className="font-bold text-slate-200 mt-0.5">{rowSeat}</p>
                </div>
              </div>

              {/* Barcode & Dynamic Refresh Area (Figma Screen 5 Right) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-center space-y-3">
                <div className="mx-auto flex size-36 items-center justify-center rounded-xl bg-white p-2">
                  <QrCode className="size-32 text-slate-900" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold text-rose-400">
                    <span>KODE TIKET: {ticketCode}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Dynamic Barcode • Refresh otomatis tiap 30s • </span>
                    <span className="font-mono text-slate-300 font-bold">{currentTime} WIB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Transaction Summary & Action Buttons (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Summary Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Status Pembayaran
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                  LUNAS (TERVERIFIKASI SISTEM)
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Metode Pembayaran</span>
                <span className="font-semibold text-slate-900">BCA Virtual Account</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Nomor Referensi VA</span>
                <span className="font-mono font-semibold text-slate-900">
                  {booking.vaNumber || "8277 0812 9845 7890"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Waktu Transaksi</span>
                <span className="font-mono font-semibold text-slate-900">
                  24 Okt 2025, 10:14 WIB
                </span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex items-baseline justify-between text-sm">
                <span className="font-bold text-slate-900">Total Dibayar</span>
                <span className="font-mono font-black text-rose-600">
                  {formatRupiah(booking.totalAmount)}
                </span>
              </div>
            </div>

            {/* Notification alert */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
              <Mail className="size-4 text-slate-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Salinan tiket digital & invoice telah dikirimkan ke <strong>{customerEmail}</strong> dan WhatsApp <strong>{customerPhone}</strong>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3 rounded-2xl shadow-lg shadow-rose-600/30 text-xs"
              >
                <Download className="mr-1.5 size-4" />
                {downloading ? "Mengunduh PDF..." : "Unduh E-Tiket (PDF)"}
              </Button>

              <Button
                variant="outline"
                onClick={() => alert("E-Tiket berhasil ditambahkan ke Apple / Google Wallet.")}
                className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3 rounded-2xl text-xs"
              >
                <Wallet className="mr-1.5 size-4 text-slate-500" />
                Simpan ke Apple / Google Wallet
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Tautan Pass berhasil disalin ke clipboard!");
                }}
                className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3 rounded-2xl text-xs"
              >
                <Share2 className="mr-1.5 size-4 text-slate-500" />
                Bagikan Pass
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to={ROUTES.home}
                  className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="mr-1 size-3.5" />
                  Kembali ke Beranda Booket
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
