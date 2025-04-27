// src/components/products/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext'; // Import for price formatting later

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, imageUrl }) => {
  const { locale } = useLanguage();

  // Basic price formatting with locale
  const formattedPrice = locale === 'am' ? `${price.toFixed(2)} ብር` : `$${price.toFixed(2)}`;

  return (
    <Link href={`/product/${id}`} className="group block overflow-hidden">
      {/* 'group' allows hover effects on children based on parent hover */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800 p-3 flex flex-col h-full">

        {/* Product Image */}
        <div className="relative w-full aspect-square overflow-hidden rounded mb-3">
          {/* aspect-square makes height equal to width */}
          <Image
            src={imageUrl || '/placeholder-image.png'} // Use placeholder if imageUrl is null
            alt={name} // Important for accessibility!
            fill // Makes the image fill the container
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" // Helps optimize image loading
            className="object-cover group-hover:scale-105 transition-transform duration-300" // Zoom effect on hover
            onError={(e) => {
              // Handle image loading errors
              (e.target as HTMLImageElement).src = '/placeholder-image.png';
              (e.target as HTMLImageElement).srcset = '';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col flex-grow"> {/* flex-grow makes this section take remaining space */}
          <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-1 truncate">
            {/* truncate prevents long names from breaking layout */}
            {name}
          </h3>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-auto pt-2">
            {/* mt-auto pushes price to the bottom if card height varies */}
            {formattedPrice}
            {/* We'll add logic to switch currency based on locale later */}
          </p>
        </div>

      </div>
    </Link>
  );
};

export default ProductCard;