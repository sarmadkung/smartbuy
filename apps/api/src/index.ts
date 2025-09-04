import { Hono } from "hono";
import { getDb } from "./db/client";
import { users } from "../../../packages/db-schema/src/schema";

const app = new Hono<{ Bindings: { DATABASE_URL: string } }>();

app.get("/", (c) => c.text("Hello Hono + Drizzle + PostgreSQL!"));

app.get("/users", async (c) => {
  const db = getDb(c.env);
  const allUsers = await db.select().from(users);
  return c.json(allUsers);
});

app.post("/users", async (c) => {
  const body = await c.req.json<{ name: string; email: string }>();
  const db = getDb(c.env);
  const inserted = await db
    .insert(users)
    .values({ name: body.name, email: body.email })
    .returning();
  return c.json(inserted[0]);
});

export default app;
