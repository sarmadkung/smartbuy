import { db } from "../db";
import { users } from "../../../../packages/db-schema/src/schema";
import { faker } from "@faker-js/faker";

export async function seedUsers() {
for (let i = 0; i < 10; i++) {
    await db.insert(users).values({
      username: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      verified: faker.datatype.boolean(),
      resetToken: faker.string.alphanumeric(10),
      otp: faker.string.alphanumeric(6),
      createdAt: faker.date.past(),
    });
  }
  console.log("🌱 Users seeded");
}
