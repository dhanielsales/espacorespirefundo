import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { RowActions } from "../components/ui/row-actions";
import { PlanForm } from "../components/PlanForm";
import { plansApi } from "../lib/api";
import type { Plan } from "../types/plan";

export const Route = createFileRoute("/plans/")({
  component: PlansPage,
});

const createColumns = (onEdit: (plan: Plan) => void): ColumnDef<Plan>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return description || "-";
    },
  },
  {
    accessorKey: "monthlyFee",
    header: "Mensalidade",
    cell: ({ row }) => {
      const fee = row.getValue("monthlyFee") as number;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(fee / 100);
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as number;
      return (
        <Badge variant={isActive === 1 ? "success" : "destructive"}>
          {isActive === 1 ? "Ativo" : "Inativo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <RowActions
          row={row}
          actions={[
            {
              label: "Editar",
              onClick: (plan) => onEdit(plan),
            },
          ]}
        />
      );
    },
  },
];

function PlansPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>(undefined);

  const {
    data: plans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: plansApi.getAll,
  });

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPlan(undefined);
  };

  const columns = createColumns(handleEdit);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos</h1>
          <p className="text-muted-foreground">
            Gerencie os planos disponíveis
          </p>
        </div>
        <Button
          variant="brand-violet-light"
          onClick={() => setIsFormOpen(true)}
        >
          Adicionar Plano
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden p-4">
        <DataTable
          columns={columns}
          data={plans || []}
          loading={isLoading}
          error={error ? new Error(error.message) : null}
        />
      </div>
      <PlanForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        plan={selectedPlan}
      />
    </div>
  );
}
