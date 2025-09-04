// apps/seeder/src/seeds/users.seed.ts
import { db } from '../db'
import { users } from '../../../../packages/db-schema/src/schema'
import { faker } from '@faker-js/faker'

export async function seedUsers() {
  try {
    const rows = Array.from({ length: 10 }).map(() => ({
      username: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password(),
      verified: faker.datatype.boolean(),
      resetToken: faker.string.alphanumeric(10),
      otp: faker.string.alphanumeric(6),
      createdAt: faker.date.past(),
    }))

    await db.insert(users).values(rows)
    console.log('🌱 Users seeded')
  } catch (err) {
    console.error('❌ Seeding failed:', err)
  }
}
