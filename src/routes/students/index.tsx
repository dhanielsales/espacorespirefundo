import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { studentsApi } from "../../lib/api";
import { StudentForm } from "../../components/StudentForm";
import { useAuthStore } from "../../store/auth";
import { DataTable } from "../../components/ui/data-table";
import { RowActions } from "../../components/ui/row-actions";
import type { ColumnDef } from "@tanstack/react-table";
import type { Student } from "../../types/student";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/students/")({
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
  component: StudentsPage,
});

function StudentsPage() {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const {
    data: students,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["students"],
    queryFn: studentsApi.getAll,
  });

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <Link
          className="text-sky-500 underline"
          to={`/students/$id`}
          params={{ id: row.original.id.toString() }}
        >
          {row.original.id}
        </Link>
      ),
    },
    {
      accessorKey: "fullName",
      header: "Nome do Aluno",
    },
    {
      accessorKey: "birthDate",
      header: "Data de Nascimento",
    },
    {
      accessorKey: "parentName",
      header: "Nome do Responsável",
      cell: ({ row }) => row.original.parentName || "-",
    },
    {
      accessorKey: "parentPhone",
      header: "Telefone do Responsável",
      cell: ({ row }) => row.original.parentPhone || "-",
    },
    {
      accessorKey: "parentEmail",
      header: "Email do Responsável",
      cell: ({ row }) => row.original.parentEmail || "-",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          row={row}
          actions={[
            {
              label: "Ver detalhes",
              onClick: (student) => {
                navigate({
                  to: "/students/$id",
                  params: { id: student.id.toString() },
                });
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <StudentForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
        }}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Listagem de Alunos
            </h1>
            <p className="mt-2 text-gray-600">
              Gerencie as informações dos alunos e as matrículas
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
            }}
            variant="brand-violet-light"
            // className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Adicionar Aluno
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden p-4">
          <DataTable
            columns={columns}
            data={students || []}
            loading={isLoading}
            error={error}
          />
        </div>
      </div>
    </>
  );
}
