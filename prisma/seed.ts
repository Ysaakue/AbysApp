import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@abysapp.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@abysapp.com",
      password: passwordHash,
      active: true,
    },
  });

  console.log(`Seeded admin user: ${admin.email}`);

  const statuses = [
    { name: "Open", color: "#3B82F6" },
    { name: "In Progress", color: "#F59E0B" },
    { name: "Waiting Parts", color: "#8B5CF6" },
    { name: "Completed", color: "#10B981" },
    { name: "Cancelled", color: "#EF4444" },
  ];

  for (const status of statuses) {
    await prisma.orderStatus.upsert({
      where: { name: status.name },
      update: {},
      create: status,
    });
  }

  console.log(`Seeded ${statuses.length} order statuses.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
