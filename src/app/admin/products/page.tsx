// src/app/admin/products/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@prisma/client"; // Import types
import Image from "next/image"; // For displaying product image thumbnails

// Define the shape of Product data returned by our admin API
// (Includes nested category name)
interface AdminProductView extends Product {
  category: {
    name: string;
  } | null; // Category relationship might be optional in schema, handle null
}

export default function AdminProductsPage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { t, locale } = useLanguage();
  const router = useRouter();

  const [products, setProducts] = useState<AdminProductView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auth and Role checks (similar to Admin Users page)
    if (!isAuthLoading && !currentUser) {
      router.replace("/login?redirectedFrom=/admin/products");
      return;
    }
    if (!isAuthLoading && currentUser && currentUser.role !== "ADMIN") {
      router.replace("/"); // Redirect non-admins home
      return;
    }

    // Fetch products if authenticated admin
    if (currentUser && currentUser.role === "ADMIN") {
      const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch("/api/admin/products"); // Fetch from admin API
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message || `Error fetching products: ${response.status}`
            );
          }
          const data: AdminProductView[] = await response.json();
          setProducts(data);
        } catch (err) {
          console.error("Failed to fetch admin products:", err);
          setError(
            err instanceof Error ? err.message : "Could not load product list."
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchProducts();
    } else if (!isAuthLoading) {
      setIsLoading(false);
    }
  }, [currentUser, isAuthLoading, router]); // Dependencies

  // Render Logic
  const isLoadingPage = isLoading || isAuthLoading;

  if (isLoadingPage) {
    return (
      <div className="container mx-auto p-6 text-center">
        Loading products...
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto p-6 text-center text-red-600">
        Error: {error}
      </div>
    );
  }
  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="container mx-auto p-6 text-center text-red-600">
        Access Denied.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-tight text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage all products in the store.
          </p>
        </div>
        {/* TODO: Add "Create New Product" Button */}
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            onClick={() => router.push("/admin/products/new")} // Example navigation
          >
            Add product
          </button>
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
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                    >
                      Image
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-4 px-3 text-sm text-center text-gray-500 dark:text-gray-400"
                      >
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-6">
                          <Image
                            src={product.imageUrl || "/placeholder-image.png"}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md object-contain border border-gray-200 dark:border-gray-700 bg-white p-0.5"
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {product.category?.name || "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {locale === "am"
                            ? `${product.price.toFixed(2)} ብር`
                            : `$${product.price.toFixed(2)}`}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {product.stock}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(product.createdAt).toLocaleDateString(
                            locale === "am" ? "am-ET" : "en-US",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {/* Replace placeholder button with Link */}
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded px-1"
                          >
                            Edit
                            <span className="sr-only">, {product.name}</span>
                          </Link>
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
        <Link href="/admin" className="...">
          {" "}
          {/* Use styles from Admin Users page */}← Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
