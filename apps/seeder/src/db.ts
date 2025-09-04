import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../packages/db-schema/src/schema"; // ← import shared schema package

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // make sure it's set in .env
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.query('SELECT 1', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database successfully!');
  }
});

export const db = drizzle(pool, { schema });