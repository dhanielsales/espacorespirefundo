import {
  createFileRoute,
  Link,
  useNavigate,
  redirect,
} from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  Calendar,
  User,
  ArrowLeft,
  Trash2,
  Pencil,
  DollarSign,
  Plus,
  FileText,
  CreditCard,
} from "lucide-react";
import { studentsApi } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import { formatCPF } from "../../lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { StudentForm } from "../../components/StudentForm";
import { PaymentForm } from "../../components/PaymentForm";
import { PlanEnrollmentForm } from "../../components/PlanEnrollmentForm";
import { DeleteConfirmationAlert } from "../../components/DeleteConfirmationAlert";
import { PaymentReceiptModal } from "../../components/PaymentReceiptModal";
import type { StudentPlanEnrollment } from "../../types/student";
import type { StudentPayment } from "../../types/payment";

export const Route = createFileRoute("/students/$id")({
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: StudentDetail,
});

function StudentDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StudentPlanEnrollment | null>(
    null
  );
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] =
    useState<StudentPayment | null>(null);

  const {
    data: student,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["student", id],
    queryFn: () => studentsApi.getById(id),
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["student-payments", id],
    queryFn: () => studentsApi.getPayments(id),
    enabled: !!student,
  });

  const deleteMutation = useMutation({
    mutationFn: studentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Estudante excluído com sucesso!");
      navigate({ to: "/students" });
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao excluir estudante");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutateAsync(id).then(() => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Estudante excluído com sucesso!");
      navigate({ to: "/students" });
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/students">
          <Button variant="brand-violet-outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para lista de alunos
          </Button>
        </Link>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6">
            <p className="text-red-600">
              Erro Carregando os dados do aluno: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {student && (
        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{student.fullName}</CardTitle>
                  <CardDescription>
                    Membro desde:{" "}
                    {new Date(student.createdAt).toLocaleDateString("pt-BR")}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="brand-violet-outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setIsPaymentModalOpen(true)}
                  >
                    <DollarSign className="h-4 w-4" />
                    Registrar Pagamento
                  </Button>
                  <Button
                    variant="brand-violet-outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <DeleteConfirmationAlert
                    onConfirm={handleDelete}
                    isPending={deleteMutation.isPending}
                    description={
                      <>
                        Esta ação não pode ser desfeita. Isso excluirá
                        permanentemente os dados do aluno{" "}
                        <strong>{student.fullName}</strong> do sistema.
                      </>
                    }
                  >
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </DeleteConfirmationAlert>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Student's Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Informações do Aluno</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-violet-100 p-2">
                    <User className="h-5 w-5 text-brand-violet-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Nome</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {student.fullName || (
                        <span className="text-gray-400 italic">
                          Não informado
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-violet-100 p-2">
                    <CreditCard className="h-5 w-5 text-brand-violet-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">CPF</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {student.cpf ? (
                        formatCPF(student.cpf)
                      ) : (
                        <span className="text-gray-400 italic">
                          Não informado
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-violet-100 p-2">
                    <Mail className="h-5 w-5 text-brand-violet-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {student.email || (
                        <span className="text-gray-400 italic">
                          Não informado
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-violet-100 p-2">
                    <Phone className="h-5 w-5 text-brand-violet-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">
                      Telefone
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {student.phone || (
                        <span className="text-gray-400 italic">
                          Não informado
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-violet-100 p-2">
                    <Calendar className="h-5 w-5 text-brand-violet-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">
                      Data de Nascimento
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(student.birthDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent/Guardian Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Informações do Responsável
              </CardTitle>
              {!student.parentName &&
              !student.parentEmail &&
              !student.parentPhone ? (
                <CardDescription>
                  Nenhuma informação do responsável cadastrada
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-pink-100 p-2">
                    <User className="h-5 w-5 text-brand-pink-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Nome</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {student.parentName || (
                        <span className="text-gray-400 italic">
                          Não informado
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-pink-100 p-2">
                    <CreditCard className="h-5 w-5 text-brand-pink-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">CPF</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {student.parentCpf ? (
                        formatCPF(student.parentCpf)
                      ) : (
                        <span className="text-gray-400 italic">
                          Não informado
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-pink-100 p-2">
                    <Mail className="h-5 w-5 text-brand-pink-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {student.parentEmail || (
                        <span className="text-gray-400 italic">
                          Não informado
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-pink-100 p-2">
                    <Phone className="h-5 w-5 text-brand-pink-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">
                      Telefone
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {student.parentPhone || (
                        <span className="text-gray-400 italic">
                          Não informado
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {student.observations || (
                  <span className="text-gray-400 italic">
                    Nenhuma observação registrada
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Plan Enrollments */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">Planos Inscritos</CardTitle>
                  {(!student.plans || student.plans.length === 0) && (
                    <CardDescription>
                      Este aluno não está inscrito em nenhum plano
                    </CardDescription>
                  )}
                </div>
                <Button
                  variant="brand-violet-light"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsAddPlanModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Plano
                </Button>
              </div>
            </CardHeader>
            {student.plans && student.plans.length > 0 && (
              <CardContent>
                <div className="space-y-4">
                  {student.plans.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {enrollment.planName}
                            </h3>
                            {enrollment.enrollmentIsActive === 1 ? (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                Ativo
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                                Inativo
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Inscrito em{" "}
                            {new Date(enrollment.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </p>
                        </div>
                        <Button
                          variant="brand-violet-outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => setEditingPlan(enrollment)}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">
                            Mensalidade
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(enrollment.planMonthlyFee / 100)}
                          </p>
                        </div>

                        {enrollment.planDescription && (
                          <div className="space-y-1 md:col-span-2">
                            <p className="text-sm font-medium text-gray-500">
                              Descrição
                            </p>
                            <p className="text-sm text-gray-700">
                              {enrollment.planDescription}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Histórico de Pagamentos</CardTitle>
              <CardDescription>
                {payments?.length || 0} pagamento(s) registrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="md" />
                </div>
              ) : payments && payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {payment.month}/{payment.year}
                          </p>
                          {payment.paidAt && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                              Pago
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {payment.planName}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(payment.amount / 100)}
                          </p>
                          {payment.paidAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(payment.paidAt).toLocaleDateString(
                                "pt-BR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="brand-violet-outline"
                          className="gap-2"
                          onClick={() => setSelectedPaymentForReceipt(payment)}
                        >
                          <FileText className="h-4 w-4" />
                          Ver Recibo
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic py-4">
                  Nenhum pagamento registrado
                </p>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium">ID:</span> {student.id}
                </div>
                <div>
                  <span className="font-medium">Criado em:</span>{" "}
                  {new Date(student.createdAt).toLocaleString("pt-BR")}
                </div>
                <div>
                  <span className="font-medium">Atualizado em:</span>{" "}
                  {new Date(student.updatedAt).toLocaleString("pt-BR")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {student && (
        <>
          <StudentForm
            open={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            student={student}
            onSuccess={() => refetch()}
          />
          <PaymentForm
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              queryClient.invalidateQueries({
                queryKey: ["student-payments", id],
              });
            }}
            studentId={student.id}
            studentPlans={student.plans}
          />
          <PlanEnrollmentForm
            open={isAddPlanModalOpen}
            onClose={() => setIsAddPlanModalOpen(false)}
            studentId={student.id}
          />
          {editingPlan && (
            <PlanEnrollmentForm
              open={true}
              onClose={() => setEditingPlan(null)}
              studentId={student.id}
              enrollment={editingPlan}
            />
          )}
          {selectedPaymentForReceipt && (
            <PaymentReceiptModal
              isOpen={true}
              onClose={() => setSelectedPaymentForReceipt(null)}
              studentName={student.fullName}
              planName={selectedPaymentForReceipt.planName || "N/A"}
              amount={selectedPaymentForReceipt.amount}
              month={selectedPaymentForReceipt.month}
              year={selectedPaymentForReceipt.year}
              paymentMethod={
                selectedPaymentForReceipt.paymentMethod || undefined
              }
              paidAt={selectedPaymentForReceipt.paidAt || undefined}
              receiptNumber={selectedPaymentForReceipt.id.toString()}
            />
          )}
        </>
      )}
    </div>
  );
}
