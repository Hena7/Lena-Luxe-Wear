// src/app/admin/users/page.tsx
"use client"; // Required for fetching and state management

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Check auth state
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Prisma } from '@prisma/client'; // Import Prisma namespace

// Define the shape of User data returned by our admin API
// (Includes _count if you added it)
type AdminUserView = {
    id: string;
    email: string;
    name: string | null;
    phoneNumber: string;
    role: 'CUSTOMER' | 'ADMIN';
    createdAt: string | Date;
    updatedAt: string | Date;
    _count?: {
        orders: number;
    };
};

export default function AdminUsersPage() {
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    const { t, locale } = useLanguage();
    const router = useRouter();

    const [users, setUsers] = useState<AdminUserView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("ADMIN USERS PAGE EFFECT: isAuthLoading:", isAuthLoading, "currentUser:", currentUser); // Log state

        if (!isAuthLoading && !currentUser) {
            console.log("ADMIN USERS PAGE EFFECT: Redirecting to login (no user).");
            router.replace('/login?redirectedFrom=/admin/users');
            return;
        }

        if (!isAuthLoading && currentUser) { // Check user exists first
            console.log(`ADMIN USERS PAGE EFFECT: Checking role: ${currentUser.role}`); // <<< ADD THIS
            if (currentUser.role !== 'ADMIN') {
                console.error(`!!! REDIRECTING ADMIN?: AuthLoading=${isAuthLoading}, User Role=${currentUser?.role}`);
                router.replace('/');
                return;
            }
        }
        // Fetch users if authenticated and is admin
        if (currentUser && currentUser.role === 'ADMIN') {
            console.log("ADMIN USERS PAGE EFFECT: Proceeding to fetch users.");
            const fetchUsers = async () => {
                console.log("Fetching admin user list...");
                setIsLoading(true);
                setError(null);
                try {
                    const response = await fetch('/api/admin/users'); // Fetch from admin API

                    if (response.status === 401 || response.status === 403) { // Handle auth/forbidden errors
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `Access denied: Status ${response.status}`);
                    }
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `HTTP error fetching users! Status: ${response.status}`);
                    }

                    const data: AdminUserView[] = await response.json();
                    setUsers(data);
                    console.log("Admin user list fetched:", data);

                } catch (err) {
                    console.error("Failed to fetch users:", err);
                    setError(err instanceof Error ? err.message : 'Could not load user list.');
                } finally {
                    setIsLoading(false);
                    console.log("Admin user fetch finished.");
                }
            };
            fetchUsers();
        } else if (!isAuthLoading) {
            console.log("ADMIN USERS PAGE EFFECT: Auth loaded, but not admin or no user. Stopping loading.");
            setIsLoading(false);
        }


    }, [currentUser, isAuthLoading, router]); // Dependencies

    // --- Render Logic ---
    const isLoadingPage = isLoading || isAuthLoading;

    if (isLoadingPage) {
        return <div className="container mx-auto p-6 text-center">Loading users...</div>;
    }

    if (error) {
        // Display error message (similar to previous pages)
        return <div className="container mx-auto p-6 text-center text-red-600">Error: {error}</div>;
    }

    // Add check if user is definitely not admin (should have been redirected, but belt-and-suspenders)
    if (!currentUser || currentUser.role !== 'ADMIN') {
        return <div className="container mx-auto p-6 text-center text-red-600">Access Denied.</div>;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center mb-6">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white">
                        Users
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        A list of all registered users in the system.
                    </p>
                </div>
                {/* Optional: Add User Button */}
                {/* <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none"> ... </div> */}
            </div>

            {/* Users Table */}
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Phone Number</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Orders</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Registered</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="whitespace-nowrap py-4 px-3 text-sm text-center text-gray-500 dark:text-gray-400">No users found.</td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{user.name || <span className="italic text-gray-400">N/A</span>}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{user.phoneNumber}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'ADMIN' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">{user._count?.orders ?? 0}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-US') : 'N/A'}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    {/* Add Edit/Delete links/buttons later */}
                                                    {/* <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit<span className="sr-only">, {user.name}</span></a> */}
                                                    <span className="text-gray-400"> TBD </span>
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
            {/* Optional: Back link */}
            <div className="mt-8">
                <Link href="/admin" className="text-sm font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300">
                    ← Back to Admin Dashboard
                </Link>
            </div>
        </div>
    );
}