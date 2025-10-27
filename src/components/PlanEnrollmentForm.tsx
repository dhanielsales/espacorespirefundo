import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { studentsApi } from "../lib/api";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { SelectPlan } from "./SelectPlan";
import type { StudentPlanEnrollment } from "../types/student";

interface PlanEnrollmentFormProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  enrollment?: StudentPlanEnrollment; // Optional - if provided, we're editing
}

export function PlanEnrollmentForm({
  open,
  onClose,
  studentId,
  enrollment,
}: PlanEnrollmentFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!enrollment;

  const mutation = useMutation({
    mutationFn: (planId: number) =>
      isEditing
        ? studentsApi.updatePlanEnrollment(studentId, enrollment.id, planId)
        : studentsApi.createPlanEnrollment(studentId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student", String(studentId)],
      });
      toast.success(
        isEditing
          ? "Plano atualizado com sucesso!"
          : "Plano adicionado com sucesso!"
      );
      onClose();
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          (isEditing ? "Falha ao atualizar plano" : "Falha ao adicionar plano")
      );
    },
  });

  const form = useForm({
    defaultValues: {
      planId: enrollment?.planId || 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.planId || value.planId === 0) {
        toast.error("Selecione um plano");
        return;
      }
      mutation.mutate(value.planId);
    },
  });

  return (
    <Modal
      title={isEditing ? "Editar Plano" : "Adicionar Novo Plano"}
      description={
        isEditing
          ? `Alterar o plano inscrito em ${new Date(
              enrollment.createdAt
            ).toLocaleDateString("pt-BR")}`
          : "Inscrever o aluno em um novo plano"
      }
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      isLoading={mutation.isPending}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <form.Field
          name="planId"
          validators={{
            onChange: ({ value }) => {
              if (value === null || value === undefined || value === 0) {
                return "Plano é obrigatório";
              }
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <SelectPlan
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                error={field.state.meta.errors.join(", ")}
                required
              />
            </div>
          )}
        </form.Field>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="brand-violet-outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="brand-violet"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? isEditing
                ? "Salvando..."
                : "Adicionando..."
              : isEditing
              ? "Salvar"
              : "Adicionar Plano"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
