"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
};

type Props = {
  productId: string;
  reviews: Review[];
  onReviewAdded: () => void;
};

export default function ProductReviews({
  productId,
  reviews,
  onReviewAdded,
}: Props) {
  const { currentUser } = useAuth();
  const { locale } = useLanguage();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError(
        locale === "am"
          ? "እባክዎን ግምገማ ለመስጠት ይግቡ"
          : "Please login to leave a review",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment || null }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit review");
      }

      setComment("");
      setRating(5);
      onReviewAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          {locale === "am" ? "ግምገማዎች" : "Reviews"}
        </h3>

        {reviews.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-6 w-6 ${
                    star <= averageRating
                      ? "text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {averageRating.toFixed(1)} ({reviews.length}{" "}
              {locale === "am" ? "ግምገማዎች" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {currentUser && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg"
        >
          <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            {locale === "am" ? "ግምገማዎን ያክሉ" : "Add Your Review"}
          </h4>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {locale === "am" ? "ደረጃ" : "Rating"}
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  {star <= rating ? (
                    <StarIcon className="h-8 w-8 text-yellow-400 hover:scale-110 transition-transform" />
                  ) : (
                    <StarOutline className="h-8 w-8 text-gray-300 dark:text-gray-600 hover:scale-110 transition-transform" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="comment"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            >
              {locale === "am" ? "አስተያየት (አማራጭ)" : "Comment (Optional)"}
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={
                locale === "am"
                  ? "ስለዚህ ምርት ሀሳብዎን ያክሉ..."
                  : "Share your thoughts about this product..."
              }
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? locale === "am"
                ? "በመላክ ላይ..."
                : "Submitting..."
              : locale === "am"
                ? "ግምገማ ያስገቡ"
                : "Submit Review"}
          </button>
        </form>
      )}

      {!currentUser && (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {locale === "am"
              ? "ግምገማ ለመስጠት እባክዎን ይግቡ"
              : "Please login to leave a review"}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {locale === "am" ? "ገና ምንም ግምገማዎች የሉም" : "No reviews yet"}
          </p>
        )}

        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {review.user.name || review.user.email}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            {review.comment && (
              <p className="text-gray-600 dark:text-gray-300">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
