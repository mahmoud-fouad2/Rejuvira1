import { hash } from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_SEED_NAME?.trim() || "Rejuvira Super Admin";
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      "ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be provided.",
    );
  }

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name,
      hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
    create: {
      name,
      email,
      hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
  });

  console.log(`Seeded admin user: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
