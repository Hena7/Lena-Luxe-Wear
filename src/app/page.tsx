"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/products/ProductCard";

const featuredProductsData = [
  {
    id: "prod-001",
    name: "Classic Cotton T-Shirt",
    price: 19.99,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-002",
    name: "Slim Fit Jeans",
    price: 49.95,
    imageUrl:
      "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHNsaW0lMjBmaXQlMjBqZWFuc3xlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: "prod-003",
    name: "Summer Floral Dress",
    price: 65.0,
    imageUrl:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "prod-004",
    name: "Leather Belt",
    price: 24.5,
    imageUrl:
      "https://images.unsplash.com/photo-1591117105338-4eb266b13c7d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxlYXRoZXIlMjBiZWx0fGVufDB8fDB8fHww",
  },
];

export default function Home() {
  const { t } = useLanguage();

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

      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
          {t("featuredProducts")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProductsData.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
            />
          ))}
        </div>
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
    </div>
  );
}
