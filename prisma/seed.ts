import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

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
    { name: "Aberto", color: "#3B82F6" },
    { name: "Em Andamento", color: "#F59E0B" },
    { name: "Aguardando Peças", color: "#8B5CF6" },
    { name: "Concluído", color: "#10B981" },
    { name: "Cancelado", color: "#EF4444" },
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
