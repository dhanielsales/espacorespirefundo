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
} from "lucide-react";
import { studentsApi } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { StudentForm } from "../../components/StudentForm";
import { PaymentForm } from "../../components/PaymentForm";

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

  const {
    data: student,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["student", id],
    queryFn: () => studentsApi.getById(parseInt(id, 10)),
  });

  // Get student's payment history
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["student-payments", id],
    queryFn: () => studentsApi.getPayments(parseInt(id, 10)),
    enabled: !!student,
  });

  // Get the plan's monthly fee from student data
  const planMonthlyFee = student?.planMonthlyFee || 0;

  const deleteMutation = useMutation({
    mutationFn: studentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted successfully!");
      navigate({ to: "/students" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete student");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(parseInt(id, 10));
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
                  <CardTitle className="text-2xl">
                    #{student.id} {student.fullName}
                  </CardTitle>
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Tem certeza absoluta?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá
                          permanentemente os dados do aluno {student.fullName}{" "}
                          do sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={deleteMutation.isPending}
                          variant="destructive"
                        >
                          {deleteMutation.isPending
                            ? "Excluindo..."
                            : "Sim, excluir"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Plan Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Plano Atual</CardTitle>
              {!student.planId && (
                <CardDescription>
                  Este aluno não está inscrito em nenhum plano
                </CardDescription>
              )}
            </CardHeader>
            {student.planId && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Nome do Plano
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {student.planName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Mensalidade
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format((student.planMonthlyFee || 0) / 100)}
                    </p>
                  </div>
                  {student.planDescription && (
                    <div className="space-y-2 md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">
                        Descrição
                      </p>
                      <p className="text-sm text-gray-700">
                        {student.planDescription}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Data de Inscrição
                    </p>
                    <p className="text-sm text-gray-900">
                      {student.enrolledAt
                        ? new Date(student.enrolledAt).toLocaleDateString(
                            "pt-BR"
                          )
                        : "-"}
                    </p>
                  </div>
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
                              "pt-BR"
                            )}
                          </p>
                        )}
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
              // Refetch payments after closing to show updated list
              queryClient.invalidateQueries({
                queryKey: ["student-payments", id],
              });
            }}
            preselectedStudentId={student.studentToPlanId ?? undefined}
            planMonthlyFee={planMonthlyFee}
          />
        </>
      )}
    </div>
  );
}
