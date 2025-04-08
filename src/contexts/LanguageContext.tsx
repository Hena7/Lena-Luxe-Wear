// src/contexts/LanguageContext.tsx
"use client"; // Mark this as a Client Component

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define available locales
export type Locale = 'en' | 'am';

// Define the structure of your translations
// In a real app, load this from JSON files
const translations = {
  en: {
    // Header
    logo: "GarmentStore",
    navHome: "Home",
    navShop: "Shop",
    navAbout: "About",
    // Homepage Hero
    heroTitle: "New Arrivals",
    heroSubtitle: "Discover the latest trends in fashion.",
    heroButton: "Shop Now",
    // Homepage Sections
    featuredProducts: "Featured Products",
    shopByCategory: "Shop by Category",
    // Categories
    catMen: "Men",
    catWomen: "Women",
    catKids: "Kids",
    catAccessories: "Accessories",
    // Footer
    footerRights: "All rights reserved",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    // Toggles
    switchToAmharic: "am",
    switchToEnglish: "en",
    toggleDarkMode: "Toggle Dark Mode",
    toggleLightMode: "Toggle Light Mode",
  },
  am: {
    // Header
    logo: "ልብስ መሸጫ",
    navHome: "መነሻ",
    navShop: "መሸጫ",
    navAbout: "ስለ እኛ",
    // Homepage Hero
    heroTitle: "አዲስ የገቡ",
    heroSubtitle: "አዳዲስ የፋሽን አዝማሚያዎችን ያግኙ።",
    heroButton: "አሁን ይግዙ",
    // Homepage Sections
    featuredProducts: "ተመራጭ እቃዎች",
    shopByCategory: "በምድብ ይግዙ",
    // Categories
    catMen: "ወንዶች",
    catWomen: "ሴቶች",
    catKids: "ልጆች",
    catAccessories: "መለዋወጫዎች",
    // Footer
    footerRights: "መብቱ በህግ የተጠበቀ ነው።",
    footerPrivacy: "የግላዊነት መመሪያ",
    footerTerms: "የአገልግሎት ውል",
    // Toggles
    switchToAmharic: "am",
    switchToEnglish: "en",
    toggleDarkMode: "ወደ ጨለማ ቀይር",
    toggleLightMode: "ወደ ብርሃን ቀይር",
  }
};

// Type for the translation function/object
type TranslationKey = keyof typeof translations.en; // Or .am, keys should match
type Translations = typeof translations.en; // Type for one language's strings

interface LanguageContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string; // Function to get translation
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en'); // Default to English

  // Function to get the translation for the current locale
  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations.en[key] || key; // Fallback logic
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the LanguageContext
export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};