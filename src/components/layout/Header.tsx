"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import {
  UserIcon as UserIconOutline,
  ArrowRightOnRectangleIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

export default function Header() {
  const { locale, setLocale, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, isLoading: isAuthLoading, refetchUser } = useAuth();
  const { getItemCount, isCartLoading } = useCart
    ? useCart()
    : { getItemCount: () => 0, isCartLoading: true };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const cartItemCount = getItemCount ? getItemCount() : 0;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLanguageChange = () => {
    setLocale(locale === "en" ? "am" : "en");
    closeMobileMenu();
  };

  const handleThemeToggle = () => {
    toggleTheme();
    closeMobileMenu();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(data.message || "Logout failed");
      }

      await response.json();
      await refetchUser();
      router.push("/");
    } catch (error) {
      alert(
        `Logout failed: ${error instanceof Error ? error.message : "Please try again."}`,
      );
    } finally {
      closeMobileMenu();
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300 border-b border-gray-200 dark:border-gray-700">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center min-h-[64px]">
        <div className="flex-shrink-0">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center space-x-2 text-xl font-bold text-gray-800 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 rounded-sm"
            title={t("navHome")}
          >
            <Image
              className="h-10 w-auto object-contain"
              src="/lena.png"
              alt="Lena Garments Logo"
              width={144}
              height={40}
              priority
            />
          </Link>
        </div>

        <div className="hidden md:flex flex-grow justify-center items-center space-x-4 lg:space-x-6">
          <Link
            href="/"
            className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            {t("navHome")}
          </Link>
          <Link
            href="/shop"
            className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            {t("navShop")}
          </Link>
          <Link
            href="/about"
            className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            {t("navAbout")}
          </Link>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleLanguageChange}
              className="text-xs sm:text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-150"
              aria-label={
                locale === "en" ? "Switch to Amharic" : "Switch to English"
              }
              title={
                locale === "en" ? "Switch to Amharic" : "Switch to English"
              }
            >
              {locale === "en" ? t("switchToAmharic") : t("switchToEnglish")}
            </button>
            <button
              onClick={handleThemeToggle}
              className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-150"
              aria-label={
                theme === "light" ? t("toggleDarkMode") : t("toggleLightMode")
              }
              title={
                theme === "light" ? t("toggleDarkMode") : t("toggleLightMode")
              }
            >
              {theme === "light" ? (
                <MoonIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <SunIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <Link
              href="/cart"
              className="relative text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
              {!isCartLoading && cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white pointer-events-none">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
              {isCartLoading && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-gray-400 animate-pulse pointer-events-none"></span>
              )}
            </Link>

            {isAuthLoading ? (
              <div
                className="h-6 w-6 animate-pulse bg-gray-300 dark:bg-gray-600 rounded-full"
                title="Loading user status"
              ></div>
            ) : currentUser ? (
              <>
                <Link
                  href="/orders"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Orders"
                  title="Orders"
                >
                  <CubeIcon className="w-6 h-6" aria-hidden="true" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Logout"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon
                    className="w-6 h-6"
                    aria-hidden="true"
                  />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Login or Register"
                  title="Login or Register"
                >
                  <UserIconOutline className="w-6 h-6" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg rounded-b-lg p-4 pt-2 space-y-1 z-40 border-t border-gray-200 dark:border-gray-700"
        >
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            {" "}
            {t("navHome")}{" "}
          </Link>
          <Link
            href="/shop"
            onClick={closeMobileMenu}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            {" "}
            {t("navShop")}{" "}
          </Link>
          <Link
            href="/about"
            onClick={closeMobileMenu}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            {" "}
            {t("navAbout")}{" "}
          </Link>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2"></div>

          <div className="flex items-center justify-between space-x-3 py-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLanguageChange}
                className="text-xs px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150"
                aria-label="Switch Language"
              >
                {" "}
                {locale === "en"
                  ? t("switchToAmharic")
                  : t("switchToEnglish")}{" "}
              </button>
              <button
                onClick={handleThemeToggle}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150"
                aria-label="Toggle Theme"
              >
                {" "}
                {theme === "light" ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}{" "}
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="relative text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 p-1.5"
                aria-label="Shopping Cart"
              >
                <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                {!isCartLoading && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white pointer-events-none">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
                {isCartLoading && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-gray-400 animate-pulse pointer-events-none"></span>
                )}
              </Link>

              {isAuthLoading ? (
                <div className="h-6 w-6 animate-pulse bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              ) : currentUser ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150 p-1.5"
                  aria-label="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-150 p-1.5"
                  aria-label="Login or Register"
                >
                  <UserIconOutline className="w-6 h-6" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
