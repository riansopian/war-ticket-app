import { RotateCcw, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resetMockDb } from "@/services/mock";

/**
 * Alat bantu demo (hanya untuk mockup). Berada di composition root karena
 * satu-satunya bagian UI yang boleh tahu soal implementasi mock.
 */
export function DevTools() {
  const fast = sessionStorage.getItem("rusuh.mock.fast") === "1";

  const reset = () => {
    resetMockDb();
    window.location.assign("/");
  };
  const toggleFast = () => {
    window.location.assign(fast ? "/?fast=0" : "/?fast=1");
  };

  return (
    <footer className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-2 px-4 pb-8 text-xs text-muted-foreground sm:max-w-xl md:max-w-2xl">
      <span>Mode demo:</span>
      <Button variant="ghost" size="sm" onClick={reset}>
        <RotateCcw /> Reset data
      </Button>
      <Button variant="ghost" size="sm" onClick={toggleFast}>
        <Zap /> TTL cepat: {fast ? "ON" : "OFF"}
      </Button>
    </footer>
  );
}
