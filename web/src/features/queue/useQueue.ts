import { useCallback, useEffect, useState } from "react";

import { useServices } from "@/app/ServicesContext";
import type { QueueStatus } from "@/domain/types";

interface UseQueueResult {
  status: QueueStatus | undefined;
  error: unknown;
  /** Antre ulang (mis. setelah EXPIRED). */
  rejoin: () => void;
}

/**
 * Join antrian (idempoten) lalu polling adaptif memakai `retryAfterMs` dari
 * server (SPEC §4.3). Berhenti begitu ADMITTED/EXPIRED.
 */
export function useQueue(eventId: string): UseQueueResult {
  const { queue } = useServices();
  const [status, setStatus] = useState<QueueStatus>();
  const [error, setError] = useState<unknown>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setError(undefined);

    const poll = async (first: boolean) => {
      try {
        const next = first ? await queue.join(eventId) : await queue.getStatus(eventId);
        if (cancelled) return;
        setStatus(next);
        if (next.state === "WAITING") {
          timer = setTimeout(() => poll(false), next.retryAfterMs);
        }
      } catch (e) {
        if (!cancelled) setError(e);
      }
    };
    poll(true);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [queue, eventId, attempt]);

  const rejoin = useCallback(() => {
    setStatus(undefined);
    setAttempt((n) => n + 1);
  }, []);

  return { status, error, rejoin };
}
