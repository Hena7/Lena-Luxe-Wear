// src/components/layout/Header.tsx
"use client"; // Needs to be client component to use hooks and state

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
// If you want to close the menu on route changes, uncomment the next line
// import { usePathname } from 'next/navigation';

// --- SVG Icons ---

const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    aria-hidden="true" // Hide decorative icon from screen readers
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    aria-hidden="true" // Hide decorative icon from screen readers
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);

const CartIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
);

const UserIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
);

// --- Header Component ---

export default function Header() {
  const { locale, setLocale, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Optional: Close mobile menu on route change
  // Uncomment the import for usePathname above if using this
  // const pathname = usePathname();
  // useEffect(() => {
  //   setIsMobileMenuOpen(false);
  // }, [pathname]);

  // Helper function to ensure menu closes when a link is clicked
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handler for language change button
  const handleLanguageChange = () => {
    setLocale(locale === 'en' ? 'am' : 'en');
    // Optionally close menu if language changed from within mobile menu
    // closeMobileMenu();
  };

  // Handler for theme toggle button
  const handleThemeToggle = () => {
      toggleTheme();
      // Optionally close menu if theme changed from within mobile menu
      // closeMobileMenu();
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      {/* Main Navigation Container */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">

        {/* Logo Section (Left) */}
        <div className="flex-shrink-0"> {/* Prevent logo from shrinking */}
            <Link href="/" onClick={closeMobileMenu} className="flex items-center space-x-2 text-xl font-bold text-gray-800 dark:text-white">
               {/* Make sure lena.png is in the /public folder */}
               <img className='h-10 w-auto' src="/lena.png" alt="Lena Garments Logo"/>
               {/* If using text logo instead: */}
               {/* <span>{t('logo')}</span> */}
            </Link>
        </div>

        {/* Centered Desktop Navigation Links (Middle) */}
        <div className="hidden md:flex flex-grow justify-center items-center space-x-6 lg:space-x-8">
          <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
            {t('navHome')}
          </Link>
          <Link href="/shop" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
            {t('navShop')}
          </Link>
          <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
            {t('navAbout')}
          </Link>
        </div>

        {/* Right Controls Section */}
        <div className="flex items-center space-x-3">
            {/* Desktop Controls (Hidden on Mobile) */}
            <div className="hidden md:flex items-center space-x-3">
               {/* Language Toggle */}
               <button
                  onClick={handleLanguageChange}
                  className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label={locale === 'en' ? 'Switch to Amharic' : 'Switch to English'}
                >
                  {locale === 'en' ? t('switchToAmharic') : t('switchToEnglish')}
               </button>
               {/* Theme Toggle */}
                <button
                    onClick={handleThemeToggle}
                    className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    aria-label={theme === 'light' ? t('toggleDarkMode') : t('toggleLightMode')}
                >
                    {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                </button>
               {/* Cart Icon Link */}
               <Link href="/cart" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 p-1.5" aria-label="Shopping Cart">
                    <CartIcon />
               </Link>
               {/* User/Login Icon Link */}
               <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 p-1.5" aria-label="Login or Account">
                 <UserIcon />
               </Link>
            </div>

            {/* Mobile Menu Button (Visible on Mobile Only) */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none p-1.5" // Added padding for easier clicking
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen} // Accessibility: Indicate if menu is open
                aria-controls="mobile-menu" // Accessibility: Links this button to the menu
              >
                {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
              </button>
            </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown Panel */}
      {/* Renders conditionally based on state, hidden on desktop */}
      {isMobileMenuOpen && (
        <div
            id="mobile-menu" // For aria-controls
            className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg rounded-b-lg p-4 space-y-2 z-40 border-t border-gray-200 dark:border-gray-700" // Added border top
        >
          {/* Mobile Navigation Links */}
          <Link href="/" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            {t('navHome')}
          </Link>
          <Link href="/shop" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            {t('navShop')}
          </Link>
          <Link href="/about" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            {t('navAbout')}
          </Link>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4"></div>

          {/* Mobile Controls */}
          <div className="flex items-center justify-center space-x-4 py-2">
             {/* Language Toggle */}
             <button
                onClick={() => { handleLanguageChange(); closeMobileMenu(); }} // Close menu after action
                className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label={locale === 'en' ? 'Switch to Amharic' : 'Switch to English'}
             >
                {locale === 'en' ? t('switchToAmharic') : t('switchToEnglish')}
             </button>
             {/* Theme Toggle */}
             <button
                onClick={() => { handleThemeToggle(); closeMobileMenu(); }} // Close menu after action
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label={theme === 'light' ? t('toggleDarkMode') : t('toggleLightMode')}
             >
                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
             </button>
             {/* Cart Icon Link */}
             <Link href="/cart" onClick={closeMobileMenu} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 p-1.5" aria-label="Shopping Cart">
                 <CartIcon />
             </Link>
             {/* User/Login Icon Link */}
             <Link href="/login" onClick={closeMobileMenu} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 p-1.5" aria-label="Login or Account">
               <UserIcon />
             </Link>
          </div>
        </div>
      )}
    </header>
  );
}