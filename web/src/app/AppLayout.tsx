import {
  Bell,
  Compass,
  Hourglass,
  Layers,
  Search,
  Ticket,
  User,
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { ROUTES } from "./routes";
import { DevTools } from "./DevTools";

export function AppLayout() {
  const location = useLocation();
  const path = location.pathname;

  // Active state checker
  const isHome = path === "/" || path.startsWith("/events") && !path.includes("/queue") && !path.includes("/booking");
  const isQueue = path.includes("/queue");
  const isOrder = path.includes("/booking") || path.includes("/pay");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-rose-100 selection:text-rose-900 pb-20 md:pb-12">
      {/* ================= DESKTOP TOP NAVBAR ================= */}
      <header className="sticky top-0 z-40 hidden border-b border-slate-200/90 bg-white/95 backdrop-blur-md md:block shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Brand Logo & Search */}
          <div className="flex items-center gap-6">
            <Link to={ROUTES.home} className="flex items-center gap-2.5 group">
              <div className="flex size-9 items-center justify-center rounded-xl bg-slate-950 font-black text-rose-500 shadow-md group-hover:scale-105 transition-transform">
                <Ticket className="size-5" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight text-slate-950">
                    booket
                  </span>
                  <span className="size-1.5 rounded-full bg-rose-600 animate-pulse" />
                </div>
                <p className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
                  CONCERT & QUEUE
                </p>
              </div>
            </Link>

            {/* Global Search Bar */}
            <div className="relative w-64 lg:w-80">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari konser, artis, atau venue..."
                className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-1.5 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 transition-all focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 text-xs font-bold">
            <Link
              to={ROUTES.home}
              className={`rounded-full px-4 py-1.5 transition-all ${
                isHome
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              Jelajahi Konser
            </Link>
            <Link
              to="/events/deploy-jumat-sore/queue"
              className={`rounded-full px-4 py-1.5 transition-all ${
                isQueue
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              Antrean Live
            </Link>
            <Link
              to="/events/deploy-jumat-sore/queue"
              className="rounded-full px-4 py-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-all"
            >
              Tiket Saya
            </Link>
            <a
              href="#bantuan"
              className="rounded-full px-4 py-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-all"
            >
              Bantuan
            </a>
          </nav>

          {/* Right side: Notification & User Profile */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative flex size-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-colors"
              title="Notifikasi"
            >
              <Bell className="size-4" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-rose-600 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white py-1 pl-1 pr-3.5 shadow-sm">
              <div className="flex size-7 items-center justify-center rounded-full bg-slate-900 text-rose-400 font-black text-xs">
                KM
              </div>
              <div className="text-left leading-none">
                <p className="font-bold text-xs text-slate-900">Kolektor Musik</p>
                <p className="text-[10px] font-semibold text-rose-600">VIP Member</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 py-2.5 backdrop-blur-md md:hidden shadow-sm">
        <Link to={ROUTES.home} className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-slate-950 text-rose-500 font-black">
            <Ticket className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-black tracking-tight text-slate-950">
                booket
              </span>
              <span className="size-1.5 rounded-full bg-rose-600 animate-pulse" />
            </div>
            <p className="text-[8px] font-extrabold tracking-widest text-slate-400 uppercase">
              CONCERT & QUEUE
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <Bell className="size-4" />
          </button>
          <div className="flex size-7 items-center justify-center rounded-full bg-slate-900 text-rose-400 font-bold text-xs">
            KM
          </div>
        </div>
      </header>

      {/* ================= MAIN RESPONSIVE CONTENT ================= */}
      <main className="mx-auto w-full max-w-md px-3.5 py-4 sm:max-w-xl md:max-w-4xl lg:max-w-7xl md:px-6 md:py-6">
        <Outlet />
      </main>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 py-2 backdrop-blur-md md:hidden">
        <Link
          to={ROUTES.home}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            isHome ? "text-rose-600" : "text-slate-400"
          }`}
        >
          <Compass className="size-4" />
          <span>Jelajahi</span>
        </Link>
        <Link
          to="/events/deploy-jumat-sore/queue"
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            isQueue ? "text-rose-600" : "text-slate-400"
          }`}
        >
          <Hourglass className="size-4" />
          <span>Antrean</span>
        </Link>
        <Link
          to="/events/deploy-jumat-sore/queue"
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            isOrder ? "text-rose-600" : "text-slate-400"
          }`}
        >
          <Layers className="size-4" />
          <span>Tiket Saya</span>
        </Link>
        <button
          type="button"
          onClick={() => {}}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400"
        >
          <User className="size-4" />
          <span>Akun</span>
        </button>
      </nav>

      {/* DevTools Drawer */}
      <DevTools />
    </div>
  );
}
