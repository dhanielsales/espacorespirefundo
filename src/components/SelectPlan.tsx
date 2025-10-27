import { useQuery } from "@tanstack/react-query";
import { plansApi } from "../lib/api";
import { Select } from "./ui/select";
import { useMemo, type SelectHTMLAttributes } from "react";

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
  fetchActiveOnly?: boolean;
}

export function SelectPlan({
  label = "Plano",
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  fetchActiveOnly = true,
  ...props
}: SelectPlanProps) {
  const { data: data, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => plansApi.getAll({ page: 1, limit: 100 }),
  });

  const options = useMemo(() => {
    if (!data?.data) return [];
    const result = [
      ...data.data
        .map((plan) => {
          if (!plan.isActive && fetchActiveOnly) return null;
          return { label: plan.name, value: String(plan.id) };
        })
        .filter(Boolean),
    ] as Array<{ label: string; value: string }>;

    return result;
  }, [data, fetchActiveOnly]);

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
      placeholder="Selecione um plano"
      {...props}
    />
  );
}
