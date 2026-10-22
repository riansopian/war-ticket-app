import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Info,
  Mail,
  MapPin,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Ticket,
} from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { ErrorState, LoadingState } from "@/components/shared/AsyncStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking, Event } from "@/domain/types";
import { formatRupiah } from "@/lib/format";

export function PaymentResultPage() {
  const { bookingId = "" } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { booking: bookingService, events: eventService } = useServices();

  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [event, setEvent] = React.useState<Event | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedRef, setCopiedRef] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  // Live timestamp clock untuk Anti-Screenshot Pass effect (Figma Screen 5)
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

  const handleCopyRef = () => {
    const refCode = `#BKS-${booking?.code || "DJS-2025-99214"}`;
    navigator.clipboard.writeText(refCode);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleDownloadPdf = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("E-Tiket resmi dalam format PDF berhasil diunduh ke perangkat Anda.");
    }, 1500);
  };

  const handleResendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  if (isLoading) {
    return <LoadingState label="Memeriksa status e-tiket resmi Anda..." />;
  }

  if (error || !booking) {
    return (
      <ErrorState
        message={error || "Booking tidak ditemukan."}
        onRetry={loadData}
      />
    );
  }

  const isSuccess = booking.status === "PAID";
  const userNik = booking.nik || "3171052809960002";
  const maskedNik =
    userNik.length === 16
      ? `${userNik.slice(0, 8)}****${userNik.slice(12)}`
      : userNik;
  const totalTickets = booking.items.reduce((acc, i) => acc + i.qty, 0);
  const bookingRef = `#BKS-${booking.code || "DJS-2025-99214"}`;
  const customerEmail = booking.customerEmail || "budi.santoso@deployjumat.id";
  const ticketCodes = booking.ticketCodes || [
    "DJS-CAT1-584210",
    "DJS-CAT1-584211",
  ];

  return (
    <div className="space-y-6">
      {/* ================= TOP SECURITY HEADER ================= */}
      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span className="text-xs font-black tracking-wide text-slate-900 uppercase">
            SECURE FLASH • E Ticket View
          </span>
        </div>
        <Badge className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
          256-Bit SSL
        </Badge>
      </div>

      {isSuccess ? (
        /* ================= SUKSES (Figma Screen 5) ================= */
        <div className="space-y-6">
          {/* Header Banner: Lunas & Verified Order */}
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm border border-slate-200 space-y-2">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700">
                • LUNAS • VERIFIED ORDER
              </span>
              <h2 className="text-2xl font-black text-slate-950">
                E-Tiket Diterbitkan!
              </h2>
              <p className="text-xs text-muted-foreground">
                Bukti transaksi & e-tiket resmi telah dikirim ke{" "}
                <strong className="text-slate-800">{customerEmail}</strong>
              </p>
            </div>

            {/* Booking Ref Pill */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-1.5 border border-slate-200 text-xs font-mono">
                <span className="text-muted-foreground">Booking Ref:</span>
                <span className="font-bold text-slate-900">{bookingRef}</span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="text-slate-500 hover:text-slate-900"
                >
                  {copiedRef ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ================= CONCERT PASS CARD (Figma Screen 5) ================= */}
          <div className="mx-auto max-w-xl overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl border border-slate-800 relative">
            {/* Ambient Background Lights */}
            <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-0 size-48 rounded-full bg-blue-600/15 blur-3xl" />

            <div className="relative p-6 space-y-5">
              {/* Pass Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
                    <Ticket className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      CONCERT PASS
                    </span>
                    <h3 className="text-base font-black text-white">
                      {booking.eventName}
                    </h3>
                  </div>
                </div>
                <Badge className="bg-amber-400 text-slate-950 font-black text-xs">
                  {totalTickets} TIKET
                </Badge>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Calendar className="size-3" /> Waktu Pertunjukan
                  </span>
                  <p className="font-bold text-slate-100 pt-0.5">
                    Min, 14 Des 2025
                  </p>
                  <p className="text-[11px] text-slate-400">
                    18:30 WIB (Pintu Buka 15:00)
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <MapPin className="size-3" /> Lokasi & Gate
                  </span>
                  <p className="font-bold text-slate-100 pt-0.5">
                    Stadion Madya GBK
                  </p>
                  <p className="text-[11px] text-amber-400 font-semibold">
                    Gate B (Pintu Selatan)
                  </p>
                </div>
              </div>

              {/* Category & Holder Details */}
              <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Kategori Tiket
                  </span>
                  {booking.items.map((i) => (
                    <div key={i.categoryId} className="pt-0.5">
                      <p className="font-bold text-amber-400">{i.categoryName}</p>
                      <p className="text-[10px] text-slate-400">Free Standing Area</p>
                    </div>
                  ))}
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    Pemegang Tiket
                  </span>
                  <p className="font-bold text-slate-100 pt-0.5">
                    {booking.customerName || "Budi Santoso"}
                  </p>
                  <p className="font-mono text-[11px] text-slate-400">
                    NIK: {maskedNik}
                  </p>
                </div>
              </div>

              {/* Dynamic Anti-Screenshot Live Clock Banner (Figma Screen 5) */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-2 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>ACTIVE ANTI-SCREENSHOT PASS</span>
                  <span>•</span>
                  <span>{currentTime} WIB</span>
                </div>
              </div>

              {/* Barcode & QR Code Center Box */}
              <div className="rounded-2xl bg-white p-5 text-center space-y-2 text-slate-900 shadow-inner">
                <div className="mx-auto flex size-44 items-center justify-center rounded-xl bg-slate-50 p-2">
                  <QrCode className="size-40 text-slate-950" />
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    TICKET CODES
                  </span>
                  <div className="flex items-center justify-center gap-2 font-mono text-xs font-extrabold text-slate-800">
                    {ticketCodes.map((code) => (
                      <span
                        key={code}
                        className="rounded bg-slate-100 px-2 py-0.5 border border-slate-200"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 pt-1">
                  Tingkatkan kecerahan layar hp Anda saat mendekati pintu scanner.
                </p>
              </div>

              {/* Wallet Buttons (Figma Screen 5) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => alert("Menambahkan e-tiket ke Apple Wallet...")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <Smartphone className="size-4" />
                  <span>Apple Wallet</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert("Menyimpan e-tiket ke Google Wallet...")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <Smartphone className="size-4 text-emerald-400" />
                  <span>Google Wallet</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= KETENTUAN MASUK KONSER (Figma Screen 5) ================= */}
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Info className="size-4 text-slate-700" />
                <h4 className="text-sm font-black text-slate-900">
                  Ketentuan Masuk Konser
                </h4>
              </div>
              <Badge className="bg-red-100 text-red-800 border-red-200 font-bold text-[10px]">
                WAJIB BACA
              </Badge>
            </div>

            <div className="space-y-3 text-slate-700">
              <div className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 font-bold text-xs">
                  1
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">
                    Validasi Identitas Resmi (KTP/Passport)
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Nama pada tiket harus cocok dengan kartu identitas asli Budi Santoso saat scan di pintu turnstile.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 font-bold text-xs">
                  2
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">
                    Penukaran Wristband Gelang
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    12 - 14 Desember 2025 di Plaza Barat Stadion Utama GBK Senayan (Pukul 10:00 - 19:00 WIB).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700 font-bold text-xs">
                  !
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Barang yang Dilarang</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Dilarang membawa kamera DSLR/mirrorless, tongsis/monopod, korek api, botol kaca, payung runcing, dan senjata tajam.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= ACTION BUTTONS (Figma Screen 5) ================= */}
          <div className="mx-auto max-w-xl space-y-3">
            <Button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 text-sm"
            >
              <Download className="mr-2 size-4" />
              {downloading ? "Mengunduh PDF..." : "Unduh E-Tiket PDF (Resmi)"}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleResendEmail}
                className="font-bold text-xs"
              >
                <Mail className="mr-1.5 size-3.5" />
                {emailSent ? "Email Terkirim!" : "Kirim Ulang Email"}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.home)}
                className="font-bold text-xs"
              >
                <ArrowLeft className="mr-1.5 size-3.5" />
                Ke Beranda
              </Button>
            </div>

            <p className="text-center text-[11px] text-slate-400 pt-1">
              Butuh bantuan terkait tiket Anda? Hubungi{" "}
              <a href="#" className="font-bold text-slate-600 underline">
                TiketCare DJS
              </a>
            </p>
          </div>
        </div>
      ) : (
        /* ================= EXPIRED (Figma Kasus B) ================= */
        <div className="mx-auto max-w-xl space-y-4">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="size-6" />
            </div>
            <h2 className="text-xl font-black text-red-950">
              Waktu Pembayaran Habis!
            </h2>
            <p className="text-xs text-red-800 leading-relaxed">
              Batas waktu pembayaran 10 menit telah terlampaui. Alokasi {totalTickets} tiket Anda telah dilepas kembali ke kuota sistem untuk peserta antrian berikutnya.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 text-xs">
            <p className="font-bold text-slate-900">
              Event: {booking.eventName}
            </p>
            <div className="space-y-1 text-slate-600">
              <div>
                <span>Kategori: </span>
                <span className="font-bold text-slate-800">
                  {booking.items.map((i) => `${i.categoryName} (${i.qty}x)`).join(", ")}
                </span>
              </div>
              <div>
                <span>Total Tagihan: </span>
                <span className="font-bold text-slate-800">
                  {formatRupiah(booking.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full font-black text-xs"
              onClick={() => navigate(ROUTES.home)}
            >
              Kembali ke Beranda
            </Button>
            {event && (
              <Button
                variant="outline"
                className="w-full font-bold text-xs"
                onClick={() => navigate(ROUTES.waitingRoom(event.id))}
              >
                <RotateCcw className="mr-1.5 size-3.5" />
                Coba Antre Ulang Event Ini
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
