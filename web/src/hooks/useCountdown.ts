import { useEffect, useRef, useState } from "react";

/**
 * Countdown berbasis timestamp absolut dari server (SPEC FR-19): tetap akurat
 * walau halaman di-refresh atau tab sempat di-throttle browser.
 */
export function useCountdown(targetIso: string | undefined, onExpire?: () => void) {
  const target = targetIso ? new Date(targetIso).getTime() : undefined;
  const [remainingMs, setRemainingMs] = useState(() =>
    target === undefined ? 0 : Math.max(0, target - Date.now()),
  );
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    if (target === undefined) return;

    const tick = () => {
      const left = Math.max(0, target - Date.now());
      setRemainingMs(left);
      if (left === 0 && !firedRef.current) {
        firedRef.current = true;
        onExpireRef.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [target]);

  return { remainingMs, expired: target !== undefined && remainingMs === 0 };
}
