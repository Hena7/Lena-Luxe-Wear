// src/app/admin/products/edit/[productId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';      // Adjust path if needed
import { useLanguage } from '@/contexts/LanguageContext'; // Adjust path if needed
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import type { Category, Product } from '@prisma/client';
import { ArrowPathIcon } from '@heroicons/react/24/solid'; // Loading spinner icon

// Type for category options fetched for the dropdown
type CategoryOption = Pick<Category, 'id' | 'name'>;

// Type for product data fetched for editing (ensure API returns this shape)
interface ProductEditData extends Product {
    category: CategoryOption | null;
}

export default function AdminProductEditPage({ params }: any) {
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    const { locale } = useLanguage(); // For potential translations later
    const router = useRouter();
    const productId = params?.productId;

    // --- Form State ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState<CategoryOption[]>([]);

    // --- UI/Loading State ---
    const [isLoadingData, setIsLoadingData] = useState(true); // Loading initial product/category data
    const [isSubmitting, setIsSubmitting] = useState(false); // Submitting the update API call
    const [error, setError] = useState<string | null>(null);   // Stores error messages
    const [success, setSuccess] = useState<string | null>(null); // Stores success messages

    // --- Redirect non-admins ---
    useEffect(() => {
        // Wait for auth check to complete before deciding
        if (!isAuthLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
            console.warn("Non-admin redirect triggered from edit product page.");
            router.replace('/'); // Redirect non-admins to homepage
        }
    }, [currentUser, isAuthLoading, router]);

    // --- Fetch initial data (categories and existing product) ---
    const fetchData = useCallback(async () => {
        // Guard clauses
        if (!productId) {
            setError("Product ID is missing.");
            setIsLoadingData(false);
            return;
        }
        // We check currentUser again here, though the effect dependency handles it too
        if (!currentUser || currentUser.role !== 'ADMIN') {
            // Should have been redirected, but stop fetch just in case
            setIsLoadingData(false);
            return;
        }

        console.log(`ADMIN EDIT: Fetching initial data for product ID: ${productId}`);
        setIsLoadingData(true);
        setError(null);
        setSuccess(null);

        try {
            const [catResponse, prodResponse] = await Promise.all([
                fetch('/api/categories'),
                fetch(`/api/products/${productId}`) // Use public API to get product details
            ]);

            // Handle Categories
            if (!catResponse.ok) throw new Error('Failed to load categories.');
            const catData: CategoryOption[] = await catResponse.json();
            setCategories(catData);

            // Handle Product
            if (!prodResponse.ok) {
                const errData = await prodResponse.json().catch(() => ({}));
                if (prodResponse.status === 404) throw new Error(`Product not found (ID: ${productId}).`);
                throw new Error(errData.message || `Failed to load product data: Status ${prodResponse.status}`);
            }
            const prodData: ProductEditData = await prodResponse.json();

            // Pre-fill form state
            setName(prodData.name);
            setDescription(prodData.description || '');
            setPrice(prodData.price.toString());
            setStock(prodData.stock.toString());
            setImageUrl(prodData.imageUrl || '');
            // Ensure categoryId is set correctly, default if needed and categories exist
            setCategoryId(prodData.categoryId || (catData.length > 0 ? catData[0].id : ''));

            console.log("ADMIN EDIT: Data fetched and form pre-filled.");

        } catch (err: any) {
            console.error("ADMIN EDIT: Failed to load data:", err);
            setError(err.message || 'Could not load product data for editing.');
        } finally {
            setIsLoadingData(false);
        }
    }, [productId, currentUser]); // Depend on productId and currentUser

    // Trigger initial data fetch
    useEffect(() => {
        // Only fetch if we have the ID and the user context is loaded and is an admin
        if (productId && !isAuthLoading && currentUser && currentUser.role === 'ADMIN') {
            fetchData();
        }
    }, [productId, isAuthLoading, currentUser, fetchData]);


    // --- Form Submission Handler ---
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        // --- Input Validation ---
        const priceNum = parseFloat(price);
        const stockNum = parseInt(stock, 10);

        if (!name.trim()) { setError('Product name is required.'); setIsSubmitting(false); return; }
        if (isNaN(priceNum) || priceNum < 0) { setError('Please enter a valid non-negative price.'); setIsSubmitting(false); return; }
        if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) { setError('Please enter a valid non-negative whole number for stock.'); setIsSubmitting(false); return; }
        if (!categoryId) { setError('Please select a category.'); setIsSubmitting(false); return; }
        // Add other specific validations if needed (e.g., URL format)
        // --- End Validation ---

        try {
            console.log(`ADMIN EDIT: Submitting update for product ID: ${productId}`);
            const response = await fetch(`/api/admin/products/${productId}`, { // Target specific product admin API
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ // Send validated and formatted data
                    name: name.trim(),
                    description: description.trim() || null,
                    price: priceNum,
                    stock: stockNum,
                    imageUrl: imageUrl.trim() || null,
                    categoryId: categoryId,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update product.');
            }

            // Success
            console.log("ADMIN EDIT: Product update successful:", result);
            setSuccess(`Product "${result.name}" updated successfully! Redirecting...`);
            // Redirect back to the product list after a short delay
            setTimeout(() => router.push('/admin/products'), 1500);

        } catch (err: any) {
            console.error("ADMIN EDIT: Failed to update product:", err);
            setError(err.message || 'An unexpected error occurred during update.');
        } finally {
            setIsSubmitting(false); // Always stop submitting indicator
        }
    };

    // --- Render Logic ---

    // Display loading indicator while auth or initial data is loading
    const isLoadingPage = isAuthLoading || isLoadingData;
    if (isLoadingPage) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                <ArrowPathIcon className="h-8 w-8 animate-spin mb-4 text-gray-500 dark:text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Loading product data...</p>
            </div>
        );
    }

    // Display error if initial data loading failed
    // We check !name as an indicator that product data likely failed to load
    if (error && !name) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-300 dark:border-red-600 max-w-lg mx-auto">
                    <p className="text-sm font-medium text-red-700 dark:text-red-200">{error}</p>
                </div>
                <div className="mt-6">
                    <Link href="/admin/products" className="text-sm font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300">
                        ← Back to Products List
                    </Link>
                </div>
            </div>
        );
    }

    // Final auth check - should normally be handled by redirect effect, but good failsafe
    if (!currentUser || currentUser.role !== 'ADMIN') {
        return <div className="container mx-auto p-6 text-center text-red-600">Access Denied. You do not have permission to view this page.</div>;
    }


    // --- Render the Edit Form ---
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
            {/* Back Link */}
            <div className="mb-6">
                <Link href="/admin/products" className="text-sm font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 rounded">
                    ← Back to Products List
                </Link>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white mb-1">
                Edit Product
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Update details for product ID: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{productId}</span>
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                {/* Display Submission Error/Success Messages */}
                {error && !success && ( // Show error only if no success message
                    <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3 border border-red-300 dark:border-red-600">
                        <p className="text-sm font-medium text-red-700 dark:text-red-200">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-3 border border-green-300 dark:border-green-600">
                        <p className="text-sm font-medium text-green-700 dark:text-green-200">{success}</p>
                    </div>
                )}

                {/* Name Input */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300 mb-1">Product Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                </div>

                {/* Description Textarea */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                </div>

                {/* Price & Stock Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300 mb-1">Price <span className="text-red-500">*</span></label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span> {/* Adjust currency symbol */}
                            </div>
                            <input
                                type="number"
                                id="price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                min="0"
                                step="0.01"
                                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300 mb-1">Stock Quantity <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            id="stock"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            required
                            min="0"
                            step="1"
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            placeholder="0"
                        />
                    </div>
                </div>


                {/* Image URL Input */}
                <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300 mb-1">Image URL</label>
                    <input
                        type="url"
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                        placeholder="https://images.unsplash.com/..."
                    />
                </div>

                {/* Category Select Dropdown */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300 mb-1">Category <span className="text-red-500">*</span></label>
                    <select
                        id="category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                        disabled={isLoadingData || categories.length === 0} // Disable while loading categories
                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6 disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:bg-gray-700"
                    >
                        {categories.length === 0 && isLoadingData ? (
                            <option>Loading categories...</option>
                        ) : categories.length === 0 ? (
                            <option>No categories found</option>
                        ) : (
                            categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))
                        )}
                    </select>
                </div>

                {/* Submit Button Area */}
                <div className="pt-4 flex justify-end">
                    <Link href="/admin/products" className="rounded-md bg-white dark:bg-gray-700 py-2 px-3 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 mr-3">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting || isLoadingData}
                        // disabled={isSubmitting || isLoadingData || success} // Disable if submitting, loading data, or after success
                        className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> Updating...
                            </>
                        ) : (
                            'Update Product'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}