import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { studentsApi } from "../lib/api";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Select } from "./ui/select";
import { SelectPlan } from "./SelectPlan";
import type { StudentPlanEnrollment } from "../types/student";

interface PlanEnrollmentFormProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
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
    mutationFn: (data: { planId: string; isActive: number }) =>
      isEditing
        ? studentsApi.updatePlanEnrollment(studentId, enrollment.id, data)
        : studentsApi.createPlanEnrollment(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student", studentId],
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
      planId: enrollment?.planId || "",
      isActive: enrollment?.enrollmentIsActive ?? 1,
    },
    onSubmit: async ({ value }) => {
      if (!value.planId || value.planId === "") {
        toast.error("Selecione um plano");
        return;
      }
      mutation.mutate({
        planId: value.planId,
        isActive: value.isActive,
      });
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
              if (value === null || value === undefined || value === "") {
                return "Plano é obrigatório";
              }
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <SelectPlan
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors.join(", ")}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="isActive"
          validators={{
            onChange: ({ value }) => {
              if (value === null || value === undefined) {
                return "Status é obrigatório";
              }
            },
          }}
        >
          {(field) => (
            <Select
              label="Status da Inscrição"
              value={field.state.value.toString()}
              onChange={(e) => field.handleChange(parseInt(e.target.value))}
              error={field.state.meta.errors.join(", ")}
              required
              options={[
                { value: "1", label: "Ativo" },
                { value: "0", label: "Inativo" },
              ]}
            />
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
            variant="brand-violet-light"
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
