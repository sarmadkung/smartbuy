import { db } from "../db";
import { users } from "../../../../packages/db-schema/src/schema";
import { faker } from "@faker-js/faker";

export async function seedUsers() {
for (let i = 0; i < 10; i++) {
    await db.insert(users).values({
      name: faker.person.fullName(),
      email: faker.internet.email(),
    });
  }
  console.log("🌱 Users seeded");
}
