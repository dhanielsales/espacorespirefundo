import type {
  Student,
  CreateStudentInput,
  UpdateStudentInput,
} from "../types/student";
import type { Plan, CreatePlanInput, UpdatePlanInput } from "../types/plan";
import type {
  StudentPayment,
  CreatePaymentInput,
  UpdatePaymentInput,
} from "../types/payment";
import type { LoginInput, RegisterInput } from "../../db/validations";
import { useAuthStore } from "../store/auth";

const API_BASE = "/api";

function getAuthHeaders(includeContentType = true): HeadersInit {
  const token = useAuthStore.getState().token;
  return {
    ...(includeContentType ? { "Content-Type": "application/json" } : {}),
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

  getPayments: async (id: number): Promise<StudentPayment[]> => {
    const response = await fetch(`${API_BASE}/students/${id}/payments`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch student payments");
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
      headers: getAuthHeaders(false),
    });
    if (!response.ok) {
      throw new Error("Failed to delete student");
    }
  },

  updatePlanEnrollment: async (
    studentId: number,
    enrollmentId: number,
    planId: number
  ): Promise<{ id: number; studentId: number; planId: number }> => {
    const response = await fetch(
      `${API_BASE}/students/${studentId}/plans/${enrollmentId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ planId }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update plan enrollment");
    }
    return response.json();
  },

  createPlanEnrollment: async (
    studentId: number,
    planId: number
  ): Promise<{ id: number; studentId: number; planId: number }> => {
    const response = await fetch(`${API_BASE}/students/${studentId}/plans`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ planId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create plan enrollment");
    }
    return response.json();
  },
};

export const plansApi = {
  getAll: async (): Promise<Plan[]> => {
    const response = await fetch(`${API_BASE}/plans`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch plans");
    }
    return response.json();
  },

  getById: async (id: number): Promise<Plan> => {
    const response = await fetch(`${API_BASE}/plans/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch plan");
    }
    return response.json();
  },

  create: async (data: CreatePlanInput): Promise<Plan> => {
    const response = await fetch(`${API_BASE}/plans`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create plan");
    }
    return response.json();
  },

  update: async (id: number, data: UpdatePlanInput): Promise<Plan> => {
    const response = await fetch(`${API_BASE}/plans/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update plan");
    }
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/plans/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(false),
    });
    if (!response.ok) {
      throw new Error("Failed to delete plan");
    }
  },
};

export const paymentsApi = {
  getAll: async (): Promise<StudentPayment[]> => {
    const response = await fetch(`${API_BASE}/payments`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch payments");
    }
    return response.json();
  },

  getById: async (id: number): Promise<StudentPayment> => {
    const response = await fetch(`${API_BASE}/payments/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch payment");
    }
    return response.json();
  },

  create: async (data: CreatePaymentInput): Promise<StudentPayment> => {
    const response = await fetch(`${API_BASE}/payments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create payment");
    }
    return response.json();
  },

  update: async (
    id: number,
    data: UpdatePaymentInput
  ): Promise<StudentPayment> => {
    const response = await fetch(`${API_BASE}/payments/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update payment");
    }
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/payments/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(false),
    });
    if (!response.ok) {
      throw new Error("Failed to delete payment");
    }
  },
};
