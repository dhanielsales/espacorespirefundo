import Fastify from "fastify";
import cors from "@fastify/cors";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { students } from "../db/schema.js";
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

    const newStudent = await db
      .insert(students)
      .values(validation.data)
      .returning();
    return reply.code(201).send(newStudent[0]);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to create student" });
  }
});

// GET /api/students/:id - Get a single student
fastify.get("/api/students/:id", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const studentId = parseInt(id, 10);

    if (isNaN(studentId)) {
      return reply.code(400).send({ error: "Invalid student ID" });
    }

    const student = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId));

    if (student.length === 0) {
      return reply.code(404).send({ error: "Student not found" });
    }

    return reply.code(200).send(student[0]);
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to fetch student" });
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

export default async (req: Request, res: Response) => {
  await fastify.ready();
  fastify.server.emit("request", req, res);
};
