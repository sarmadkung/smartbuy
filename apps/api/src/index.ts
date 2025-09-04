import { Hono } from "hono";
import auth from "./routes/auth";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono + Drizzle + PostgreSQL!"));

app.route("/auth", auth);

export default app;

