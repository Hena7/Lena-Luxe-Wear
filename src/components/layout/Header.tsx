// src/components/layout/Header.tsx
"use client"; // Required for hooks and event handlers

import Link from 'next/link';
import Image from 'next/image'; // Import Image for logo
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For navigation like logout redirect

// Context Hooks
import { useLanguage } from '@/contexts/LanguageContext'; // Adjust path if needed
import { useTheme } from '@/contexts/ThemeContext';     // Adjust path if needed
import { useAuth } from '@/contexts/AuthContext';       // Adjust path if needed
import { useCart } from '@/contexts/CartContext';       // Adjust path if needed

// Heroicons (ensure @heroicons/react is installed)
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; // Basic icons
import { UserIcon as UserIconOutline, ArrowRightOnRectangleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'; // Outline for logged out/cart

// Uncomment if you implement close on route change feature using usePathname
// import { usePathname } from 'next/navigation';

// --- Header Component ---

export default function Header() {
  // --- Hooks ---
  const { locale, setLocale, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  // Destructure auth state, renaming isLoading to avoid potential naming conflicts
  const { currentUser, isLoading: isAuthLoading, refetchUser } = useAuth();
  // Destructure cart state and functions
  const { getItemCount, isCartLoading } = useCart ? useCart() : { getItemCount: () => 0, isCartLoading: true }; // Defensive check for useCart during initial renders/SSR hydration
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter(); // For navigation

  // --- Get Derived State ---
  const cartItemCount = getItemCount ? getItemCount() : 0; // Get current cart count

  // --- Effects ---
  // Optional: Close mobile menu on route change
  // const pathname = usePathname();
  // useEffect(() => {
  //   setIsMobileMenuOpen(false);
  // }, [pathname]);

  // --- Handlers ---
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLanguageChange = () => {
    setLocale(locale === 'en' ? 'am' : 'en');
    closeMobileMenu(); // Close menu if action originated from mobile
  };

  const handleThemeToggle = () => {
    toggleTheme();
    closeMobileMenu(); // Close menu if action originated from mobile
  };

  const handleLogout = async () => {
    console.log("Handling logout click..."); // <<< Do you see this in browser console?
    try {
        const response = await fetch('/api/auth/logout', {
             method: 'POST',
        });
        console.log("Logout API Response Status:", response.status); // <<< Add this log

        if (!response.ok) {
             const data = await response.json().catch(()=>({ message: `HTTP error! Status: ${response.status}` })); // More robust error parsing
             console.error("Logout API Error Response:", data); // <<< Add this log
             throw new Error(data.message || "Logout failed");
        }

        const resultData = await response.json(); // Parse success response (optional)
        console.log("Logout API success data:", resultData); // Log success

        await refetchUser();
        router.push('/');
    } catch (error) {
        console.error("Failed to logout (in catch block):", error); // <<< See detailed error here
        alert(`Logout failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
         closeMobileMenu();
    }
};

  // --- Render ---
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300 border-b border-gray-200 dark:border-gray-700">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center min-h-[64px]"> {/* Ensure minimum height */}

        {/* 1. Logo (Left) */}
        <div className="flex-shrink-0">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center space-x-2 text-xl font-bold text-gray-800 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 rounded-sm"
            title={t('navHome')}
          >
            <Image
              className='h-10 w-auto object-contain' // Adjust height as needed
              src="/lena.png" // Assumes lena.png is in /public folder
              alt="Lena Garments Logo"
              width={144} // Provide intrinsic width (aspect ratio preserved by object-contain/height)
              height={40} // Provide intrinsic height
              priority // Prioritize loading the logo
            />
          </Link>
        </div>

        {/* 2. Desktop Navigation Links (Center) */}
        <div className="hidden md:flex flex-grow justify-center items-center space-x-4 lg:space-x-6">
          <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
            {t('navHome')}
          </Link>
          <Link href="/shop" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
            {t('navShop')}
          </Link>
          <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
            {t('navAbout')}
          </Link>
        </div>

        {/* 3. Right Controls Area */}
        <div className="flex items-center space-x-2 sm:space-x-3">

            {/* 3a. Desktop Controls (Hidden < md) */}
            <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
               {/* Language Toggle */}
               <button
                  onClick={handleLanguageChange}
                  className="text-xs sm:text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-150"
                  aria-label={locale === 'en' ? 'Switch to Amharic' : 'Switch to English'}
                  title={locale === 'en' ? 'Switch to Amharic' : 'Switch to English'}
                >
                  {locale === 'en' ? t('switchToAmharic') : t('switchToEnglish')}
               </button>
               {/* Theme Toggle */}
                <button
                    onClick={handleThemeToggle}
                    className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-150"
                    aria-label={theme === 'light' ? t('toggleDarkMode') : t('toggleLightMode')}
                    title={theme === 'light' ? t('toggleDarkMode') : t('toggleLightMode')}
                >
                    {theme === 'light' ? <MoonIcon className="h-5 w-5" aria-hidden="true" /> : <SunIcon className="h-5 w-5" aria-hidden="true" />}
                </button>
               {/* Cart Icon Link with Count */}
                <Link href="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900" aria-label="Shopping Cart" title="Shopping Cart">
                    <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                     {!isCartLoading && cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white pointer-events-none">
                           {cartItemCount > 9 ? '9+' : cartItemCount}
                        </span>
                    )}
                     {isCartLoading && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-gray-400 animate-pulse pointer-events-none"></span>
                      )}
                </Link>

               {/* Desktop Auth Controls Conditional Rendering */}
                {isAuthLoading ? (
                     <div className="h-6 w-6 animate-pulse bg-gray-300 dark:bg-gray-600 rounded-full" title="Loading user status"></div>
                 ) : currentUser ? (
                  <> {/* Logged In State */}
                    <Link href="/orders" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900" aria-label="Account Profile" title="Account Profile">
                      <UserIconOutline className="w-6 h-6" aria-hidden="true" />
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                        aria-label="Logout"
                        title="Logout"
                    >
                         <ArrowRightOnRectangleIcon className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <> {/* Logged Out State */}
                  <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900" aria-label="Login or Register" title="Login or Register">
                    <UserIconOutline className="w-6 h-6" aria-hidden="true" />
                  </Link>
                  </>
                )}
            </div> {/* End Desktop Controls */}

            {/* 3b. Mobile Menu Button (Visible < md) */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <XMarkIcon className="block h-6 w-6" aria-hidden="true" /> : <Bars3Icon className="block h-6 w-6" aria-hidden="true" />}
              </button>
            </div> {/* End Mobile Menu Button Wrapper */}

        </div> {/* End Right Controls Area */}
      </nav>

      {/* --- Mobile Menu Dropdown Panel --- */}
      {/* Implement transition later if desired */}
      {isMobileMenuOpen && (
        <div
            id="mobile-menu"
            className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg rounded-b-lg p-4 pt-2 space-y-1 z-40 border-t border-gray-200 dark:border-gray-700"
            // Add transition classes here if animating
        >
          {/* Mobile Navigation Links */}
          <Link href="/" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"> {t('navHome')} </Link>
          <Link href="/shop" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"> {t('navShop')} </Link>
          <Link href="/about" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"> {t('navAbout')} </Link>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2"></div>

          {/* Mobile Controls (Simplified Layout) */}
          <div className="flex items-center justify-between space-x-3 py-2">
            {/* Language & Theme */}
            <div className="flex items-center space-x-2">
               <button onClick={handleLanguageChange} className="text-xs px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150" aria-label="Switch Language"> {locale === 'en' ? t('switchToAmharic') : t('switchToEnglish')} </button>
               <button onClick={handleThemeToggle} className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150" aria-label="Toggle Theme"> {theme === 'light' ? <MoonIcon className="h-5 w-5"/> : <SunIcon className="h-5 w-5" />} </button>
            </div>

             {/* Cart & Auth/Logout */}
             <div className="flex items-center space-x-3">
                 {/* Mobile Cart Count */}
                 <Link href="/cart" onClick={closeMobileMenu} className="relative text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 p-1.5" aria-label="Shopping Cart">
                     <ShoppingCartIcon className="h-6 w-6" aria-hidden="true"/>
                      {!isCartLoading && cartItemCount > 0 && (
                         <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white pointer-events-none">{cartItemCount > 9 ? '9+' : cartItemCount}</span>
                     )}
                     {isCartLoading && (<span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-gray-400 animate-pulse pointer-events-none"></span>)}
                 </Link>

                 {/* Mobile Auth Controls */}
                 {isAuthLoading ? (
                   <div className="h-6 w-6 animate-pulse bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                ) : currentUser ? (
                   // Logged In: Show Logout
                   <button onClick={handleLogout} className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150 p-1.5" aria-label="Logout"><ArrowRightOnRectangleIcon className="w-6 h-6" /></button>
                ) : (
                   // Logged Out: Show Login/Register
                   <Link href="/login" onClick={closeMobileMenu} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 p-1.5" aria-label="Login or Register"><UserIconOutline className="w-6 h-6" /></Link>
                )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}