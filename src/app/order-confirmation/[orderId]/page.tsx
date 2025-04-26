// src/app/order-confirmation/[orderId]/page.tsx
"use client"; // Needed to access params easily for now

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext'; // Assuming path is correct


// Basic page component, no React.use() needed here for direct access
export default function OrderConfirmationPage({ params }: any) {
    // Access orderId directly from destructured params
    const orderId = params?.orderId as string || 'Unknown'; // Use optional chaining and assertion/fallback

    const { locale } = useLanguage(); 

    return (
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-green-600 dark:text-green-400 mb-4">
                 {locale === 'am' ? 'ትዕዛዝዎ ተረጋግጧል!' : 'Order Confirmed!'}
             </h1>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
               {locale === 'am' ? 'ትዕዛዝዎን ስለፈጸሙ እናመሰግናለን።' : 'Thank you for your order.'}
            </p>
             <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {locale === 'am' ? 'የትዕዛዝ መለያ ቁጥርዎ፡ ' : 'Your Order ID is: '}
                 <span className="font-medium text-gray-800 dark:text-gray-200">{orderId}</span>
            </p>
            <div className="space-x-4">
                 <Link
                     href="/orders" // Link to where user can see their orders (create later)
                     className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                 >
                      {locale === 'am' ? 'ትዕዛዞቼን እይ' : 'View My Orders'}
                 </Link>
                 <Link
                    href="/shop"
                     className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                >
                    {locale === 'am' ? 'ግብይትዎን ይቀጥሉ' : 'Continue Shopping'}
                </Link>
            </div>
        </div>
    );
}