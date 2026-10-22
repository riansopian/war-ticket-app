import { Badge } from "@/components/ui/badge";
import { DashedPanel } from "@/components/shared/DashedPanel";
import { QuantityStepper } from "@/components/shared/QuantityStepper";
import type { TicketCategory } from "@/domain/types";
import { formatNumber, formatRupiah } from "@/lib/format";
import { maxSelectableQty, type Quantities } from "@/domain/rules";

interface CategoryPickerProps {
  categories: TicketCategory[];
  quantities: Quantities;
  onChangeQty: (categoryId: string, qty: number) => void;
  disabled?: boolean;
}

export function CategoryPicker({
  categories,
  quantities,
  onChangeQty,
  disabled = false,
}: CategoryPickerProps) {
  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const selectedQty = quantities[cat.id] ?? 0;
        const maxQty = maxSelectableQty(cat, quantities);
        const isSoldOut = cat.available <= 0;

        return (
          <DashedPanel
            key={cat.id}
            tone={selectedQty > 0 ? "highlight" : "neutral"}
            className="flex items-center justify-between gap-4 p-4 transition-colors"
          >
            <div className="space-y-1.5">
              <h4 className="text-base font-bold leading-tight text-foreground">
                {cat.name}
              </h4>
              <div>
                {isSoldOut ? (
                  <Badge variant="muted" className="text-[11px] bg-slate-200 text-slate-600">
                    Habis
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-[11px]">
                    Sisa {formatNumber(cat.available)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2.5">
              <span className="font-bold text-foreground">
                {formatRupiah(cat.price)}
              </span>
              <QuantityStepper
                label={`tiket ${cat.name}`}
                value={selectedQty}
                max={maxQty}
                min={0}
                disabled={disabled || (isSoldOut && selectedQty === 0)}
                onChange={(next) => onChangeQty(cat.id, next)}
              />
            </div>
          </DashedPanel>
        );
      })}
    </div>
  );
}
