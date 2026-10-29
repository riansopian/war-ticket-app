import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { ErrorState, LoadingState } from "@/components/shared/AsyncStates";
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
  const [selectedBank, setSelectedBank] = React.useState("bca");
  const [activeAccordion, setActiveAccordion] = React.useState<"va" | "qris" | "cc">("va");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedVa, setCopiedVa] = React.useState(false);

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
    const va = booking?.vaNumber || "8277 0812 9845 7890";
    navigator.clipboard.writeText(va.replace(/\s/g, ""));
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  if (isLoading) {
    return <LoadingState label="Menyiapkan gateway pembayaran aman..." />;
  }

  if (error && !booking) {
    return (
      <div className="space-y-4">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  const vaNumber = booking?.vaNumber || "8277 0812 9845 7890";
  const grandTotal = booking?.totalAmount || 2710000;

  return (
    <div className="space-y-6">
      {/* ================= RED COUNTDOWN TOP BANNER (Figma Screen 4) ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-rose-600 px-5 py-3.5 text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <Clock className="size-5 shrink-0 text-white animate-pulse" />
          <div>
            <p className="text-xs sm:text-sm font-black uppercase tracking-wide">
              WAKTU RESERVASI TERBATAS
            </p>
            <p className="text-[11px] text-rose-100">
              Selesaikan transaksi sebelum batas waktu berakhir untuk mengamankan tiket Anda.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-sm font-black bg-rose-700/80 px-3 py-1.5 rounded-xl self-start sm:self-auto border border-rose-500/50">
          <span>SISA WAKTU:</span>
          <span>{formatCountdown(remainingMs)}</span>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-900">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* ================= MAIN RESPONSIVE TWO-COLUMN LAYOUT ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Payment Methods Accordion (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Metode Pembayaran
            </h2>
            <p className="text-xs text-slate-500">
              Pilih kanal pembayaran terverifikasi dengan konfirmasi otomatis 24/7
            </p>
          </div>

          {/* ================= METHOD 1: VIRTUAL ACCOUNT ================= */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => {
                setActiveAccordion("va");
                setSelectedMethod("VIRTUAL_ACCOUNT");
              }}
              className="flex w-full items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                  <Smartphone className="size-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    Virtual Account (Bank Transfer)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    BCA, Mandiri, BRI, BNI • Konfirmasi Instan Otomatis
                  </p>
                </div>
              </div>
              {activeAccordion === "va" ? (
                <ChevronUp className="size-5 text-slate-400" />
              ) : (
                <ChevronDown className="size-5 text-slate-400" />
              )}
            </button>

            {activeAccordion === "va" && (
              <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4">
                {/* Bank Selector Pills */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { id: "bca", label: "BCA VA", badge: "Utama" },
                    { id: "mandiri", label: "Mandiri", badge: null },
                    { id: "bri", label: "BRI VA", badge: null },
                    { id: "bni", label: "BNI VA", badge: null },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBank(b.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                        selectedBank === b.id
                          ? "border-rose-600 bg-white shadow-sm text-slate-950 ring-1 ring-rose-600"
                          : "border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span>{b.label}</span>
                      {b.badge && (
                        <span className="text-[9px] text-rose-600 font-extrabold mt-0.5">
                          {b.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Virtual Account Number Card (Figma Screen 4) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Nomor Virtual Account {selectedBank.toUpperCase()}</span>
                    <span className="text-[11px] font-bold text-emerald-600">Otomatis Aktif</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <span className="font-mono text-base sm:text-lg font-black tracking-wider text-slate-900">
                      {vaNumber}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyVa}
                      className="h-8 gap-1.5 text-xs font-bold border-slate-300"
                    >
                      {copiedVa ? (
                        <>
                          <Check className="size-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Transfer Steps */}
                  <div className="space-y-1.5 pt-1 text-[11px] text-slate-600">
                    <p className="font-bold text-slate-800">Petunjuk Pembayaran Cepat:</p>
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>Buka mobile banking atau ATM {selectedBank.toUpperCase()} Anda.</li>
                      <li>Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</li>
                      <li>Masukkan 16 digit nomor VA di atas.</li>
                      <li>Periksa nominal tagihan tepat <strong>{formatRupiah(grandTotal)}</strong>.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= METHOD 2: QRIS & E-WALLET ================= */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => {
                setActiveAccordion("qris");
                setSelectedMethod("QRIS");
              }}
              className="flex w-full items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <QrCode className="size-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    QRIS & Dompet Digital
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    GoPay, OVO, DANA, ShopeePay • 0% Biaya Tambahan
                  </p>
                </div>
              </div>
              {activeAccordion === "qris" ? (
                <ChevronUp className="size-5 text-slate-400" />
              ) : (
                <ChevronDown className="size-5 text-slate-400" />
              )}
            </button>

            {activeAccordion === "qris" && (
              <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center space-y-3">
                  <div className="mx-auto flex size-40 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-2">
                    <QrCode className="size-32 text-slate-800" />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Scan QRIS menggunakan aplikasi e-wallet apa pun
                  </p>
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                    Auto-Check Aktif • Real-Time Callback
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ================= METHOD 3: CREDIT / DEBIT CARD ================= */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => {
                setActiveAccordion("cc");
                setSelectedMethod("CREDIT_CARD");
              }}
              className="flex w-full items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    Kartu Kredit / Debit Online
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Visa, Mastercard, JCB, American Express (3D Secure)
                  </p>
                </div>
              </div>
              {activeAccordion === "cc" ? (
                <ChevronUp className="size-5 text-slate-400" />
              ) : (
                <ChevronDown className="size-5 text-slate-400" />
              )}
            </button>

            {activeAccordion === "cc" && (
              <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-3">
                <p className="text-xs text-slate-600">
                  Pembayaran kartu kredit diproses melalui payment gateway terenkripsi 256-bit dengan proteksi 3D Secure OTP.
                </p>
              </div>
            )}
          </div>

          {/* Real-time Verification Assurance */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs text-slate-600">
            <Zap className="size-5 text-emerald-600 shrink-0" />
            <p>
              <strong>Verifikasi Pembayaran Otomatis:</strong> Sistem kami mendeteksi mutasi secara real-time. Tidak perlu unggah bukti transfer manual.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Pay CTA (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="sticky top-20 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Ringkasan Pembayaran
                </h3>
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Menunggu Bayar
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2">
                {booking?.eventName || "Deploy Jumat Sore Live 2025"}
              </p>
              <p className="text-[11px] text-slate-400">
                Botanical Arena, Jakarta • 24 Okt 2025
              </p>
            </div>

            {/* Line items */}
            <div className="space-y-2 text-xs">
              {(booking?.items || []).map((item) => (
                <div
                  key={item.categoryId}
                  className="flex items-center justify-between text-slate-700 font-medium"
                >
                  <span>
                    {item.qty}x {item.categoryName}
                  </span>
                  <span className="font-mono font-bold">
                    {formatRupiah(item.qty * item.unitPrice)}
                  </span>
                </div>
              ))}

              <div className="border-t border-slate-100 pt-2 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Pajak Daerah (10%)</span>
                  <span className="font-mono">{formatRupiah(booking?.taxAmount || 245000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Biaya Layanan</span>
                  <span className="font-mono">{formatRupiah(booking?.platformFee || 15000)}</span>
                </div>
              </div>

              {/* Total Payment */}
              <div className="border-t border-slate-100 pt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    Total Pembayaran
                  </span>
                  <p className="text-[10px] text-slate-400">Nett terms</p>
                </div>
                <span className="text-xl font-black font-mono text-rose-600">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handlePay}
                disabled={isSubmitting}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-rose-600/30 group text-sm"
              >
                {isSubmitting ? (
                  "Mengonfirmasi Pembayaran..."
                ) : (
                  <>
                    Bayar Sekarang
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
              <p className="text-[10px] text-slate-400 text-center">
                Simulasi otomatis: Pembayaran langsung terverifikasi seketika
              </p>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Enkripsi 256-Bit SSL • Transaksi Dijamin Aman</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
