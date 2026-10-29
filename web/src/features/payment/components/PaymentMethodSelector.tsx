import { Building2, CreditCard, QrCode, Smartphone } from "lucide-react";
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

const methodIcons: Partial<Record<PaymentMethodId, React.ReactNode>> = {
  VIRTUAL_ACCOUNT: <CreditCard className="size-5 text-sky-600" />,
  BCA_VA: <CreditCard className="size-5 text-sky-600" />,
  MANDIRI_VA: <CreditCard className="size-5 text-sky-600" />,
  BRI_VA: <CreditCard className="size-5 text-sky-600" />,
  BNI_VA: <CreditCard className="size-5 text-sky-600" />,
  E_WALLET: <Smartphone className="size-5 text-indigo-600" />,
  QRIS: <QrCode className="size-5 text-emerald-600" />,
  GOPAY: <Smartphone className="size-5 text-emerald-600" />,
  BANK_TRANSFER: <Building2 className="size-5 text-slate-600" />,
  CREDIT_CARD: <CreditCard className="size-5 text-rose-600" />,
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
        const icon = methodIcons[method.id] || <CreditCard className="size-5 text-slate-600" />;

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
                {icon}
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
