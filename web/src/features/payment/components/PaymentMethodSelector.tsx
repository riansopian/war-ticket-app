import { Building2, CreditCard, Smartphone } from "lucide-react";
import * as React from "react";

import { DashedPanel } from "@/components/shared/DashedPanel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { PaymentMethod, PaymentMethodId } from "@/domain/types";

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethod: PaymentMethodId;
  onSelectMethod: (method: PaymentMethodId) => void;
  disabled?: boolean;
}

const methodIcons: Record<PaymentMethodId, React.ReactNode> = {
  VIRTUAL_ACCOUNT: <CreditCard className="size-5 text-sky-600" />,
  E_WALLET: <Smartphone className="size-5 text-indigo-600" />,
  BANK_TRANSFER: <Building2 className="size-5 text-slate-600" />,
};

export function PaymentMethodSelector({
  methods,
  selectedMethod,
  onSelectMethod,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <RadioGroup
      value={selectedMethod}
      onValueChange={(val) => onSelectMethod(val as PaymentMethodId)}
      disabled={disabled}
      className="gap-3"
    >
      {methods.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <label
            key={method.id}
            htmlFor={`payment-method-${method.id}`}
            className="cursor-pointer"
          >
            <DashedPanel
              tone={isSelected ? "highlight" : "neutral"}
              className="flex items-center justify-between p-4 transition-all hover:border-primary/80"
            >
              <div className="flex items-center gap-3">
                {methodIcons[method.id]}
                <span className="font-bold text-foreground">
                  {method.label}
                </span>
              </div>
              <RadioGroupItem
                value={method.id}
                id={`payment-method-${method.id}`}
              />
            </DashedPanel>
          </label>
        );
      })}
    </RadioGroup>
  );
}
