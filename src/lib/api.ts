import type {
  Student,
  CreateStudentInput,
  UpdateStudentInput,
} from "../types/student";
import type { LoginInput, RegisterInput } from "../../db/validations";
import { useAuthStore } from "../store/auth";

const API_BASE = "/api";

function getAuthHeaders(): HeadersInit {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const authApi = {
  register: async (
    data: RegisterInput,
    apiKey: string
  ): Promise<{
    user: { id: number; name: string; email: string };
    token: string;
  }> => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Registration-Key": apiKey,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to register");
    }
    return response.json();
  },

  login: async (
    data: LoginInput
  ): Promise<{
    user: { id: number; name: string; email: string };
    token: string;
  }> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to login");
    }
    return response.json();
  },

  me: async (): Promise<{
    user: { id: number; name: string; email: string };
  }> => {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }
    return response.json();
  },
};

export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await fetch(`${API_BASE}/students`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch students");
    }
    return response.json();
  },

  getById: async (id: number): Promise<Student> => {
    const response = await fetch(`${API_BASE}/students/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch student");
    }
    return response.json();
  },

  create: async (data: CreateStudentInput): Promise<Student> => {
    const response = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create student");
    }
    return response.json();
  },

  update: async (id: number, data: UpdateStudentInput): Promise<Student> => {
    const response = await fetch(`${API_BASE}/students/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update student");
    }
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/students/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete student");
    }
  },
};
