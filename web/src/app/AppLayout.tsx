import { Outlet } from "react-router-dom";

import { DevTools } from "./DevTools";

/** Layout global: latar + kolom tengah responsif (mobile-first seperti wireframe). */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-violet-50/60">
      <main className="mx-auto w-full max-w-md px-4 py-8 sm:max-w-xl md:max-w-2xl">
        <Outlet />
      </main>
      <DevTools />
    </div>
  );
}
