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
import { useAuthStore } from "../store/auth";
import { cleanCPF } from "./formatters";

interface User {
  id: number;
  name: string;
  email: string;
}

const API_BASE = "/api";

function handleUnauthorized() {
  useAuthStore.getState().logout();
  window.location.href = "/login";
}

async function handleResponse(response: Response) {
  if (response.status === 403) {
    handleUnauthorized();
    throw new Error("Unauthorized access");
  }
  return response;
}

function getAuthHeaders(includeContentType = true): HeadersInit {
  const token = useAuthStore.getState().token;
  return {
    ...(includeContentType ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to register");
    }
    return response.json();
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> => {
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

  me: async (): Promise<User> => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    return response.json();
  },
};

export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await fetch(`${API_BASE}/students`, {
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
    if (!response.ok) {
      throw new Error("Failed to fetch students");
    }
    return response.json();
  },

  getById: async (id: string): Promise<Student> => {
    const response = await fetch(`${API_BASE}/students/${id}`, {
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
    if (!response.ok) {
      throw new Error("Failed to fetch student");
    }
    return response.json();
  },

  getPayments: async (id: string): Promise<StudentPayment[]> => {
    const response = await fetch(`${API_BASE}/students/${id}/payments`, {
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
    if (!response.ok) {
      throw new Error("Failed to fetch student payments");
    }
    return response.json();
  },

  create: async (data: CreateStudentInput): Promise<Student> => {
    // Clean CPF formatting before sending
    const cleanedData = {
      ...data,
      cpf: data.cpf ? cleanCPF(data.cpf) : undefined,
      parentCpf: data.parentCpf ? cleanCPF(data.parentCpf) : undefined,
    };

    const response = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(cleanedData),
    });
    await handleResponse(response);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create student");
    }
    return response.json();
  },

  update: async (id: string, data: UpdateStudentInput): Promise<Student> => {
    // Clean CPF formatting before sending
    const cleanedData = {
      ...data,
      cpf: data.cpf ? cleanCPF(data.cpf) : undefined,
      parentCpf: data.parentCpf ? cleanCPF(data.parentCpf) : undefined,
    };

    const response = await fetch(`${API_BASE}/students/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(cleanedData),
    });
    await handleResponse(response);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update student");
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/students/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(false),
    });
    await handleResponse(response);
    if (!response.ok) {
      throw new Error("Failed to delete student");
    }
  },

  updatePlanEnrollment: async (
    studentId: string,
    enrollmentId: string,
    data: { planId: string; isActive?: number }
  ): Promise<{ id: string; studentId: string; planId: string }> => {
    const response = await fetch(
      `${API_BASE}/students/${studentId}/plans/${enrollmentId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    await handleResponse(response);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update plan enrollment");
    }
    return response.json();
  },

  createPlanEnrollment: async (
    studentId: string,
    data: { planId: string; isActive?: number }
  ): Promise<{ id: string; studentId: string; planId: string }> => {
    const response = await fetch(`${API_BASE}/students/${studentId}/plans`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    await handleResponse(response);
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
    await handleResponse(response);
    if (!response.ok) {
      throw new Error("Failed to fetch plans");
    }
    return response.json();
  },

  getById: async (id: string): Promise<Plan> => {
    const response = await fetch(`${API_BASE}/plans/${id}`, {
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
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
    await handleResponse(response);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create plan");
    }
    return response.json();
  },

  update: async (id: string, data: UpdatePlanInput): Promise<Plan> => {
    const response = await fetch(`${API_BASE}/plans/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    await handleResponse(response);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update plan");
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/plans/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(false),
    });
    await handleResponse(response);
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
    await handleResponse(response);
    if (!response.ok) {
      throw new Error("Failed to fetch payments");
    }
    return response.json();
  },

  getById: async (id: string): Promise<StudentPayment> => {
    const response = await fetch(`${API_BASE}/payments/${id}`, {
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
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
    await handleResponse(response);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create payment");
    }
    return response.json();
  },

  update: async (
    id: string,
    data: UpdatePaymentInput
  ): Promise<StudentPayment> => {
    const response = await fetch(`${API_BASE}/payments/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    await handleResponse(response);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update payment");
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/payments/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(false),
    });
    await handleResponse(response);
    if (!response.ok) {
      throw new Error("Failed to delete payment");
    }
  },
};
