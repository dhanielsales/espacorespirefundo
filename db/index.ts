import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";

import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Check if using Neon (contains neon.tech in URL) or local PostgreSQL
const isNeon = process.env.DATABASE_URL.includes("neon.tech");

function createDatabase() {
  if (isNeon) {
    const sql = neon(process.env.DATABASE_URL!);
    return drizzleNeon(sql, { schema });
  } else {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
    });
    return drizzlePostgres(pool, { schema });
  }
}

export const db = createDatabase();
