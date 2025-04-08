// src/app/product/[productId]/page.tsx
"use client"; // Mark as client component to potentially add interactions later (like "Add to Cart")

import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import Link from 'next/link'; // For breadcrumbs or related products
import { notFound } from 'next/navigation'; // To handle cases where the product ID doesn't exist

// --- Data Fetching Simulation ---
// Combine dummy data from both home and shop pages for lookup
// !! IMPORTANT: This is temporary! In a real app, you'd fetch ONE product
// !!            from your database/API using the productId.
const allProductsData = [
    { id: 'prod-001', name: 'Classic Cotton T-Shirt', price: 19.99, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'A comfortable and classic 100% cotton t-shirt.' },
    { id: 'prod-002', name: 'Slim Fit Jeans', price: 49.95, imageUrl: 'https://images.unsplash.com/photo-1602293589914-9b29cdae68dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Modern slim fit jeans with a touch of stretch for comfort.' },
    { id: 'prod-003', name: 'Summer Floral Dress', price: 65.00, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Light and airy floral dress perfect for summer days.' },
    { id: 'prod-004', name: 'Leather Belt', price: 24.50, imageUrl: 'https://images.unsplash.com/photo-1542181634-519e8a315436?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Genuine leather belt with a classic buckle.' },
    { id: 'prod-005', name: 'Cozy Knit Sweater', price: 55.00, imageUrl: 'https://images.unsplash.com/photo-1616420879804-2a14f4173313?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Warm and cozy knit sweater for chilly evenings.' },
    { id: 'prod-006', name: 'Canvas Sneakers', price: 39.99, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Casual and durable canvas sneakers for everyday wear.' },
    { id: 'prod-007', name: 'Wool Scarf', price: 29.95, imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Soft wool scarf to keep you warm in style.' },
    { id: 'prod-008', name: 'Stylish Sunglasses', price: 75.00, imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', description: 'Protect your eyes with these fashionable sunglasses.' },
];

// Function to simulate fetching a single product
const getProductById = (id: string) => {
    console.log("Searching for product with ID:", id); // Debug log
    return allProductsData.find(p => p.id === id);
};
// --- End Data Fetching Simulation ---


// The page component receives props including `params`
interface ProductPageProps {
    params: { productId: string }; // param name must match folder name [productId]
    // searchParams?: { [key: string]: string | string[] | undefined }; // For query params if needed
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { t, locale } = useLanguage();
  const { productId } = params; // Extract the ID from the params object

  // Find the product using the simulated fetch function
  const product = getProductById(productId);

  // Handle product not found - show a 404 page
  if (!product) {
      console.log("Product not found, triggering 404 for ID:", productId); // Debug log
      notFound(); // This function from next/navigation renders the default 404 page
  }

  // Basic price formatting (can be improved)
  const formattedPrice = locale === 'am'
    ? `${product.price.toFixed(2)} ብር` // Amharic Price
    : `$${product.price.toFixed(2)}`; // English Price

  return (
    <div className="container mx-auto px-4 py-8">
       {/* Breadcrumbs (optional but good UX) */}
       <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
         <Link href="/" className="hover:underline">{t('navHome')}</Link>
         {' / '}
         <Link href="/shop" className="hover:underline">{t('navShop')}</Link>
         {' / '}
         <span className="font-semibold text-gray-700 dark:text-gray-300">{product.name}</span>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Column */}
        <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
             <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw" // Image takes full width on mobile, half on desktop
                className="object-cover"
                priority // Prioritize loading the main product image
             />
        </div>

        {/* Details Column */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-6">
            {formattedPrice}
          </p>

          {/* Description */}
          <div className="mb-6 prose dark:prose-invert max-w-none">
            {/* Using Tailwind Prose for nice text formatting */}
            <h2 className="text-xl font-semibold mb-2">{locale === 'am' ? 'መግለጫ' : 'Description'}</h2>
            <p>{product.description || (locale === 'am' ? 'መግለጫ የለም።' : 'No description available.')}</p>
          </div>

          {/* Add to Cart Button (Placeholder) */}
          <div className="mt-8">
             <button className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded transition duration-300 disabled:opacity-50"
               // Add onClick handler later for cart functionality
               // disabled={!product.inStock} // Example: disable if out of stock
             >
                {locale === 'am' ? 'ወደ ጋሪ ጨምር' : 'Add to Cart'}
             </button>
          </div>

          {/* Other details like size/color selectors would go here */}

        </div>
      </div>

      {/* Related Products Section (Placeholder) */}
      <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
            {locale === 'am' ? 'ተዛማጅ ምርቶች' : 'Related Products'}
          </h2>
          {/* You could fetch and display other ProductCards here */}
          <p className="text-gray-500 dark:text-gray-400">[ Related products will appear here / ተዛማጅ ምርቶች እዚህ ይታያሉ ]</p>
      </div>
    </div>
  );
}