import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import * as Label from "@radix-ui/react-label";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authApi } from "../lib/api";
import { useAuthStore } from "../store/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Login com sucesso!");
      navigate({ to: "/" });
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao fazer login");
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutateAsync(value).then(() => {
        form.reset();
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-5xl font-bold font-dancing-script bg-linear-to-r from-[#968EF5] to-[#D45D92] bg-clip-text text-transparent">
            Respire Fundo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestão de Alunos
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field name="email">
              {(field) => (
                <div>
                  <Label.Root
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Endereço de e-mail
                  </Label.Root>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Entre seu e-mail"
                      required
                    />
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div>
                  <Label.Root
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Senha
                  </Label.Root>
                  <div className="mt-1">
                    <input
                      id="password"
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Entre sua senha"
                      required
                    />
                  </div>
                </div>
              )}
            </form.Field>

            <div>
              <Button
                type="submit"
                disabled={mutation.isPending}
                variant="brand-pink"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? "Entrando..." : "Entrar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
