import Fastify from "fastify";
import cors from "@fastify/cors";
import { eq, desc, isNull, and, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  students,
  plans,
  studentPayments,
  studentsToPlans,
  users,
} from "../db/schema.js";
import { createStudentSchema, updateStudentSchema } from "../db/validations.js";
import { verifyToken, extractTokenFromHeader } from "./auth-utils.js";

const fastify = Fastify({ logger: true });

// Helper function to clean CPF (remove formatting)
function cleanCPF(cpf: string | null | undefined): string | null {
  if (!cpf) return null;
  // Remove all non-digit characters
  const cleaned = cpf.replace(/\D/g, "");
  return cleaned.length === 11 ? cleaned : null;
}

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

  // Skip auth for public auth endpoints
  if (request.url.startsWith("/api/auth/")) {
    return;
  }

  const token = extractTokenFromHeader(request.headers.authorization);

  if (!token) {
    return reply.code(403).send({ error: "Authentication required" });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return reply.code(403).send({ error: "Invalid or expired token" });
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);
  if (!user) {
    return reply.code(403).send({ error: "Invalid or expired token" });
  }

  // Attach user info to request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (request as any).user = user;
});

// GET /api/students - List all students with pagination and filters
fastify.get("/api/students", async (request, reply) => {
  try {
    const query = request.query as {
      page?: string;
      limit?: string;
      search?: string;
    };

    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [isNull(students.deletedAt)];

    if (query.search) {
      conditions.push(
        sql`${students.fullName} ILIKE ${`%${query.search}%`} OR ${
          students.cpf
        } ILIKE ${`%${cleanCPF(query.search)}%`}`
      );
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(students)
      .where(and(...conditions));

    // Get paginated results
    const allStudents = await db
      .select()
      .from(students)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(students.createdAt));

    const totalPages = Math.ceil(count / limit);

    return reply.code(200).send({
      data: allStudents,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
      },
    });
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

    const { planId, cpf, parentCpf, ...studentData } = validation.data;

    // Clean CPF formatting (double safety: frontend + backend)
    const cleanedCpf = cpf ? cleanCPF(cpf) : null;
    const cleanedParentCpf = parentCpf ? cleanCPF(parentCpf) : null;

    // Create student and enrollment in a transaction
    const result = await db.transaction(async (tx) => {
      // Create student
      const newStudent = await tx
        .insert(students)
        .values({
          ...studentData,
          cpf: cleanedCpf,
          parentCpf: cleanedParentCpf,
        })
        .returning();

      const student = newStudent[0];

      // Enroll student in plan
      await tx.insert(studentsToPlans).values({
        studentId: student.id,
        planId: planId,
      });

      return student;
    });

    return reply.code(201).send(result);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to create student" });
  }
});

// GET /api/students/:id - Get a single student with their plan enrollments
fastify.get("/api/students/:id", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };

    if (!id) {
      return reply.code(400).send({ error: "Invalid student ID" });
    }

    // Get student data
    const [student] = await db
      .select()
      .from(students)
      .where(and(eq(students.id, id), isNull(students.deletedAt)))
      .limit(1);

    if (!student) {
      return reply.code(404).send({ error: "Student not found" });
    }

    // Get student's plan enrollments
    const studentPlans = await db
      .select({
        id: studentsToPlans.id,
        planId: plans.id,
        planName: plans.name,
        planDescription: plans.description,
        planMonthlyFee: plans.monthlyFee,
        planIsActive: plans.isActive,
        enrollmentIsActive: studentsToPlans.isActive,
        createdAt: studentsToPlans.createdAt,
        updatedAt: studentsToPlans.updatedAt,
      })
      .from(studentsToPlans)
      .innerJoin(plans, eq(studentsToPlans.planId, plans.id))
      .where(eq(studentsToPlans.studentId, id))
      .orderBy(desc(studentsToPlans.createdAt));

    return reply.code(200).send({
      ...student,
      plans: studentPlans,
    });
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch student" });
  }
});

// GET /api/students/:id/payments - Get student's payment history
fastify.get("/api/students/:id/payments", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };

    if (!id) {
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
      .where(eq(students.id, id))
      .orderBy(desc(studentPayments.year), desc(studentPayments.month));

    return reply.code(200).send(payments);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch student payments" });
  }
});

// GET /api/students/:id/plans - Get student's enrolled plans
fastify.get("/api/students/:id/plans", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };

    if (!id) {
      return reply.code(400).send({ error: "Invalid student ID" });
    }

    const studentPlans = await db
      .select({
        id: studentsToPlans.id,
        studentId: studentsToPlans.studentId,
        planId: studentsToPlans.planId,
        planName: plans.name,
        planDescription: plans.description,
        monthlyFee: plans.monthlyFee,
        isActive: plans.isActive,
        createdAt: studentsToPlans.createdAt,
      })
      .from(studentsToPlans)
      .innerJoin(plans, eq(studentsToPlans.planId, plans.id))
      .where(eq(studentsToPlans.studentId, id))
      .orderBy(desc(studentsToPlans.createdAt));

    return reply.code(200).send(studentPlans);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch student plans" });
  }
});

// POST /api/students/:id/plans - Create a new plan enrollment for student
fastify.post("/api/students/:id/plans", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };

    if (!id) {
      return reply.code(400).send({ error: "Invalid student ID" });
    }

    const body = request.body as { planId?: string; isActive?: number };

    if (!body.planId) {
      return reply.code(400).send({ error: "planId is required" });
    }

    // Verify student exists
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!student) {
      return reply.code(404).send({ error: "Student not found" });
    }

    // Verify plan exists
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, body.planId))
      .limit(1);

    if (!plan) {
      return reply.code(404).send({ error: "Plan not found" });
    }

    // Create the enrollment
    const enrollmentData: {
      studentId: string;
      planId: string;
      isActive?: number;
    } = {
      studentId: id,
      planId: body.planId,
    };

    if (body.isActive !== undefined) {
      enrollmentData.isActive = body.isActive;
    }

    const [newEnrollment] = await db
      .insert(studentsToPlans)
      .values(enrollmentData)
      .returning();

    return reply.code(201).send(newEnrollment);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to create plan enrollment" });
  }
});

// PUT /api/students/:id/plans/:enrollmentId - Update student plan enrollment
fastify.put("/api/students/:id/plans/:enrollmentId", async (request, reply) => {
  try {
    const { id, enrollmentId } = request.params as {
      id: string;
      enrollmentId: string;
    };

    if (!id || !enrollmentId) {
      return reply.code(400).send({ error: "Invalid ID" });
    }

    const body = request.body as { planId?: string; isActive?: number };

    if (!body.planId) {
      return reply.code(400).send({ error: "planId is required" });
    }

    // Verify the enrollment belongs to the student
    const existingEnrollment = await db
      .select()
      .from(studentsToPlans)
      .where(eq(studentsToPlans.id, enrollmentId));

    if (existingEnrollment.length === 0) {
      return reply.code(404).send({ error: "Enrollment not found" });
    }

    if (existingEnrollment[0].studentId !== id) {
      return reply
        .code(403)
        .send({ error: "Enrollment does not belong to this student" });
    }

    // Update the enrollment
    const updateData: { planId: string; isActive?: number } = {
      planId: body.planId,
    };

    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }

    const updated = await db
      .update(studentsToPlans)
      .set(updateData)
      .where(eq(studentsToPlans.id, enrollmentId))
      .returning();

    return reply.code(200).send(updated[0]);
  } catch (error) {
    fastify.log.error(error);
    return reply
      .code(500)
      .send({ error: "Failed to update student plan enrollment" });
  }
});

// PUT /api/students/:id - Update a student
fastify.put("/api/students/:id", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };

    if (!id) {
      return reply.code(400).send({ error: "Invalid student ID" });
    }

    const validation = updateStudentSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.code(400).send({
        error: "Validation failed",
        details: validation.error.issues,
      });
    }

    // Clean CPF formatting if provided (double safety: frontend + backend)
    const { cpf, parentCpf, ...otherData } = validation.data;
    const updateData = {
      ...otherData,
      ...(cpf !== undefined && { cpf: cpf ? cleanCPF(cpf) : null }),
      ...(parentCpf !== undefined && {
        parentCpf: parentCpf ? cleanCPF(parentCpf) : null,
      }),
    };

    const updatedStudent = await db
      .update(students)
      .set(updateData)
      .where(and(eq(students.id, id), isNull(students.deletedAt)))
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

// DELETE /api/students/:id - Soft delete a student
fastify.delete("/api/students/:id", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };

    if (!id) {
      return reply.code(400).send({ error: "Invalid student ID" });
    }

    // Soft delete by setting deletedAt timestamp
    const deletedStudent = await db
      .update(students)
      .set({ deletedAt: new Date() })
      .where(and(eq(students.id, id), isNull(students.deletedAt)))
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
// GET /api/plans - List all plans with pagination and filters
fastify.get("/api/plans", async (request, reply) => {
  try {
    const query = request.query as {
      page?: string;
      limit?: string;
      search?: string;
    };

    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (query.search) {
      conditions.push(sql`${plans.name} ILIKE ${`%${query.search}%`}`);
    }

    // Get total count
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(plans);

    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }

    const [{ count }] = await countQuery;

    // Get paginated results
    const plansQuery = db
      .select()
      .from(plans)
      .orderBy(desc(plans.id))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      plansQuery.where(and(...conditions));
    }

    const allPlans = await plansQuery;

    const totalPages = Math.ceil(count / limit);

    return reply.code(200).send({
      data: allPlans,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
      },
    });
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch plans" });
  }
});

// GET /api/plans/:id - Get single plan
fastify.get("/api/plans/:id", async (request, reply) => {
  const { id } = request.params as { id: string };

  if (!id) {
    return reply.code(400).send({ error: "Invalid plan ID" });
  }

  try {
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, id))
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

  if (!id) {
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
      .where(eq(plans.id, id))
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

// ===== PAYMENTS ROUTES =====

// GET /api/payments - List all payments with joins, pagination and filters
fastify.get("/api/payments", async (request, reply) => {
  try {
    const query = request.query as {
      page?: string;
      limit?: string;
      search?: string;
      planId?: string;
    };

    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (query.search) {
      conditions.push(
        sql`${students.fullName} ILIKE ${`%${query.search}%`} OR ${
          students.cpf
        } ILIKE ${`%${cleanCPF(query.search)}%`}`
      );
    }

    if (query.planId) {
      conditions.push(eq(plans.id, query.planId));
    }

    // Get total count
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(studentPayments)
      .leftJoin(
        studentsToPlans,
        eq(studentPayments.studentToPlanId, studentsToPlans.id)
      )
      .leftJoin(students, eq(studentsToPlans.studentId, students.id))
      .leftJoin(plans, eq(studentsToPlans.planId, plans.id));

    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }

    const [{ count }] = await countQuery;

    // Get paginated results
    const paymentsQuery = db
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
        studentId: students.id,
        studentDeletedAt: students.deletedAt,
        planName: plans.name,
      })
      .from(studentPayments)
      .leftJoin(
        studentsToPlans,
        eq(studentPayments.studentToPlanId, studentsToPlans.id)
      )
      .leftJoin(students, eq(studentsToPlans.studentId, students.id))
      .leftJoin(plans, eq(studentsToPlans.planId, plans.id))
      .orderBy(desc(studentPayments.createdAt))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      paymentsQuery.where(and(...conditions));
    }

    const allPayments = await paymentsQuery;

    const totalPages = Math.ceil(count / limit);

    return reply.code(200).send({
      data: allPayments,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
      },
    });
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch payments" });
  }
});

// GET /api/payments/:id - Get single payment
fastify.get("/api/payments/:id", async (request, reply) => {
  const { id } = request.params as { id: string };

  if (!id) {
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
      .where(eq(studentPayments.id, id))
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
    studentToPlanId: string;
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
    // Get the planId from studentsToPlans
    const [enrollment] = await db
      .select({ planId: studentsToPlans.planId })
      .from(studentsToPlans)
      .where(eq(studentsToPlans.id, body.studentToPlanId))
      .limit(1);

    if (!enrollment) {
      return reply
        .code(404)
        .send({ error: "Student plan enrollment not found" });
    }

    const [newPayment] = await db
      .insert(studentPayments)
      .values({
        studentToPlanId: body.studentToPlanId,
        month: body.month,
        planId: enrollment.planId, // Auto-fill from studentsToPlans
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

  if (!id) {
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
      .where(eq(studentPayments.id, id))
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

export default async (req: Request, res: Response) => {
  await fastify.ready();
  fastify.server.emit("request", req, res);
};
