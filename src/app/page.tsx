"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/products/ProductCard";
import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
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
  category: Category | null;
};

export default function Home() {
  const { t, locale } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("q", searchQuery);
        if (selectedCategory !== "all")
          params.append("category", selectedCategory);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (sortOrder) params.append("sort", sortOrder);

        const response = await fetch(
          `/api/products/search?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data.products);
        setCategories(data.categories);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load products",
        );
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortOrder]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSortOrder("newest");
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-700 dark:to-blue-700 py-20 px-4 rounded-lg mb-12 text-center transition-colors duration-300">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          {t("heroTitle")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {t("heroSubtitle")}
        </p>
        <Link
          href="/shop"
          className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 dark:text-white text-white font-bold py-3 px-8 rounded transition duration-300"
        >
          {t("heroButton")}
        </Link>
      </section>
      <section>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
          {t("shopByCategory")}
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/shop?category=men"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-5 rounded transition"
          >
            {t("catMen")}
          </Link>
          <Link
            href="/shop?category=women"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-5 rounded transition"
          >
            {t("catWomen")}
          </Link>
          <Link
            href="/shop?category=kids"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-5 rounded transition"
          >
            {t("catKids")}
          </Link>
          <Link
            href="/shop?category=accessories"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-5 rounded transition"
          >
            {t("catAccessories")}
          </Link>
        </div>
      </section>
      <section className="mb-12">
        {!isLoading && !error && (
          <>
            <div className="mb-12 text-sm text-gray-600 dark:text-gray-400"></div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium mb-2">
                  {locale === "am" ? "ምንም ምርት አልተገኘም" : "No products found"}
                </p>
                <p className="text-sm">
                  {locale === "am"
                    ? "የፍለጋ ደንቦችዎን ይለውጡ"
                    : "Try adjusting your search criteria"}
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
