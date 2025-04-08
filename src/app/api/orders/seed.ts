import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.order.create({
    data: {
      userEmail: "test@example.com",
      customerName: "John Doe",
      phone: "1234567890",
      totalAmount: 50.0,
    },
  });

  console.log("Sample order added!");
}

main();
