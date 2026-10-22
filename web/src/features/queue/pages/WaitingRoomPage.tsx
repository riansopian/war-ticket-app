import {
  ArrowLeft,
  Clock,
  Hourglass,
  RefreshCw,
  ShieldCheck,
  Ticket,
  Zap,
} from "lucide-react";
import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { ErrorState } from "@/components/shared/AsyncStates";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/hooks/useAsync";
import { formatCountdown } from "@/lib/format";
import { useQueue } from "../useQueue";

export function WaitingRoomPage() {
  const { eventId = "deploy-jumat-sore" } = useParams();
  const navigate = useNavigate();
  const { events } = useServices();

  const { data: event } = useAsync(() => events.get(eventId), [events, eventId]);
  const { status, error, rejoin } = useQueue(eventId);

  // Auto-redirect ke Booking begitu giliran tiba (FR-08)
  React.useEffect(() => {
    if (status?.state === "ADMITTED") {
      navigate(ROUTES.booking(eventId), { replace: true });
    }
  }, [status?.state, eventId, navigate]);

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorState message="Terjadi kendala pada antrian Anda." onRetry={rejoin} />
      </div>
    );
  }

  // Fallback default values sesuai mockup Figma
  const position = status?.position ?? 4812;
  const initialPosition = status?.initialPosition ?? 5000;
  const progressPercent = Math.min(
    100,
    Math.max(10, Math.round(((initialPosition - position) / initialPosition) * 100)),
  );
  const formattedPosition = `#${String(position).padStart(5, "0").replace(/(\d{2})(\d{3})/, "$1.$2")}`;
  const peopleAhead = Math.max(1, position - 1);
  const etaSeconds = status?.etaSeconds ?? 132;
  const token = status?.token || "SEC-Q928-ACTIVE";

  return (
    <div className="space-y-6">
      {/* ================= TOP STATUS PILL BAR ================= */}
      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <Hourglass className="size-4 text-amber-500 animate-spin" />
          <span className="text-xs font-black tracking-wide text-slate-900 uppercase">
            Ruang Tunggu Tiket
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-600">
          <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>16 ms (STABLE)</span>
        </div>
      </div>

      {/* ================= EVENT HEADER CARD ================= */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-amber-700">
              WAR LIVE
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              {event?.tourName || "Sunset Sound Tour"}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            {event?.name || "Deploy Jumat Sore 2025"}
          </h2>
          <p className="text-xs text-muted-foreground">
            14 Des 2025 • {event?.venue || "Stadion Madya GBK"}
          </p>
        </div>
      </div>

      {/* ================= RESPONSIVE LAYOUT (2 Columns on Web) ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Queue Number & Stats (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Big Dark Queue Card (Figma Screen 2) */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-2xl border border-slate-800">
            {/* Ambient Background Lights */}
            <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-0 size-48 rounded-full bg-blue-600/15 blur-3xl" />

            <div className="relative space-y-5">
              {/* Token & Auto-refresh */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-1 text-[10px] font-bold text-slate-300 border border-slate-700">
                  <ShieldCheck className="size-3 text-emerald-400" />
                  TOKEN: {token}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <RefreshCw className="size-3 animate-spin text-amber-400" />
                  AUTO-REFRESH
                </span>
              </div>

              {/* Big Queue Number */}
              <div className="py-2 text-center space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Nomor Urut Antrean Anda
                </p>
                <div className="text-5xl sm:text-6xl font-black tracking-tight text-amber-400 font-mono drop-shadow-sm">
                  {formattedPosition}
                </div>
                <p className="text-xs font-medium text-slate-300">
                  Ada <span className="font-bold text-white">{peopleAhead} orang</span> lagi di depan Anda
                </p>
              </div>

              {/* Progress Bar & Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status Laju Masuk:</span>
                  <span className="font-bold text-emerald-400">
                    {progressPercent}% Menuju Akses
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center">
                  <span className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-slate-400">
                    <Clock className="size-3 text-amber-400" /> Estimasi Masuk
                  </span>
                  <p className="text-base sm:text-lg font-black font-mono text-white">
                    ~{formatCountdown(etaSeconds * 1000)}s
                  </p>
                  <span className="text-[10px] text-slate-400">Berdasarkan kuota aktif</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center">
                  <span className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-slate-400">
                    <Zap className="size-3 text-emerald-400" /> Laju Sistem
                  </span>
                  <p className="text-base sm:text-lg font-black font-mono text-white">
                    250 tkt/menit
                  </p>
                  <span className="text-[10px] text-emerald-400 font-medium">Trafik Stabil 99.8%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Auto Redirect Active Indicator (Figma Screen 2) */}
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 text-emerald-950 shadow-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Zap className="size-4 animate-pulse" />
            </div>
            <div className="space-y-0.5 text-xs">
              <p className="font-extrabold uppercase tracking-wide text-emerald-900">
                AUTO-REDIRECT AKTIF
              </p>
              <p className="text-emerald-800">
                Otomatis dialihkan saat giliran tiba. Tetap di layar ini!
              </p>
            </div>
          </div>

          {/* Leave Queue Safely */}
          <div className="text-center pt-1">
            <Link
              to={ROUTES.home}
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="mr-1 size-3.5" />
              Tinggalkan antrean sementara & simpan di "Your Queue"
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Ticket Availability & Rules (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Ketersediaan Tiket Terkini (LIVE SYNC) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="size-4 text-slate-700" />
                <h3 className="text-sm font-black text-slate-900">
                  Ketersediaan Tiket Terkini
                </h3>
              </div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                LIVE SYNC
              </span>
            </div>

            <div className="space-y-2.5">
              {/* VIP Sunset Lounge */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900">VIP Sunset Lounge</p>
                  <p className="text-[11px] text-muted-foreground">
                    Rp 1.850.000 • Seated Exclusive
                  </p>
                </div>
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[10px]">
                  Sisa 42 Tiket
                </Badge>
              </div>

              {/* CAT 1 Sunset Floor */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900">CAT 1 Sunset Floor</p>
                  <p className="text-[11px] text-muted-foreground">
                    Rp 950.000 • Standing Free Flow
                  </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                  Tersedia: 412
                </Badge>
              </div>

              {/* CAT 2 Tribune Seated */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900">CAT 2 Tribune Seated</p>
                  <p className="text-[11px] text-muted-foreground">
                    Rp 650.000 • Free Seating Center
                  </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                  Tersedia: 180
                </Badge>
              </div>

              {/* CAT 3 Tribune Upper (HABIS) */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs opacity-60">
                <div>
                  <p className="font-bold text-slate-900 line-through">CAT 3 Tribune Upper</p>
                  <p className="text-[11px] text-muted-foreground">
                    Rp 400.000 • Upper Level
                  </p>
                </div>
                <Badge variant="destructive" className="font-bold text-[10px]">
                  HABIS
                </Badge>
              </div>
            </div>
          </div>

          {/* Aturan Antrean & Sistem Masuk (Figma Screen 2) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3.5 text-xs">
            <h4 className="font-black text-slate-900 text-sm">
              Aturan Antrean & Sistem Masuk
            </h4>

            <div className="space-y-3 text-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700 text-[10px]">
                  !
                </span>
                <p>
                  <strong className="text-slate-900">Dilarang me-refresh atau menutup halaman.</strong> Sesi dan nomor antrian Anda akan hangus jika koneksi terputus.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">
                  1
                </span>
                <p>
                  <strong className="text-slate-900">Batas Pembelian:</strong> Setiap 1 Nomor Induk Kependudukan (NIK) resmi hanya berhak membeli maksimal <span className="font-bold text-slate-900">3 tiket</span>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">
                  2
                </span>
                <p>
                  <strong className="text-slate-900">Durasi Checkout 5 Menit:</strong> Saat tiba giliran, Anda diberikan jendela waktu 300 detik untuk memilih kategori tiket dan menyelesaikan validasi identitas.
                </p>
              </div>
            </div>

            {/* Hint Box: Siapkan KTP/Paspor */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-amber-900">
              <p className="font-bold">Siapkan KTP / Paspor Anda</p>
              <p className="text-[11px] text-amber-800">
                Sistem memeriksa format 16 digit NIK secara otomatis demi mencegah bot scalper.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
