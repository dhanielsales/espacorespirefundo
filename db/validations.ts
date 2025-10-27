import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().min(1, "Nome completo é obrigatório").max(255),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos")
    .or(z.literal(""))
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  email: z
    .string()
    .email("Email inválido")
    .max(255)
    .or(z.literal(""))
    .optional(),
  phone: z.string().max(25).optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  parentName: z.string().max(255).optional(),
  parentCpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos")
    .or(z.literal(""))
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  parentEmail: z
    .string()
    .email("Email inválido")
    .max(255)
    .or(z.literal(""))
    .optional(),
  parentPhone: z.string().max(25).optional(),
  observations: z.string().optional(),
  planId: z.string().uuid("Plano é obrigatório"),
});

export const updateStudentSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  cpf: z
    .string()
    .regex(/^\d{11}$/)
    .or(z.literal(""))
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  email: z.string().email().max(255).or(z.literal("")).optional(),
  phone: z.string().max(25).optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  parentName: z.string().max(255).optional(),
  parentCpf: z
    .string()
    .regex(/^\d{11}$/)
    .or(z.literal(""))
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  parentEmail: z.string().email().max(255).or(z.literal("")).optional(),
  parentPhone: z.string().max(25).optional(),
  observations: z.string().optional(),
});

export const createPlanSchema = z.object({
  name: z.string().min(1, "Nome do plano é obrigatório").max(200),
  description: z.string().optional(),
  monthlyFee: z.number().int().min(0, "Mensalidade deve ser positiva"),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  monthlyFee: z.number().int().min(0).optional(),
});

export const createPaymentSchema = z.object({
  studentToPlanId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  paymentMethod: z
    .enum(["cash", "credit_card", "debit_card", "pix"])
    .optional(),
  paidAt: z.string().datetime().optional(),
  observations: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).optional(),
  paymentMethod: z
    .enum([
      "cash",
      "credit_card",
      "debit_card",
      "pix",
      "bank_transfer",
      "check",
    ])
    .optional(),
  paidAt: z.string().datetime().optional(),
  observations: z.string().optional(),
});

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(255),
  email: z.string().email("Email inválido").max(255),
  password: z
    .string()
    .min(5, "Senha deve ter pelo menos 6 caracteres")
    .max(255),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
