import {
  AlarmClockOff,
  Calendar,
  RotateCcw,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "@/app/routes";
import { Button } from "@/components/ui/button";

interface BookingExpiredModalProps {
  isOpen: boolean;
  eventId: string;
  sessionCode?: string;
  itemsSummary?: string;
  onClose?: () => void;
}

export function BookingExpiredModal({
  isOpen,
  eventId,
  sessionCode = "TK - 8829",
  itemsSummary = "2× CAT 2 • Pakis Ground",
  onClose,
}: BookingExpiredModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRequeue = () => {
    if (onClose) onClose();
    navigate(ROUTES.waitingRoom(eventId));
  };

  const handleGoHome = () => {
    if (onClose) onClose();
    navigate(ROUTES.home);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
        {/* Top Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-rose-600 to-emerald-600" />

        {/* Ambient Glowing Red Icon */}
        <div className="relative mx-auto flex size-20 items-center justify-center pt-1">
          <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl" />
          <div className="relative flex size-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30">
            <AlarmClockOff className="size-7" />
          </div>
        </div>

        {/* Status Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-rose-600 border border-rose-100">
            <span className="size-1.5 rounded-full bg-rose-600 animate-pulse" />
            SESI RESERVASI KEDALUWARSA
          </span>
        </div>

        {/* Header & Description */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Waktu Pemesanan Habis
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Batas waktu <strong>5 menit</strong> untuk reservasi tiket ini telah berakhir. Tiket yang Anda tahan telah dikembalikan ke pool antrean demi keadilan pembeli lain.
          </p>
        </div>

        {/* Session Details Box (Figma Screen) */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-2xs border border-slate-200/80">
              <Ticket className="size-5 text-slate-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                SESI TERAKHIR #{sessionCode}
              </p>
              <p className="truncate text-xs font-black text-slate-900">
                {itemsSummary}
              </p>
            </div>
          </div>

          <span className="rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-600 border border-rose-100 shrink-0">
            Rilis Otomatis
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <Button
            onClick={handleRequeue}
            className="w-full sm:flex-1 bg-slate-950 hover:bg-slate-800 text-white font-black py-3 rounded-2xl text-xs gap-2 shadow-sm"
          >
            <RotateCcw className="size-3.5" />
            Antre Ulang Sekarang
          </Button>

          <Button
            variant="outline"
            onClick={handleGoHome}
            className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border-transparent font-bold py-3 rounded-2xl text-xs gap-2"
          >
            <Calendar className="size-3.5 text-slate-600" />
            Lihat Jadwal Konser Lain
          </Button>
        </div>

        {/* Subtext Note */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
          <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
          <span>Sistem antrean Booket FairQueue menjamin kesempatan yang adil bagi setiap penikmat musik.</span>
        </div>
      </div>
    </div>
  );
}
