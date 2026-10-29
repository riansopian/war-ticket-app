import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  DoorOpen,
  Info,
  MapPin,
  Search,
  ShieldCheck,
  Ticket,
  Zap,
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

  const [activeCategory, setActiveCategory] = React.useState("semua");
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: eventList, error, loading, reload } = useAsync(
    () => events.list(),
    [events],
  );

  const mainEvent =
    eventList?.find((e) => e.id === "deploy-jumat-sore") || eventList?.[0];

  const handleEnterWar = (eventId: string) => {
    navigate(ROUTES.waitingRoom(eventId));
  };

  return (
    <div className="space-y-8">
      {/* Alert Notice jika sesi expired atau dibatalkan */}
      {notice ? (
        <Alert
          variant="warning"
          className="border-rose-300 bg-rose-50 text-rose-950 shadow-sm"
        >
          <Info className="size-4 text-rose-600" />
          <AlertDescription className="text-xs font-semibold">
            {notice}
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Sesi "Your Queue" Aktif (Persistent Session Widget) */}
      <YourQueueSection />

      {/* Mobile Search Input (Visible on mobile only) */}
      <div className="relative md:hidden">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari konser, artis, atau venue..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
      </div>

      {loading && !eventList ? (
        <LoadingState label="Memuat katalog konser Booket..." />
      ) : null}

      {error ? (
        <ErrorState message="Gagal memuat event." onRetry={reload} />
      ) : null}

      {/* ================= HERO FLASH WAR CARD (Figma Screen 1) ================= */}
      {mainEvent ? (
        <div className="relative overflow-hidden rounded-3xl bg-[#18191e] text-white shadow-2xl border border-slate-800">
          {/* Subtle Ambient Red Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-rose-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 size-80 rounded-full bg-rose-950/30 blur-3xl" />

          <div className="relative p-6 sm:p-8 space-y-6">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-rose-400 border border-rose-500/30">
                  <span className="size-1.5 rounded-full bg-rose-500 animate-ping" />
                  FEATURED HEADLINE ACT
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] font-semibold text-slate-300 border border-slate-700">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  SISA KUOTA TERBUKA (&lt; 2.000 TIKET)
                </span>
              </div>
              <span className="rounded-full bg-slate-800/90 px-3 py-1 text-[11px] font-mono text-slate-300">
                Presale Fase 2
              </span>
            </div>

            {/* Main Content Grid: Event Meta & Real-time Sales Meter */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Title & Description (7 Cols) */}
              <div className="space-y-4 lg:col-span-7">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-500">
                    {mainEvent.tourName || "Tur Musik Botani 2025"}
                  </p>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase">
                    {mainEvent.name}
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  {mainEvent.description ||
                    "Panggung megah di bawah pepohonan rindang Botanical Garden. Nikmati 4 jam pertunjukan musik indie-folk terbaik tahun ini."}
                </p>

                {/* Event Highlights Info */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="size-4 text-rose-500 shrink-0" />
                    <span>Jumat, 24 Oktober 2025 • 18:30 WIB</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="size-4 text-rose-500 shrink-0" />
                    <span>{mainEvent.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-emerald-400">
                    <DoorOpen className="size-4 shrink-0" />
                    <span>Gate 4B Level 1 Open</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Real-Time Sales Meter Widget (5 Cols) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg backdrop-blur-md space-y-4 lg:col-span-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Real-time Sales Meter
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black font-mono text-white">
                      92% <span className="text-xs font-semibold text-slate-400">Terisi</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      22.080 / 24.000 Tiket
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-emerald-400 shadow-sm transition-all duration-1000 ease-out"
                      style={{ width: "92%" }}
                    />
                  </div>
                </div>

                {/* Categories Quota Badges */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                    <p className="text-[10px] text-slate-400">Festival A</p>
                    <p className="text-[11px] font-bold text-emerald-400">Tersedia</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                    <p className="text-[10px] text-slate-400">VIP Sunset</p>
                    <p className="text-[11px] font-bold text-rose-400">Habis</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                    <p className="text-[10px] text-slate-400">CAT 1 & 2</p>
                    <p className="text-[11px] font-bold text-amber-400">&lt; 350 Sisa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Price & Primary CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400">
                  Harga Tiket Mulai Dari
                </span>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl sm:text-2xl font-black text-white font-mono">
                    {formatRupiah(mainEvent.startingPrice || 650000)}
                  </p>
                  <span className="text-xs text-slate-400">/ tiket (Nett)</span>
                </div>
              </div>

              <div className="space-y-1.5 sm:text-right">
                <Button
                  onClick={() => handleEnterWar(mainEvent.id)}
                  className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-black px-7 py-3 rounded-2xl shadow-lg shadow-rose-600/30 group text-sm"
                >
                  Masuk Antrean War Tiket
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <p className="text-[11px] text-slate-400">
                  FairQueue Engine aktif • Batas 3 tiket per NIK
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ================= 3 VALUE PROPOSITIONS (Figma Screen 1) ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <ShieldCheck className="size-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">
              Jaminan Tiket 100% Asli
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Terverifikasi langsung oleh promotor resmi dengan enkripsi barcode anti-duplikasi dinamis.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
            <CheckCircle2 className="size-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">
              Verifikasi Cepat NIK
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Sistem terintegrasi otomatis untuk validasi NIK menghindari calo dan duplikasi antrean.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Zap className="size-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">
              Penerbitan E-Ticket Instan
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Setelah pembayaran sukses, e-ticket digital langsung terbit di akun dan dikirimkan via WhatsApp/Email.
            </p>
          </div>
        </div>
      </div>

      {/* ================= KONSER & EVENT LAINNYA (Figma Screen 1) ================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Konser & Event Lainnya
            </h3>
            <p className="text-xs text-muted-foreground">
              Pilihan konser terbaik yang akan segera hadir di Booket
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: "semua", label: "Semua Genre" },
              { id: "indie", label: "Indie Rock" },
              { id: "pop", label: "Pop" },
              { id: "jazz", label: "Jazz & Folk" },
              { id: "festival", label: "Festival" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 rounded-full px-3 py-1 font-bold transition-all ${
                  activeCategory === cat.id
                    ? "bg-slate-950 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Jakarta Indie Wave Festival */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="space-y-1">
              <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-[10px]">
                PRE-SALE HARI INI
              </Badge>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">
                Jakarta Indie Wave Festival 2025
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="size-3" />
                <span>Gelora Bung Karno, Senayan</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Mulai Dari</p>
                <p className="font-bold text-slate-900 text-xs font-mono">
                  {formatRupiah(250000)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-7 text-xs font-semibold px-2.5">
                  <Bell className="size-3 mr-1 text-slate-500" />
                  Ingatkan
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleEnterWar("deploy-jumat-sore")}
                  className="h-7 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-3"
                >
                  Pesan
                </Button>
              </div>
            </div>
          </div>

          {/* Card 2: Sound of Horizon */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="space-y-1">
              <Badge className="bg-sky-50 text-sky-700 border-sky-200 font-bold text-[10px]">
                JADWAL 18 NOV
              </Badge>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">
                Sound of Horizon 2025
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="size-3" />
                <span>JIExpo Kemayoran, Hall D</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Mulai Dari</p>
                <p className="font-bold text-slate-900 text-xs font-mono">
                  {formatRupiah(350000)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-7 text-xs font-semibold px-2.5">
                  <Bell className="size-3 mr-1 text-slate-500" />
                  Ingatkan
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleEnterWar("deploy-jumat-sore")}
                  className="h-7 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-3"
                >
                  Pesan
                </Button>
              </div>
            </div>
          </div>

          {/* Card 3: Sunset Symphony Tour */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="space-y-1">
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-bold text-[10px]">
                SEGERA HADIR
              </Badge>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">
                Sunset Symphony Tour 2025
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="size-3" />
                <span>Taman Ismail Marzuki (TIM)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Mulai Dari</p>
                <p className="font-bold text-slate-900 text-xs font-mono">
                  {formatRupiah(275000)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-7 text-xs font-semibold px-2.5">
                  <Bell className="size-3 mr-1 text-slate-500" />
                  Ingatkan
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleEnterWar("deploy-jumat-sore")}
                  className="h-7 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-3"
                >
                  Pesan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FAIRQUEUE BOT PROTECTION BANNER (Figma Screen 1) ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-zinc-900 p-6 text-white shadow-md">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <ShieldCheck className="size-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-black text-white text-base">
                FairQueue™ Bot Protection Aktif
              </h4>
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Sistem antrean kami didukung teknologi anti-bot mutakhir dan verifikasi NIK real-time untuk menjamin kesempatan yang adil bagi setiap pembeli tiket konser resmi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 text-xs font-bold"
          >
            Pelajari Mekanisme
          </Button>
          <Button
            size="sm"
            onClick={() => handleEnterWar("deploy-jumat-sore")}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
          >
            Cek Antrean Aktif
          </Button>
        </div>
      </div>

      {/* ================= BOOKET FOOTER ================= */}
      <footer className="border-t border-slate-200 pt-8 pb-4 text-xs text-slate-500 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-slate-950 text-rose-500 font-black">
                <Ticket className="size-4" />
              </div>
              <span className="font-black text-slate-900 text-sm">booket</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Platform war tiket dan manajemen antrean konser terpercaya di Indonesia dengan teknologi FairQueue™.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900">Layanan</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="#" className="hover:text-slate-900">Jadwal War Tiket</a></li>
              <li><a href="#" className="hover:text-slate-900">FairQueue System</a></li>
              <li><a href="#" className="hover:text-slate-900">Verifikasi NIK Resmi</a></li>
              <li><a href="#" className="hover:text-slate-900">E-Ticket Digital</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900">Bantuan & Regulasi</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="#" className="hover:text-slate-900">Pusat Bantuan</a></li>
              <li><a href="#" className="hover:text-slate-900">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-slate-900">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-slate-900">Anti-Calo Pledge</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900">Hubungi Promotor</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Email: support@booket.id<br />
              WhatsApp Helpdesk: 0812-9845-7890<br />
              Kawasan Senayan, Jakarta Pusat
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/80 pt-4 text-[11px] text-slate-400">
          <p>© 2025 Booket Entertainment Pte. Ltd. Hak Cipta Dilindungi.</p>
          <p className="font-mono">FairQueue™ v3.4 Engine • Protected by Cloudflare</p>
        </div>
      </footer>
    </div>
  );
}
