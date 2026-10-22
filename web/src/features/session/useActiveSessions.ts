import { useEffect } from "react";

import { useServices } from "@/app/ServicesContext";
import { useAsync } from "@/hooks/useAsync";

/** Sesi aktif user dengan refresh berkala (posisi antrian / sisa waktu). */
export function useActiveSessions(refreshMs = 3000) {
  const { session } = useServices();
  const state = useAsync(() => session.listActive(), [session]);
  const { reload } = state;

  useEffect(() => {
    const id = setInterval(reload, refreshMs);
    return () => clearInterval(id);
  }, [reload, refreshMs]);

  return state;
}
