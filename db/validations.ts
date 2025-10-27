import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(255),
  email: z.string().email("Invalid email address").max(255).optional(),
  phone: z.string().max(25).optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  parentName: z.string().max(255).optional(),
  parentEmail: z.string().email("Invalid email address").max(255).optional(),
  parentPhone: z.string().max(25).optional(),
  observations: z.string().optional(),
});

export const updateStudentSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(25).optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  parentName: z.string().max(255).optional(),
  parentEmail: z.string().email().max(255).optional(),
  parentPhone: z.string().max(25).optional(),
  observations: z.string().optional(),
});

export const createPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required").max(200),
  description: z.string().optional(),
  monthlyFee: z.number().int().min(0, "Monthly fee must be positive"),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  monthlyFee: z.number().int().min(0).optional(),
});

export const createPaymentSchema = z.object({
  studentToPlanId: z.number().int().positive(),
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
  name: z.string().min(3, "Name must be at least 3 characters").max(255),
  email: z.string().email("Invalid email address").max(255),
  password: z
    .string()
    .min(5, "Password must be at least 6 characters")
    .max(255),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
