import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/auth/login');
  }

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true, phoneNumber: true } },
      items: {
        include: {
          product: { select: { name: true, price: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard - Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border p-4 rounded-lg">
              <h2 className="text-lg font-semibold">
                Order ID: {order.id} | User: {order.user.email}
              </h2>
              <p>Phone: {order.user.phoneNumber || 'Not provided'}</p>
              <p>Total: ${order.total}</p>
              <p>Status: {order.status}</p>
              <p>Ordered At: {new Date(order.createdAt).toLocaleString()}</p>
              <h3 className="mt-2 font-medium">Products:</h3>
              <ul className="list-disc pl-5">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product.name} - ${item.product.price} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}