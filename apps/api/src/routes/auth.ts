import "dotenv/config";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import * as jose from "jose";
import { db } from "../db"; // adjust path
import { users } from "../../../../packages/db-schema/src/schema"; // adjust path

const auth = new Hono();

const clientId = process.env.GOOGLE_CLIENT_ID!;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key");

// Helper to sign JWT
async function signJwt(payload: object) {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

// Helper to verify JWT
async function verifyJwt(token: string) {
  const { payload } = await jose.jwtVerify(token, secret);
  return payload;
}

// Register
auth.post("/register", async (c) => {
  const body = await c.req.json<{ email: string; username: string; password: string }>();

  // Hash password
  const hashedPassword = await bcrypt.hash(body.password, 10);

  // Insert user and return inserted row
  const [newUser] = await db.insert(users).values({
    email: body.email,
    username: body.username,
    password: hashedPassword,
  }).returning();

  return c.json({
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
  });
});

// Login
auth.post("/login", async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();

  // Find user
  const foundUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email))
    .limit(1);

  if (foundUsers.length === 0) {
    return c.text("User not found", 404);
  }

  const user = foundUsers[0];

  // Check password
  const isPasswordValid = await bcrypt.compare(body.password, user.password);
  if (!isPasswordValid) {
    return c.text("Invalid password", 401);
  }

  // Issue JWT with jose
  const token = await signJwt({ id: user.id, email: user.email });

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  });
});

// Logout (stateless JWT -> just tell client to drop token)
auth.get("/logout", (c) => {
  return c.json({ message: "Logged out" });
});

// Get current user from token
auth.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.text("Unauthorized", 401);

  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = await verifyJwt(token);
    return c.json({ user: payload });
  } catch {
    return c.text("Invalid or expired token", 401);
  }
});

// Forgot password (placeholder)
auth.post("/forgot-password", (c) => {
  return c.json({ message: "Forgot password" });
});

// Reset password (placeholder)
auth.post("/reset-password", (c) => {
  return c.json({ message: "Reset password" });
});

// Change password (placeholder)
auth.post("/change-password", (c) => {
  return c.json({ message: "Change password" });
});

// Verify email (placeholder)
auth.post("/verify-email", (c) => {
  return c.json({ message: "Verify email" });
});

// Resend verification email (placeholder)
auth.post("/resend-verification-email", (c) => {
  return c.json({ message: "Resend verification email" });
});

// Verify email OTP (placeholder)
auth.post("/verify-email-otp", (c) => {
  return c.json({ message: "Verify email OTP" });
});
 
 
// Google OAuth2
// Step 1: Redirect user to Google login
auth.get("/google", (c) => {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
  
    return c.redirect(url.toString());
  });
  
  // Step 2: Handle Google callback
  auth.get("/google/callback", async (c) => {
    const code = c.req.query("code");
    if (!code) return c.text("Missing code", 400);
  
    // Exchange code for tokens
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
  
    const tokenData = await tokenRes.json() as { id_token?: string };
    if (!tokenData.id_token) return c.text("Failed to get ID token", 400);
  
    // Decode the Google ID Token
    const payload = JSON.parse(
      Buffer.from(tokenData.id_token.split(".")[1], "base64url").toString()
    );
  
    const email = payload.email;
    const username = payload.name || email.split("@")[0];
    const googleId = payload.sub;
  
    // Check if user exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
  
    if (existingUsers.length === 0) {
      // Generate a dummy password since schema requires it
      const dummyPassword = `google-${googleId}`;
  
      await db.insert(users).values({
        username,
        email,
        password: dummyPassword,
      });
    }
  
    // TODO: issue your own JWT session token here
    return c.json({ message: "Logged in", email, username });
  });
  

export default auth;
