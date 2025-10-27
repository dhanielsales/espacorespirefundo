import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { RowActions } from "../components/ui/row-actions";
import { PlanForm } from "../components/PlanForm";
import { plansApi } from "../lib/api";
import type { Plan } from "../types/plan";

export const Route = createFileRoute("/plans/")({
  component: PlansPage,
});

function PlansPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["plans", page, limit, search],
    queryFn: () => plansApi.getAll({ page, limit, search }),
  });

  const plans = response?.data || [];
  const pagination = response?.pagination;

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPlan(undefined);
  };

  const columns: ColumnDef<Plan>[] = [
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
                onClick: (plan) => handleEdit(plan),
              },
            ]}
          />
        );
      },
    },
  ];

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
        <div className="mb-4 flex gap-4">
          <Input
            placeholder="Buscar por nome do plano..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <DataTable
          columns={columns}
          data={plans}
          loading={isLoading}
          error={error ? new Error(error.message) : null}
          pagination={
            pagination
              ? {
                  pageIndex: page - 1,
                  pageSize: limit,
                  totalPages: pagination.totalPages,
                  totalItems: pagination.total,
                  onPageChange: (newPage) => setPage(newPage + 1),
                }
              : undefined
          }
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
