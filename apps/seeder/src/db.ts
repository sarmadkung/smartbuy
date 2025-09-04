import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../packages/db-schema/src/schema"; // ← import shared schema package

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // make sure it's set in .env
});

export const db = drizzle(pool, { schema });
