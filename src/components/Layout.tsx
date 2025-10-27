import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

import { useAuthStore } from "../store/auth";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate({ to: "/login" });
  };

  // If not authenticated, show simple layout without sidebar
  if (!isAuthenticated) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-background border-b border-gray-200 flex items-center justify-end px-6">
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {/* <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </button> */}

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-semibold text-slate-800">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">{user?.name}</p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sair"
                className="p-1 hover:bg-gray-100 rounded cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
