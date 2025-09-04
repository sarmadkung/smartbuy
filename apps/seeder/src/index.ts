import { seedUsers } from "./seeds/users.seed";

async function runSeeders() {
  try {
    await seedUsers();
    console.log("✅ Seeding finished");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

runSeeders();

