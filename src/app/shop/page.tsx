// src/app/shop/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import type { Prisma } from '@prisma/client';
import ProductCard from '@/components/products/ProductCard';

// Type definitions
type Category = {
    id: string;
    name: string;
}

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
}

// Derived type representing a Product with its Category relation included
interface ProductWithCategory extends Product {
    category: {
        id: string;
        name: string;
    } | null; // Allow null in case relation is optional or data inconsistent
}

// Type for categories fetched from API or used in state
type CategoryOption = Pick<Category, 'id' | 'name'>;

// Type for sorting options
type SortOption = 'default' | 'price-asc' | 'price-desc';

export default function ShopPage() {
  const { t, locale } = useLanguage();

  // State variables
  const [allProducts, setAllProducts] = useState<ProductWithCategory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<SortOption>('default');

  // Fetch Categories Effect (runs once on mount)
  useEffect(() => {
      const fetchCategories = async () => {
          console.log("Fetching categories...");
          setIsLoadingCategories(true);
          setError(null); // Reset error specifically for categories perhaps
          try {
              const response = await fetch('/api/categories');
              if (!response.ok) {
                  throw new Error(`HTTP error fetching categories! status: ${response.status}`);
              }
              const data: CategoryOption[] = await response.json();
              setCategories(data);
              console.log("Categories fetched successfully:", data);
          } catch (err) {
             console.error("Failed to fetch categories", err);
             setError(err instanceof Error ? `Failed to load categories: ${err.message}` : 'Failed to load categories');
          } finally {
              setIsLoadingCategories(false);
              console.log("Category fetch finished.");
          }
      };
      fetchCategories();
  }, []); // Empty dependency array = run once

  // Fetch Products Effect (runs when selectedCategoryId changes)
  useEffect(() => {
    const fetchProducts = async () => {
      console.log(`Fetching products for category ID: ${selectedCategoryId}`);
      setIsLoadingProducts(true);
      setError(null); // Reset error before product fetch
      try {
        let apiUrl = '/api/products';
        if (selectedCategoryId && selectedCategoryId !== 'All') {
           apiUrl += `?categoryId=${selectedCategoryId}`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
           const errorData = await response.json().catch(()=>({}));
          throw new Error(errorData.message || `HTTP error fetching products! status: ${response.status}`);
        }

        const data: ProductWithCategory[] = await response.json();
        setAllProducts(data); // Store the fetched products (which might be filtered by API)
        console.log("Products fetched successfully:", data);

      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching products.');
        setAllProducts([]); // Clear products on error
      } finally {
        setIsLoadingProducts(false);
        console.log("Product fetch finished.");
      }
    };
    fetchProducts();
  }, [selectedCategoryId]); // Dependency: Re-run when selectedCategoryId changes

  // Client-side Sorting Effect (runs when products or sort order changes)
  useEffect(() => {
    let productsToDisplay = [...allProducts]; // Use the latest fetched products

    // Apply client-side sorting
    productsToDisplay.sort((a, b) => {
      switch (sortOrder) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        default: return 0; // Keep API order (e.g., createdAt desc) or add another default sort
      }
    });

    setFilteredProducts(productsToDisplay); // Update the state for rendering

  }, [allProducts, sortOrder]); // Dependencies: Run when allProducts or sortOrder change


  // Combine loading states for UI
  const isLoading = isLoadingProducts || isLoadingCategories;

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-8">
        {t('navShop')}
      </h1>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 md:gap-6">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          {/* "All" Button */}
          <button
              key="All"
              onClick={() => setSelectedCategoryId('All')}
              disabled={isLoading}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedCategoryId === 'All'
                      ? 'bg-purple-600 text-white border-purple-600 shadow' // Active style
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600' // Inactive style
              }`}
          >
              {locale === 'am' ? 'ሁሉም' : 'All'}
          </button>

          {/* Category Buttons */}
          {isLoadingCategories ? (
               <span className="text-sm text-gray-500 dark:text-gray-400 px-4 py-1.5">Loading categories...</span>
          ) : (
            categories.map(category => (
                <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    disabled={isLoading}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedCategoryId === category.id
                            ? 'bg-purple-600 text-white border-purple-600 shadow' // Active style
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600' // Inactive style
                    }`}
                >
                    {category.name} {/* Display category name from API */}
                </button>
            ))
          )}
           {!isLoadingCategories && categories.length === 0 && !error && (
                <span className="text-sm text-gray-500 dark:text-gray-400 px-4 py-1.5">No categories found.</span>
            )}
        </div>

        {/* Sort Dropdown */}
        <div>
            <label htmlFor="sort-order" className="sr-only">
                {locale === 'am' ? 'ደርድር በ' : 'Sort by'}
            </label>
            <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOption)}
                disabled={isLoading || isLoadingProducts} // Disable if either is loading
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <option value="default">{locale === 'am' ? 'ነባሪ' : 'Default'}</option>
                <option value="price-asc">{locale === 'am' ? 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ' : 'Price: Low to High'}</option>
                <option value="price-desc">{locale === 'am' ? 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ' : 'Price: High to Low'}</option>
            </select>
        </div>
      </div>

     {/* Loading State Display */}
     {isLoading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {locale === 'am' ? 'ምርቶች እየተጫኑ ነው...' : 'Loading products...'}
            {/* You could add a spinner animation here */}
        </div>
     )}

     {/* Error State Display */}
     {!isLoading && error && (
        <div className="text-center py-12 text-red-600 dark:text-red-400">
            <p>{locale === 'am' ? 'ስህተት ተፈጥሯል፡' : 'Error:'} {error}</p>
            {/* Maybe add a retry button here? */}
        </div>
     )}

      {/* Product Grid - Render only if not loading and no error */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Map over filteredProducts state */}
              {filteredProducts.map((product) => (
                   // Ensure ProductCard component can handle the ProductWithCategory shape
                  <ProductCard key={product.id} {...product} />
              ))}
          </div>

          {/* Display message if no products match filters AFTER loading/no error */}
          {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {locale === 'am' ? 'ምንም የሚዛመድ ምርት አልተገኘም።' : 'No products found matching your criteria.'}
              </div>
          )}
        </>
      )}

      {/* Pagination Placeholder - Would require API changes */}
      <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
        [ Pagination may be added later / የገጽ ቁጥሮች በኋላ ሊጨመሩ ይችላሉ ]
      </div>
    </div>
  );
}






// // src/app/shop/page.tsx
// "use client"; // We'll likely need client-side features like filtering later

// import ProductCard from '@/components/products/ProductCard';
// import { useLanguage } from '@/contexts/LanguageContext';
// import { useEffect, useState } from 'react';
// // We need a type for the product data coming from the API
// import type { Product } from '@prisma/client'; // Import generated Product type!

// // Define available categories statically for now
// const staticCategories = ['All', 'T-Shirt', 'Jeans', 'Dress', 'Accessories', 'Sweater', 'Shoes']; // Match seeded data

// // Define sorting options
// type SortOption = 'default' | 'price-asc' | 'price-desc';

// export default function ShopPage() {
//   const { t, locale } = useLanguage();

  
//   // === State Variables ===
//   const [allProducts, setAllProducts] = useState<Product[]>([]); // Store fetched products
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // Products after filtering/sorting
//   const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state
//   const [error, setError] = useState<string | null>(null); // Error state
//   const [selectedCategory, setSelectedCategory] = useState<string>('All');
//   const [sortOrder, setSortOrder] = useState<SortOption>('default');
//   // =======================

//   // === Data Fetching Effect ===
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setIsLoading(true); // Start loading
//       setError(null); // Reset error state
//       try {
//         const response = await fetch('/api/products'); // Fetch from our API route

//         if (!response.ok) {
//           // Handle HTTP errors (like 404, 500)
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data: Product[] = await response.json(); // Parse JSON response
//         setAllProducts(data); // Store all fetched products
//         // setFilteredProducts(data); // Initially show all products (will be updated by filter/sort effect)

//       } catch (err) {
//         console.error("Failed to fetch products:", err);
//         setError(err instanceof Error ? err.message : 'An unknown error occurred');
//       } finally {
//         setIsLoading(false); // Stop loading regardless of success/error
//       }
//     };

//     fetchProducts(); // Call the fetch function when component mounts
//   }, []); // Empty dependency array means this effect runs only once on mount
//   // ===========================


//   // === Filtering and Sorting Effect ===
//   useEffect(() => {
//     // This effect runs whenever allProducts, selectedCategory, or sortOrder changes
//     let productsToDisplay = [...allProducts]; // Start with all fetched products

//     // Apply filtering
//     if (selectedCategory !== 'All') {
//       productsToDisplay = productsToDisplay.filter(product => product.category === selectedCategory);
//     }

//     // Apply sorting
//     productsToDisplay.sort((a, b) => {
//       switch (sortOrder) {
//         case 'price-asc':
//           return a.price - b.price;
//         case 'price-desc':
//           return b.price - a.price;
//         default:
//           // Optional: Add a default sort (e.g., by name or ID) if needed
//           // return a.name.localeCompare(b.name);
//           return 0;
//       }
//     });

//     setFilteredProducts(productsToDisplay); // Update the state for rendering

//   }, [allProducts, selectedCategory, sortOrder]); // Dependencies for this effect


//   return (
//     <div>
//       <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-8">
//         {t('navShop')}
//       </h1>

//       {/* Filter and Sort Controls */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//         {/* Category Filters - Use staticCategories now */}
//         <div className="flex flex-wrap justify-center md:justify-start gap-2">
//             {staticCategories.map(category => (
//                 <button
//                     key={category}
//                     onClick={() => setSelectedCategory(category)}
//                     // Disable buttons while loading
//                     disabled={isLoading}
//                     className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
//                         selectedCategory === category
//                             ? 'bg-purple-600 text-white shadow'
//                             : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
//                     }`}
//                 >
//                     {category}
//                 </button>
//             ))}
//         </div>

//         {/* Sort Dropdown */}
//         <div>
//             <label htmlFor="sort-order" className="sr-only">
//                 {locale === 'am' ? 'ደርድር በ' : 'Sort by'}
//             </label>
//             <select
//                 id="sort-order"
//                 value={sortOrder}
//                 onChange={(e) => setSortOrder(e.target.value as SortOption)}
//                 // Disable dropdown while loading
//                 disabled={isLoading}
//                 className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//                 <option value="default">{locale === 'am' ? 'ነባሪ' : 'Default'}</option>
//                 <option value="price-asc">{locale === 'am' ? 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ' : 'Price: Low to High'}</option>
//                 <option value="price-desc">{locale === 'am' ? 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ' : 'Price: High to Low'}</option>
//             </select>
//         </div>
//     </div>

//      {/* Loading State Display */}
//      {isLoading && (
//         <div className="text-center py-12 text-gray-500 dark:text-gray-400">
//             {locale === 'am' ? 'ምርቶች እየተጫኑ ነው...' : 'Loading products...'}
//             {/* You could add a spinner animation here */}
//         </div>
//      )}

//      {/* Error State Display */}
//      {!isLoading && error && (
//         <div className="text-center py-12 text-red-600 dark:text-red-400">
//             {locale === 'am' ? 'ስህተት ተፈጥሯል፡' : 'Error:'} {error}
//         </div>
//      )}

//       {/* Product Grid - Render only if not loading and no error */}
//       {!isLoading && !error && (
//         <>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {/* Map over filteredProducts now */}
//               {filteredProducts.map((product) => (
//                   <ProductCard key={product.id} {...product} />
//               ))}
//           </div>

//           {/* Display message if no products match filters after loading */}
//           {filteredProducts.length === 0 && (
//               <div className="text-center py-12 text-gray-500 dark:text-gray-400">
//                   {locale === 'am' ? 'ምንም የሚዛመድ ምርት አልተገኘም።' : 'No products found matching your criteria.'}
//               </div>
//           )}
//         </>
//       )}

//       {/* Placeholder for pagination - would interact with API fetching */}
//       <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
//         [ Pagination might be added later / የገጽ ቁጥሮች በኋላ ሊጨመሩ ይችላሉ ]
//       </div>
//     </div>
//   );
// }