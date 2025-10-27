import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../components/ui/data-table";
import { Badge } from "../components/ui/badge";
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

const columns: ColumnDef<StudentPayment>[] = [
  {
    accessorKey: "studentName",
    header: "Aluno",
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
      return new Date(paidAt).toLocaleDateString("pt-BR");
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
];

function PaymentsPage() {
  const {
    data: payments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentsApi.getAll,
  });

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

      <DataTable
        columns={columns}
        data={payments || []}
        loading={isLoading}
        error={error ? new Error(error.message) : null}
      />
    </div>
  );
}
