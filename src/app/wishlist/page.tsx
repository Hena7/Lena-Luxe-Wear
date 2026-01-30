"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/products/ProductCard";
import { HeartIcon } from "@heroicons/react/24/solid";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  description: string | null;
  stock: number;
  category: {
    id: string;
    name: string;
  } | null;
};

type WishlistItem = {
  id: string;
  productId: string;
  createdAt: string;
  product: Product;
};

export default function WishlistPage() {
  const { currentUser } = useAuth();
  const { locale } = useLanguage();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const response = await fetch("/api/wishlist");
        if (!response.ok) throw new Error("Failed to fetch wishlist");
        const data = await response.json();
        setWishlist(data);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load wishlist",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [currentUser]);

  const handleRemove = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove from wishlist");

      setWishlist((prev) =>
        prev.filter((item) => item.productId !== productId),
      );
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <HeartIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {locale === "am" ? "የምኞት ዝርዝር" : "Your Wishlist"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {locale === "am"
            ? "የምኞት ዝርዝርዎን ለማየት እባክዎን ይግቡ"
            : "Please login to view your wishlist"}
        </p>
        <a
          href="/login"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {locale === "am" ? "ግባ" : "Login"}
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          {locale === "am" ? "የምኞት ዝርዝር" : "Your Wishlist"}
        </h1>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {wishlist.length} {locale === "am" ? "እቃዎች" : "items"}
        </span>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <HeartIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {locale === "am" ? "የምኞት ዝርዝርዎ ባዶ ነው" : "Your wishlist is empty"}
          </p>
          <a
            href="/shop"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            {locale === "am" ? "ምርቶችን ይፈልጉ" : "Browse Products"}
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="relative">
              <ProductCard {...item.product} />
              <button
                onClick={() => handleRemove(item.productId)}
                className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors group"
                title={locale === "am" ? "ከዝርዝር አስወግድ" : "Remove from wishlist"}
              >
                <HeartIcon className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
