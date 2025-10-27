import { createFileRoute, redirect } from "@tanstack/react-router";
import { Users, BarChart3, DollarSign } from "lucide-react";

import { useAuthStore } from "../store/auth";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="mt-2 text-gray-600">Bem-vindo de volta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0 bg-secondary bg-opacity-10 rounded-md p-3">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">
                Total de Alunos
              </p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0 bg-accent bg-opacity-10 rounded-md p-3">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Planos Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="shrink-0 bg-accent-light bg-opacity-10 rounded-md p-3">
              <DollarSign className="w-6 h-6 text-accent-light" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Receita</p>
              <p className="text-2xl font-semibold text-gray-900">$0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">[EM CONSTRUÇÃO]</div>
    </div>
  );
}
