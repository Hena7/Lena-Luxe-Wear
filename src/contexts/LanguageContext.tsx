"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

export type Locale = "en" | "am";

const translations = {
  en: {
    logo: "GarmentStore",
    navHome: "Home",
    navShop: "Shop",
    navAbout: "About",
    heroTitle: "New Arrivals",
    heroSubtitle: "Discover the latest trends in fashion.",
    heroButton: "Shop Now",
    featuredProducts: "Featured Products",
    shopByCategory: "Shop by Category",
    catMen: "Men",
    catWomen: "Women",
    catKids: "Kids",
    catAccessories: "Accessories",
    footerRights: "All rights reserved",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    switchToAmharic: "am",
    switchToEnglish: "en",
    toggleDarkMode: "Toggle Dark Mode",
    toggleLightMode: "Toggle Light Mode",
  },
  am: {
    logo: "ልብስ መሸጫ",
    navHome: "መነሻ",
    navShop: "መሸጫ",
    navAbout: "ስለ እኛ",
    heroTitle: "አዲስ የገቡ",
    heroSubtitle: "አዳዲስ የፋሽን አዝማሚያዎችን ያግኙ።",
    heroButton: "አሁን ይግዙ",
    featuredProducts: "ተመራጭ እቃዎች",
    shopByCategory: "በምድብ ይግዙ",
    catMen: "ወንዶች",
    catWomen: "ሴቶች",
    catKids: "ልጆች",
    catAccessories: "መለዋወጫዎች",
    footerRights: "መብቱ በህግ የተጠበቀ ነው።",
    footerPrivacy: "የግላዊነት መመሪያ",
    footerTerms: "የአገልግሎት ውል",
    switchToAmharic: "am",
    switchToEnglish: "en",
    toggleDarkMode: "ወደ ጨለማ ቀይር",
    toggleLightMode: "ወደ ብርሃን ቀይር",
  },
};

type TranslationKey = keyof typeof translations.en;
type Translations = typeof translations.en;

interface LanguageContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined,
);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [locale, setLocale] = useState<Locale>("en");

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
