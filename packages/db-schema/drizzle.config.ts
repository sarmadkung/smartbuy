import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import { join } from "path";

// load env from the monorepo root
dotenv.config({ path: join(__dirname, "../../.env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});


