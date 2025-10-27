import Fastify from "fastify";
import cors from "@fastify/cors";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { loginSchema, registerSchema } from "../db/validations.js";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
} from "./auth-utils.js";

const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors, {
  origin: true,
});

// POST /api/auth/register - Register a new user (protected by API key)
fastify.post("/api/auth/register", async (request, reply) => {
  try {
    // Check for API key in header
    const apiKey = request.headers["x-registration-key"] as string;
    const validApiKey = process.env.REGISTRATION_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      return reply
        .code(403)
        .send({ error: "Invalid or missing registration API key" });
    }

    const validation = registerSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.code(400).send({
        error: "Validation failed",
        details: validation.error.issues,
      });
    }

    const { name, email, password } = validation.data;

    // Check if email already exists
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingEmail.length > 0) {
      return reply.code(409).send({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning();

    const user = newUser[0];

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      name: user.name,
      email: user.email,
    });

    return reply.code(201).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to register user" });
  }
});

// POST /api/auth/login - Login user
fastify.post("/api/auth/login", async (request, reply) => {
  try {
    const validation = loginSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.code(400).send({
        error: "Validation failed",
        details: validation.error.issues,
      });
    }

    const { email, password } = validation.data;

    // Find user by email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length === 0) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const user = existingUser[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      name: user.name,
      email: user.email,
    });

    return reply.code(200).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to login" });
  }
});

// GET /api/auth/me - Get current user (protected route)
fastify.get("/api/auth/me", async (request, reply) => {
  try {
    const token = extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      return reply.code(401).send({ error: "No authorization token" });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return reply.code(403).send({ error: "Invalid or expired token" });
    }

    // Find user to ensure they still exist
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId));

    if (existingUser.length === 0) {
      return reply.code(403).send({ error: "Invalid or expired token" });
    }

    const user = existingUser[0];

    return reply.code(200).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: "Failed to get user info" });
  }
});

export default async (req: Request, res: Response) => {
  await fastify.ready();
  fastify.server.emit("request", req, res);
};
