"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/products/ProductCard";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

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

export default function ShopPage() {
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
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
        {t("navShop")}
      </h1>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === "am" ? "ምርቶችን ይፈልጉ..." : "Search products..."
              }
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            {locale === "am" ? "ማጣሪያዎች" : "Filters"}
          </button>
        </div>

        <div
          className={`${showFilters ? "block" : "hidden md:block"} space-y-4`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {locale === "am" ? "ምድብ" : "Category"}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">
                  {locale === "am" ? "ሁሉም ምድቦች" : "All Categories"}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {locale === "am" ? "ዋጋ ክልል" : "Price Range"}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder={locale === "am" ? "ዝቅተኛ" : "Min"}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder={locale === "am" ? "ከፍተኛ" : "Max"}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {locale === "am" ? "ደርድር በ" : "Sort By"}
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="newest">
                  {locale === "am" ? "አዲስ" : "Newest"}
                </option>
                <option value="price-asc">
                  {locale === "am" ? "ዋጋ: ዝቅተኛ ወደ ከፍተኛ" : "Price: Low to High"}
                </option>
                <option value="price-desc">
                  {locale === "am" ? "ዋጋ: ከፍተኛ ወደ ዝቅተኛ" : "Price: High to Low"}
                </option>
                <option value="name-asc">
                  {locale === "am" ? "ስም: A-Z" : "Name: A-Z"}
                </option>
                <option value="name-desc">
                  {locale === "am" ? "ስም: Z-A" : "Name: Z-A"}
                </option>
              </select>
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            {locale === "am" ? "ማጣሪያዎችን አጽዳ" : "Clear Filters"}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-600 dark:text-red-400">
          <p>
            {locale === "am" ? "ስህተት:" : "Error:"} {error}
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {products.length}{" "}
            {locale === "am" ? "ምርቶች ተገኝተዋል" : "products found"}
          </div>

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
    </div>
  );
}
