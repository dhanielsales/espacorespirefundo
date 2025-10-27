export interface StudentPlanEnrollment {
  id: string; // studentToPlanId (UUID)
  planId: string;
  planName: string;
  planDescription: string | null;
  planMonthlyFee: number;
  planIsActive: number;
  enrollmentIsActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string; // UUID
  fullName: string;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  birthDate: string;
  parentName: string | null;
  parentCpf: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  // Plan enrollments
  plans: StudentPlanEnrollment[];
}

export interface CreateStudentInput {
  fullName: string;
  cpf?: string;
  email?: string;
  phone?: string;
  birthDate: string;
  parentName?: string;
  parentCpf?: string;
  parentEmail?: string;
  parentPhone?: string;
  observations?: string;
  planId: string; // UUID
}

export interface UpdateStudentInput {
  fullName?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  parentName?: string;
  parentCpf?: string;
  parentEmail?: string;
  parentPhone?: string;
  observations?: string;
}

export interface Plan {
  id: number;
  name: string;
  description: string | null;
  monthlyFee: number;
}

export type PaymentMethod =
  | "cash"
  | "credit_card"
  | "debit_card"
  | "pix"
  | "bank_transfer"
  | "check";

export interface StudentPayment {
  id: number;
  studentToPlanId: number;
  month: number;
  year: number;
  paymentMethod: PaymentMethod | null;
  paidAt: string | null;
  observations: string | null;
  createdAt: string;
}
