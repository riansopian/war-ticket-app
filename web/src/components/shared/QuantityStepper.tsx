import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface QuantityStepperProps {
  value: number;
  max: number;
  min?: number;
  disabled?: boolean;
  label: string;
  onChange: (next: number) => void;
}

/** Stepper −/+ generik. Tidak tahu apa pun soal tiket (SRP). */
export function QuantityStepper({
  value,
  max,
  min = 0,
  disabled = false,
  label,
  onChange,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Kurangi ${label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus />
      </Button>
      <span className="w-5 text-center font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <Button
        type="button"
        size="icon"
        aria-label={`Tambah ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}
