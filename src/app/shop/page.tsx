// src/app/shop/page.tsx
"use client"; // We'll likely need client-side features like filtering later

import ProductCard from '@/components/products/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

// Let's create slightly more dummy data for the shop page
// In a real app, this would be fetched based on filters/pagination
// const shopProductsData = [
//     { id: 'prod-001', name: 'Classic Cotton T-Shirt', price: 19.99, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' },
//     { id: 'prod-002', name: 'Slim Fit Jeans', price: 49.95, imageUrl: 'https://images.unsplash.com/photo-1602293589914-9b29cdae68dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' },
//     { id: 'prod-003', name: 'Summer Floral Dress', price: 65.00, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' },
//     { id: 'prod-004', name: 'Leather Belt', price: 24.50, imageUrl: 'https://images.unsplash.com/photo-1542181634-519e8a315436?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' },
//     { id: 'prod-005', name: 'Cozy Knit Sweater', price: 55.00, imageUrl: 'https://images.unsplash.com/photo-1616420879804-2a14f4173313?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' },
//     { id: 'prod-006', name: 'Canvas Sneakers', price: 39.99, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' },
//     { id: 'prod-007', name: 'Wool Scarf', price: 29.95, imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' }, // Example non-clothing item
//     { id: 'prod-008', name: 'Stylish Sunglasses', price: 75.00, imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80' },
// ];

interface ShopProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description?: string; // Keep description optional here if needed
  category: 'T-Shirt' | 'Jeans' | 'Dress' | 'Accessories' | 'Sweater' | 'Shoes'; // Example categories
}

const shopProductsData: ShopProduct[] = [
  { id: 'prod-001', name: 'Classic Cotton T-Shirt', price: 19.99, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', category: 'T-Shirt' },
  { id: 'prod-002', name: 'Slim Fit Jeans', price: 49.95, imageUrl: 'https://images.unsplash.com/photo-1602293589914-9b29cdae68dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', category: 'Jeans' },
  { id: 'prod-003', name: 'Summer Floral Dress', price: 65.00, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', category: 'Dress' },
  { id: 'prod-004', name: 'Leather Belt', price: 24.50, imageUrl: 'https://images.unsplash.com/photo-1542181634-519e8a315436?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', category: 'Accessories' },
  { id: 'prod-005', name: 'Cozy Knit Sweater', price: 55.00, imageUrl: 'https://images.unsplash.com/photo-1616420879804-2a14f4173313?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', category: 'Sweater' },
  { id: 'prod-006', name: 'Canvas Sneakers', price: 39.99, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', category: 'Shoes' },
  { id: 'prod-007', name: 'Wool Scarf', price: 29.95, imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', category: 'Accessories' }, // Another accessory
  { id: 'prod-008', name: 'Stylish Sunglasses', price: 75.00, imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', category: 'Accessories' }, // And another
  // Add a few more for better testing maybe
  { id: 'prod-009', name: 'Graphic Print T-Shirt', price: 22.50, imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', category: 'T-Shirt' },
  { id: 'prod-010', name: 'High-Waisted Jeans', price: 52.00, imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', category: 'Jeans' },
];

const categories = ['All', ...new Set(shopProductsData.map(p => p.category))];

// Define sorting options
type SortOption = 'default' | 'price-asc' | 'price-desc';

export default function ShopPage() {
  const { t, locale } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<SortOption>('default');

  // === Filtering and Sorting Logic ===
  const filteredAndSortedProducts = shopProductsData
      .filter(product => {
          // Filter by category
          if (selectedCategory === 'All') {
              return true; // Show all if 'All' is selected
          }
          return product.category === selectedCategory;
      })
      .sort((a, b) => {
          // Sort based on sortOrder
          switch (sortOrder) {
              case 'price-asc':
                  return a.price - b.price; // Sort by price: low to high
              case 'price-desc':
                  return b.price - a.price; // Sort by price: high to low
              case 'default':
              default:
                  return 0; // No specific sorting, keep original (or sort by ID/name if needed)
          }
      });



  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-8">
        {t('navShop')} {/* Re-use translation key */}
      </h1>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                {/* Category Filters */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                                selectedCategory === category
                                    ? 'bg-purple-600 text-white shadow' // Active style
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600' // Inactive style
                            }`}
                        >
                            {category} {/* Display category name */}
                            {/* Add translation for category names later if needed */}
                        </button>
                    ))}
                </div>

                {/* Sort Dropdown */}
                <div>
                    <label htmlFor="sort-order" className="sr-only"> {/* Screen reader only label */}
                        {locale === 'am' ? 'ደርድር በ' : 'Sort by'}
                    </label>
                    <select
                        id="sort-order"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as SortOption)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="default">{locale === 'am' ? 'ነባሪ' : 'Default'}</option>
                        <option value="price-asc">{locale === 'am' ? 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ' : 'Price: Low to High'}</option>
                        <option value="price-desc">{locale === 'am' ? 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ' : 'Price: High to Low'}</option>
                        {/* Add other sort options later (e.g., name, newest) */}
                    </select>
                </div>
            </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Map over filteredAndSortedProducts instead of shopProductsData */}
                {filteredAndSortedProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>

             {/* Display message if no products match filters */}
             {filteredAndSortedProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    {locale === 'am' ? 'ምንም የሚዛመድ ምርት አልተገኘም።' : 'No products found matching your criteria.'}
                </div>
             )}

    </div>
  );
}