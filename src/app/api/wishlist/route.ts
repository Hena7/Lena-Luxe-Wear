import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = new TextEncoder().encode(JWT_SECRET);

async function getUserFromToken(request: NextRequest) {
  if (!JWT_SECRET || secretKey.length === 0) {
    return null;
  }

  const token = request.cookies.get("sessionToken")?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const userId = payload.userId as string;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(wishlists);
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Product already in wishlist" },
        { status: 400 },
      );
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        userId: user.id,
        productId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(wishlist, { status: 201 });
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 },
      );
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 },
    );
  }
}
