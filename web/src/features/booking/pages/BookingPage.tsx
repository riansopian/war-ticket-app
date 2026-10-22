import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Lock,
  Minus,
  Plus,
} from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MAX_TICKETS_PER_ORDER } from "@/domain/rules";
import { useAsync } from "@/hooks/useAsync";
import { useCountdown } from "@/hooks/useCountdown";
import { formatCountdown, formatRupiah } from "@/lib/format";

export function BookingPage() {
  const { eventId = "deploy-jumat-sore" } = useParams();
  const navigate = useNavigate();
  const { events, booking: bookingService, queue } = useServices();

  const { data: categories } = useAsync(
    () => events.getCategories(eventId),
    [events, eventId],
  );

  const [bookingExpiresAt, setBookingExpiresAt] = React.useState<string>();
  const [nik, setNik] = React.useState("3171052809960002");
  const [customerName, setCustomerName] = React.useState("Budi Santoso");
  const [customerEmail, setCustomerEmail] = React.useState("budi.santoso@deployjumat.id");
  const [quantities, setQuantities] = React.useState<Record<string, number>>({
    "cat-1": 2, // default 2 tickets on CAT 1 Sunset Floor as in Figma
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Ambil queue status untuk membaca bookingExpiresAt otoritatif server
  React.useEffect(() => {
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

  // Price calculations matching Figma Screen 3
  const activeItems = (categories || [])
    .filter((c) => (quantities[c.id] || 0) > 0)
    .map((c) => ({
      category: c,
      qty: quantities[c.id] || 0,
      subtotal: (quantities[c.id] || 0) * c.price,
    }));

  const subtotal = activeItems.reduce((acc, i) => acc + i.subtotal, 0);
  const taxAmount = Math.round(subtotal * 0.1); // Pajak 10%
  const platformFee = totalQty > 0 ? 10000 : 0;
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
      {/* ================= TOP HEADER PILL BAR ================= */}
      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-black tracking-wide text-slate-900 uppercase">
            SESI TIKET AKTIF • Checkout Hold
          </span>
        </div>
        <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-[10px]">
          FASE FLASH DROP
        </Badge>
      </div>

      {/* ================= COUNTDOWN BANNER (Figma Screen 3) ================= */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 shadow-sm text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
          <Clock className="size-4 text-amber-600 animate-pulse" />
          <span>Sisa Waktu Sesi Pemilihan</span>
          <span className="rounded-md bg-slate-900 px-2.5 py-0.5 font-mono text-sm font-black text-amber-400">
            {formatCountdown(remainingMs)}
          </span>
        </div>
        <p className="text-[11px] text-amber-800">
          Sesi akan berakhir jika idle dalam 5 menit untuk menjaga keadilan antrean.
        </p>
      </div>

      {formError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs">{formError}</AlertDescription>
        </Alert>
      ) : null}

      {/* ================= RESPONSIVE LAYOUT (Web 2 Columns) ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Steps 1 & 2 (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* STEP 1: Identitas & Validasi NIK (Figma Screen 3) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-amber-500 font-black text-slate-950 text-xs">
                  1
                </span>
                <h3 className="text-sm font-black text-slate-900">
                  Identitas & Validasi NIK
                </h3>
              </div>
              <Badge className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                NFR-04 ATOMIC
              </Badge>
            </div>

            {/* Quota Banner */}
            <div className="flex items-center justify-between rounded-xl bg-amber-50/70 p-3 text-xs border border-amber-200">
              <span className="font-bold text-amber-950">
                KUOTA PER NIK (BR-01): Maks. 3 Tiket / NIK
              </span>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                • Sisa Kuota: 3
              </Badge>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* NIK Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Nomor Induk Kependudukan (NIK 16 Digit)
                  </label>
                  {isNikValid && (
                    <span className="flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                      <CheckCircle2 className="size-3.5" /> Format NIK Valid
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">
                  Nama Lengkap (Sesuai KTP)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">
                  Email Pengiriman Tiket
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Pilih Kategori Tiket (Figma Screen 3) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-amber-500 font-black text-slate-950 text-xs">
                  2
                </span>
                <h3 className="text-sm font-black text-slate-900">
                  Pilih Kategori Tiket
                </h3>
              </div>
              <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-[10px]">
                HOLD 10 MENIT
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Pilih kategori tiket yang tersedia:</span>
              <span className="font-bold text-slate-900">
                Tiket dipilih: {totalQty} dari maks. {MAX_TICKETS_PER_ORDER}
              </span>
            </div>

            {/* List Category Cards */}
            <div className="space-y-3">
              {(categories || []).map((cat) => {
                const qty = quantities[cat.id] || 0;
                const isSoldOut = cat.isSoldOut || cat.available <= 0;

                return (
                  <div
                    key={cat.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      qty > 0
                        ? "border-amber-400 bg-amber-50/20 shadow-sm ring-1 ring-amber-400"
                        : isSoldOut
                        ? "border-slate-200 bg-slate-50 opacity-60"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {cat.name}
                          </h4>
                          {cat.tag && (
                            <Badge
                              className={`text-[9px] font-bold ${
                                isSoldOut
                                  ? "bg-red-100 text-red-700 border-red-300"
                                  : cat.available < 50
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-emerald-100 text-emerald-800 border-emerald-300"
                              }`}
                            >
                              {cat.tag}
                            </Badge>
                          )}
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-muted-foreground">
                            {cat.description}
                          </p>
                        )}
                        <p className="text-xs font-black text-slate-900 pt-1">
                          HARGA PER TIKET{" "}
                          <span className="text-amber-600 text-sm">
                            {formatRupiah(cat.price)}
                          </span>
                        </p>
                      </div>

                      {/* Stepper / Sold Out Button */}
                      {isSoldOut ? (
                        <span className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500">
                          Habis Terjual
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={qty <= 0}
                            onClick={() => handleQtyChange(cat.id, -1)}
                            className="flex size-8 items-center justify-center rounded-lg border border-slate-300 bg-white font-bold text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-40"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-5 text-center font-mono text-sm font-black text-slate-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            disabled={totalQty >= MAX_TICKETS_PER_ORDER || qty >= cat.available}
                            onClick={() => handleQtyChange(cat.id, 1)}
                            className="flex size-8 items-center justify-center rounded-lg bg-amber-500 font-bold text-slate-950 shadow-sm hover:bg-amber-600 disabled:opacity-40"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Rincian Pembayaran & Sticky CTA (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-amber-500 font-black text-slate-950 text-xs">
                3
              </span>
              <h3 className="text-sm font-black text-slate-900">
                Rincian Pembayaran
              </h3>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2.5 text-xs">
              {activeItems.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  Belum ada tiket yang dipilih.
                </p>
              ) : (
                activeItems.map((item) => (
                  <div
                    key={item.category.id}
                    className="flex items-center justify-between text-slate-700"
                  >
                    <span>
                      {item.category.name} ({item.qty} Tiket)
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Pajak Hiburan & Daerah (10%)</span>
                <span className="font-semibold text-slate-900">
                  {formatRupiah(taxAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Biaya Layanan Gerbang Pembayaran</span>
                <span className="font-semibold text-slate-900">
                  {formatRupiah(platformFee)}
                </span>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-3">
                <div className="flex items-center justify-between text-sm font-black">
                  <span className="text-slate-900">Total Tagihan</span>
                  <span className="text-base text-amber-600">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Hold & Continue CTA Button */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || totalQty === 0 || !isNikValid}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm"
              >
                <Lock className="mr-1.5 size-4" />
                {isSubmitting
                  ? "Mengamankan Slot Kuota..."
                  : "Hold Stok & Lanjut Pembayaran (10 Mnt)"}
              </Button>
              <p className="text-center text-[10px] text-muted-foreground">
                Stok akan di-HOLD selama 10 menit setelah tombol ditekan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
