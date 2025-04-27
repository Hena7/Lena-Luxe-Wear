// src/app/orders/page.tsx
"use client"; // Client component for hooks and data fetching

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path if needed
import { useLanguage } from '@/contexts/LanguageContext'; // Adjust path if needed
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { ArrowPathIcon } from '@heroicons/react/24/solid'; // Loading spinner icon

// Type for status update options
type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

// Type for the order data expected from GET /api/orders (for the current user)
type UserOrderView = {
    id: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string | Date;
    updatedAt: string | Date;
    userId: string;
    items: {
        id: string;
        quantity: number;
        price: number;
        productId: string;
        orderId: string;
        product: {
            id: string;
            name: string;
            imageUrl: string | null;
        } | null;
    }[];
}

export default function UserOrdersPage() {
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    const { t, locale } = useLanguage();
    const router = useRouter();

    const [orders, setOrders] = useState<UserOrderView[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Loading state for the orders fetch
    const [error, setError] = useState<string | null>(null); // Error state for fetching

    // Effect for authentication check and data fetching
    useEffect(() => {
        // Redirect to login if auth check finishes and no user is found
        if (!isAuthLoading && !currentUser) {
            console.log("User not logged in, redirecting from orders page...");
            router.replace('/login?redirectedFrom=/orders');
            return;
        }

        // Fetch orders only when auth check is complete AND user exists
        if (!isAuthLoading && currentUser) {
            const fetchOrders = async () => {
                console.log("Fetching user's orders...");
                setIsLoading(true);
                setError(null);
                try {
                    const response = await fetch('/api/orders'); // Calls GET /api/orders

                    if (response.status === 401) { // Handle session expiry specifically
                        console.log("Session expired while fetching orders, redirecting.");
                        router.replace('/login?redirectedFrom=/orders');
                        return;
                    }
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `HTTP error fetching orders! Status: ${response.status}`);
                    }

                    const data: UserOrderView[] = await response.json();
                    setOrders(data);
                    console.log("User's orders fetched:", data);

                } catch (err) {
                    console.error("Failed to fetch user orders:", err);
                    setError(err instanceof Error ? err.message : 'Could not load order history.');
                    setOrders([]); // Clear orders on error
                } finally {
                    setIsLoading(false);
                    console.log("User order fetch finished.");
                }
            };
            fetchOrders();
        } else if (!isAuthLoading) {
            // If auth check is done but there's no user (should have been redirected)
            // Ensure loading state is turned off.
            setIsLoading(false);
        }

    }, [currentUser, isAuthLoading, router]); // Dependencies


    // Helper function for currency formatting
    const formatCurrency = (amount: number): string => {
        return (locale === 'am'
            ? `${amount.toFixed(2)} ብር`
            : `$${amount.toFixed(2)}`
        );
    };

    // Helper function to get text color based on order status
    function getStatusColorText(status: OrderStatus): string {
        switch (status) {
            case 'PENDING': return 'text-yellow-600 dark:text-yellow-400';
            case 'PROCESSING': return 'text-blue-600 dark:text-blue-400';
            case 'SHIPPED': return 'text-cyan-600 dark:text-cyan-400';
            case 'DELIVERED': return 'text-green-600 dark:text-green-400';
            case 'CANCELLED': case 'REFUNDED': return 'text-red-600 dark:text-red-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    }


    // --- Render Logic ---

    // Combined Loading State (Initial Auth Check + Order Fetch)
    if (isAuthLoading || isLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center">
                <ArrowPathIcon className="h-8 w-8 animate-spin mb-4" />
                <span>{locale === 'am' ? 'የትዕዛዝ ታሪክ በመጫን ላይ...' : 'Loading order history...'}</span>
            </div>
        );
    }

    // Error State after loading
    if (error) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg mx-auto" role="alert">
                    <strong className="font-bold">{locale === 'am' ? 'ስህተት፡ ' : 'Error: '}</strong>
                    <span className="block sm:inline">{error}</span>
                </div>
                {/* Maybe add a link home or retry */}
                <Link href="/" className="mt-6 inline-block text-purple-600 dark:text-purple-400 hover:underline font-medium">
                    {locale === 'am' ? 'ወደ መነሻ ተመለስ' : 'Return Home'}
                </Link>
            </div>
        );
    }

    // Ensure user is logged in (should be guaranteed by effect, but belt-and-suspenders)
    if (!currentUser) {
        // This state ideally shouldn't be reached due to the redirect in useEffect
        return (<div className="container mx-auto p-6 text-center text-red-600 dark:text-red-400">Please log in to view orders.</div>);
    }

    // No Orders State
    if (orders.length === 0) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center flex flex-col items-center min-h-[calc(100vh-250px)] justify-center">
                {/* You can use an appropriate icon here */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /> {/* Example document icon */}
                </svg>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-3">
                    {locale === 'am' ? 'የትዕዛዝ ታሪክ የለም' : 'No Order History Found'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs">
                    {locale === 'am' ? 'እስካሁን ምንም ትዕዛዝ ያላስገቡ ይመስላል። ለመጀመር ይሸምቱ!' : 'It looks like you haven\'t placed any orders yet. Start shopping to see them here!'}
                </p>
                <Link
                    href="/shop"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out"
                >
                    {locale === 'am' ? 'አሁን ይሸምቱ' : 'Shop Now'}
                </Link>
            </div>
        );
    }

    // --- Display User's Orders ---
    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen"> {/* Ensure page takes height */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-10">
                    {locale === 'am' ? 'የእኔ ትዕዛዞች' : 'My Orders'}
                </h1>

                {/* List of Orders */}
                <div className="space-y-8">
                    {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200 sm:rounded-lg overflow-hidden">
                            {/* Order Header Section */}
                            <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 sm:px-6 sm:py-4 bg-gray-50 dark:bg-gray-800/50 flex-wrap gap-y-3 gap-x-6">
                                <dl className="grid flex-grow grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3 md:grid-cols-4"> {/* Responsive columns */}
                                    <div>
                                        <dt className="font-medium text-gray-500 dark:text-gray-400">{locale === 'am' ? 'ትዕዛዝ #' : 'Order #'}</dt>
                                        {/* Optional Link to a user-facing order detail page */}
                                        {/* <Link href={`/orders/${order.id}`}> */}
                                        <dd className="mt-1 text-gray-700 dark:text-gray-200 font-mono text-xs sm:text-sm break-words">{order.id}</dd>
                                        {/* </Link> */}
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-500 dark:text-gray-400">{locale === 'am' ? 'ቀን' : 'Date Placed'}</dt>
                                        <dd className="mt-1 text-gray-700 dark:text-gray-200">
                                            <time dateTime={order.createdAt.toString()}>
                                                {new Date(order.createdAt).toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </time>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-500 dark:text-gray-400">{locale === 'am' ? 'ድምር' : 'Total'}</dt>
                                        <dd className="mt-1 font-semibold text-gray-800 dark:text-gray-100">
                                            {formatCurrency(order.totalAmount)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-500 dark:text-gray-400">{locale === 'am' ? 'ሁኔታ' : 'Status'}</dt>
                                        <dd className={`mt-1 font-semibold text-sm capitalize ${getStatusColorText(order.status)}`}>
                                            {order.status.toLowerCase()} {/* Display status consistently */}
                                        </dd>
                                    </div>
                                </dl>
                                {/* Optional Details Link */}
                                {/* <div className="ml-auto flex-shrink-0 mt-2 sm:mt-0"> <Link href={`/orders/${order.id}`} className="...">Details</Link> </div> */}
                            </div>

                            {/* Order Items List */}
                            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-600 px-4 py-3 sm:px-6 sm:py-4">
                                {order.items.map((item) => (
                                    <li key={item.id} className="flex py-3 sm:py-4 space-x-4">
                                        <div className="flex-shrink-0">
                                            <Image
                                                src={item.product?.imageUrl || '/placeholder-image.png'}
                                                alt={item.product?.name || 'Product image'}
                                                width={64}
                                                height={64}
                                                className="h-16 w-16 rounded object-contain border border-gray-200 dark:border-gray-700 p-0.5 bg-white"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate" title={item.product?.name || ''}>
                                                {/* Optional: Link product name back to product page */}
                                                {/* <Link href={`/product/${item.productId}`} className="hover:underline"> */}
                                                {item.product?.name || <span className="italic text-gray-500">Product Information Unavailable</span>}
                                                {/* </Link> */}
                                            </p>
                                            <div className="flex justify-between items-baseline mt-1">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {`Qty: ${item.quantity}`}
                                                </p>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {formatCurrency(item.price)} <span className="text-xs text-gray-400">{locale === 'am' ? '(እያንዳንዳቸው)' : '(each)'}</span>
                                                </p>
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