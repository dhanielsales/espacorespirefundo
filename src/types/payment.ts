export interface StudentPayment {
  id: string; // UUID
  studentToPlanId: string; // UUID
  month: number;
  year: number;
  amount: number;
  paymentMethod?: "cash" | "credit_card" | "debit_card" | "pix" | null;
  paidAt?: string | null;
  observations?: string | null;
  createdAt: string;
  // Joined fields
  studentName?: string | null;
  planName?: string | null;
}

export type paymentMethod = "cash" | "credit_card" | "debit_card" | "pix";

export interface CreatePaymentInput {
  studentToPlanId: string; // UUID
  month: number;
  year: number;
  amount: number;
  paymentMethod?: paymentMethod;
  observations?: string;
}

export interface UpdatePaymentInput {
  month?: number;
  year?: number;
  amount?: number;
  paymentMethod?: paymentMethod;
  observations?: string;
}

export interface CreatePaymentInput {
  studentToPlanId: string; // UUID
  month: number;
  year: number;
  paymentMethod?: "cash" | "credit_card" | "debit_card" | "pix";
  paidAt?: string;
  observations?: string;
}

export interface UpdatePaymentInput {
  month?: number;
  year?: number;
  paymentMethod?: "cash" | "credit_card" | "debit_card" | "pix";
  paidAt?: string;
  observations?: string;
}
