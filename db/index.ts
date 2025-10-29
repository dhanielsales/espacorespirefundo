import { drizzle as drizzleNeonWs } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { Pool } from "pg";

import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Check if using Neon (contains neon.tech in URL) or local PostgreSQL
const isNeon = process.env.DATABASE_URL.includes("neon.tech");

function createDatabase() {
  if (isNeon) {
    // Use WebSocket driver for Neon (supports transactions)
    const pool = new NeonPool({ connectionString: process.env.DATABASE_URL! });
    return drizzleNeonWs(pool, { schema });
  } else {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
    });
    return drizzlePostgres(pool, { schema });
  }
}

export const db = createDatabase();
