'use client';

import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CheckoutPage() {
  const { cart, removeFromCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, router]);

  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart }),
    });
    if (res.ok) {
      cart.forEach((item) => removeFromCart(item.productId));
      router.push('/orders');
    }
  };

  if (!session) return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <ul className="space-y-2">
        {cart.map((item) => (
          <li key={item.id}>
            Product ID: {item.productId} - Quantity: {item.quantity}
          </li>
        ))}
      </ul>
      <button
        onClick={handleCheckout}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
      >
        Complete Purchase
      </button>
    </div>
  );
}