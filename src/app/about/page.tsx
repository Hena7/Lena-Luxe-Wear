"use client";

import Image from "next/image";
import Link from "next/link";
import {
  SparklesIcon,
  GlobeAltIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export default function AboutPage() {
  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 dark:from-purple-900/40 dark:via-gray-900 dark:to-indigo-900/40 py-24 sm:py-32 px-6 text-center shadow-sm">
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Redefining{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              Elegance
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Lena Luxe Wear isn't just a brand; it's a statement. We bring you
            curated fashion that blends timeless sophistication with modern bold
            trends.
          </p>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </section>

      {/* Our Story Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 relative h-96 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            alt="Our Studio"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="order-1 md:order-2 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Our Story
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Founded with a passion for quality and an eye for detail, Lena Luxe
            Wear started as a small boutique with a big dream: to make
            high-fashion accessible to everyone.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            We believe that clothing is more than just fabric; it's an
            expression of identity. Every piece in our collection is handpicked
            to ensure it meets our rigorous standards of quality, comfort, and
            style.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-10 md:p-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Lena Luxe?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {" "}
            We are committed to providing an exceptional shopping experience
            from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <SparklesIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Premium Quality
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We source only the finest materials to ensure your garments look
              great and last longer.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <GlobeAltIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Sustainable Fashion
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We advocate for ethical manufacturing and sustainable practices in
              every step.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <HeartIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Customer First
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our support team is dedicated to ensuring you are 100% satisfied
              with your purchase.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gray-900 dark:bg-black py-20 px-6 text-center text-white shadow-xl">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Upgrade Your Wardrobe?
          </h2>
          <p className="text-gray-300 mb-10 text-lg">
            Discover our latest collection and find the perfect look for you
            today.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-white/20"
          >
            Start Shopping
          </Link>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
      </section>
    </div>
  );
}
