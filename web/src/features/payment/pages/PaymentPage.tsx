import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { ErrorState, LoadingState } from "@/components/shared/AsyncStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking, PaymentMethodId } from "@/domain/types";
import { useCountdown } from "@/hooks/useCountdown";
import { formatCountdown, formatRupiah } from "@/lib/format";

export function PaymentPage() {
  const { bookingId = "" } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { booking: bookingService, payment: paymentService } = useServices();

  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [selectedMethod, setSelectedMethod] =
    React.useState<PaymentMethodId>("VIRTUAL_ACCOUNT");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!bookingId) return;
    setIsLoading(true);
    setError(null);
    try {
      const b = await bookingService.get(bookingId);
      setBooking(b);
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
  }, [bookingId, bookingService, navigate]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExpire = React.useCallback(() => {
    if (bookingId) {
      navigate(ROUTES.paymentResult(bookingId), { replace: true });
    }
  }, [bookingId, navigate]);

  const { remainingMs } = useCountdown(booking?.paymentExpiresAt, handleExpire);

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

  const handleCopyVa = () => {
    const va = booking?.vaNumber || "8801 2398 4102 9312";
    navigator.clipboard.writeText(va.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <LoadingState label="Menyiapkan gateway pembayaran aman..." />;
  }

  if (error && !booking) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (!booking) return null;

  const vaNumberFormatted = booking.vaNumber || "8801 2398 4102 9312";
  const idempotencyKey = booking.idempotencyKey || "IDEM-PAY-9842F";
  const totalTickets = booking.items.reduce((acc, i) => acc + i.qty, 0);

  return (
    <div className="space-y-6">
      {/* ================= TOP SECURITY HEADER ================= */}
      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span className="text-xs font-black tracking-wide text-slate-900 uppercase">
            SECURE FLASH • Checkout Payment
          </span>
        </div>
        <Badge className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
          256-Bit SSL
        </Badge>
      </div>

      {/* Gateway Secure & Idempotency Bar */}
      <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2 text-white text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>GATEWAY SECURE SSL • Auto-verification enabled</span>
        </div>
        <span className="text-slate-400 font-bold">{idempotencyKey}</span>
      </div>

      {/* ================= SLOT KUOTA TERKUNCI BANNER (Figma Screen 4) ================= */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 shadow-sm space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <p className="text-xs font-black text-amber-950 uppercase tracking-wide">
              SLOT KUOTA TERKUNCI: Selesaikan sebelum tiket dirilis kembali
            </p>
            <p className="text-[11px] text-amber-800">
              Held Quota: Active • Auto-Release at 00:00
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-slate-950 px-3 py-1 font-mono text-base font-black text-amber-400">
            <Clock className="size-4" />
            <span>{formatCountdown(remainingMs)}</span>
          </div>
        </div>
      </div>

      {/* ================= RESPONSIVE LAYOUT (Web 2 Columns) ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Payment Methods & Instructions (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Method Selection (Figma Screen 4) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Pilih Metode Pembayaran
              </h3>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                • Bebas Biaya Admin
              </Badge>
            </div>

            {/* List Methods */}
            <div className="space-y-3">
              {/* Option 1: Virtual Account (BCA VA) */}
              <div
                onClick={() => setSelectedMethod("VIRTUAL_ACCOUNT")}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  selectedMethod === "VIRTUAL_ACCOUNT"
                    ? "border-amber-400 bg-amber-50/20 ring-1 ring-amber-400 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
                      <CreditCard className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          Virtual Account (BCA VA)
                        </h4>
                        <Badge className="bg-sky-100 text-sky-800 font-bold text-[9px]">
                          Tersambung API
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground pt-0.5">
                        Konfirmasi instan otomatis tanpa bukti transfer
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                      selectedMethod === "VIRTUAL_ACCOUNT"
                        ? "border-amber-500 bg-amber-500 text-slate-950"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedMethod === "VIRTUAL_ACCOUNT" && (
                      <Check className="size-3.5 stroke-[3]" />
                    )}
                  </div>
                </div>

                {/* Sub-panel VA Number & Step-by-Step Guide (when selected) */}
                {selectedMethod === "VIRTUAL_ACCOUNT" && (
                  <div className="mt-4 pt-4 border-t border-dashed border-amber-200 space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Nomor Virtual Account
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg font-black tracking-wider text-slate-950">
                          {vaNumberFormatted}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyVa}
                          className="h-8 gap-1 text-xs font-bold"
                        >
                          {copied ? (
                            <>
                              <Check className="size-3 text-emerald-600" /> Disalin!
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" /> Salin
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Step-by-step instructions */}
                    <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700 space-y-2">
                      <p className="font-bold text-slate-900">
                        Instruksi Pembayaran BCA VA:
                      </p>
                      <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                        <li>
                          Buka aplikasi <strong>m-BCA</strong> atau ATM BCA, pilih menu <strong>Transfer &gt; BCA Virtual Account</strong>.
                        </li>
                        <li>
                          Masukkan nomor VA <strong className="font-mono">{vaNumberFormatted.replace(/\s/g, "")}</strong> dan pastikan tagihan sebesar <strong className="text-amber-700">{formatRupiah(booking.totalAmount)}</strong>.
                        </li>
                        <li>
                          Konfirmasi dengan PIN Anda. Tiket diterbitkan otomatis dalam 5-10 detik.
                        </li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Instant QRIS */}
              <div
                onClick={() => setSelectedMethod("E_WALLET")}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  selectedMethod === "E_WALLET"
                    ? "border-amber-400 bg-amber-50/20 ring-1 ring-amber-400 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <QrCode className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          Instant QRIS
                        </h4>
                        <Badge className="bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                          AUTO
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Gopay, OVO, Dana, ShopeePay, LinkAja
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                      selectedMethod === "E_WALLET"
                        ? "border-amber-500 bg-amber-500 text-slate-950"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedMethod === "E_WALLET" && (
                      <Check className="size-3.5 stroke-[3]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Option 3: Kartu Kredit / Debit */}
              <div
                onClick={() => setSelectedMethod("BANK_TRANSFER")}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  selectedMethod === "BANK_TRANSFER"
                    ? "border-amber-400 bg-amber-50/20 ring-1 ring-amber-400 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                      <Smartphone className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Kartu Kredit / Debit Online
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Visa, Mastercard, JCB (3D Secure OTP)
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                      selectedMethod === "BANK_TRANSFER"
                        ? "border-amber-500 bg-amber-500 text-slate-950"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedMethod === "BANK_TRANSFER" && (
                      <Check className="size-3.5 stroke-[3]" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Garansi Anti-Dobel Bayar (Figma Screen 4) */}
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold">
              <ShieldCheck className="size-4" />
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900">Garansi Anti-Dobel Bayar</p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Kunci idempotensi transaksi aktif. Jangan tutup halaman ini jika Anda sedang menyelesaikan transfer di aplikasi perbankan.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Sticky Pay CTA (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            {/* Order Card Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  ORDER ID
                </span>
                <p className="font-mono font-bold text-slate-900 text-xs">
                  #{booking.code || booking.id}
                </p>
              </div>
              <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-[10px]">
                HOLD STOCK
              </Badge>
            </div>

            {/* Event & Customer Summary */}
            <div className="space-y-2.5 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 space-y-1">
                <p className="font-black text-slate-900 text-sm">
                  {booking.eventName}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {booking.tourName || "Sunset Sound Tour"} • {totalTickets} Tiket
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-700">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span className="font-bold">{booking.customerName}</span>
                  <span className="font-mono text-slate-400">({booking.nik})</span>
                </div>
              </div>

              {/* Rincian Tagihan */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                {booking.items.map((item) => (
                  <div
                    key={item.categoryId}
                    className="flex items-center justify-between text-slate-700"
                  >
                    <span>
                      {item.categoryName} ({item.qty}x)
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatRupiah(item.qty * item.unitPrice)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-slate-600">
                  <span>Pajak Hiburan & Daerah (10%)</span>
                  <span className="font-semibold text-slate-900">
                    {formatRupiah(booking.taxAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Biaya Layanan</span>
                  <span className="font-semibold text-slate-900">
                    {formatRupiah(booking.platformFee)}
                  </span>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-2.5 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Total Tagihan</span>
                  <span className="font-black text-base text-amber-600">
                    {formatRupiah(booking.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={handlePay}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm"
              >
                <ShieldCheck className="mr-1.5 size-4" />
                {isSubmitting ? "Memverifikasi Pembayaran..." : "Saya Sudah Bayar"}
              </Button>
              <p className="text-center text-[10px] text-muted-foreground">
                Sistem memverifikasi mutasi bank secara otomatis dalam 5-10 detik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
