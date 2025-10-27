import {
  pgTable,
  serial,
  varchar,
  date,
  timestamp,
  integer,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Payment method enum
export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "credit_card",
  "debit_card",
  "pix",
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // hashed password
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 25 }),
  birthDate: date("birth_date").notNull(),
  parentName: varchar("parent_name", { length: 255 }),
  parentEmail: varchar("parent_email", { length: 255 }),
  parentPhone: varchar("parent_phone", { length: 25 }),
  observations: text("observations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Plans table
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  monthlyFee: integer("monthly_fee").notNull(), // Store in cents
  isActive: integer("is_active").notNull().default(1), // 1 = active, 0 = inactive
});

// Students to plans junction table
export const studentsToPlans = pgTable("students_to_plans", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  planId: integer("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  isActive: integer("is_active").notNull().default(1), // 1 = active, 0 = inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Student payments table
export const studentPayments = pgTable("student_payments", {
  id: serial("id").primaryKey(),
  studentToPlanId: integer("student_to_plan_id")
    .notNull()
    .references(() => studentsToPlans.id, { onDelete: "cascade" }),
  planId: integer("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  amount: integer("amount").notNull(), // Payment amount in cents
  paymentMethod: paymentMethodEnum("payment_method"),
  paidAt: timestamp("paid_at"),
  observations: text("observations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const studentsRelations = relations(students, ({ many }) => ({
  studentsToPlans: many(studentsToPlans),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  studentsToPlans: many(studentsToPlans),
}));

export const studentsToPlansRelations = relations(
  studentsToPlans,
  ({ one, many }) => ({
    student: one(students, {
      fields: [studentsToPlans.studentId],
      references: [students.id],
    }),
    plan: one(plans, {
      fields: [studentsToPlans.planId],
      references: [plans.id],
    }),
    payments: many(studentPayments),
  })
);

export const studentPaymentsRelations = relations(
  studentPayments,
  ({ one }) => ({
    studentToPlan: one(studentsToPlans, {
      fields: [studentPayments.studentToPlanId],
      references: [studentsToPlans.id],
    }),
    plan: one(plans, {
      fields: [studentPayments.planId],
      references: [plans.id],
    }),
  })
);
