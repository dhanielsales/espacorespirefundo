import { createFileRoute, redirect } from "@tanstack/react-router";
import { Users, BarChart3, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAuthStore } from "../store/auth";
import { dashboardApi } from "../lib/api";
import { ChartContainer, ChartTooltip } from "../components/ui/chart";

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
  const { user } = useAuthStore();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardApi.getStats(),
  });

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["dashboard", "students-chart"],
    queryFn: () => dashboardApi.getStudentsChart(),
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["dashboard", "revenue-chart"],
    queryFn: () => dashboardApi.getRevenueChart(),
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Olá, {user?.name}, bem-vindo de volta!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-lg bg-brand-violet-100 p-2">
              <Users className="h-6 w-6 text-brand-violet-700" />
            </div>

            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">
                Total de Alunos
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? "..." : stats?.totalStudents || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-lg bg-brand-pink-100 p-2">
              <BarChart3 className="h-6 w-6 text-brand-pink-700" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Planos Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? "..." : stats?.totalActivePlans || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-lg bg-green-100 p-2">
              <DollarSign className="h-6 w-6 text-green-700" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">
                Receita do Mês
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading
                  ? "..."
                  : new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format((stats?.currentMonthRevenue || 0) / 100)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alunos (Últimos 12 meses)
          </h2>
          {studentsLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <ChartContainer className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Receita (Últimos 12 meses)
          </h2>
          {revenueLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <ChartContainer className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        minimumFractionDigits: 0,
                      }).format(value)
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {label}
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }).format(payload[0].value as number)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D45D92"
                    strokeWidth={2}
                    dot={{ fill: "#D45D92" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </div>
    </div>
  );
}
