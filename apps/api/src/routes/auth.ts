import { OpenAPIHono } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import * as bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { db } from '../db';
import { users } from '../../../../packages/db-schema/src/schema';
import { Resend } from 'resend';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key"
);

async function signJwt(payload: object) {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

const auth = new OpenAPIHono()
  .openapi(
    {
      method: 'post',
      path: '/register',
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                email: z.string().email(),
                username: z.string(),
                password: z.string().min(6),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User registered',
          content: {
            'application/json': {
              schema: z.object({
                id: z.number(),
                email: z.string(),
                username: z.string(),
              }),
            },
          },
        },
      },
    },
    async (c) => {
      const body = await c.req.json<{
        email: string;
        username: string;
        password: string;
      }>();
      const hashedPassword = await bcrypt.hash(body.password, 10);

      const [newUser] = await db
        .insert(users)
        .values({
          email: body.email,
          username: body.username,
          password: hashedPassword,
        })
        .returning();

      return c.json({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      });
    }
  )
  .openapi(
    {
      method: 'post',
      path: '/login',
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                email: z.string().email(),
                password: z.string(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login success',
          content: {
            'application/json': {
              schema: z.object({
                token: z.string(),
                user: z.object({
                  id: z.number(),
                  email: z.string(),
                  username: z.string(),
                }),
              }),
            },
          },
        },
        401: { description: 'Invalid credentials' },
      },
    },
    async (c) => {
      const body = await c.req.json<{ email: string; password: string }>();
      const foundUsers = await db
        .select()
        .from(users)
        .where((eq(users.email, body.email)))
        .limit(1);
      if (foundUsers.length === 0) return c.text("User not found", 404);

      const user = foundUsers[0];
      const isPasswordValid = await bcrypt.compare(body.password, user.password);
      if (!isPasswordValid) return c.text("Invalid password", 401);

      const token = await signJwt({ id: user.id, email: user.email });
      return c.json({
        token,
        user: { id: user.id, email: user.email, username: user.username },
      });
    }
  )
  .doc('/openapi.json', {
    openapi: '3.0.0',
    info: { title: 'Auth API', version: '1.0.0' },
  })
  .get('/docs', (c) =>
    c.html(`
    <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
      </head>
      <body>
        <div id="ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({ url: '/auth/openapi.json', dom_id:'#ui' })
        </script>
      </body>
    </html>
  `)
  );

export default auth;