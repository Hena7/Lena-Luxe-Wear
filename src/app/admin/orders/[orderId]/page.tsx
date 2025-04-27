// src/app/admin/orders/[orderId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

// Type for the detailed order data fetched from API
type AdminOrderDetailView = {
    id: string;
    totalAmount: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
    createdAt: string | Date;
    updatedAt: string | Date;
    userId: string;
    user: {
        id: string;
        email: string;
        name: string | null;
        phoneNumber: string;
    } | null;
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

// Type for status update options
type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
const orderStatuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrderDetailPage({ params }: any) {
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    const { locale } = useLanguage();
    const router = useRouter();
    const orderId = params?.orderId;

    const [order, setOrder] = useState<AdminOrderDetailView | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

    // Fetch order details
    const fetchOrderDetails = useCallback(async () => {
        if (!orderId || !currentUser || currentUser.role !== 'ADMIN') return;

        console.log(`Fetching details for order: ${orderId}`);
        setIsLoading(true); setError(null); setStatusUpdateError(null);
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Error fetching order: ${response.status}`);
            }
            const data: AdminOrderDetailView = await response.json();
            setOrder(data);
            console.log("Order details fetched:", data);
        } catch (err) {
            console.error("Fetch order detail error:", err);
            setError(err instanceof Error ? err.message : 'Could not load order details.');
        } finally {
            setIsLoading(false);
        }
    }, [orderId, currentUser]); // Depend on orderId and admin status

    // Initial fetch effect
    useEffect(() => {
        if (!isAuthLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
            router.replace(currentUser ? '/' : '/login?redirectedFrom=/admin/orders');
            return;
        }
        if (currentUser?.role === 'ADMIN' && orderId) {
            fetchOrderDetails();
        } else if (!isAuthLoading) {
            setIsLoading(false); // Stop loading if not admin
        }
    }, [currentUser, isAuthLoading, router, orderId, fetchOrderDetails]);

    // --- Handler to Update Status ---
    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (!order) return; // Ensure order data is loaded
        // Prevent pointless updates
        if (newStatus === order.status) {
            console.log("Status unchanged, skipping update.");
            return;
        }
        console.log(`Attempting to update order ${order.id} to status ${newStatus}`);
        setIsUpdatingStatus(true);
        setStatusUpdateError(null);
        try {
            // Call the PUT endpoint
            const response = await fetch(`/api/admin/orders/${order.id}`, {
                method: 'PUT', // Correct method
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }), // Send the new status
            });
            const result = await response.json(); // Parse response
            if (!response.ok) {
                // Use error message from API response
                throw new Error(result.message || `Failed to update status: ${response.status}`);
            }
            console.log("Status update successful via API:", result);

            // Option A (Simpler & Recommended): Refetch data to guarantee consistency
            await fetchOrderDetails(); // Re-fetch the entire order detail

            // Option B (Optimistic Update - more complex, potential sync issues):
            // setOrder(prev => prev ? { ...prev, status: result.status, updatedAt: new Date(result.updatedAt) } : null);

        } catch (err: any) {
            console.error("Status update failed:", err);
            setStatusUpdateError(err.message || 'Could not update order status.');
        } finally {
            setIsUpdatingStatus(false);
        }
    };



    // --- Render Logic ---
    if (isLoading || isAuthLoading) { /* ... loading ... */ }
    if (error) { /* ... error loading order ... */ }
    if (!order) { // Handles case after loading where order wasn't found or not authorized
        return <div className="container mx-auto p-6 text-center">Order not found or access denied.</div>;
    }

    // Formatters
    const formatDate = (dateString: string | Date | undefined) =>
        dateString ? new Date(dateString).toLocaleString(locale === 'am' ? 'am-ET' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
    const formatCurrency = (amount: number) => (locale === 'am' ? `${amount.toFixed(2)} ብር` : `$${amount.toFixed(2)}`);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Link & Header */}
            <div className="mb-6">
                <Link href="/admin/orders" className="text-sm font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300">
                    ← Back to All Orders
                </Link>
            </div>
            <h1 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white mb-6">
                Order Details
            </h1>

            <div className="space-y-8 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:space-y-0">
                {/* Left Column: Order Info & Items */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Summary Box */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Information</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div><dt className="text-gray-500 dark:text-gray-400">Order ID</dt><dd className="mt-1 text-gray-700 dark:text-gray-200 font-mono">{order.id}</dd></div>
                            <div><dt className="text-gray-500 dark:text-gray-400">Date Placed</dt><dd className="mt-1 text-gray-700 dark:text-gray-200">{formatDate(order.createdAt)}</dd></div>
                            <div><dt className="text-gray-500 dark:text-gray-400">Total Amount</dt><dd className="mt-1 text-gray-700 dark:text-gray-200 font-medium">{formatCurrency(order.totalAmount)}</dd></div>
                            <div><dt className="text-gray-500 dark:text-gray-400">Last Updated</dt><dd className="mt-1 text-gray-700 dark:text-gray-200">{formatDate(order.updatedAt)}</dd></div>
                            {/* Add Shipping/Billing here later if available */}
                        </dl>
                    </div>

                    {/* Customer Info Box */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Customer Information</h2>
                        {order.user ? (
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div><dt className="text-gray-500 dark:text-gray-400">Name</dt><dd className="mt-1 text-gray-700 dark:text-gray-200">{order.user.name || 'N/A'}</dd></div>
                                <div><dt className="text-gray-500 dark:text-gray-400">Email</dt><dd className="mt-1 text-gray-700 dark:text-gray-200">{order.user.email}</dd></div>
                                <div><dt className="text-gray-500 dark:text-gray-400">Phone</dt><dd className="mt-1 text-gray-700 dark:text-gray-200">{order.user.phoneNumber}</dd></div>
                                <div><dt className="text-gray-500 dark:text-gray-400">User ID</dt><dd className="mt-1 text-gray-700 dark:text-gray-200 font-mono text-xs">{order.user.id}</dd></div>
                            </dl>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">User details not available.</p>
                        )}
                    </div>


                    {/* Items Ordered Box */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Items Ordered</h2>
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex py-4">
                                    <div className="flex-shrink-0">
                                        <Image src={item.product?.imageUrl || '/placeholder-image.png'} alt={item.product?.name || ''} width={64} height={64} className="h-16 w-16 rounded-md object-contain border p-1 bg-white" />
                                    </div>
                                    <div className="ml-4 flex flex-1 flex-col">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-800 dark:text-white">{item.product?.name || <span className="italic text-gray-500">Product Unavailable</span>}</h4>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">ID: {item.productId}</p>
                                        </div>
                                        <div className="mt-1 flex flex-1 items-end justify-between text-sm">
                                            <p className="text-gray-600 dark:text-gray-300">{`Qty: ${item.quantity}`}</p>
                                            <p className="font-medium text-gray-700 dark:text-gray-200">{formatCurrency(item.price)} <span className="text-xs text-gray-400">(each)</span></p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column: Status Update */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Update Status</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Status:</label>
                                <p className={`mt-1 text-sm font-medium inline-flex items-center rounded-full px-3 py-1 ${getStatusColor(order.status)}`}>{order.status}</p> {/* Use helper */}
                            </div>
                            <div>
                                <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Change Status to:</label>
                                <select
                                    id="newStatus"
                                    name="newStatus"
                                    value={order.status} // Reflect current status
                                    disabled={isUpdatingStatus}
                                    onChange={(e) => handleStatusChange(e.target.value as OrderStatus)} // Trigger handler
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                                >
                                    {orderStatuses.map(status => ( // Use defined statuses array
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            {isUpdatingStatus && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center"><ArrowPathIcon className="h-4 w-4 animate-spin mr-1" /> Updating...</p>
                            )}
                            {statusUpdateError && (
                                <p className="text-sm text-red-600 dark:text-red-400">{statusUpdateError}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// Helper function from previous step (ensure it's available)
// function getStatusColor(status: OrderStatus): string { ... }

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