import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Clock,
  Info,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { useServices } from "@/app/ServicesContext";
import { ErrorState, LoadingState } from "@/components/shared/AsyncStates";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YourQueueSection } from "@/features/session/YourQueueSection";
import { useAsync } from "@/hooks/useAsync";
import { formatRupiah } from "@/lib/format";

export function HomePage() {
  const { events } = useServices();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;

  const [activeCategory, setActiveCategory] = React.useState("live");
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: eventList, error, loading, reload } = useAsync(
    () => events.list(),
    [events],
  );

  const mainEvent = eventList?.find((e) => e.id === "deploy-jumat-sore") || eventList?.[0];

  const handleEnterWar = (eventId: string) => {
    navigate(ROUTES.waitingRoom(eventId));
  };

  return (
    <div className="space-y-6">
      {/* Alert Notice jika sesi expired */}
      {notice ? (
        <Alert variant="warning" className="border-amber-300 bg-amber-50 text-amber-900">
          <Info className="size-4 text-amber-600" />
          <AlertDescription className="text-xs font-semibold">{notice}</AlertDescription>
        </Alert>
      ) : null}

      {/* Sesi "Your Queue" Aktif (Persistent Session Widget) */}
      <YourQueueSection />

      {/* Search Bar & Filter Pills (Figma Screen 1) */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari konser, artis, atau venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 font-bold transition-all ${
              activeCategory === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveCategory("live")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-bold transition-all ${
              activeCategory === "live"
                ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            <span className="inline-block size-2 rounded-full bg-slate-950 animate-pulse" />
            War Hari Ini (Live)
          </button>
          <button
            onClick={() => setActiveCategory("pop")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 font-semibold transition-all ${
              activeCategory === "pop"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            Pop/Rock
          </button>
          <button
            onClick={() => setActiveCategory("indie")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 font-semibold transition-all ${
              activeCategory === "indie"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            Indie
          </button>
        </div>
      </div>

      {loading && !eventList ? (
        <LoadingState label="Memuat event flash war..." />
      ) : null}

      {error ? (
        <ErrorState message="Gagal memuat event." onRetry={reload} />
      ) : null}

      {/* ================= HERO FLASH WAR CARD (Figma Screen 1) ================= */}
      {mainEvent ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-zinc-950 text-white shadow-xl shadow-slate-900/10 border border-slate-800">
          {/* Background Ambient Glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 size-64 rounded-full bg-orange-600/10 blur-3xl" />

          <div className="relative p-5 sm:p-6 space-y-4">
            {/* Top Badges */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-red-400 border border-red-500/30">
                  <span className="size-1.5 rounded-full bg-red-400 animate-ping" />
                  FLASH WAR AKTIF
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300 border border-amber-500/30">
                  HIGH TRAFFIC
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="size-3" /> 14 Des 2025 • 18:30 WIB
              </span>
            </div>

            {/* Event Title & Venue */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {mainEvent.name}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <MapPin className="size-3.5 text-amber-400 shrink-0" />
                <span>{mainEvent.venue}</span>
              </div>
            </div>

            {/* Metrics Info Grid */}
            <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs backdrop-blur-sm">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                  Kapasitas Antrean
                </span>
                <p className="font-bold text-slate-200">
                  {mainEvent.capacityPerMin || "~1.200 org/mnt"}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                  Sisa Kuota Terbuka
                </span>
                <p className="font-bold text-amber-400">
                  {mainEvent.remainingTicketsText || "2.100 tiket (Tersisa 32%)"}
                </p>
              </div>
            </div>

            {/* Price & CTA Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                  Mulai Dari
                </span>
                <p className="text-base sm:text-lg font-black text-white">
                  {formatRupiah(mainEvent.startingPrice || 400000)}
                </p>
              </div>

              <Button
                onClick={() => handleEnterWar(mainEvent.id)}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 group"
              >
                Masuk War Tiket
                <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Security Protection Banner (Figma Screen 1) */}
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
          <ShieldCheck className="size-5" />
        </div>
        <div className="space-y-0.5 text-xs">
          <h4 className="font-bold text-slate-900">
            Sistem Proteksi Anti-Calo & Bot Aktif
          </h4>
          <p className="text-slate-600 leading-relaxed">
            1 NIK maksimal 3 tiket. Antrean virtual dilengkapi verifikasi reCAPTCHA v3 & auto-release hold 10 menit.
          </p>
        </div>
      </div>

      {/* ================= JADWAL WAR MENDATANG (Figma Screen 1) ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="size-4 text-slate-700" />
            <h3 className="text-sm font-black text-slate-900">
              Jadwal War Mendatang
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            LIVE SYNC
          </span>
        </div>

        {/* Card 1: Indie Soundscape */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-1">
            <Badge className="bg-sky-50 text-sky-700 border-sky-200 font-bold text-[10px]">
              SCHEDULED • BESOK
            </Badge>
            <h4 className="font-bold text-slate-900 text-sm">
              Indie Soundscape Festival 2025
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="size-3" />
              <span>Tennis Indoor Senayan, Jakarta</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-700">
              War Buka: 18:00 WIB
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-mono font-bold text-amber-400">
              23 : 45 : 10
            </div>
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              <Bell className="mr-1 size-3.5 text-amber-500" />
              Ingatkan
            </Button>
          </div>
        </div>

        {/* Card 2: Java Rock Wave */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-1">
            <Badge className="bg-sky-50 text-sky-700 border-sky-200 font-bold text-[10px]">
              SCHEDULED • 18 NOV
            </Badge>
            <h4 className="font-bold text-slate-900 text-sm">
              Java Rock Wave 2025
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="size-3" />
              <span>JIExpo Kemayoran Open Space</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-700">
              War Buka: 18 Nov, 12:00 WIB
            </p>
          </div>

          <Button variant="outline" size="sm" className="text-xs font-semibold self-start sm:self-auto">
            <Bell className="mr-1 size-3.5 text-amber-500" />
            Ingatkan
          </Button>
        </div>
      </div>

      {/* ================= TIKET TELAH TERJUAL (Figma Screen 1) ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="size-4 text-slate-400" />
            <h3 className="text-sm font-black text-slate-900">
              Tiket Telah Terjual
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ARSIP WAR
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm opacity-80">
          <div className="space-y-1">
            <Badge variant="destructive" className="font-bold text-[10px]">
              SOLD OUT • HABIS DLM 4 MENIT
            </Badge>
            <h4 className="font-bold text-slate-900 text-sm">
              The Sunset Acoustic Sessions
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="size-3" />
              <span>Taman Ismail Marzuki (TIM), Jakarta</span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px]">
              <span className="line-through text-slate-400">Kuota: 1.500 Tiket</span>
              <span className="font-bold text-red-600">100% TERJUAL</span>
            </div>
          </div>

          <Button disabled variant="outline" size="sm" className="text-xs font-bold self-start sm:self-auto">
            <Lock className="mr-1 size-3.5" />
            Tiket Habis (Sold Out)
          </Button>
        </div>
      </div>
    </div>
  );
}
