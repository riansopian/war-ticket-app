import { createContext, useContext, type ReactNode } from "react";

import type { Services } from "@/services/contracts";

const ServicesContext = createContext<Services | null>(null);

interface ServicesProviderProps {
  services: Services;
  children: ReactNode;
}

/** DI container sederhana: UI meminta `Services`, tidak tahu implementasinya. */
export function ServicesProvider({ services, children }: ServicesProviderProps) {
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices(): Services {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error("useServices harus dipakai di dalam <ServicesProvider>");
  return ctx;
}
