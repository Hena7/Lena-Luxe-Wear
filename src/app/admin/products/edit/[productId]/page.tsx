// src/app/admin/products/edit/[productId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'; // Use useParams to get ID easily in client component
import type { Category, Product } from '@prisma/client';

// Type for category options
type CategoryOption = Pick<Category, 'id' | 'name'>;
// Type for product data including category (from GET /api/products/:id)
interface ProductEditData extends Product {
    category: CategoryOption | null; // Ensure API returns category with product
}

export default function AdminEditProductPage() {
    const { currentUser, isLoading: isAuthLoading } = useAuth();
    const { locale } = useLanguage();
    const router = useRouter();
    const params = useParams(); // Hook to get route parameters
    const productId = params.productId as string; // Get productId from params

    // State for form fields - initialize empty
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState<CategoryOption[]>([]);

    // State for UI feedback
    const [isLoadingData, setIsLoadingData] = useState(true); // Loading product/category data
    const [isSubmitting, setIsSubmitting] = useState(false); // Submitting update
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Redirect non-admins
    useEffect(() => {
        if (!isAuthLoading && (!currentUser || currentUser.role !== 'ADMIN')) {
            router.replace('/');
        }
    }, [currentUser, isAuthLoading, router]);

    // Fetch initial data (categories and existing product)
    const fetchData = useCallback(async () => {
        if (!productId || (currentUser && currentUser.role !== 'ADMIN')) return; // Ensure ID exists and user is admin

        console.log(`Fetching data for product edit: ${productId}`);
        setIsLoadingData(true);
        setError(null);
        setSuccess(null); // Clear previous success message

        try {
            // Fetch categories and product data in parallel
            const [catResponse, prodResponse] = await Promise.all([
                fetch('/api/categories'),
                fetch(`/api/products/${productId}`) // Use public product fetch API
            ]);

            // Handle Category Fetch Response
            if (!catResponse.ok) throw new Error('Failed to fetch categories');
            const catData: CategoryOption[] = await catResponse.json();
            setCategories(catData);
            console.log("Categories fetched for edit form:", catData);

             // Handle Product Fetch Response
             if (!prodResponse.ok) {
                 if (prodResponse.status === 404) throw new Error(`Product with ID ${productId} not found.`);
                 throw new Error(`Failed to fetch product data: Status ${prodResponse.status}`);
             }
             const prodData: ProductEditData = await prodResponse.json();
             console.log("Product data fetched for edit form:", prodData);

             // --- Pre-fill form state ---
             setName(prodData.name);
             setDescription(prodData.description || '');
             setPrice(prodData.price.toString()); // Convert number to string for input
             setStock(prodData.stock.toString()); // Convert number to string for input
             setImageUrl(prodData.imageUrl || '');
             setCategoryId(prodData.categoryId || (catData.length > 0 ? catData[0].id : '')); // Set category or default
             // ---------------------------

        } catch (err: any) {
            console.error("Failed to load data for editing:", err);
            setError(err.message || 'Could not load product data.');
            // Optionally redirect if product not found?
             // if (err.message.includes("not found")) { router.push('/admin/products'); }
        } finally {
            setIsLoadingData(false);
        }
    // Only depend on productId and admin status for initial fetch trigger
    }, [productId, currentUser, isAuthLoading]); // Re-fetch if productId changes or auth resolves

    // Call fetchData on mount or when dependencies change
    useEffect(() => {
       if (currentUser && currentUser.role === 'ADMIN' && productId) {
         fetchData();
       }
    }, [fetchData, currentUser, productId]); // Include fetchData in dependencies


    // Form submission handler
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        // Validate numeric inputs
         const priceNum = parseFloat(price);
         const stockNum = parseInt(stock, 10);
         if (isNaN(priceNum) || priceNum < 0) { /* ... set error, return ... */ setError('Invalid price'); setIsSubmitting(false); return; }
         if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) { /* ... set error, return ... */ setError('Invalid stock'); setIsSubmitting(false); return; }
         if (!categoryId) { /* ... set error, return ... */ setError('Category required'); setIsSubmitting(false); return; }


        try {
             // PUT request to the specific product's admin endpoint
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'PUT', // Use PUT for updates
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ // Send only fields that can be updated
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
            setSuccess(`Product "${result.name}" updated successfully!`);
            // Optionally redirect back to list after delay
            setTimeout(() => router.push('/admin/products'), 1500);

        } catch (err: any) {
            console.error("Failed to update product:", err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };


     // --- Render Logic ---
     const isLoadingPage = isAuthLoading || isLoadingData; // Loading if auth or data fetch is happening

     if (isLoadingPage) { return <div className="container mx-auto p-6 text-center">Loading product data...</div>; }
     if (error && !name) { // Show major error if product data failed to load initially
         return <div className="container mx-auto p-6 text-center text-red-600">Error loading product: {error}</div>;
     }
     if (!currentUser || currentUser.role !== 'ADMIN') { return <div className="container mx-auto p-6 text-center text-red-600">Access Denied.</div>; }

    // Render the form (very similar to create form, but with pre-filled values)
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
            <div className="mb-6">
                <Link href="/admin/products" className="..."> {/* Back link style */}
                    ← Back to Products List
                </Link>
             </div>
            <h1 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white mb-6">
                 Edit Product <span className="text-base font-normal text-gray-500 ml-2">(ID: {productId})</span>
             </h1>

             {/* Use the same form structure as create, but values are bound to state */}
             <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                {/* Display Submission Error/Success Messages */}
                 {error && <div className="rounded-md bg-red-50 ..."><p className="text-sm ...">{error}</p></div>}
                 {success && <div className="rounded-md bg-green-50 ..."><p className="text-sm ...">{success}</p></div>}

                 {/* Name */}
                <div>
                     <label htmlFor="name" className="block text-sm font-medium ...">Product Name <span className="text-red-500">*</span></label>
                     <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="block w-full px-3 py-2 ..." />
                </div>

                 {/* Description */}
                 <div>
                     <label htmlFor="description" className="block text-sm font-medium ...">Description</label>
                     <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="block w-full px-3 py-2 ..." />
                 </div>

                  {/* Price & Stock (inline) */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                         <label htmlFor="price" className="block text-sm font-medium ...">Price <span className="text-red-500">*</span></label>
                         <div className="relative ...">
                             {/* ... price input with value={price} ... */}
                             <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01" className="..." placeholder="0.00" />
                         </div>
                     </div>
                     <div>
                          <label htmlFor="stock" className="block text-sm font-medium ...">Stock Quantity <span className="text-red-500">*</span></label>
                          <input type="number" id="stock" value={stock} onChange={(e) => setStock(e.target.value)} required min="0" step="1" className="..." placeholder="0" />
                     </div>
                  </div>

                 {/* Image URL */}
                <div>
                     <label htmlFor="imageUrl" className="block text-sm font-medium ...">Image URL</label>
                     <input type="url" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="..." placeholder="https://example.com/image.png" />
                </div>

                 {/* Category Select */}
                <div>
                     <label htmlFor="category" className="block text-sm font-medium ...">Category <span className="text-red-500">*</span></label>
                     <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required disabled={isLoadingData || categories.length === 0} className="...">
                         {categories.length === 0 && !isLoadingData ? (
                             <option>No categories loaded</option>
                         ) : (
                             categories.map(cat => (
                                 <option key={cat.id} value={cat.id}>{cat.name}</option>
                             ))
                         )}
                      </select>
                 </div>

                 {/* Submit Button */}
                 <div className="pt-4">
                     <button type="submit" disabled={isSubmitting || isLoadingData} className="w-full flex justify-center py-2 px-4 ... disabled:opacity-50">
                        {isSubmitting ? 'Updating...' : 'Update Product'}
                     </button>
                 </div>
             </form>
         </div>
     );
}