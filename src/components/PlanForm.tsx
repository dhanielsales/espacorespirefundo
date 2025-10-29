import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import toast from "react-hot-toast";

import { Modal } from "./ui/modal";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select } from "./ui/select";
import { ConfirmationAlert } from "./DeleteConfirmationAlert";
import { plansApi } from "../lib/api";
import type { Plan } from "../types/plan";

interface PlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: Plan;
}

const planSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  monthlyFee: z.number().min(0, "Mensalidade deve ser maior ou igual a zero"),
  isActive: z.number().min(0).max(1),
});

export function PlanForm({ isOpen, onClose, plan }: PlanFormProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!plan;
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmitValue, setPendingSubmitValue] = useState<z.infer<
    typeof planSchema
  > | null>(null);

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof planSchema>) => {
      if (isEditMode && plan) {
        return plansApi.update(plan.id, {
          ...data,
          monthlyFee: data.monthlyFee * 100,
        });
      }
      return plansApi.create({ ...data, monthlyFee: data.monthlyFee * 100 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success(
        isEditMode
          ? "Plano atualizado com sucesso!"
          : "Plano criado com sucesso!"
      );
      setPendingSubmitValue(null);
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar plano: ${error.message}`);
      setPendingSubmitValue(null);
    },
  });

  const handleConfirmedSubmit = () => {
    if (pendingSubmitValue) {
      mutation.mutateAsync(pendingSubmitValue).then(() => {
        form.reset();
        setShowConfirmDialog(false);
      });
    }
  };

  const form = useForm({
    defaultValues: {
      name: plan?.name || "",
      description: plan?.description || "",
      monthlyFee: plan?.monthlyFee ? plan.monthlyFee / 100 : 0,
      isActive: plan?.isActive ?? 1,
    },
    onSubmit: async ({ value }) => {
      // Check if we're editing and changing from active (1) to inactive (0)
      const isDeactivating =
        isEditMode && plan?.isActive === 1 && value.isActive === 0;

      if (isDeactivating) {
        // Show confirmation dialog
        setPendingSubmitValue(value);
        setShowConfirmDialog(true);
      } else {
        // Submit directly
        mutation.mutateAsync(value).then(() => {
          form.reset();
        });
      }
    },
  });

  return (
    <Modal
      open={isOpen}
      onOpenChange={() => {
        form.reset();
        onClose();
      }}
      title={isEditMode ? "Editar Plano" : "Adicionar Novo Plano"}
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
          name="name"
          validators={{
            onChange: planSchema.shape.name,
          }}
        >
          {(field) => (
            <Input
              label="Nome do Plano"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.join(", ")}
              required
            />
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Textarea
              label="Descrição"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.join(", ")}
              rows={3}
            />
          )}
        </form.Field>

        <form.Field
          name="monthlyFee"
          validators={{
            onChange: planSchema.shape.monthlyFee,
          }}
        >
          {(field) => (
            <Input
              label="Mensalidade (R$)"
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

        <form.Field
          name="isActive"
          validators={{
            onChange: planSchema.shape.isActive,
          }}
        >
          {(field) => (
            <Select
              label="Status"
              name={field.name}
              value={field.state.value.toString()}
              onChange={(e) => field.handleChange(parseInt(e.target.value))}
              onBlur={field.handleBlur}
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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="brand-violet-light"
            loading={mutation.isPending}
          >
            {isEditMode ? "Atualizar" : "Adicionar"}
          </Button>
        </div>
      </form>

      <ConfirmationAlert
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Desativar Plano"
        onConfirm={handleConfirmedSubmit}
        isPending={mutation.isPending}
        cancelText="Cancelar"
        confirmText="Sim, desativar"
        description={
          <>
            Tem certeza que deseja desativar este plano?{" "}
            <strong>Todos os alunos </strong> matriculados neste plano terão
            suas matriculas desativadas e o plano{" "}
            <strong>não estará mais disponível</strong> para novas matrículas.
          </>
        }
      />
    </Modal>
  );
}
