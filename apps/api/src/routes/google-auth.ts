import { OpenAPIHono } from '@hono/zod-openapi';
import { db } from '../db';
import { users } from '../../../../packages/db-schema/src/schema';
import * as jose from 'jose';

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

const googleAuth = new OpenAPIHono()
  .get('/google', (c) => {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    return c.redirect(url.toString());
  })
  .get('/google/callback', async (c) => {
    const code = c.req.query("code");
    if (!code) return c.text("Missing code", 400);

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

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
    });

    const tokenData = (await tokenRes.json()) as { id_token?: string };
    if (!tokenData.id_token) return c.text("Failed to get ID token", 400);

    const payload = JSON.parse(
      Buffer.from(tokenData.id_token.split(".")[1], "base64url").toString()
    );
    const email = payload.email;
    const username = payload.name || email.split("@")[0];
    const googleId = payload.sub;

    let user = await db
      .select()
      .from(users)
      .where((eq(users.email, email)))
      .limit(1);
    if (user.length === 0) {
      const dummyPassword = `google-${googleId}`;
      const [newUser] = await db
        .insert(users)
        .values({ username, email, password: dummyPassword })
        .returning();
      user = [newUser];
    }

    const token = await signJwt({ id: user[0].id, email: user[0].email });
    return c.json({
      message: "Logged in with Google",
      token,
      user: user[0],
    });
  });

export default googleAuth;