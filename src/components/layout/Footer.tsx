"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 transition-colors duration-300">
      <div className="container mx-auto px-6 py-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>
          © {currentYear} {t("logo")} - {t("footerRights")}
        </p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-gray-800 dark:hover:text-white">
            {t("footerPrivacy")}
          </a>
          <a href="#" className="hover:text-gray-800 dark:hover:text-white">
            {t("footerTerms")}
          </a>
        </div>
      </div>
    </footer>
  );
}
