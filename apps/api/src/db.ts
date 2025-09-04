import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { users } from "../../../packages/db-schema/src/schema"; // ✅ shared schem

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool);


