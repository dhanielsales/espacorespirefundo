import { useQuery } from "@tanstack/react-query";
import { plansApi } from "../lib/api";
import { Select } from "./ui/select";
import type { SelectHTMLAttributes } from "react";

interface SelectPlanProps
  extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "onChange" | "value" | "children"
  > {
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function SelectPlan({
  label = "Plano",
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  ...props
}: SelectPlanProps) {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: plansApi.getAll,
  });

  const options =
    plans?.map((plan) => ({
      value: String(plan.id),
      label: `${plan.name} - ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(plan.monthlyFee / 100)}`,
    })) || [];

  return (
    <Select
      label={label}
      value={String(value)}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      options={options}
      disabled={disabled || isLoading}
      required={required}
      {...props}
    />
  );
}
