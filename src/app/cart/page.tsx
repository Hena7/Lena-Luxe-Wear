// src/app/cart/page.tsx
"use client";

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext'; // Adjust path if needed
import { useLanguage } from '@/contexts/LanguageContext'; // Adjust path if needed
import { useAuth } from '@/contexts/AuthContext'; // Adjust path if needed
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid'; // Loading spinner icon

export default function CartPage() {
    const {
        items,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getCartTotal,
        isCartLoading // Loading state from context (for initial localStorage load)
    } = useCart();
    const { t, locale } = useLanguage();
    const { currentUser, isLoading: isAuthLoading } = useAuth(); // Get auth status
    const router = useRouter();

    // State for the Place Order button action
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);

    // Handler for quantity input change
    const handleQuantityChange = (itemId: string, newQuantityStr: string) => {
        let newQuantity = parseInt(newQuantityStr, 10);

        // If input is empty or not a number, maybe do nothing yet,
        // wait for blur or handle more gracefully if needed.
        if (isNaN(newQuantity) || newQuantityStr === '') {
            return;
        }

        // Ensure quantity is at least 1, otherwise remove? Or just prevent going below 1?
        // For now, force minimum of 1. Can be changed to removeItem(itemId) if 0 is typed.
        if (newQuantity <= 0) {
            newQuantity = 1;
            // Potentially show a message?
        }

        // TODO: Optional: Add stock check here based on available stock info
        // if (item.stock && newQuantity > item.stock) { ... }

        updateQuantity(itemId, newQuantity);
    };

    // Handler for placing the order
    const handlePlaceOrder = async () => {
        setOrderError(null);
        setIsPlacingOrder(true);

        if (!currentUser) {
            setOrderError(locale === 'am' ? 'ትዕዛዝ ለመፈጸም መግባት አለብዎት።' : 'You must be logged in to place an order.');
            setIsPlacingOrder(false);
            router.push('/login?redirectedFrom=/cart');
            return;
        }

        const orderData = {
            items: items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
            })),
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            const resultData = await response.json();

            if (!response.ok) {
                throw new Error(resultData.message || `Order placement failed! Status: ${response.status}`);
            }

            // Success!
            alert(locale === 'am' ? 'ትዕዛዝዎ በተሳካ ሁኔታ ተፈጽሟል!' : 'Order placed successfully!');
            clearCart(); // Clear cart state/localStorage
            router.push('/order-confirmation/' + resultData.id); // Redirect to confirmation

        } catch (error: any) {
            console.error("Failed to place order:", error);
            setOrderError(error.message || 'An unexpected error occurred.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const itemCount = getItemCount();
    const cartTotal = getCartTotal();

    // Combined loading state for initial cart load or auth check
    const isLoadingInitial = isCartLoading || isAuthLoading;

    // === Render Logic ===

    // 1. Initial Loading State
    if (isLoadingInitial) {
         return (
             <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                  <ArrowPathIcon className="h-8 w-8 animate-spin mb-4" />
                  {locale === 'am' ? 'ጋሪ በመጫን ላይ...' : 'Loading Cart...'}
             </div>
         );
    }

    // 2. Empty Cart State
    if (!items || items.length === 0) {
         return (
             <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center flex flex-col items-center min-h-[calc(100vh-250px)] justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-3">
                    {locale === 'am' ? 'የገበያ ጋሪዎ ባዶ ነው' : 'Your Shopping Cart is Empty'}
                </h1>
                 <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs">
                    {locale === 'am' ? 'እስካሁን ምንም ያላከሉ አይመስልም። ምርቶችን ማሰስ ይጀምሩ!' : 'Looks like you haven\'t added anything yet. Start browsing our products!'}
                 </p>
                <Link
                    href="/shop"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out"
                >
                     {locale === 'am' ? 'ወደ መሸጫ ይሂዱ' : 'Go to Shop'}
                </Link>
             </div>
         );
    }

    // 3. Cart with Items View
    return (
        <div className="bg-white dark:bg-gray-900"> {/* Add background color */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-8">
                    {locale === 'am' ? 'የገበያ ጋሪ' : 'Shopping Cart'}
                    <span className="text-lg sm:text-xl font-normal text-gray-500 dark:text-gray-400 ml-2">
                         ({itemCount} {itemCount === 1 ? (locale === 'am' ? 'ዕቃ' : 'Item') : (locale === 'am' ? 'ዕቃዎች' : 'Items')})
                    </span>
                </h1>

                <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                    {/* Cart Items List (Left Column / Main Area) */}
                    <section aria-labelledby="cart-heading" className="lg:col-span-7">
                        <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700 border-b border-t border-gray-200 dark:border-gray-700">
                            {items.map((item, itemIdx) => ( // Added itemIdx for potential use
                                <li key={item.id} className="flex py-6 sm:py-8">
                                    {/* Image */}
                                    <div className="flex-shrink-0">
                                        <Image
                                            src={item.imageUrl || '/placeholder-image.png'} // Fallback image
                                            alt={item.name}
                                            width={160} // Increased size slightly
                                            height={160}
                                            className="h-24 w-24 rounded-md object-contain object-center sm:h-32 sm:w-32 border border-gray-200 dark:border-gray-600 p-1 bg-white" // Contain within bg
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                            {/* Product Name & Price */}
                                            <div>
                                                 <div className="flex justify-between">
                                                     <h3 className="text-sm sm:text-base font-medium text-gray-800 dark:text-white">
                                                         <Link href={`/product/${item.id}`} className="hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 rounded">
                                                            {item.name}
                                                         </Link>
                                                     </h3>
                                                 </div>
                                                 <p className="mt-1 text-sm sm:text-base font-medium text-gray-900 dark:text-gray-200">
                                                    {locale === 'am' ? `${item.price.toFixed(2)} ብር` : `$${item.price.toFixed(2)}`}
                                                 </p>
                                             </div>

                                            {/* Quantity Input & Remove Button */}
                                             <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex sm:flex-col sm:items-end sm:justify-start"> {/* Align quantity/remove right on sm+ */}
                                                 <label htmlFor={`quantity-${item.id}`} className="sr-only"> Quantity, {item.name} </label>
                                                 <input
                                                      id={`quantity-${item.id}`}
                                                      name={`quantity-${item.id}`}
                                                      type="number"
                                                      min="1"
                                                      aria-label={`Quantity for ${item.name}`}
                                                      value={item.quantity}
                                                     onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                      className="w-20 rounded-md border border-gray-300 dark:border-gray-600 py-1.5 px-3 text-left text-base font-medium leading-5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                                                 />
                                                  <button
                                                         type="button"
                                                         onClick={() => removeItem(item.id)}
                                                         className="mt-2 text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500 rounded px-1 py-0.5" // Adjusted styling
                                                         aria-label={`Remove ${item.name}`}
                                                         title={`Remove ${item.name}`}
                                                     >
                                                         <TrashIcon className="h-4 w-4 mr-1" aria-hidden="true" /> {/* Smaller icon */}
                                                         {locale === 'am' ? 'አስወግድ' : 'Remove'}
                                                     </button>
                                             </div>
                                         </div>
                                     </div>
                                 </li>
                             ))}
                         </ul>
                         {/* Clear Cart Button - below list */}
                         <div className="mt-4 text-right">
                             <button
                                 type="button"
                                 onClick={clearCart}
                                 className="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500 rounded p-1"
                                 title={locale === 'am' ? 'ሁሉንም ጋሪ አጽዳ' : 'Clear entire cart'}
                             >
                                {locale === 'am' ? 'ጋሪውን አጽዳ' : 'Clear Cart'}
                             </button>
                         </div>
                     </section>

                    {/* Order Summary (Right Column / Sidebar) */}
                     <section
                         aria-labelledby="summary-heading"
                         className="mt-16 rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 shadow-lg border border-gray-200 dark:border-gray-700"
                     >
                        <h2 id="summary-heading" className="text-xl font-semibold text-gray-900 dark:text-white">
                            {locale === 'am' ? 'የትዕዛዝ ማጠቃለያ' : 'Order Summary'}
                        </h2>

                        <dl className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600 dark:text-gray-400">{locale === 'am' ? 'ንዑስ ድምር' : 'Subtotal'}</dt>
                                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                    {locale === 'am' ? `${cartTotal.toFixed(2)} ብር` : `$${cartTotal.toFixed(2)}`}
                                 </dd>
                             </div>
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                 <dt className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                     <span>{locale === 'am' ? 'ማጓጓዣ' : 'Shipping'}</span>
                                 </dt>
                                 <dd className="text-sm font-medium text-gray-900 dark:text-white">
                                     {locale === 'am' ? 'ሲጨርሱ ይሰላል' : 'Calculated at checkout'}
                                 </dd>
                             </div>
                             <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                <dt className="text-base font-medium text-gray-900 dark:text-white">{locale === 'am' ? 'ጠቅላላ ድምር' : 'Order Total'}</dt>
                                <dd className="text-base font-medium text-gray-900 dark:text-white">
                                     {locale === 'am' ? `${cartTotal.toFixed(2)} ብር` : `$${cartTotal.toFixed(2)}`}
                                 </dd>
                            </div>
                        </dl>

                        {/* Display Order Error Message */}
                        {orderError && (
                           <div className="mt-4 rounded-md bg-red-100 dark:bg-red-800/50 p-3 border border-red-300 dark:border-red-600">
                                <p className="text-sm font-medium text-red-800 dark:text-red-100">{orderError}</p>
                            </div>
                        )}

                        {/* Place Order Button */}
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder || itemCount === 0 || !currentUser}
                                className={`w-full flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm transition duration-150 ease-in-out ${
                                    (isPlacingOrder || itemCount === 0 || !currentUser)
                                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900'
                                }`}
                            >
                                {isPlacingOrder ? (
                                     <>
                                         <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                                         {locale === 'am' ? 'በማስኬድ ላይ...' : 'Placing Order...'}
                                     </>
                                ) : (
                                    locale === 'am' ? 'አሁን እዘዝ' : 'Place Order Now'
                                )}
                            </button>
                             {!isAuthLoading && !currentUser && itemCount > 0 && (
                                <p className="text-center text-sm text-yellow-700 dark:text-yellow-400 mt-2">
                                   <Link href="/login?redirectedFrom=/cart" className="underline hover:text-yellow-600 dark:hover:text-yellow-300">
                                        {locale === 'am' ? 'ለመቀጠል ይግቡ' : 'Log in to continue'}
                                   </Link>
                                </p>
                              )}
                         </div>

                        {/* Continue Shopping Link */}
                        <div className="mt-6 text-center text-sm">
                             <p className="text-gray-500 dark:text-gray-400">
                                {locale === 'am' ? 'ወይም ' : 'or '}
                                <Link href="/shop" className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 rounded">
                                    {locale === 'am' ? 'ግብይትዎን ይቀጥሉ' : 'Continue Shopping'}
                                     <span aria-hidden="true"> →</span>
                                 </Link>
                             </p>
                         </div>
                     </section>
                </div>
            </div>
        </div>
    );
}