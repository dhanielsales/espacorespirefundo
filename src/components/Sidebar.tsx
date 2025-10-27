import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Users, BarChart3, LayoutDashboard, DollarSign } from "lucide-react";

const items = [
  {
    section: "Menu Principal",
    options: [
      {
        label: "Dashboard",
        to: "/",
        icon: LayoutDashboard,
      },
      {
        label: "Alunos",
        to: "/students",
        icon: Users,
      },
      {
        label: "Pagamentos",
        to: "/payments",
        icon: DollarSign,
      },
      {
        label: "Planos",
        to: "/plans",
        icon: BarChart3,
      },
    ],
  },
  // {
  //   section: "Others",
  //   options: [
  //     {
  //       label: "Configurações",
  //       to: "/settings",
  //       icon: Settings,
  //     },
  //   ],
  // },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-background border-r border-gray-200 flex flex-col h-screen">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-linear-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-12" />
          </div>
          <span className="text-3xl font-bold font-dancing-script bg-linear-to-r from-[#968EF5] to-[#D45D92] bg-clip-text text-transparent">
            Respire Fundo
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        {items.map((item, index) => (
          <div className={cn("px-4", { "mt-8": index > 0 })} key={item.section}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {item.section}
            </p>
            <nav className="space-y-1">
              {item.options.map((option) => (
                <Link
                  key={option.to}
                  to={option.to}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  activeProps={{
                    className:
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-gray-200",
                  }}
                >
                  <option.icon className="w-5 h-5 mr-3" />
                  {option.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Light/Dark Mode Toggle */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-medium text-gray-700">Modo Claro</span>
        </div>
      </div>
    </aside>
  );
}
