// src/app/orders/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // To check if user is logged in initially
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
// Import Prisma types used in the nested include from the API response
import type { Order, OrderItem, Product } from '@prisma/client';
import { useRouter } from 'next/navigation'; // For redirect if not logged in

// Define the shape of the Order data we expect from the API
interface OrderWithItemsAndProducts extends Order {
    items: (OrderItem & { // Each item includes product details
        product: Pick<Product, 'id' | 'name' | 'imageUrl'> | null; // Product can be null if deleted? Handle defensively.
    })[];
}

export default function OrdersPage() {
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    const { t, locale } = useLanguage();
    const router = useRouter();

    const [orders, setOrders] = useState<OrderWithItemsAndProducts[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if auth check finishes and user is not logged in
        if (!isAuthLoading && !currentUser) {
            console.log("User not logged in, redirecting from orders page...");
            router.replace('/login?redirectedFrom=/orders'); // Use replace to avoid adding orders page to history
            return;
        }

        // Fetch orders only if the user is potentially logged in
        // (Middleware should handle the main blocking, this is a client-side fallback/check)
        if (currentUser) {
            const fetchOrders = async () => {
                console.log("Fetching user orders...");
                setIsLoadingOrders(true);
                setError(null);
                try {
                    const response = await fetch('/api/orders'); // GET request
                    if (response.status === 401) { // Handle potential session expiry after initial load
                         router.replace('/login?redirectedFrom=/orders');
                         return;
                    }
                    if (!response.ok) {
                         const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `HTTP error fetching orders! Status: ${response.status}`);
                    }
                    const data: OrderWithItemsAndProducts[] = await response.json();
                    setOrders(data);
                    console.log("Orders fetched:", data);
                } catch (err) {
                    console.error("Failed to fetch orders:", err);
                    setError(err instanceof Error ? err.message : 'Could not load order history.');
                } finally {
                    setIsLoadingOrders(false);
                    console.log("Order fetch finished.");
                }
            };
            fetchOrders();
        } else if (!isAuthLoading) {
             // If auth check is done and still no user, stop loading order state
             setIsLoadingOrders(false);
        }

    }, [currentUser, isAuthLoading, router]); // Dependencies: Run when auth state changes


    // --- Render Logic ---

    // Loading state (covers auth check AND order fetching)
    if (isAuthLoading || isLoadingOrders) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                 {/* Basic Loading Indicator */}
                <p className="text-gray-500 dark:text-gray-400">Loading order history...</p>
                {/* TODO: Add a more visual loader/skeleton */}
            </div>
        );
    }

     // Error State
     if (error) {
        return (
             <div className="container mx-auto px-4 py-12 text-center">
                <div className="bg-red-100 ... max-w-lg mx-auto" role="alert"> {/* Use styles from prev example */}
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
             </div>
         );
     }

    // No Orders State
    if (orders.length === 0) {
         return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    {locale === 'am' ? 'የትዕዛዝ ታሪክ የለም' : 'No Order History'}
                 </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {locale === 'am' ? 'እስካሁን ምንም ትዕዛዝ ያላስገቡ ይመስላል።' : 'It looks like you haven\'t placed any orders yet.'}
                </p>
                <Link href="/shop" className="inline-flex items-center ... bg-purple-600 ..."> {/* Use styles from prev example */}
                     {locale === 'am' ? 'አሁን ይሸምቱ' : 'Shop Now'}
                </Link>
            </div>
         );
    }

    // --- Display Orders ---
    return (
        <div className="bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-10">
                    {locale === 'am' ? 'የትዕዛዝ ታሪክ' : 'Order History'}
                </h1>

                <div className="space-y-16">
                    {orders.map((order) => (
                        <div key={order.id} className="border-t border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm sm:rounded-lg sm:border">
                            {/* Order Header */}
                            <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 sm:p-6">
                                <dl className="grid flex-1 grid-cols-2 gap-x-6 text-sm sm:grid-cols-4">
                                    <div>
                                        <dt className="font-medium text-gray-900 dark:text-white">{locale === 'am' ? 'የትዕዛዝ ቁጥር' : 'Order number'}</dt>
                                        <dd className="mt-1 text-gray-500 dark:text-gray-400 font-mono text-xs sm:text-sm break-all">{order.id}</dd>
                                    </div>
                                    <div className="hidden sm:block">
                                        <dt className="font-medium text-gray-900 dark:text-white">{locale === 'am' ? 'የታዘዘበት ቀን' : 'Date placed'}</dt>
                                        <dd className="mt-1 text-gray-500 dark:text-gray-400">
                                            <time dateTime={order.createdAt.toString()}>
                                                 {new Date(order.createdAt).toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-US', {
                                                     year: 'numeric', month: 'long', day: 'numeric',
                                                 })}
                                            </time>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-900 dark:text-white">{locale === 'am' ? 'ጠቅላላ መጠን' : 'Total amount'}</dt>
                                        <dd className="mt-1 font-medium text-gray-700 dark:text-gray-200">
                                             {locale === 'am' ? `${order.totalAmount.toFixed(2)} ብር` : `$${order.totalAmount.toFixed(2)}`}
                                         </dd>
                                    </div>
                                     <div className="hidden sm:block">
                                         <dt className="font-medium text-gray-900 dark:text-white">{locale === 'am' ? 'ሁኔታ' : 'Status'}</dt>
                                         <dd className={`mt-1 font-medium ${order.status === 'DELIVERED' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                             {order.status} {/* TODO: Translate status enum */}
                                         </dd>
                                     </div>
                                </dl>
                                 {/* Optional: Add Invoice/Details Link */}
                                {/* <div className="ml-4 flex-shrink-0 sm:order-last sm:ml-0">...</div> */}
                            </div>

                            {/* Order Items List */}
                            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700 p-4 sm:p-6">
                                {order.items.map((item) => (
                                    <li key={item.id} className="flex py-4">
                                        <div className="flex-shrink-0">
                                            <Image
                                                src={item.product?.imageUrl || '/placeholder-image.png'} // Handle potentially null product
                                                alt={item.product?.name || 'Product image'}
                                                width={80}
                                                height={80}
                                                className="h-20 w-20 rounded-md object-contain object-center border border-gray-200 dark:border-gray-600 p-1 bg-white"
                                            />
                                        </div>
                                        <div className="ml-4 flex flex-1 flex-col">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                                                    {item.product?.name || <span className="italic text-gray-500">Product no longer available</span>}
                                                 </h4>
                                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                    {locale === 'am' ? `ብዛት፡ ${item.quantity}` : `Quantity: ${item.quantity}`}
                                                </p>
                                             </div>
                                            <div className="mt-1 flex flex-1 items-end">
                                                 <p className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                     <span>{locale === 'am' ? `${item.price.toFixed(2)} ብር` : `$${item.price.toFixed(2)}`}</span>
                                                    <span className="text-gray-400 dark:text-gray-500"> ( {locale === 'am' ? 'በወቅቱ የነበረ ዋጋ' : 'Price at time of order'} ) </span>
                                                 </p>
                                                 {/* Optional: Add reorder button or link to product */}
                                                  {/* <div className="ml-auto"> ... </div> */}
                                             </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}