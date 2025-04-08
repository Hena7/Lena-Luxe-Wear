import { NextResponse } from 'next/server';
import prisma from '.././lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cart } = await req.json();
  const total = cart.reduce(
    async (sum: number, item: { productId: string; quantity: number }) => {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      return sum + (product?.price || 0) * item.quantity;
    },
    0
  );

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      total: await total,
      items: {
        create: cart.map((item: { productId: string; quantity: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
  });

  return NextResponse.json({ message: 'Order created', orderId: order.id });
}