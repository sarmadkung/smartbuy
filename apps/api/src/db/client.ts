import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// We export a factory function so each request can create a db instance
export function getDb(env: { DATABASE_URL: string }) {
  const client = postgres(env.DATABASE_URL, {
    max: 5,           // small connection pool
    fetch_types: false
  });

  return drizzle(client, { schema });
}

