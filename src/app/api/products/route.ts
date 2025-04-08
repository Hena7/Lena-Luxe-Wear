
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}

  
export async function POST(req: Request) {
  try {
    const { name, price, imageUrl } = await req.json();

    const product = await prisma.product.create({
      data: { name, price: parseFloat(price), imageUrl },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}


