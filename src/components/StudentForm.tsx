import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { studentsApi } from "../lib/api";
import type { CreateStudentInput, Student } from "../types/student";
import { createStudentSchema } from "../../db/validations";
import { formatCPF, cleanCPF } from "../lib/formatters";
import { Modal } from "./ui/modal";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { SelectPlan } from "./SelectPlan";

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  student?: Student;
  onSuccess?: () => void;
}

export function StudentForm({
  open,
  onClose,
  student,
  onSuccess,
}: StudentFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!student;

  const mutation = useMutation({
    mutationFn: isEditing
      ? (data: CreateStudentInput) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { planId, ...updateData } = data;
          return studentsApi.update(student.id, updateData);
        }
      : studentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      if (student) {
        queryClient.invalidateQueries({
          queryKey: ["student", String(student.id)],
        });
      }
      toast.success(
        isEditing
          ? "Aluno atualizado com sucesso!"
          : "Aluno criado com sucesso!"
      );
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          (isEditing ? "Falha ao atualizar aluno" : "Falha ao criar aluno")
      );
    },
  });

  const form = useForm({
    defaultValues: {
      fullName: student?.fullName || "",
      cpf: student?.cpf ? formatCPF(student.cpf) : "",
      email: student?.email || "",
      phone: student?.phone || "",
      birthDate: student?.birthDate || "",
      parentName: student?.parentName || "",
      parentCpf: student?.parentCpf ? formatCPF(student.parentCpf) : "",
      parentEmail: student?.parentEmail || "",
      parentPhone: student?.parentPhone || "",
      observations: student?.observations || "",
      planId: "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutateAsync(value as CreateStudentInput).then(() => {
        form.reset();
      });
    },
  });

  const handleOnClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOnClose}
      title={isEditing ? "Editar Aluno" : "Adicionar Novo Aluno"}
      description={
        isEditing
          ? "Atualize as informações do aluno abaixo"
          : "Preencha as informações do aluno abaixo"
      }
      size="xl"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div className="border-t pt-4 ">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Informações do Aluno
          </h3>

          <div className="space-y-4">
            <form.Field
              name="fullName"
              validators={{
                onChange: ({ value }) => {
                  const result =
                    createStudentSchema.shape.fullName.safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <Input
                  label="Nome Completo"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors.join(", ")}
                  required
                />
              )}
            </form.Field>

            <form.Field
              name="birthDate"
              validators={{
                onChange: ({ value }) => {
                  const result =
                    createStudentSchema.shape.birthDate.safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <Input
                  label="Data de Nascimento"
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors.join(", ")}
                  helperText={
                    <>
                      Campo formatado com Mes/Dia/Ano. <br /> Exemplo:
                      07/19/2000 = 19 de Julho de 2000.
                    </>
                  }
                  required
                />
              )}
            </form.Field>

            <form.Field
              name="cpf"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return undefined;
                  const cleaned = cleanCPF(value);
                  const result =
                    createStudentSchema.shape.cpf.safeParse(cleaned);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <Input
                  label="CPF do Aluno"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const cleaned = cleanCPF(e.target.value);
                    const formatted = formatCPF(cleaned);
                    field.handleChange(formatted);
                  }}
                  error={field.state.meta.errors.join(", ")}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              )}
            </form.Field>

            {!isEditing && (
              <form.Field
                name="planId"
                validators={{
                  onChange: ({ value }) => {
                    if (value === null || value === undefined || value === "") {
                      return "Plano é obrigatório";
                    }

                    const result =
                      createStudentSchema.shape.planId.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <SelectPlan
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors.join(", ")}
                    required
                  />
                )}
              </form.Field>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    const result =
                      createStudentSchema.shape.email.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <Input
                    label="Email"
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors.join(", ")}
                  />
                )}
              </form.Field>

              <form.Field
                name="phone"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    const result =
                      createStudentSchema.shape.phone.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <Input
                    label="Telefone"
                    type="tel"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors.join(", ")}
                  />
                )}
              </form.Field>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Informações do Responsável
          </h3>

          <div className="space-y-4">
            <form.Field
              name="parentName"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return undefined;
                  const result =
                    createStudentSchema.shape.parentName.safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <Input
                  label="Nome do Responsável"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors.join(", ")}
                />
              )}
            </form.Field>

            <form.Field
              name="parentCpf"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return undefined;
                  const cleaned = cleanCPF(value);
                  const result =
                    createStudentSchema.shape.parentCpf.safeParse(cleaned);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <Input
                  label="CPF do Responsável"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const cleaned = cleanCPF(e.target.value);
                    const formatted = formatCPF(cleaned);
                    field.handleChange(formatted);
                  }}
                  error={field.state.meta.errors.join(", ")}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              )}
            </form.Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field
                name="parentEmail"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    const result =
                      createStudentSchema.shape.parentEmail.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <Input
                    label="Email do Responsável"
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors.join(", ")}
                  />
                )}
              </form.Field>

              <form.Field
                name="parentPhone"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    const result =
                      createStudentSchema.shape.parentPhone.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <Input
                    label="Telefone do Responsável"
                    type="tel"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors.join(", ")}
                  />
                )}
              </form.Field>
            </div>
          </div>
        </div>

        <form.Field
          name="observations"
          validators={{
            onChange: ({ value }) => {
              if (!value) return undefined;
              const result =
                createStudentSchema.shape.observations.safeParse(value);
              return result.success
                ? undefined
                : result.error.issues[0]?.message;
            },
          }}
        >
          {(field) => (
            <Textarea
              label="Observações"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors.join(", ")}
              rows={3}
            />
          )}
        </form.Field>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" onClick={handleOnClose} variant="outline">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="brand-violet-light"
            disabled={mutation.isPending}
            loading={mutation.isPending}
          >
            {mutation.isPending
              ? isEditing
                ? "Atualizando..."
                : "Criando..."
              : isEditing
              ? "Atualizar Aluno"
              : "Criar Aluno"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
