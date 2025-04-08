// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers"; // Import the wrapper

const inter = Inter({ subsets: ["latin"] });

// Metadata can remain static or be dynamically generated later based on locale
export const metadata: Metadata = {
  title: "GarmentStore - Your Fashion Destination", // Keep base title simpler for now
  description: "Find the latest trends in clothing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The 'lang' attribute might be dynamically set later if needed for SEO/Accessibility
    <html lang="en" suppressHydrationWarning> {/* suppressHydrationWarning added for theme switching */}
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col min-h-screen transition-colors duration-300`}> {/* Added base light/dark styles and transition */}
        <Providers> {/* Wrap everything inside Providers */}
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}