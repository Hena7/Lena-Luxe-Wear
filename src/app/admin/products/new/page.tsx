// src/app/admin/products/new/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

// Type definitions
type Category = {
  id: string;
  name: string;
};

// Type for category options fetched for the dropdown
type CategoryOption = Pick<Category, "id" | "name">;

export default function AdminNewProductPage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { locale } = useLanguage();
  const router = useRouter();

  // State for form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(""); // Store as string initially for input
  const [stock, setStock] = useState(""); // Store as string initially
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState(""); // Store selected category ID
  const [categories, setCategories] = useState<CategoryOption[]>([]); // Store fetched categories

  // State for UI feedback
  const [isLoading, setIsLoading] = useState(false); // Loading during API call
  const [isLoadingCategories, setIsLoadingCategories] = useState(true); // Loading categories
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect non-admins
  useEffect(() => {
    if (!isAuthLoading && (!currentUser || currentUser.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [currentUser, isAuthLoading, router]);

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch("/api/categories"); // Use existing API
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data: CategoryOption[] = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0].id); // Default to the first category initially
        }
      } catch (err) {
        console.error(err);
        setError("Could not load categories for selection.");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []); // Fetch once on mount

  // Form submission handler
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted - starting product creation...");
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validate numeric inputs
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid non-negative price.");
      setIsLoading(false);
      return;
    }
    if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      setError("Please enter a valid non-negative whole number for stock.");
      setIsLoading(false);
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      setIsLoading(false);
      return;
    }

    const productData = {
      name,
      description: description || null,
      price: priceNum,
      stock: stockNum,
      imageUrl: imageUrl || null,
      categoryId,
    };

    console.log("Sending product data:", productData);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      console.log("API Response:", { status: response.status, result });

      if (!response.ok) {
        throw new Error(result.message || "Failed to create product.");
      }

      // Success
      console.log("Product created successfully:", result);
      setSuccess(`Product "${result.name}" created successfully!`);

      // Show success message briefly before redirecting
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (err: any) {
      console.error("Failed to create product:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial loading / Auth check
  if (isAuthLoading || isLoadingCategories) {
    return (
      <div className="container mx-auto p-6 text-center">Loading form...</div>
    );
  }
  // Should be redirected if not admin, but double-check
  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="container mx-auto p-6 text-center text-red-600">
        Access Denied.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
      {" "}
      {/* Max width for form */}
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="text-sm font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
        >
          ← Back to Products List
        </Link>
      </div>
      <h1 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white mb-6">
        Create New Product
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700"
      >
        {/* Error/Success Messages */}
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3 border border-red-300 dark:border-red-600">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-3 border border-green-300 dark:border-green-600">
            <p className="text-sm text-green-700 dark:text-green-200">
              {success}
            </p>
          </div>
        )}

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Price & Stock (inline) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                  $
                </span>{" "}
                {/* Adjust currency symbol */}
              </div>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 pl-7 pr-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              min="0"
              step="1"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="0"
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="https://example.com/image.png"
          />
        </div>

        {/* Category Select */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            disabled={isLoadingCategories || categories.length === 0}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700"
          >
            {isLoadingCategories ? (
              <option>Loading categories...</option>
            ) : categories.length === 0 ? (
              <option>No categories available</option>
            ) : (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={
              isLoading || isLoadingCategories || categories.length === 0
            }
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          >
            {isLoading && (
              <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
            )}
            {isLoading ? "Creating Product..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
