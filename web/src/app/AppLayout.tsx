import {
  Flame,
  Hourglass,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  User,
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { ROUTES } from "./routes";
import { DevTools } from "./DevTools";

export function AppLayout() {
  const location = useLocation();
  const path = location.pathname;

  // Active state checker for bottom nav
  const isHome = path === "/" || path.startsWith("/events");
  const isQueue = path.includes("/queue");
  const isOrder = path.includes("/booking") || path.includes("/pay");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-amber-100 selection:text-amber-900 pb-20 md:pb-12">
      {/* ================= DESKTOP TOP NAVBAR ================= */}
      <header className="sticky top-0 z-40 hidden border-b border-slate-200/80 bg-white/90 backdrop-blur-md md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          {/* Logo & City */}
          <div className="flex items-center gap-6">
            <Link to={ROUTES.home} className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 font-extrabold text-white shadow-md shadow-amber-500/20">
                <Ticket className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black tracking-tight text-slate-900">
                    DEPLOY JUMAT SORE
                  </span>
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    LIVE
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="size-3 text-slate-400" />
                  <span>Jakarta, ID (GBK Complex)</span>
                </div>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1 pl-4 text-xs font-semibold">
              <Link
                to={ROUTES.home}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  isHome && !isQueue
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                War Tiket
              </Link>
              <Link
                to="/events/deploy-jumat-sore/queue"
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  isQueue
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Ruang Tunggu
              </Link>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <span className="inline-block size-2 animate-pulse rounded-full bg-emerald-500" />
                SISTEM SIAP • 99.98%
              </span>
            </nav>
          </div>

          {/* Right side: Security & Profile */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-[11px] text-slate-600">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>SECURE FLASH 256-BIT</span>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                BS
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900 leading-tight">
                  Budi Santoso
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  31710528****0002
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <Link to={ROUTES.home} className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500 text-white font-bold">
            <Ticket className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-black tracking-tight text-slate-900">
                DEPLOY JUMAT SORE
              </span>
              <span className="rounded-full bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-700">
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MapPin className="size-2.5" />
              <span>Jakarta, ID (GBK)</span>
              <span className="text-emerald-600 font-bold">• SIAP 99.98%</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            BS
          </div>
        </div>
      </header>

      {/* ================= MAIN RESPONSIVE CONTENT ================= */}
      <main className="mx-auto w-full max-w-md px-3.5 py-4 sm:max-w-lg md:max-w-4xl lg:max-w-6xl md:px-6 md:py-8">
        <Outlet />
      </main>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 py-2 backdrop-blur md:hidden">
        <Link
          to={ROUTES.home}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            isHome && !isQueue ? "text-amber-600" : "text-slate-400"
          }`}
        >
          <Flame className="size-4" />
          <span>War Tiket</span>
        </Link>
        <Link
          to="/events/deploy-jumat-sore/queue"
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            isQueue ? "text-amber-600" : "text-slate-400"
          }`}
        >
          <Hourglass className="size-4" />
          <span>Antrean</span>
        </Link>
        <Link
          to={ROUTES.home}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            isOrder ? "text-amber-600" : "text-slate-400"
          }`}
        >
          <ShoppingBag className="size-4" />
          <span>Pesanan</span>
        </Link>
        <button
          type="button"
          onClick={() => {}}
          className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400"
        >
          <User className="size-4" />
          <span>Profil</span>
        </button>
      </nav>

      {/* DevTools Drawer */}
      <DevTools />
    </div>
  );
}
