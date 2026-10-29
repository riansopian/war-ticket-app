import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Minus,
  Plus,
  ShieldCheck,
} from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MAX_TICKETS_PER_ORDER } from "@/domain/rules";
import { useAsync } from "@/hooks/useAsync";
import { useCountdown } from "@/hooks/useCountdown";
import { formatCountdown, formatRupiah } from "@/lib/format";
import { BookingExpiredModal } from "../components/BookingExpiredModal";

export function BookingPage() {
  const { eventId = "deploy-jumat-sore" } = useParams();
  const navigate = useNavigate();
  const { events, booking: bookingService, queue } = useServices();

  const { data: categories } = useAsync(
    () => events.getCategories(eventId),
    [events, eventId],
  );

  const [bookingExpiresAt, setBookingExpiresAt] = React.useState<string>();
  const [nik, setNik] = React.useState("3174052309980004");
  const [customerName, setCustomerName] = React.useState("Rian Adi Nugroho");
  const [customerEmail, setCustomerEmail] = React.useState("rian.nugroho@mail.com");
  const [customerPhone, setCustomerPhone] = React.useState("081298457890");
  const [agreed, setAgreed] = React.useState(true);
  const [quantities, setQuantities] = React.useState<Record<string, number>>({
    vip: 1, // Default 1x VIP Sunset Lounge as in Figma Screen 3 / Screen 5
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isExpired, setIsExpired] = React.useState(false);

  // Ambil queue status untuk membaca bookingExpiresAt
  React.useEffect(() => {
    queue.getStatus(eventId).then((s) => {
      if (s.state === "ADMITTED" && s.bookingExpiresAt) {
        setBookingExpiresAt(s.bookingExpiresAt);
      } else if (s.state === "EXPIRED") {
        setIsExpired(true);
      } else if (s.state === "NONE") {
        navigate(ROUTES.home, {
          replace: true,
          state: {
            notice: "Sesi antrean tidak aktif atau sudah berakhir. Silakan antre kembali.",
          },
        });
      }
    });
  }, [queue, eventId, navigate]);

  const handleExpire = () => {
    setIsExpired(true);
  };

  const { remainingMs } = useCountdown(bookingExpiresAt, handleExpire);

  // Quantity calculations
  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);
  const isNikValid = /^\d{16}$/.test(nik);

  const handleQtyChange = (catId: string, delta: number) => {
    const current = quantities[catId] || 0;
    const next = Math.max(0, current + delta);
    const newTotal = totalQty - current + next;
    if (newTotal > MAX_TICKETS_PER_ORDER) return;
    setQuantities((prev) => ({ ...prev, [catId]: next }));
  };

  // Price calculations matching Figma Screen 3 (Total Rp 2.710.000 for 1x VIP)
  const activeItems = (categories || [])
    .filter((c) => (quantities[c.id] || 0) > 0)
    .map((c) => ({
      category: c,
      qty: quantities[c.id] || 0,
      subtotal: (quantities[c.id] || 0) * c.price,
    }));

  const subtotal = activeItems.reduce((acc, i) => acc + i.subtotal, 0);
  const taxAmount = Math.round(subtotal * 0.1); // Pajak Daerah 10%
  const platformFee = totalQty > 0 ? 15000 : 0; // Biaya Layanan Rp 15.000
  const grandTotal = subtotal + taxAmount + platformFee;

  const handleSubmit = async () => {
    if (!isNikValid) {
      setFormError("NIK harus berupa 16 digit angka resmi.");
      return;
    }
    if (totalQty === 0) {
      setFormError("Pilih minimal 1 tiket untuk melanjutkan.");
      return;
    }
    if (!agreed) {
      setFormError("Anda harus menyetujui syarat & ketentuan sebelum melanjutkan.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const items = Object.entries(quantities)
        .filter(([, q]) => q > 0)
        .map(([categoryId, qty]) => ({ categoryId, qty }));
      const booking = await bookingService.create({
        eventId,
        nik,
        customerName,
        customerEmail,
        customerPhone,
        items,
      });
      navigate(ROUTES.payment(booking.id));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Gagal membuat reservasi tiket.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= RED COUNTDOWN TOP BANNER (Figma Screen 5 Left) ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <Clock className="size-5 shrink-0 text-white animate-pulse" />
          <p className="text-xs sm:text-sm font-bold">
            Sesi Pemesanan Diamankan. Tiket di dalam keranjang Anda ditahan sementara.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black bg-rose-700/80 px-3 py-1 rounded-xl border border-rose-500/50">
            <span>SISA WAKTU:</span>
            <span>{formatCountdown(remainingMs)}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpired(true)}
            className="text-[10px] font-bold text-rose-200 hover:text-white bg-rose-700/60 px-2 py-1 rounded-lg border border-rose-500/40 transition-colors"
            title="Simulasikan Waktu Pemesanan Habis"
          >
            Tes Expired
          </button>
        </div>
      </div>

      {/* ================= MODAL WAKTU PEMESANAN HABIS (Figma Design) ================= */}
      <BookingExpiredModal
        isOpen={isExpired}
        eventId={eventId}
        sessionCode="TK - 8829"
        itemsSummary={
          activeItems.length > 0
            ? `${activeItems.map((i) => `${i.qty}× ${i.category.name}`).join(", ")} • Botanical Arena`
            : "2× CAT 2 • Pakis Ground"
        }
        onClose={() => setIsExpired(false)}
      />

      {/* ================= ERROR ALERT ================= */}
      {formError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs font-semibold">
            {formError}
          </AlertDescription>
        </Alert>
      ) : null}

      {/* ================= MAIN RESPONSIVE GRID (2 Columns) ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Ticket Selection & Identity Verification (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* STEP 1: Pilih Kategori Tiket */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  1. Pilih Kategori Tiket
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih kategori tempat duduk atau festival favorit Anda
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
                Maksimal 3 Tiket
              </span>
            </div>

            <div className="space-y-3">
              {(categories || []).map((cat) => {
                const qty = quantities[cat.id] || 0;
                const isSoldOut = cat.available === 0;

                return (
                  <div
                    key={cat.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      qty > 0
                        ? "border-rose-600 bg-rose-50/20 shadow-sm"
                        : isSoldOut
                        ? "border-slate-200 bg-slate-50/60 opacity-60"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-sm">
                            {cat.name}
                          </h3>
                          {cat.id === "vip" && (
                            <span className="rounded bg-rose-100 px-2 py-0.5 text-[9px] font-black uppercase text-rose-700">
                              Prioritas
                            </span>
                          )}
                        </div>

                        <p className="font-mono text-base font-black text-slate-950">
                          {formatRupiah(cat.price)}
                        </p>

                        {cat.perks && (
                          <p className="text-[11px] text-slate-500 font-medium">
                            {cat.perks}
                          </p>
                        )}

                        <div className="pt-1">
                          {isSoldOut ? (
                            <span className="font-mono text-xs font-bold text-rose-600">
                              Habis Terjual (Sold Out)
                            </span>
                          ) : (
                            <span className="font-mono text-[11px] font-bold text-emerald-600">
                              Tersedia: {cat.available} Tiket
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper Quantity */}
                      {!isSoldOut ? (
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(cat.id, -1)}
                            disabled={qty === 0}
                            className="flex size-7 items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none shadow-xs transition-colors"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-5 text-center font-mono text-sm font-bold text-slate-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(cat.id, 1)}
                            disabled={totalQty >= MAX_TICKETS_PER_ORDER || cat.available <= qty}
                            className="flex size-7 items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none shadow-xs transition-colors"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500">
                          Habis
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Validasi Identitas Pemesan */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900">
                2. Validasi Identitas Pemesan
              </h2>
              <p className="text-xs text-slate-500">
                Pastikan data sesuai KTP/e-KTP asli untuk proses verifikasi tiket dan gate entry
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* NIK Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="nik" className="font-bold text-slate-800">
                    Nomor Induk Kependudukan (NIK)
                  </label>
                  {isNikValid && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <Check className="size-3" /> Terkoneksi Dukcapil
                    </span>
                  )}
                </div>
                <input
                  id="nik"
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                  placeholder="3174052309980004"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Nama Lengkap Input */}
              <div className="space-y-1.5">
                <label htmlFor="customerName" className="font-bold text-slate-800">
                  Nama Lengkap (Sesuai KTP)
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Rian Adi Nugroho"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Email & WhatsApp Inputs Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="customerEmail" className="font-bold text-slate-800">
                    Alamat Email (Untuk E-Ticket)
                  </label>
                  <input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="rian.nugroho@mail.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="customerPhone" className="font-bold text-slate-800">
                    Nomor WhatsApp Aktif
                  </label>
                  <input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="081298457890"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-[11px] text-slate-600 leading-relaxed">
                    Saya menyetujui syarat & ketentuan pemesanan tiket, kebijakan pembatalan, serta menjamin keabsahan data NIK yang didaftarkan.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Payment Summary (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="sticky top-20 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Rincian Pembayaran
              </h3>
              <p className="text-xs font-bold text-slate-700 mt-1">
                Deploy Jumat Sore Live 2025
              </p>
              <p className="text-[11px] text-slate-400">
                Botanical Arena, Jakarta • 24 Okt 2025
              </p>
            </div>

            {/* Selected Tickets Breakdown */}
            <div className="space-y-2 text-xs">
              {activeItems.length > 0 ? (
                activeItems.map((item) => (
                  <div
                    key={item.category.id}
                    className="flex items-center justify-between text-slate-700"
                  >
                    <span>
                      {item.qty}x {item.category.name}
                    </span>
                    <span className="font-mono font-bold">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">Belum ada tiket dipilih</p>
              )}

              {/* Tax & Fees */}
              <div className="border-t border-slate-100 pt-2 space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex items-center justify-between">
                  <span>Pajak Daerah (10%)</span>
                  <span className="font-mono font-semibold">
                    {formatRupiah(taxAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Biaya Layanan</span>
                  <span className="font-mono font-semibold">
                    {formatRupiah(platformFee)}
                  </span>
                </div>
              </div>

              {/* Total Tagihan */}
              <div className="border-t border-slate-100 pt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    Total Tagihan
                  </span>
                  <p className="text-[10px] text-slate-400">Termasuk pajak & biaya layanan</p>
                </div>
                <span className="text-xl font-black font-mono text-rose-600">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || totalQty === 0 || !isNikValid || !agreed}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3 rounded-2xl shadow-lg shadow-rose-600/30 group text-sm"
              >
                {isSubmitting ? "Memproses Reservasi..." : "Lanjut ke Pembayaran"}
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Button>
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
