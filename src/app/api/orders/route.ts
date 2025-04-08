import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { items, totalAmount, userEmail, phone } = await req.json();

    const order = await prisma.order.create({
      data: {
        userId: session.user.id, // ✅ Use userId instead
        totalAmount: calculatedTotal,
        items: {
          create: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
      },
    });

    return NextResponse.json({ message: "Order placed!", order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}
