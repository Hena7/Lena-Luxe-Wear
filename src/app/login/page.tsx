// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { t, locale } = useLanguage();
  const router = useRouter();

  // === Form State ===
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // ==================

  // === UI State ===
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refetchUser } = useAuth();
  // ================

  // === Form Submission Handler ===
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      // --- Login Successful ---
      console.log("Login successful:", data.user); // Log user data for now

      // Refetch user to get updated session data including role
      await refetchUser();

      // Wait a tiny bit for the context to update (alternative: we could check data.user.role directly if API returned it)
      // For now, we'll check by making a small delay or by fetching /api/auth/me
      // Let's fetch the user role to determine redirect
      const meResponse = await fetch("/api/auth/me");
      if (meResponse.ok) {
        const userData = await meResponse.json();
        // Redirect based on user role
        if (userData.user?.role === "ADMIN") {
          router.push("/admin"); // Redirect admins to admin dashboard
        } else {
          router.push("/"); // Redirect customers to homepage
        }
      } else {
        // Fallback to homepage if we can't determine role
        router.push("/");
      }
    } catch (err) {
      console.error("Login form error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  // ==============================

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {locale === "am" ? "ወደ መለያዎ ይግቡ" : "Sign in to your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {locale === "am" ? "ወይም " : "Or "}
            <Link
              href="/register"
              className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
            >
              {locale === "am" ? "አዲስ መለያ ይፍጠሩ" : "create a new account"}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-700">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          )}

          <input type="hidden" name="remember" defaultValue="true" />
          <div className="-space-y-px rounded-md shadow-sm">
            {/* Email Input */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                {locale === "am" ? "ኢሜል አድራሻ" : "Email address"}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full appearance-none rounded-t-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:z-10 focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                placeholder={locale === "am" ? "ኢሜል አድራሻ" : "Email address"}
              />
            </div>
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                {locale === "am" ? "የይለፍ ቃል" : "Password"}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password" // Use "current-password" for login forms
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative mt-5 block w-full appearance-none rounded-b-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:z-10 focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                placeholder={locale === "am" ? "የይለፍ ቃል" : "Password"}
              />
            </div>
          </div>

          {/* Optional: Add "Forgot password?" link here */}
          {/* Remember me / Forgot password (Optional placeholders) */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="#"
                className="font-medium m-3 text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
              >
                {locale === "am" ? "የይለፍ ቃልዎን ረሱ?" : "Forgot your password?"}
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <span className="animate-spin mr-2">⏳</span> : null}
              {isLoading
                ? locale === "am"
                  ? "በመግባት ላይ..."
                  : "Signing in..."
                : locale === "am"
                  ? "ግባ"
                  : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
