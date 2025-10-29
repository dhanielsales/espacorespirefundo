export interface StudentPayment {
  id: string; // UUID
  studentToPlanId: string; // UUID
  month: number;
  year: number;
  amount: number;
  paymentMethod?: PaymentMethod | null;
  paidAt?: string | null;
  observations?: string | null;
  createdAt: string;
  // Joined fields
  studentId?: string;
  studentName?: string | null;
  studentDeletedAt?: string | null;
  planName?: string | null;
}

export interface CreatePaymentInput {
  studentToPlanId: string; // UUID
  month: number;
  year: number;
  amount: number;
  paymentMethod?: PaymentMethod;
  observations?: string;
}

export interface UpdatePaymentInput {
  month?: number;
  year?: number;
  amount?: number;
  paymentMethod?: PaymentMethod;
  observations?: string;
}

export interface CreatePaymentInput {
  studentToPlanId: string; // UUID
  month: number;
  year: number;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  observations?: string;
}

export interface UpdatePaymentInput {
  month?: number;
  year?: number;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  observations?: string;
}

export type PaymentMethod = "cash" | "credit_card" | "debit_card" | "pix";

export const paymentMethodsLabels: Record<string, string> = {
  cash: "Dinheiro",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  pix: "PIX",
};
