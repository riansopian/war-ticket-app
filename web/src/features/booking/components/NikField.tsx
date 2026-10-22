import * as React from "react";
import { DashedPanel } from "@/components/shared/DashedPanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NIK_LENGTH } from "@/domain/rules";

interface NikFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * NIK Input field (Wireframe 9.3)
 * Menampilkan label, input NIK dengan batas 16 digit, dan pesan bantuan / error.
 */
export function NikField({ value, onChange, error, disabled }: NikFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya izinkan angka dan batasi maksimal 16 digit
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, NIK_LENGTH);
    onChange(cleaned);
  };

  return (
    <DashedPanel tone="neutral" className="space-y-2">
      <Label htmlFor="nik-input" className="text-sm font-bold text-foreground">
        NIK (Nomor Induk Kependudukan)
      </Label>
      <Input
        id="nik-input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={NIK_LENGTH}
        value={value}
        onChange={handleChange}
        placeholder="3171xxxxxxxxxxxx"
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby="nik-hint"
        className="font-mono text-base tracking-wider"
      />
      {error ? (
        <p id="nik-hint" className="text-xs font-semibold text-destructive">
          {error}
        </p>
      ) : (
        <p id="nik-hint" className="text-xs text-muted-foreground">
          Maks. 3 tiket per NIK untuk event ini.
        </p>
      )}
    </DashedPanel>
  );
}
