export interface StudentPlanEnrollment {
  id: number; // studentToPlanId
  planId: number;
  planName: string;
  planDescription: string | null;
  planMonthlyFee: number;
  planIsActive: number;
  enrollmentIsActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  birthDate: string;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  // Plan enrollments
  plans: StudentPlanEnrollment[];
}

export interface CreateStudentInput {
  fullName: string;
  email?: string;
  phone?: string;
  birthDate: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  observations?: string;
  planId: number;
}

export interface UpdateStudentInput {
  fullName?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  parentName?: string;
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
