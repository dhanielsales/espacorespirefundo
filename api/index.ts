import Fastify from "fastify";
import cors from "@fastify/cors";
import { eq, desc } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  students,
  plans,
  studentPayments,
  studentsToPlans,
} from "../db/schema.js";
import { createStudentSchema, updateStudentSchema } from "../db/validations.js";
import { verifyToken, extractTokenFromHeader } from "./auth-utils.js";

const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors, {
  origin: true,
});

// Authentication middleware
fastify.addHook("onRequest", async (request, reply) => {
  // Skip auth for preflight requests
  if (request.method === "OPTIONS") {
    return;
  }

  const token = extractTokenFromHeader(request.headers.authorization);

  if (!token) {
    return reply.code(401).send({ error: "Authentication required" });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return reply.code(401).send({ error: "Invalid or expired token" });
  }

  // Attach user info to request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (request as any).user = payload;
});

// GET /api/students - List all students
fastify.get("/api/students", async (request, reply) => {
  try {
    const allStudents = await db.select().from(students);
    return reply.code(200).send(allStudents);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch students" });
  }
});

// POST /api/students - Create a new student
fastify.post("/api/students", async (request, reply) => {
  try {
    const validation = createStudentSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.code(400).send({
        error: "Validation failed",
        details: validation.error.issues,
      });
    }

    const { planId, ...studentData } = validation.data;

    // Create student
    const newStudent = await db
      .insert(students)
      .values(studentData)
      .returning();

    const student = newStudent[0];

    // Enroll student in plan
    await db.insert(studentsToPlans).values({
      studentId: student.id,
      planId: planId,
    });

    return reply.code(201).send(student);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to create student" });
  }
});

// GET /api/students/:id - Get a single student with plan info
fastify.get("/api/students/:id", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      return reply.code(400).send({ error: "Invalid student ID" });
    }

    const result = await db
      .select({
        id: students.id,
        fullName: students.fullName,
        email: students.email,
        phone: students.phone,
        birthDate: students.birthDate,
        parentName: students.parentName,
        parentEmail: students.parentEmail,
        parentPhone: students.parentPhone,
        observations: students.observations,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
        studentToPlanId: studentsToPlans.id,
        planId: plans.id,
        planName: plans.name,
        planDescription: plans.description,
        planMonthlyFee: plans.monthlyFee,
        planIsActive: plans.isActive,
        enrolledAt: studentsToPlans.enrolledAt,
      })
      .from(students)
      .leftJoin(studentsToPlans, eq(students.id, studentsToPlans.studentId))
      .leftJoin(plans, eq(studentsToPlans.planId, plans.id))
      .where(eq(students.id, studentId))
      .orderBy(desc(studentsToPlans.enrolledAt))
      .limit(1);

    if (result.length === 0) {
      return reply.code(404).send({ error: "Student not found" });
    }

    return reply.code(200).send(result[0]);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch student" });
  }
});

// GET /api/students/:id/payments - Get student's payment history
fastify.get("/api/students/:id/payments", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      return reply.code(400).send({ error: "Invalid student ID" });
    }

    const payments = await db
      .select({
        id: studentPayments.id,
        studentToPlanId: studentPayments.studentToPlanId,
        studentName: students.fullName,
        planName: plans.name,
        month: studentPayments.month,
        year: studentPayments.year,
        amount: studentPayments.amount,
        paymentMethod: studentPayments.paymentMethod,
        paidAt: studentPayments.paidAt,
        observations: studentPayments.observations,
        createdAt: studentPayments.createdAt,
      })
      .from(studentPayments)
      .innerJoin(
        studentsToPlans,
        eq(studentPayments.studentToPlanId, studentsToPlans.id)
      )
      .innerJoin(students, eq(studentsToPlans.studentId, students.id))
      .innerJoin(plans, eq(studentsToPlans.planId, plans.id))
      .where(eq(students.id, studentId))
      .orderBy(desc(studentPayments.year), desc(studentPayments.month));

    return reply.code(200).send(payments);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch student payments" });
  }
});

// PUT /api/students/:id - Update a student
fastify.put("/api/students/:id", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      return reply.code(400).send({ error: "Invalid student ID" });
    }

    const validation = updateStudentSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.code(400).send({
        error: "Validation failed",
        details: validation.error.issues,
      });
    }

    const updatedStudent = await db
      .update(students)
      .set(validation.data)
      .where(eq(students.id, studentId))
      .returning();

    if (updatedStudent.length === 0) {
      return reply.code(404).send({ error: "Student not found" });
    }

    return reply.code(200).send(updatedStudent[0]);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to update student" });
  }
});

// DELETE /api/students/:id - Delete a student
fastify.delete("/api/students/:id", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      return reply.code(400).send({ error: "Invalid student ID" });
    }

    const deletedStudent = await db
      .delete(students)
      .where(eq(students.id, studentId))
      .returning();

    if (deletedStudent.length === 0) {
      return reply.code(404).send({ error: "Student not found" });
    }

    return reply.code(200).send({
      message: "Student deleted successfully",
      student: deletedStudent[0],
    });
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to delete student" });
  }
});

// ===== PLANS ROUTES =====

// GET /api/plans - List all plans
fastify.get("/api/plans", async (request, reply) => {
  try {
    const allPlans = await db.select().from(plans).orderBy(desc(plans.id));
    return reply.code(200).send(allPlans);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch plans" });
  }
});

// GET /api/plans/:id - Get single plan
fastify.get("/api/plans/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const planId = parseInt(id, 10);

  if (isNaN(planId)) {
    return reply.code(400).send({ error: "Invalid plan ID" });
  }

  try {
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    if (!plan) {
      return reply.code(404).send({ error: "Plan not found" });
    }

    return reply.code(200).send(plan);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch plan" });
  }
});

// POST /api/plans - Create new plan
fastify.post("/api/plans", async (request, reply) => {
  const body = request.body as {
    name: string;
    description?: string;
    monthlyFee: number;
    isActive?: number;
  };

  if (!body.name || body.monthlyFee === undefined) {
    return reply.code(400).send({ error: "Name and monthly fee are required" });
  }

  try {
    const [newPlan] = await db
      .insert(plans)
      .values({
        name: body.name,
        description: body.description || null,
        monthlyFee: body.monthlyFee,
        isActive: body.isActive ?? 1,
      })
      .returning();

    return reply.code(201).send(newPlan);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to create plan" });
  }
});

// PUT /api/plans/:id - Update plan
fastify.put("/api/plans/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const planId = parseInt(id, 10);

  if (isNaN(planId)) {
    return reply.code(400).send({ error: "Invalid plan ID" });
  }

  const body = request.body as {
    name?: string;
    description?: string;
    monthlyFee?: number;
    isActive?: number;
  };

  try {
    const [updatedPlan] = await db
      .update(plans)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.monthlyFee !== undefined && { monthlyFee: body.monthlyFee }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      })
      .where(eq(plans.id, planId))
      .returning();

    if (!updatedPlan) {
      return reply.code(404).send({ error: "Plan not found" });
    }

    return reply.code(200).send(updatedPlan);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to update plan" });
  }
});

// DELETE /api/plans/:id - Delete plan
fastify.delete("/api/plans/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const planId = parseInt(id, 10);

  if (isNaN(planId)) {
    return reply.code(400).send({ error: "Invalid plan ID" });
  }

  try {
    await db.delete(plans).where(eq(plans.id, planId));
    return reply.code(204).send();
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to delete plan" });
  }
});

// ===== PAYMENTS ROUTES =====

// GET /api/payments - List all payments with joins
fastify.get("/api/payments", async (request, reply) => {
  try {
    const allPayments = await db
      .select({
        id: studentPayments.id,
        studentToPlanId: studentPayments.studentToPlanId,
        month: studentPayments.month,
        year: studentPayments.year,
        amount: studentPayments.amount,
        paymentMethod: studentPayments.paymentMethod,
        paidAt: studentPayments.paidAt,
        observations: studentPayments.observations,
        createdAt: studentPayments.createdAt,
        studentName: students.fullName,
        planName: plans.name,
      })
      .from(studentPayments)
      .leftJoin(
        studentsToPlans,
        eq(studentPayments.studentToPlanId, studentsToPlans.id)
      )
      .leftJoin(students, eq(studentsToPlans.studentId, students.id))
      .leftJoin(plans, eq(studentsToPlans.planId, plans.id))
      .orderBy(desc(studentPayments.createdAt));

    return reply.code(200).send(allPayments);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch payments" });
  }
});

// GET /api/payments/:id - Get single payment
fastify.get("/api/payments/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const paymentId = parseInt(id, 10);

  if (isNaN(paymentId)) {
    return reply.code(400).send({ error: "Invalid payment ID" });
  }

  try {
    const [payment] = await db
      .select({
        id: studentPayments.id,
        studentToPlanId: studentPayments.studentToPlanId,
        month: studentPayments.month,
        year: studentPayments.year,
        amount: studentPayments.amount,
        paymentMethod: studentPayments.paymentMethod,
        paidAt: studentPayments.paidAt,
        observations: studentPayments.observations,
        createdAt: studentPayments.createdAt,
        studentName: students.fullName,
        planName: plans.name,
      })
      .from(studentPayments)
      .leftJoin(
        studentsToPlans,
        eq(studentPayments.studentToPlanId, studentsToPlans.id)
      )
      .leftJoin(students, eq(studentsToPlans.studentId, students.id))
      .leftJoin(plans, eq(studentsToPlans.planId, plans.id))
      .where(eq(studentPayments.id, paymentId))
      .limit(1);

    if (!payment) {
      return reply.code(404).send({ error: "Payment not found" });
    }

    return reply.code(200).send(payment);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch payment" });
  }
});

// POST /api/payments - Create new payment
fastify.post("/api/payments", async (request, reply) => {
  const body = request.body as {
    studentToPlanId: number;
    month: number;
    year: number;
    amount: number;
    paymentMethod?: "cash" | "credit_card" | "debit_card" | "pix";
    observations?: string;
  };

  if (!body.studentToPlanId || !body.month || !body.year || !body.amount) {
    return reply
      .code(400)
      .send({ error: "Student plan ID, month, year, and amount are required" });
  }

  try {
    const [newPayment] = await db
      .insert(studentPayments)
      .values({
        studentToPlanId: body.studentToPlanId,
        month: body.month,
        year: body.year,
        amount: body.amount,
        paymentMethod: body.paymentMethod || null,
        paidAt: new Date(), // Auto-fill with current timestamp
        observations: body.observations || null,
      })
      .returning();

    return reply.code(201).send(newPayment);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to create payment" });
  }
});

// PUT /api/payments/:id - Update payment
fastify.put("/api/payments/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const paymentId = parseInt(id, 10);

  if (isNaN(paymentId)) {
    return reply.code(400).send({ error: "Invalid payment ID" });
  }

  const body = request.body as {
    month?: number;
    year?: number;
    amount?: number;
    paymentMethod?: "cash" | "credit_card" | "debit_card" | "pix";
    observations?: string;
  };

  try {
    const [updatedPayment] = await db
      .update(studentPayments)
      .set({
        ...(body.month !== undefined && { month: body.month }),
        ...(body.year !== undefined && { year: body.year }),
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.paymentMethod !== undefined && {
          paymentMethod: body.paymentMethod,
        }),
        ...(body.observations !== undefined && {
          observations: body.observations,
        }),
      })
      .where(eq(studentPayments.id, paymentId))
      .returning();

    if (!updatedPayment) {
      return reply.code(404).send({ error: "Payment not found" });
    }

    return reply.code(200).send(updatedPayment);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to update payment" });
  }
});

// DELETE /api/payments/:id - Delete payment
fastify.delete("/api/payments/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const paymentId = parseInt(id, 10);

  if (isNaN(paymentId)) {
    return reply.code(400).send({ error: "Invalid payment ID" });
  }

  try {
    await db.delete(studentPayments).where(eq(studentPayments.id, paymentId));
    return reply.code(204).send();
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to delete payment" });
  }
});

export default async (req: Request, res: Response) => {
  await fastify.ready();
  fastify.server.emit("request", req, res);
};
