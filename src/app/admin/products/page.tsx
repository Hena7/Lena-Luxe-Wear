// src/app/admin/products/page.tsx
"use client"; // Required for fetching, state, and interactions

import React, { useState, useEffect, Fragment, useCallback } from 'react'; // Import Fragment for modal potential
import { useAuth } from '@/contexts/AuthContext'; // Adjust path if needed
import { useLanguage } from '@/contexts/LanguageContext'; // Adjust path if needed
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import Image from 'next/image';
import { TrashIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Icons

// Type definitions
type Category = {
    id: string;
    name: string;
}

type Product = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    stock: number;
    categoryId: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    category: Category | null;
}

// Define the shape of Product data returned by the admin API
type AdminProductView = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    stock: number;
    categoryId: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    category: Category | null;
}

export default function AdminProductsPage() {
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    const { locale } = useLanguage();
    const router = useRouter();

    const [products, setProducts] = useState<AdminProductView[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Loading products list
    const [error, setError] = useState<string | null>(null); // Error fetching products

    // --- State for Delete Confirmation ---
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null); // Product ID to delete
    const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete API call
    const [deleteError, setDeleteError] = useState<string | null>(null); // Error during delete API call
    // ------------------------------------

    // Function to fetch products (memoized with useCallback)
    const fetchProducts = useCallback(async () => {
        console.log("Fetching admin product list...");
        setError(null); // Clear previous list errors
        setDeleteError(null); // Clear previous delete errors
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/products');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error fetching products: ${response.status}`);
            }
            const data: AdminProductView[] = await response.json();
            setProducts(data);
            console.log("Admin product list fetched successfully.");
        } catch (err) {
            console.error("Failed to fetch admin products:", err);
            setError(err instanceof Error ? err.message : 'Could not load product list.');
            setProducts([]); // Clear products on error
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array means it's created once, call it manually or in effect

    // Initial Fetch and Auth Check Effect
    useEffect(() => {
        if (!isAuthLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
            router.replace(currentUser ? '/' : '/login?redirectedFrom=/admin/products');
            return;
        }
        if (currentUser && currentUser.role === 'ADMIN') {
            fetchProducts(); // Fetch initial list when admin is confirmed
        } else if (!isAuthLoading) {
            setIsLoading(false); // Ensure loading stops if not admin after auth check
        }
    }, [currentUser, isAuthLoading, router, fetchProducts]); // Include fetchProducts if defined outside


    // --- Delete Handlers ---
    const handleDeleteClick = (productId: string) => {
        setDeleteError(null);
        setShowDeleteConfirm(productId); // Trigger confirmation modal
    };

    const confirmDelete = async () => {
        if (!showDeleteConfirm) return;
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const response = await fetch(`/api/admin/products/${showDeleteConfirm}`, { method: 'DELETE' });
            const result = await response.json().catch(() => ({})); // Try parsing response

            if (!response.ok) {
                throw new Error(result.message || `Failed to delete. Status: ${response.status}`);
            }
            setShowDeleteConfirm(null); // Close modal on success
            await fetchProducts(); // Refresh the list!
        } catch (err: any) {
            console.error("Delete failed:", err);
            setDeleteError(err.message || "Could not delete product.");
            // Keep modal open to show error
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(null);
        setDeleteError(null);
    };
    // ----------------------

    // --- Render Logic ---
    const isLoadingPage = isLoading || isAuthLoading;

    if (isLoadingPage) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <div className="flex justify-center items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <ArrowPathIcon className="h-6 w-6 animate-spin" />
                    <span>Loading products...</span>
                </div>
            </div>
        );
    }

    // Show error only if loading is complete (prevents flashing error during load)
    if (!isLoadingPage && error) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg mx-auto" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
                {/* Optional retry button */}
                <button onClick={fetchProducts} className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Retry
                </button>
            </div>
        );
    }

    // Check if user is definitely not admin (belt-and-suspenders after initial check)
    if (!currentUser || currentUser.role !== 'ADMIN') {
        return <div className="container mx-auto p-6 text-center text-red-600 dark:text-red-400">Access Denied. You do not have permission to view this page.</div>;
    }

    // --- Main Content ---
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="sm:flex sm:items-center mb-6">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white">
                        Products Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        View, add, edit, or delete products in the store.
                    </p>
                </div>
                {/* Add Product Button */}
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <Link href="/admin/products/new">
                        <button type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-150">
                            Add Product
                        </button>
                    </Link>
                </div>
            </div>

            {/* Products Table */}
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6 w-16">Image</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Price</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Stock</th>
                                        <th scope="col" className="hidden sm:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Created</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                    {products.length === 0 ? (
                                        <tr><td colSpan={7} className="whitespace-nowrap py-10 px-3 text-sm text-center text-gray-500 dark:text-gray-400">No products found.</td></tr>
                                    ) : (
                                        products.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-6">
                                                    <Image
                                                        src={product.imageUrl || '/placeholder-image.png'}
                                                        alt={product.name}
                                                        width={40}
                                                        height={40}
                                                        className="h-10 w-10 rounded-md object-contain border border-gray-200 dark:border-gray-700 bg-white p-0.5"
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800 dark:text-gray-100 max-w-xs truncate" title={product.name}>{product.name}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{product.category?.name || <span className="italic">N/A</span>}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {locale === 'am' ? `${product.price.toFixed(2)} ብር` : `$${product.price.toFixed(2)}`}
                                                </td>
                                                <td
                                                    title={product.stock < 10 ? 'Low stock' : ''} // Example title for low stock
                                                    className={`whitespace-nowrap px-3 py-4 text-sm text-center font-medium tabular-nums ${product.stock < 10 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
                                                        }`}
                                                >
                                                    {product.stock}
                                                </td>
                                                <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(product.createdAt).toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-3">
                                                    {/* Edit Link */}
                                                    <Link href={`/admin/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded px-1" title="Edit product">
                                                        Edit<span className="sr-only">, {product.name}</span>
                                                    </Link>
                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteClick(product.id)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500 rounded px-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete product"
                                                        disabled={isDeleting && showDeleteConfirm === product.id} // Disable while deleting this specific item
                                                    >
                                                        Delete<span className="sr-only">, {product.name}</span>
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

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-opacity-80" aria-hidden="true" onClick={cancelDelete}></div> {/* Close on overlay click */}
                        {/* Modal panel */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-200 dark:border-gray-700">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full"> {/* Allow text wrapping */}
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                        {locale === 'am' ? 'ምርት አጥፋ' : 'Delete Product'}
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {locale === 'am' ? 'ይህን ምርት ለማጥፋት እርግጠኛ ነዎት? ይህን እርምጃ መመለስ አይቻልም።' : 'Are you sure you want to delete this product? This action cannot be undone.'}
                                        </p>
                                        {/* Show delete error here */}
                                        {deleteError && (
                                            <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-300">{deleteError}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3"> {/* Added gap */}
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm transition-colors duration-150 ${isDeleting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800'}`}
                                    onClick={confirmDelete}
                                >
                                    {isDeleting ? (
                                        <> <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> {locale === 'am' ? 'በማጥፋት ላይ...' : 'Deleting...'} </>
                                    ) : (locale === 'am' ? 'አጥፋ' : 'Delete')}
                                </button>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors duration-150"
                                    onClick={cancelDelete}
                                >
                                    {locale === 'am' ? 'ሰርዝ' : 'Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* --- End Delete Confirmation Modal --- */}
        </div>
    );
}