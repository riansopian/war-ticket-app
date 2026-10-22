import { useNavigate } from "react-router-dom";

import { useActiveSessions } from "./useActiveSessions";
import { sessionHref } from "./sessionHref";
import { YourQueueCard } from "./YourQueueCard";

/** Container: menampilkan seluruh sesi aktif; kosong → tidak merender apa pun. */
export function YourQueueSection() {
  const navigate = useNavigate();
  const { data } = useActiveSessions();
  if (!data || data.length === 0) return null;

  return (
    <section aria-label="Antrian Anda" className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground">
        Antrian Anda
      </h2>
      {data.map((s) => (
        <YourQueueCard
          key={`${s.kind}-${s.eventId}-${s.bookingId ?? ""}`}
          session={s}
          onContinue={(session) => navigate(sessionHref(session))}
        />
      ))}
    </section>
  );
}
