// src/app/admin/orders/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Order, OrderItem, User, Product, OrderStatus } from '@prisma/client'; // Import types

// Define the shape of Order data returned by the admin API
interface AdminOrderView extends Order {
    user: Pick<User, 'id' | 'email' | 'name'> | null; // Included user details
    items: (Pick<OrderItem, 'id' | 'quantity' | 'price' | 'productId'> & {
        // Product details might be nested here if included in API
        // product?: Pick<Product, 'name' | 'imageUrl'> | null;
    })[];
}


export default function AdminOrdersPage() {
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    const { locale } = useLanguage(); // Get locale for date/currency formatting
    const router = useRouter();

    const [orders, setOrders] = useState<AdminOrderView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Auth and Role checks
        if (!isAuthLoading && !currentUser) {
            router.replace('/login?redirectedFrom=/admin/orders');
            return;
        }
        if (!isAuthLoading && currentUser && currentUser.role !== 'ADMIN') {
            router.replace('/');
            return;
        }

        // Fetch all orders if authenticated admin
        if (currentUser && currentUser.role === 'ADMIN') {
            const fetchOrders = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await fetch('/api/admin/orders'); // Fetch from admin API
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `Error fetching orders: ${response.status}`);
                    }
                    const data: AdminOrderView[] = await response.json();
                    setOrders(data);
                } catch (err) {
                    console.error("Failed to fetch admin orders:", err);
                    setError(err instanceof Error ? err.message : 'Could not load order list.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOrders();
        } else if (!isAuthLoading) {
            setIsLoading(false);
        }
    }, [currentUser, isAuthLoading, router]); // Dependencies

    // --- Render Logic ---
    const isLoadingPage = isLoading || isAuthLoading;

    if (isLoadingPage) { return <div className="container mx-auto p-6 text-center">Loading orders...</div>; }
    if (error) { return <div className="container mx-auto p-6 text-center text-red-600">Error: {error}</div>; }
    if (!currentUser || currentUser.role !== 'ADMIN') { return <div className="container mx-auto p-6 text-center text-red-600">Access Denied.</div>; }

    function getStatusColor(status: OrderStatus): string {
        switch (status) {
          case 'PENDING':
            return 'bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200';
          case 'PROCESSING':
            return 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200';
          case 'SHIPPED':
            return 'bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200';
          case 'DELIVERED':
            return 'bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-200';
          case 'CANCELLED':
          case 'REFUNDED':
            return 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200';
          default:
            return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        }
      }
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center mb-6">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white">
                        All Orders
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        A list of all orders placed in the system.
                    </p>
                </div>
                 {/* Optional: Add filtering/sorting controls */}
            </div>

           {/* Orders Table */}
           <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                 <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                         <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Order ID</th>
                                         <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                                         <th scope="col" className="hidden sm:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                                         <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Total</th>
                                         <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                         <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Items</th>
                                         <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">View</span></th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                     {orders.length === 0 ? (
                                         <tr><td colSpan={7} className="whitespace-nowrap py-10 px-3 text-sm text-center text-gray-500 dark:text-gray-400">No orders found.</td></tr>
                                     ) : (
                                         orders.map((order) => (
                                             <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                  {/* Make Order ID a Link */}
                                                 <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono sm:pl-6">
                                                      <Link href={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded" title={`View order ${order.id}`}>
                                                          {order.id.substring(0, 8)}... {/* Shorten ID */}
                                                       </Link>
                                                  </td>
                                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                      {/* Display name or email, potentially link to user admin page? */}
                                                      <span title={order.user?.email || 'Unknown Email'}>{order.user?.name || order.user?.email || <span className="italic text-gray-400">N/A</span>}</span>
                                                  </td>
                                                   <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                      {new Date(order.createdAt).toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric'})}
                                                    </td>
                                                   <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                       {locale === 'am' ? `${order.totalAmount.toFixed(2)} ብር` : `$${order.totalAmount.toFixed(2)}`}
                                                   </td>
                                                   <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                      {/* Status Badge */}
                                                       <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                                                           {order.status} {/* TODO: Translate */}
                                                        </span>
                                                   </td>
                                                   <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">{order.items.length}</td>
                                                   <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                      {/* Link instead of button */}
                                                      <Link href={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded px-1">
                                                           View<span className="sr-only">, order {order.id}</span>
                                                       </Link>
                                                   </td>
                                             </tr>
                                         ))
                                     )}
                                 </tbody>
                             </table>
                         </div>
                     </div>
                </div>
            </div>
            {/* Back link */}
             <div className="mt-8">
                 <Link href="/admin" className="text-sm font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300">
                     ← Back to Admin Dashboard
                 </Link>
             </div>
         </div>
     );
}