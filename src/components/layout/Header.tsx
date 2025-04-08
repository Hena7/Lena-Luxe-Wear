// src/components/layout/Header.tsx
"use client"; // Needs to be client component to use hooks

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext'; // Import language hook
import { useTheme } from '@/contexts/ThemeContext'; // Import theme hook
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'; // Example icons (install @heroicons/react)
import { useEffect, useState } from 'react';

// Hamburger Icon SVG
const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

// Close Icon SVG
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);

export default function Header() {
  const { locale, setLocale, t } = useLanguage(); // Get language state and functions
  const { theme, toggleTheme } = useTheme(); // Get theme state and function
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []); // Dependency on location object

  // Helper function to close menu, used by links
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLanguageChange = () => {
    setLocale(locale === 'en' ? 'am' : 'en');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300"> {/* Dark mode styling */}
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
        <img className='max-w-36' src="./lena.png" alt="logo"/>{/* Logo */}
          {/* {t('logo')} Use translation function */}
        </Link>
        {/* Mobile Menu Button (Visible below md breakpoint) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
        {/* Navigation Links & Controls Container */}
        {/* Hidden below md, Flex row on md and up */}
        {/* Absolute positioned dropdown on mobile when open */}
        <div
          className={`
             ${
               isMobileMenuOpen ? "flex" : "hidden"
             } md:flex flex-col md:flex-row md:items-center md:space-x-4
             absolute md:relative top-full left-0 w-full md:w-auto
             bg-white dark:bg-gray-800 md:bg-transparent dark:md:bg-transparent
             shadow-lg md:shadow-none rounded-b-lg md:rounded-none
             p-4 md:p-0 mt-1 md:mt-0 space-y-3 md:space-y-0
             items-stretch md:items-center z-10 md:z-auto
           `}
        >
        {/* Navigation Links */}
        <div className=" text-center space-x-4"> {/* Hide on small screens */}
          <Link href="/" onClick={closeMobileMenu} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
            {t('navHome')}
          </Link>
          <Link href="/shop" onClick={closeMobileMenu}  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
            {t('navShop')}
          </Link>
          <Link href="/about" onClick={closeMobileMenu}  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
            {t('navAbout')}
          </Link>
        </div>

        {/* Controls: Language, Theme, Icons */}
        <div className="flex justify-center  items-center space-x-3">
           {/* Language Toggle */}
           <button
              onClick={handleLanguageChange}
              className="text-sm px-2 py-1 border rounded-3xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              aria-label={locale === 'en' ? 'Switch to Amharic' : 'Switch to English'}
            >
              {locale === 'en' ? t('switchToAmharic') : t('switchToEnglish')}
           </button>

           {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                aria-label={theme === 'light' ? t('toggleDarkMode') : t('toggleLightMode')}
            >
                {theme === 'light' ? (
                    <MoonIcon className="h-5 w-5" />
                ) : (
                    <SunIcon className="h-5 w-5" />
                )}
            </button>

           {/* Placeholder for Cart Icon */}
           <span className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white cursor-pointer">🛒</span>
           {/* Placeholder for User/Login Icon */}
           <span className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white cursor-pointer">👤</span>

           {/* Consider a Mobile Menu Button Here for smaller screens */}
        </div>
        </div>
      </nav>
    </header>
  );
}