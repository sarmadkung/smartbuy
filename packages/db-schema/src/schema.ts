import { pgTable, serial, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }), 
  verified: boolean("verified").notNull().default(false),
  resetToken: varchar("reset_token", { length: 255 }), // nullable by default
  otp: varchar("otp", { length: 10 }), // store 6-digit OTP for email verification
  createdAt: timestamp("created_at").defaultNow(),
});

