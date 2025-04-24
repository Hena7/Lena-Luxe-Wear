// src/app/admin/page.tsx
// This can be a Server Component initially if just displaying info
// Or make it Client if interactions are needed immediately

import React from 'react';
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
      <p className="text-gray-700 dark:text-gray-300">
        Welcome, Admin! This area is restricted.
      </p>
      {/* Add links to other admin sections later */}
      <div className="mt-8 space-y-4">
           <p className="text-lg font-medium">Admin Sections:</p>
           {/* Add links to pages you'll create later */}
           {/* <Link href="/admin/users" className="...">View Users</Link> */}
           {/* <Link href="/admin/orders" className="...">View All Orders</Link> */}
           {/* <Link href="/admin/products" className="...">Manage Products</Link> */}
           <p className="text-sm text-gray-500">(More admin sections coming soon...)</p>
      </div>
    </div>
  );
}