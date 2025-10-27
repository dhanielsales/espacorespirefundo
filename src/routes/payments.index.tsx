import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText } from "lucide-react";
import { DataTable } from "../components/ui/data-table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { PaymentReceiptModal } from "../components/PaymentReceiptModal";
import { paymentsApi } from "../lib/api";
import type { StudentPayment } from "../types/payment";

export const Route = createFileRoute("/payments/")({
  component: PaymentsPage,
});

const paymentMethodLabels: Record<string, string> = {
  cash: "Dinheiro",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  pix: "PIX",
};

function PaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(
    null
  );

  const {
    data: payments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentsApi.getAll,
  });

  const columns: ColumnDef<StudentPayment>[] = [
    {
      accessorKey: "studentName",
      header: "Aluno",
      cell: ({ row }) => {
        if (row.original.studentDeletedAt) {
          return row.original.studentName;
        }

        return (
          <Link
            className="text-sky-500 underline"
            to={`/students/$id`}
            params={{ id: row.original.studentId as string }}
          >
            {row.original.studentName}
          </Link>
        );
      },
    },
    {
      accessorKey: "planName",
      header: "Plano",
    },
    {
      accessorKey: "month",
      header: "Mês",
    },
    {
      accessorKey: "year",
      header: "Ano",
    },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number;
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(amount / 100); // Convert from cents
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Método",
      cell: ({ row }) => {
        const method = row.getValue("paymentMethod") as string | null;
        if (!method) return "-";
        return paymentMethodLabels[method] || method;
      },
    },
    {
      accessorKey: "paidAt",
      header: "Data de Pagamento",
      cell: ({ row }) => {
        const paidAt = row.getValue("paidAt") as string | null;
        if (!paidAt) return "-";
        return new Date(paidAt).toLocaleDateString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const paidAt = row.getValue("paidAt") as string | null;
        return (
          <Badge variant={paidAt ? "success" : "warning"}>
            {paidAt ? "Pago" : "Pendente"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <Button
          variant="brand-violet-outline"
          size="sm"
          className="gap-2"
          onClick={() => setSelectedPayment(row.original)}
        >
          <FileText className="h-4 w-4" />
          Ver Recibo
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">
            Histórico de pagamentos dos alunos
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden p-4">
        <DataTable
          columns={columns}
          data={payments || []}
          loading={isLoading}
          error={error ? new Error(error.message) : null}
        />
      </div>

      {selectedPayment && (
        <PaymentReceiptModal
          isOpen={true}
          onClose={() => setSelectedPayment(null)}
          studentName={selectedPayment.studentName || "N/A"}
          planName={selectedPayment.planName || "N/A"}
          amount={selectedPayment.amount}
          month={selectedPayment.month}
          year={selectedPayment.year}
          paymentMethod={selectedPayment.paymentMethod || undefined}
          paidAt={selectedPayment.paidAt || undefined}
          receiptNumber={selectedPayment.id.toString()}
        />
      )}
    </div>
  );
}
