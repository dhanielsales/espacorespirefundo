import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import toast from "react-hot-toast";

import { Modal } from "./ui/modal";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select } from "./ui/select";
import { paymentsApi, studentsApi, plansApi } from "../lib/api";
import type { StudentPayment } from "../types/payment";
import { Spinner } from "./ui/spinner";

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: StudentPayment;
  preselectedStudentId?: number; // For pre-selecting student from detail page
  planMonthlyFee?: number; // For pre-filling amount from plan
}

const paymentSchema = z.object({
  studentToPlanId: z.number().min(1, "Aluno/Plano é obrigatório"),
  month: z.number().min(1).max(12, "Mês deve estar entre 1 e 12"),
  year: z.number().min(2020, "Ano inválido"),
  amount: z.number().min(0, "Valor deve ser maior ou igual a zero"),
  paymentMethod: z
    .enum(["cash", "credit_card", "debit_card", "pix"])
    .optional(),
  observations: z.string().optional(),
});

export function PaymentForm({
  isOpen,
  onClose,
  payment,
  preselectedStudentId,
  planMonthlyFee,
}: PaymentFormProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!payment;

  // Fetch students and plans for the dropdowns
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: studentsApi.getAll,
    enabled: isOpen,
  });

  // Load plans for future use (e.g., showing plan details in form)
  const { data: _plans, isLoading: loadingPlans } = useQuery({
    queryKey: ["plans"],
    queryFn: plansApi.getAll,
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof paymentSchema>) => {
      if (isEditMode && payment) {
        return paymentsApi.update(payment.id, data);
      }
      return paymentsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success(
        isEditMode
          ? "Pagamento atualizado com sucesso!"
          : "Pagamento registrado com sucesso!"
      );
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar pagamento: ${error.message}`);
    },
  });

  const form = useForm({
    defaultValues: {
      studentToPlanId: payment?.studentToPlanId || preselectedStudentId || 0,
      month: payment?.month || new Date().getMonth() + 1,
      year: payment?.year || new Date().getFullYear(),
      amount: payment?.amount || planMonthlyFee || 0,
      paymentMethod: payment?.paymentMethod || "",
      observations: payment?.observations || "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value as z.infer<typeof paymentSchema>);
    },
  });

  if (loadingStudents || loadingPlans) {
    return (
      <Modal open={isOpen} onOpenChange={onClose} title="Carregando...">
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      title={isEditMode ? "Editar Pagamento" : "Registrar Novo Pagamento"}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="studentToPlanId"
          validators={{
            onChange: paymentSchema.shape.studentToPlanId,
          }}
        >
          {(field) => (
            <Select
              label="Aluno"
              name={field.name}
              value={field.state.value.toString()}
              onChange={(e) =>
                field.handleChange(parseInt(e.target.value) || 0)
              }
              onBlur={field.handleBlur}
              error={field.state.meta.errors.join(", ")}
              required
              disabled={isEditMode}
              options={[
                { value: "0", label: "Selecione um aluno" },
                ...(students?.map((student) => ({
                  value: student.id.toString(),
                  label: student.fullName,
                })) || []),
              ]}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="month"
            validators={{
              onChange: paymentSchema.shape.month,
            }}
          >
            {(field) => (
              <Select
                label="Mês"
                name={field.name}
                value={field.state.value.toString()}
                onChange={(e) => field.handleChange(parseInt(e.target.value))}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(", ")}
                required
                options={[
                  { value: "1", label: "Janeiro" },
                  { value: "2", label: "Fevereiro" },
                  { value: "3", label: "Março" },
                  { value: "4", label: "Abril" },
                  { value: "5", label: "Maio" },
                  { value: "6", label: "Junho" },
                  { value: "7", label: "Julho" },
                  { value: "8", label: "Agosto" },
                  { value: "9", label: "Setembro" },
                  { value: "10", label: "Outubro" },
                  { value: "11", label: "Novembro" },
                  { value: "12", label: "Dezembro" },
                ]}
              />
            )}
          </form.Field>

          <form.Field
            name="year"
            validators={{
              onChange: paymentSchema.shape.year,
            }}
          >
            {(field) => (
              <Input
                label="Ano"
                type="number"
                name={field.name}
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(parseInt(e.target.value) || 0)
                }
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(", ")}
                min="2020"
                required
              />
            )}
          </form.Field>
        </div>

        <form.Field
          name="amount"
          validators={{
            onChange: paymentSchema.shape.amount,
          }}
        >
          {(field) => (
            <Input
              label="Valor (R$)"
              type="number"
              name={field.name}
              value={field.state.value}
              onChange={(e) =>
                field.handleChange(parseFloat(e.target.value) || 0)
              }
              onBlur={field.handleBlur}
              error={field.state.meta.errors.join(", ")}
              step="0.01"
              min="0"
              required
            />
          )}
        </form.Field>

        <form.Field name="paymentMethod">
          {(field) => (
            <Select
              label="Método de Pagamento"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.join(", ")}
              options={[
                { value: "", label: "Selecione um método" },
                { value: "cash", label: "Dinheiro" },
                { value: "credit_card", label: "Cartão de Crédito" },
                { value: "debit_card", label: "Cartão de Débito" },
                { value: "pix", label: "PIX" },
              ]}
            />
          )}
        </form.Field>

        <form.Field name="observations">
          {(field) => (
            <Textarea
              label="Observações"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.join(", ")}
              rows={3}
            />
          )}
        </form.Field>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="brand-pink"
            loading={mutation.isPending}
          >
            {isEditMode ? "Atualizar" : "Registrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
