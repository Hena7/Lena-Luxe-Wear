// src/app/admin/page.tsx
// This can be a Server Component initially if just displaying info
// Or make it Client if interactions are needed immediately

"use client"; // Added use client since we're using Link component

import React from 'react';
import Link from 'next/link';
// You might fetch admin-specific data here later using server-side functions
// or call API routes protected by the same admin check.

export default function AdminDashboardPage() {

  // Add server-side checks or data fetching if needed
  // Example: const users = await getAdminUserData();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
        Admin Dashboard
      </h1>
      <p className="text-gray-700 dark:text-gray-300 mb-8 text-2xl">
        Welcome,<span className='text-purple-500 font-bold'> Lwisha!</span>
      </p>
      <p className='text-gray-700 dark:text-gray-300 mb-8'>
        This area is restricted for users.
      </p>
      <div className="mt-8 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Admin Sections
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/users"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-4 px-6 rounded-lg transition duration-300 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-2">👥</span>
            <span className="font-medium">Manage Users</span>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-4 px-6 rounded-lg transition duration-300 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-2">📦</span>
            <span className="font-medium">View Orders</span>
          </Link>

          <Link
            href="/admin/products"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-4 px-6 rounded-lg transition duration-300 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-2">🛍️</span>
            <span className="font-medium">Manage Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}