// src/app/register/page.tsx
"use client"; // This page needs interactivity (state, form handling)

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Used for redirection after success
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
    const { t, locale } = useLanguage();
    const router = useRouter(); // Hook for programmatic navigation

    // === Form State ===
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    // ==================

    // === UI State ===
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    // ================

    // === Form Submission Handler ===
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default browser form submission
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    phoneNumber,
                    name: name || undefined, // Send name only if it's not empty
                }),
            });

            const data = await response.json(); // Attempt to parse JSON regardless of status

            if (!response.ok) {
                // Handle errors from the API (4xx, 5xx)
                // Use the message from the API response if available
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            // --- Registration Successful ---
            setSuccessMessage(locale === 'am' ? 'ምዝገባ ተሳክቷል! ወደ መግቢያ ገጽ ይመራሉ...' : 'Registration successful! Redirecting to login...');
            // Clear form (optional)
            setName('');
            setEmail('');
            setPhoneNumber('');
            setPassword('');

            // Redirect to login page after a short delay
            setTimeout(() => {
                router.push('/login'); // Redirect using Next.js router
            }, 2000); // 2-second delay

        } catch (err) {
            console.error("Registration form error:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false); // Stop loading indicator
        }
    };
    // ==============================

    // === Render Logic ===
    return (
        <div className="flex min-h-[calc(100vh-150px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8"> {/* Adjust min-height based on header/footer */}
            <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {locale === 'am' ? 'አዲስ መለያ ይፍጠሩ' : 'Create your account'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {locale === 'am' ? 'ወይም ' : 'Or '}
                        <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300">
                           {locale === 'am' ? 'ወደ መለያዎ ይግቡ' : 'sign in to your account'}
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Display Error/Success Messages */}
                    {error && (
                        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-700">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}
                    {successMessage && (    
                        <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-700">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">{successMessage}</p>
                        </div>
                    )}

                    <input type="hidden" name="remember" defaultValue="true" />
                    <div className="-space-y-px rounded-md shadow-sm">
                        {/* Name Input (Optional) */}
                         <div>
                            <label htmlFor="name" className="sr-only">
                                {locale === 'am' ? 'ስም (አማራጭ)' : 'Name (Optional)'}
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="relative block my-5 w-full appearance-none rounded-t-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:z-10 focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                                placeholder={locale === 'am' ? 'ስም (አማራጭ)' : 'Name (Optional)'}
                            />
                        </div>
                        {/* Email Input */}
                         <div>
                            <label htmlFor="email-address" className="sr-only">
                                {locale === 'am' ? 'ኢሜል አድራሻ' : 'Email address'}
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                 // Adjust border radius based on position (middle input)
                                className="relative  my-5 block w-full appearance-none border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:z-10 focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                                placeholder={locale === 'am' ? 'ኢሜል አድራሻ' : 'Email address'}
                            />
                        </div>
                        {/* Phone Number Input */}
                         <div>
                            <label htmlFor="phone-number" className="sr-only">
                                 {locale === 'am' ? 'ስልክ ቁጥር (ለማድረስ ያስፈልጋል)' : 'Phone Number (Required for delivery)'}
                            </label>
                            <input
                                id="phone-number"
                                name="phone-number"
                                type="tel" // Use type="tel" for phone numbers
                                autoComplete="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                 // Adjust border radius based on position (middle input)
                                className="relative my-5 block w-full appearance-none border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:z-10 focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                                placeholder={locale === 'am' ? 'ስልክ ቁጥር (ለማድረስ ያስፈልጋል)' : 'Phone Number (Required for delivery)'}
                            />
                        </div>
                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="sr-only">
                                {locale === 'am' ? 'የይለፍ ቃል' : 'Password'}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password" // Use "new-password" for registration forms
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full appearance-none rounded-b-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:z-10 focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                                placeholder={locale === 'am' ? 'የይለፍ ቃል' : 'Password'}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !!successMessage} // Disable if loading or successful
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                 <span className="animate-spin mr-2">⏳</span> // Simple loading indicator
                            ) : null}
                            {isLoading
                                ? (locale === 'am' ? 'በመመዝገብ ላይ...' : 'Registering...')
                                : (locale === 'am' ? 'ይመዝገቡ' : 'Register')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}