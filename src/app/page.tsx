// src/app/page.tsx
"use client"; // Needs "use client" because it uses the useLanguage hook
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext"; // Import language hook
import ProductCard from "@/components/products/ProductCard";
// import { featuredProductsData } from "@/components/sampleData";

const featuredProductsData = [
  {
    id: 'prod-001',
    name: 'Classic Cotton T-Shirt',
    price: 19.99,
    // Example Unsplash URL for a T-shirt
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' // Ratio ~1:1
  },
  {
    id: 'prod-002',
    name: 'Slim Fit Jeans',
    price: 49.95,
    // Example Unsplash URL for Jeans
    imageUrl: 'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHNsaW0lMjBmaXQlMjBqZWFuc3xlbnwwfHwwfHx8MA%3D%3D' // Ratio ~1:1
  },
  {
    id: 'prod-003',
    name: 'Summer Floral Dress',
    price: 65.00,
    // Example Unsplash URL for a Dress
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' // Ratio ~1:1
  },
  {
    id: 'prod-004',
    name: 'Leather Belt',
    price: 24.50,
    // Example Unsplash URL for a Belt
    imageUrl: 'https://images.unsplash.com/photo-1591117105338-4eb266b13c7d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxlYXRoZXIlMjBiZWx0fGVufDB8fDB8fHww' // Ratio ~1:1
  },

];

export default function Home() {
  const { t } = useLanguage(); // Get translation function

  return (
    <div>
      {/* Hero Section */}
      {/* Added dark mode styling */}
      <section className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-700 dark:to-blue-700 py-20 px-4 rounded-lg mb-12 text-center transition-colors duration-300">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          {t("heroTitle")} {/* Translate */}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {t("heroSubtitle")} {/* Translate */}
        </p>
        <Link
          href="/shop"
          className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 dark:text-white text-white font-bold py-3 px-8 rounded transition duration-300"
        >
          {t("heroButton")} {/* Translate */}
        </Link>
      </section>

      {/* Featured Products Section - Placeholder */}
      {/* === Featured Products Section - UPDATE THIS === */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
          {t("featuredProducts")}
        </h2>
        {/* Replace the placeholder divs with a map over the data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProductsData.map((product) => (
            // For each product in the array, render a ProductCard
            <ProductCard
              key={product.id} // React needs a unique 'key' prop when mapping
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
              // Alternatively, use spread: {...product}
            />
          ))}
        </div>
      </section>

      {/* Categories Section - Placeholder */}
      <section>
        {/* Added dark mode styling */}
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
          {t("shopByCategory")} {/* Translate */}
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {/* Add dark mode styling to category links */}
          <Link
            href="/shop?category=men"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-5 rounded transition"
          >
            {t("catMen")} {/* Translate */}
          </Link>
          <Link
            href="/shop?category=women"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-5 rounded transition"
          >
            {t("catWomen")} {/* Translate */}
          </Link>
          <Link
            href="/shop?category=kids"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-5 rounded transition"
          >
            {t("catKids")} {/* Translate */}
          </Link>
          <Link
            href="/shop?category=accessories"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-5 rounded transition"
          >
            {t("catAccessories")} {/* Translate */}
          </Link>
        </div>
      </section>
    </div>
  );
}
