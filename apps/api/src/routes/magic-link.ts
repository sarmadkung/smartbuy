import { OpenAPIHono } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import { Resend } from 'resend';

const magicLink = new OpenAPIHono()
  .openapi(
    {
      method: 'post',
      path: '/magic-link',
      request: {
        body: {
          content: {
            'application/json': {
              schema: z.object({
                email: z.string().email(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Magic link sent',
          content: {
            'application/json': {
              schema: z.object({ message: z.string() }),
            },
          },
        },
      },
    },
    async (c) => {
      const { email } = await c.req.json<{ email: string }>();
      const token = crypto.randomUUID();
      const magicLink = `${process.env.FRONTEND_URL}/login?token=${token}`;

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "SmartBuy <info@remoteline.it>",
        to: email,
        subject: "Your SmartBuy Magic Login Link",
        html: `<a href="${magicLink}" target="_blank">${magicLink}</a>`,
      });

      return c.json({ message: "Magic link sent!" });
    }
  );

export default magicLink;