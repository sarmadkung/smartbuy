import "dotenv/config"
import { OpenAPIHono } from "@hono/zod-openapi"
import { createRoute, z } from "@hono/zod-openapi"
import { eq } from "drizzle-orm"
import * as bcrypt from "bcryptjs"
import * as jose from "jose"
import { db } from "../db" // adjust path
import { users } from "../../../../packages/db-schema/src/schema" // adjust path
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const auth = new OpenAPIHono()

const clientId = process.env.GOOGLE_CLIENT_ID!
const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
const redirectUri = process.env.GOOGLE_REDIRECT_URI!

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key"
)

// --- Helper functions ---
async function signJwt(payload: object) {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret)
}

async function verifyJwt(token: string) {
  const { payload } = await jose.jwtVerify(token, secret)
  return payload
}

// ====================== ROUTES ======================

// --- Magic Link ---
auth.openapi(
  createRoute({
    method: "post",
    path: "/magic-link",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: z.string().email().openapi({ example: "user@example.com" }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Magic link sent",
        content: {
          "application/json": {
            schema: z.object({ message: z.string() }),
          },
        },
      },
    },
  }),
  async (c) => {
    const { email } = await c.req.json<{ email: string }>()
    const token = crypto.randomUUID()
    const magicLink = `${process.env.FRONTEND_URL}/login?token=${token}`

    await resend.emails.send({
      from: "SmartBuy <info@remoteline.it>",
      to: email,
      subject: "Your SmartBuy Magic Login Link",
      html: `<a href="${magicLink}" target="_blank">${magicLink}</a>`,
    })

    return c.json({ message: "Magic link sent!" })
  }
)

// --- Register ---
auth.openapi(
  createRoute({
    method: "post",
    path: "/register",
    request: {
      body: {
        content: {
          "application/json": {
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
        description: "User registered",
        content: {
          "application/json": {
            schema: z.object({
              id: z.number(),
              email: z.string(),
              username: z.string(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const body = await c.req.json<{
      email: string
      username: string
      password: string
    }>()
    const hashedPassword = await bcrypt.hash(body.password, 10)

    const [newUser] = await db
      .insert(users)
      .values({
        email: body.email,
        username: body.username,
        password: hashedPassword,
      })
      .returning()

    return c.json({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    })
  }
)

// --- Login ---
auth.openapi(
  createRoute({
    method: "post",
    path: "/login",
    request: {
      body: {
        content: {
          "application/json": {
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
        description: "Login success",
        content: {
          "application/json": {
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
      401: { description: "Invalid credentials" },
    },
  }),
  async (c) => {
    const body = await c.req.json<{ email: string; password: string }>()
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1)
    if (foundUsers.length === 0) return c.text("User not found", 404)

    const user = foundUsers[0]
    const isPasswordValid = await bcrypt.compare(body.password, user.password)
    if (!isPasswordValid) return c.text("Invalid password", 401)

    const token = await signJwt({ id: user.id, email: user.email })
    return c.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    })
  }
)

// --- Me ---
auth.openapi(
  createRoute({
    method: "get",
    path: "/me",
    responses: {
      200: {
        description: "Current user",
        content: {
          "application/json": {
            schema: z.object({ user: z.any() }),
          },
        },
      },
      401: { description: "Unauthorized" },
    },
  }),
  async (c) => {
    const authHeader = c.req.header("Authorization")
    if (!authHeader) return c.text("Unauthorized", 401)

    try {
      const token = authHeader.replace("Bearer ", "")
      const payload = await verifyJwt(token)
      return c.json({ user: payload })
    } catch {
      return c.text("Invalid or expired token", 401)
    }
  }
)

// --- Google OAuth2 --- (skip OpenAPI since redirect flows aren’t testable in Swagger)
auth.get("/google", (c) => {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", "openid email profile")
  return c.redirect(url.toString())
})

auth.get("/google/callback", async (c) => {
  const code = c.req.query("code")
  if (!code) return c.text("Missing code", 400)

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  const tokenData = (await tokenRes.json()) as { id_token?: string }
  if (!tokenData.id_token) return c.text("Failed to get ID token", 400)

  const payload = JSON.parse(
    Buffer.from(tokenData.id_token.split(".")[1], "base64url").toString()
  )
  const email = payload.email
  const username = payload.name || email.split("@")[0]
  const googleId = payload.sub

  let user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  if (user.length === 0) {
    const dummyPassword = `google-${googleId}`
    const [newUser] = await db
      .insert(users)
      .values({ username, email, password: dummyPassword })
      .returning()
    user = [newUser]
  }

  const token = await signJwt({ id: user[0].id, email: user[0].email })
  return c.json({
    message: "Logged in with Google",
    token,
    user: user[0],
  })
})

//====================== OPENAPI ======================

// Serve OpenAPI JSON
auth.doc("/openapi.json", {
  openapi: "3.0.0",
  info: { title: "Auth API", version: "1.0.0" },
})

// Serve Swagger UI
auth.get("/docs", (c) =>
  c.html(`
  <html>
    <head>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    </head>
    <body>
      <div id="ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
      <script>
        SwaggerUIBundle({ url: 'http://localhost:8787/auth/openapi.json', dom_id:'#ui' })
      </script>
    </body>
  </html>
`)
)





export default auth
