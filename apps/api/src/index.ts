
import { Hono } from 'hono';
import auth from './routes/auth';
import userRoute from './routes/user'
import googleAuth from './routes/google-auth';
import magicLink from './routes/magic-link';
const app = new Hono()
  .route('/auth', auth)
  .route('/user', userRoute)
  .route('/auth', googleAuth)
  .route('/auth', magicLink);
app.get("/", (c) => c.text("Hello Hono + Drizzle + PostgreSQL!"));

export default app;
