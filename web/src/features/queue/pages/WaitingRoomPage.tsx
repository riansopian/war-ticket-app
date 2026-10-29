import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  Users,
  Zap,
} from "lucide-react";
import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { ErrorState } from "@/components/shared/AsyncStates";
import { useAsync } from "@/hooks/useAsync";
import { formatCountdown, formatRupiah } from "@/lib/format";
import { useQueue } from "../useQueue";

export function WaitingRoomPage() {
  const { eventId = "deploy-jumat-sore" } = useParams();
  const navigate = useNavigate();
  const { events } = useServices();

  const { data: event } = useAsync(() => events.get(eventId), [events, eventId]);
  const { status, error, rejoin } = useQueue(eventId);
  const [copiedToken, setCopiedToken] = React.useState(false);

  // Auto-redirect ke Booking begitu giliran tiba (FR-08)
  React.useEffect(() => {
    if (status?.state === "ADMITTED") {
      navigate(ROUTES.booking(eventId), { replace: true });
    }
  }, [status?.state, eventId, navigate]);

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorState message="Terjadi kendala pada antrean Anda." onRetry={rejoin} />
      </div>
    );
  }

  // Values matching Figma Screen 2
  const position = status?.position ?? 4790;
  const initialPosition = status?.initialPosition ?? 6000;
  const progressPercent = Math.min(
    100,
    Math.max(15, Math.round(((initialPosition - position) / initialPosition) * 100)),
  );
  const peopleAhead = Math.max(1, position - 1);
  const etaSeconds = status?.etaSeconds ?? 240; // 4 minutes
  const token = status?.token || "BK-99420-BOTANIC";
  const visitorsCount = status?.visitorsAheadText || "12.490";
  const rateSpeed = status?.rateSpeedText || "~75 tiket/menit";

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ================= BREADCRUMB & SESSION HEADER (Figma Screen 2) ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <span className="font-bold text-slate-900">FairQueue Botanical Engine v3.4</span>
          <span>/</span>
          <span>Lobby Antrean Virtual</span>
          <span>/</span>
          <span className="text-rose-600 font-semibold">Live Status</span>
        </div>

        <button
          onClick={handleCopyToken}
          className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors self-start sm:self-auto"
          title="Salin ID Sesi Antrean"
        >
          <span>ID Sesi: {token}</span>
          <Copy className="size-3 text-slate-400" />
          {copiedToken && <span className="text-emerald-600 text-[10px]">Tersalin!</span>}
        </button>
      </div>

      {/* ================= EVENT HEADER WITH LIVE VISITORS PILL ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-50 text-rose-700 px-2.5 py-0.5 text-[10px] font-extrabold uppercase border border-rose-200">
              WAR PRESALE AKTIF
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {event?.tourName || "Tur Musik Botani 2025"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {event?.name || "Deploy Jumat Sore Live 2025"}
          </h1>
          <p className="text-xs text-slate-500">
            Jumat, 24 Oktober 2025 • 18:30 WIB • {event?.venue || "Botanical Arena, Senayan, Jakarta"}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-mono font-bold text-slate-700 shrink-0">
          <Users className="size-4 text-rose-600" />
          <span>PENGUNJUNG DALAM ANTREAN:</span>
          <span className="text-rose-600 font-black">{visitorsCount}</span>
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </div>
      </div>

      {/* ================= MAIN RESPONSIVE TWO-COLUMN LAYOUT ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Queue Number, Progress & Stability (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Big Dark Queue Card (Figma Screen 2) */}
          <div className="relative overflow-hidden rounded-3xl bg-[#18191e] p-6 sm:p-8 text-white shadow-2xl border border-slate-800 space-y-6">
            {/* Subtle glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-rose-600/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-0 size-64 rounded-full bg-emerald-600/10 blur-3xl" />

            {/* Top Card Bar */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ANTREAN AKTIF
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <RefreshCw className="size-3.5 animate-spin text-rose-500" />
                Live Sync (3s)
              </span>
            </div>

            {/* Queue Number */}
            <div className="text-center py-2 space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Nomor Urut Antrean Anda
              </p>
              <div className="text-6xl sm:text-7xl font-black tracking-tight text-white font-mono drop-shadow-md">
                {position}
              </div>
              <p className="text-xs text-slate-300">
                Ada <span className="font-bold text-white">{peopleAhead.toLocaleString("id-ID")} orang</span> lagi di depan Anda
              </p>
            </div>

            {/* Two Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-center">
                <span className="flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <Clock className="size-3.5 text-rose-500" /> Estimasi Masuk
                </span>
                <p className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                  ~{formatCountdown(etaSeconds * 1000)}
                </p>
                <span className="text-[10px] text-slate-400">Menuju gerbang checkout</span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-center">
                <span className="flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <Zap className="size-3.5 text-emerald-400" /> Laju Kecepatan
                </span>
                <p className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                  {rateSpeed}
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold">Kapasitas Maksimal</span>
              </div>
            </div>

            {/* Progress Bar & Sub-row */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Status Laju Antrean:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {progressPercent}% Menuju Akses
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-emerald-400 transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>Mulai antre: 10:00:12</span>
                <span>Gerbang Checkout Siap: ~10:05:00</span>
              </div>
            </div>
          </div>

          {/* System Integrity Notification Box (Figma Screen 2) */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-950 shadow-sm">
            <ShieldAlert className="size-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs leading-relaxed">
              <p className="font-black text-rose-900 uppercase tracking-wide">
                Pemberitahuan Sistem Integritas:
              </p>
              <p className="text-rose-800">
                Jangan tutup atau refresh tab browser ini. Halaman akan dialihkan secara otomatis saat giliran Anda tiba. Sesi antrean terikat aman pada perangkat dan NIK Anda.
              </p>
            </div>
          </div>

          {/* Server Stability Graph Widget (Figma Screen 2) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-slate-700" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Laju Aliran Server Antrean
                </h4>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-black text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                99.8% STABIL
              </span>
            </div>

            {/* Simulated Live Traffic Visual Bars */}
            <div className="flex items-end justify-between gap-1.5 h-16 pt-2 px-1">
              {[40, 55, 70, 65, 80, 85, 90, 75, 88, 92, 85, 78, 95, 88, 92, 90, 85, 96, 92, 98].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${h}%`,
                    backgroundColor: i >= 17 ? "#10b981" : i > 10 ? "#e11d48" : "#cbd5e1",
                  }}
                  title={`Load: ${h}%`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Kapasitas Server Terdistribusi Normal</span>
              <span className="font-mono font-bold text-slate-700">0% Packet Loss</span>
            </div>
          </div>

          {/* Leave Queue Safely Link */}
          <div className="text-center pt-2">
            <Link
              to={ROUTES.home}
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="mr-1.5 size-3.5" />
              Tinggalkan antrean sementara & simpan di "Tiket Saya"
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Ticket Inventory & Queue Rules (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Card 1: Live Ticket Availability (Figma Screen 2) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="size-4 text-slate-700" />
                <h3 className="text-sm font-black text-slate-900">
                  Ketersediaan Tiket Live
                </h3>
              </div>
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider font-mono">
                LIVE INVENTORY
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Category 1: VIP Sunset Lounge */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-black text-slate-900">VIP Sunset Lounge</p>
                    <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-700">
                      Prioritas
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatRupiah(2450000)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 font-mono">
                    85 Sisa
                  </span>
                  <p className="text-[10px] text-slate-400">Kuota Terbatas</p>
                </div>
              </div>

              {/* Category 2: Festival Front Row */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs">
                <div>
                  <p className="font-black text-slate-900">Festival Front Row</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatRupiah(1350000)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 font-mono">
                    210 Sisa
                  </span>
                  <p className="text-[10px] text-slate-400">Standing Zone</p>
                </div>
              </div>

              {/* Category 3: Tribune Cat 1 */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs">
                <div>
                  <p className="font-black text-slate-900">Tribune Cat 1</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatRupiah(950000)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-600 font-mono">
                    240 Sisa
                  </span>
                  <p className="text-[10px] text-slate-400">Numbered Seating</p>
                </div>
              </div>

              {/* Category 4: Tribune Cat 2 (Sold out) */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs opacity-60">
                <div>
                  <p className="font-black text-slate-500 line-through">Tribune Cat 2</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {formatRupiah(650000)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-600 font-mono">
                    Habis
                  </span>
                  <p className="text-[10px] text-slate-400">Sold Out</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-1 leading-tight">
              Stok berkurang secara dinamis saat peserta antrean menyelesaikan checkout.
            </p>
          </div>

          {/* Card 2: Queue Rules & Fair Play (Figma Screen 2) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="size-4 text-slate-700" />
              <h3 className="text-sm font-black text-slate-900">
                Aturan Antrean & Reservasi
              </h3>
            </div>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Maksimal <strong>3 tiket</strong> per NIK terverifikasi dalam satu transaksi.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Waktu hold keranjang <strong>5 menit</strong> setelah giliran checkout tiba.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verifikasi data diri wajib sesuai KTP/e-KTP asli saat penukaran gelang.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Multi-tab otomatis didiskualifikasi oleh proteksi FairQueue™ bot-guard.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
