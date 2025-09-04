import { OpenAPIHono } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import * as jose from 'jose';
import { db } from '../db';
import { users } from '../../../../packages/db-schema/src/schema';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key"
);

async function verifyJwt(token: string) {
  const { payload } = await jose.jwtVerify(token, secret);
  return payload;
}

const userRoute = new OpenAPIHono()
  .openapi(
    {
      method: 'get',
      path: '/me',
      responses: {
        200: {
          description: 'Current user',
          content: {
            'application/json': {
              schema: z.object({ user: z.any() }),
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
    async (c) => {
      const authHeader = c.req.header("Authorization");
      if (!authHeader) return c.text("Unauthorized", 401);

      try {
        const token = authHeader.replace("Bearer ", "");
        const payload = await verifyJwt(token);
        return c.json({ user: payload });
      } catch {
        return c.text("Invalid or expired token", 401);
      }
    }
  );

export default userRoute;