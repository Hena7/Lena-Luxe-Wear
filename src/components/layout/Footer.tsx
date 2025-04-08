// src/components/layout/Footer.tsx
"use client"; // Required for using the hook

import { useLanguage } from '@/contexts/LanguageContext'; // Import language hook

export default function Footer() {
  const { t } = useLanguage(); // Get translation function
  const currentYear = new Date().getFullYear();

  return (
    // Added dark mode styling
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 transition-colors duration-300">
      <div className="container mx-auto px-6 py-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>
          © {currentYear} {t('logo')} - {t('footerRights')}
        </p>
        <div className="mt-2 space-x-4">
             <a href="#" className="hover:text-gray-800 dark:hover:text-white">{t('footerPrivacy')}</a>
             <a href="#" className="hover:text-gray-800 dark:hover:text-white">{t('footerTerms')}</a>
         </div>
      </div>
    </footer>
  );
}