// src/app/admin/orders/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Order, OrderItem, User, Product } from '@prisma/client'; // Import types

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
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Total</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Items</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">View</span></th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                     {orders.length === 0 ? (
                                         <tr><td colSpan={7} className="whitespace-nowrap py-4 px-3 text-sm text-center text-gray-500 dark:text-gray-400">No orders found.</td></tr>
                                     ) : (
                                         orders.map((order) => (
                                             <tr key={order.id}>
                                                 <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-gray-500 dark:text-gray-400 sm:pl-6">{order.id.substring(0, 8)}...</td> {/* Shorten ID for display */}
                                                 <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                     {order.user?.name || order.user?.email || 'N/A'} {/* Display user name or email */}
                                                 </td>
                                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                     {new Date(order.createdAt).toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric'})}
                                                   </td>
                                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                      {locale === 'am' ? `${order.totalAmount.toFixed(2)} ብር` : `$${order.totalAmount.toFixed(2)}`}
                                                  </td>
                                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{order.status}</td> {/* TODO: Translate status */}
                                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{order.items.length}</td> {/* Show number of items */}
                                                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                      {/* TODO: Add View Order Details link */}
                                                       <button type="button" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50" disabled title="View order details (coming soon)">
                                                           View<span className="sr-only">, order {order.id}</span>
                                                       </button>
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