import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import toast from "react-hot-toast";

import { Modal } from "./ui/modal";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select } from "./ui/select";
import { paymentsApi, studentsApi } from "../lib/api";
import { Spinner } from "./ui/spinner";
import type { StudentPlanEnrollment } from "@/types/student";

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentPlans?: Array<StudentPlanEnrollment>;
}

const paymentSchema = z.object({
  studentToPlanId: z.number().min(1, "Plano é obrigatório"),
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
  studentId,
  studentPlans,
}: PaymentFormProps) {
  const queryClient = useQueryClient();

  // Fetch student's plan enrollments
  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ["student", String(studentId)],
    queryFn: () => studentsApi.getById(studentId),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof paymentSchema>) => {
      return paymentsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({
        queryKey: ["student-payments", String(studentId)],
      });
      toast.success("Pagamento registrado com sucesso!");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar pagamento: ${error.message}`);
    },
  });

  // Determine default values based on studentPlans
  const hasOnlyOnePlan = studentPlans && studentPlans.length === 1;
  const defaultEnrollmentId = hasOnlyOnePlan ? studentPlans[0].id : 0;
  const defaultAmount = hasOnlyOnePlan
    ? studentPlans[0].planMonthlyFee / 100
    : 0;

  const form = useForm({
    defaultValues: {
      studentToPlanId: defaultEnrollmentId,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: defaultAmount,
      paymentMethod: "",
      observations: "",
    },
    onSubmit: async ({ value }) => {
      // Convert amount back to cents before sending
      const dataToSubmit = {
        ...value,
        amount: Math.round(value.amount * 100),
      };
      mutation.mutate(dataToSubmit as z.infer<typeof paymentSchema>);
    },
  });

  // Update amount when enrollment selection changes
  const handleEnrollmentChange = (enrollmentId: number) => {
    form.setFieldValue("studentToPlanId", enrollmentId);
    const enrollment = studentPlans?.find((p) => p.id === enrollmentId);
    if (enrollment) {
      form.setFieldValue("amount", enrollment.planMonthlyFee / 100);
    }
  };

  if (loadingStudent) {
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
      title="Registrar Novo Pagamento"
      description={student ? `Aluno: ${student.fullName}` : undefined}
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
              label="Plano"
              name={field.name}
              value={field.state.value.toString()}
              onChange={(e) => {
                const enrollmentId = parseInt(e.target.value) || 0;
                handleEnrollmentChange(enrollmentId);
              }}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.join(", ")}
              required
              options={[
                { value: "0", label: "Selecione um plano" },
                ...(studentPlans?.map((enrollment) => ({
                  value: enrollment.id.toString(),
                  label: `${enrollment.planName} - ${new Intl.NumberFormat(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    }
                  ).format(enrollment.planMonthlyFee / 100)}`,
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
            Registrar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
