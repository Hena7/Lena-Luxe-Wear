"use client";

import { useState, useEffect, use } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import type { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type ProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
  searchParams?: { [key: string]: string | string[] | undefined };
};

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
};

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { t, locale } = useLanguage();
  const { addItem } = useCart();
  const { productId } = use(params);

  // State for the product data, loading, and error status
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch product data when the component mounts or productId changes
  useEffect(() => {
    if (!productId) {
      setError("Product ID not found in URL.");
      setIsLoading(false);
      return; // Stop if no ID
    }

    const fetchProduct = async () => {
      console.log(`Fetching product details for ID: ${productId}`);
      setIsLoading(true);
      setError(null);
      setProduct(null); // Reset product state on new fetch

      try {
        const apiUrl = `/api/products/${productId}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to get error message from API
          if (response.status === 404) {
            setError(
              errorData.message || `Product with ID ${productId} not found.`,
            );
          } else {
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`,
            );
          }
          setProduct(null);
        } else {
          const data: Product = await response.json();
          setProduct(data); // Set fetched product data
          console.log("Product fetched successfully:", data);
        }
      } catch (err) {
        console.error(`Failed to fetch product ${productId}:`, err);
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching product details.",
        );
        setProduct(null);
      } finally {
        setIsLoading(false);
        console.log("Product detail fetch finished.");
      }
    };

    fetchProduct();
  }, [productId]); // Dependency array includes productId

  // Handler for the Add to Cart button
  const handleAddToCart = () => {
    if (product) {
      console.log(`Adding ${product.name} (ID: ${product.id}) to cart`);
      addItem(product, 1); // Use the addItem function from context
      // Simple feedback - consider a more user-friendly notification/toast later
      alert("added to cart!");
    } else {
      console.error("Cannot add to cart, product data is not available.");
      alert("Could not add to cart. Please try again.");
    }
  };

  // --- Render Logic ---

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        {/* Basic Loading Skeleton */}
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-10"></div>{" "}
          {/* Breadcrumbs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg"></div>{" "}
            {/* Image */}
            <div className="space-y-4">
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>{" "}
              {/* Title */}
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>{" "}
              {/* Price */}
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mt-4"></div>{" "}
              {/* Desc Title */}
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>{" "}
              {/* Desc Line */}
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>{" "}
              {/* Desc Line */}
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>{" "}
              {/* Desc Line */}
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-full md:w-1/2 mt-6"></div>{" "}
              {/* Button */}
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mt-2"></div>{" "}
              {/* Stock */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div
          className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative max-w-lg mx-auto"
          role="alert"
        >
          <strong className="font-bold">
            {locale === "am" ? "ስህተት፡ " : "Error: "}
          </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <Link
          href="/shop"
          className="mt-6 inline-block text-purple-600 dark:text-purple-400 hover:underline font-medium"
        >
          ← {locale === "am" ? "ወደ መሸጫ ተመለስ" : "Return to Shop"}
        </Link>
      </div>
    );
  }

  // 3. Product Not Found State (covered by !product check after loading/error checks)
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-gray-600 dark:text-gray-400">
        <p>
          {locale === "am"
            ? "ይህ ምርት ሊገኝ አልቻለም።"
            : "This product could not be found."}
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block text-purple-600 dark:text-purple-400 hover:underline font-medium"
        >
          ← {locale === "am" ? "ወደ መሸጫ ተመለስ" : "Return to Shop"}
        </Link>
      </div>
    );
  }

  // 4. --- Render Actual Product Details ---
  const formattedPrice =
    locale === "am"
      ? `${product.price.toFixed(2)} ብር`
      : `$${product.price.toFixed(2)}`;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <Link
          href="/"
          className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
        >
          {t("navHome")}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href="/shop"
          className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
        >
          {t("navShop")}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">
          {product.name}
        </span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Column */}
        <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800">
          <Image
            src={product.imageUrl || "/placeholder-image.png"} // Add fallback image path
            alt={product.name}
            fill
            sizes="(max-width: 768px) 90vw, 45vw" // Adjust sizes based on layout
            className="object-contain p-4" // Use 'object-contain' if images aren't perfectly square
            priority // Load this image first
            onError={(e) => {
              // Optional: Handle image loading errors (e.g., show placeholder)
              (e.target as HTMLImageElement).src = "/placeholder-image.png";
              (e.target as HTMLImageElement).srcset = "";
            }}
          />
          {isOutOfStock && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              {locale === "am" ? "አልቋል" : "Out of Stock"}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="flex flex-col justify-center">
          {" "}
          {/* Center content vertically if needed */}
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-6">
            {formattedPrice}
          </p>
          {/* Description */}
          {product.description && (
            <div className="mb-6 prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              {/* Using Tailwind Prose plugin for nice formatting */}
              {/* <h2 className="text-xl font-semibold mb-2">{locale === 'am' ? 'መግለጫ' : 'Description'}</h2> */}
              <p>{product.description}</p>
            </div>
          )}
          {!product.description && (
            <p className="mb-6 text-gray-500 dark:text-gray-400 italic">
              {locale === "am" ? "መግለጫ የለም።" : "No description available."}
            </p>
          )}
          {/* Add to Cart Button & Stock */}
          <div className="mt-auto pt-6">
            {" "}
            {/* Push button towards bottom */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full flex items-center justify-center rounded-md border border-transparent bg-purple-600 py-3 px-8 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out ${isOutOfStock ? "opacity-50 cursor-not-allowed bg-gray-500 hover:bg-gray-500" : ""}`}
            >
              {isOutOfStock
                ? locale === "am"
                  ? "አልቋል"
                  : "Out of Stock"
                : locale === "am"
                  ? "ወደ ጋሪ ጨምር"
                  : "Add to Cart"}
            </button>
            {!isOutOfStock && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center md:text-left">
                {locale === "am"
                  ? `ክምችት፡ ${product.stock} ቀርቷል።`
                  : `${product.stock} items left in stock.`}
              </p>
            )}
            {isOutOfStock && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-3 text-center md:text-left">
                {locale === "am"
                  ? "ይህ እቃ በአሁኑ ጊዜ አልቋል።"
                  : "This item is currently out of stock."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Section (Placeholder - fetch and display logic needed) */}
      {/* <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                    {locale === 'am' ? 'ተዛማጅ ምርቶች' : 'Related Products'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">[ Related products could be displayed here using ProductCard components ]</p>
                {/* Example: Render more ProductCards fetched based on current product's category *}
            </div> */}
    </div>
  );
}
