// components/ProductCard.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
// Removed: import { useEffect } from "react"; // No longer used
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';

// Define the Product interface for consistency
export interface Product {
  _id?: string; // MongoDB ID (from real API)
  id?: string; // For dummy data (from dummyProducts array)
  title: string;
  image: string;
  price: number;
  oldPrice?: number;
  stock: number;
  discount?: number;
  category?: string;
  subcategory?: string;
}

function ProductCard({ product }: { product: Product }) {
  const { currentCurrency, exchangeRateAUDtoPKR, loadingRates, ratesError } = useCurrency();
  const { addToCart, cartLoading, isAuthReady } = useCart();

  const getConvertedPrice = (originalPrice: number) => {
    if (loadingRates || exchangeRateAUDtoPKR === null) {
      return `Loading...`;
    }
    if (ratesError) {
      return `Error!`;
    }

    const numericPrice = Number(originalPrice); // Ensure price is numeric
    if (isNaN(numericPrice)) {
      console.error("Invalid price for conversion:", originalPrice);
      return "N/A";
    }

    if (currentCurrency === 'PKR') {
      return numericPrice.toFixed(2);
    } else if (currentCurrency === 'AUD') {
      if (exchangeRateAUDtoPKR === 0) {
        console.error("Exchange rate for AUD to PKR is zero, cannot convert.");
        return "N/A";
      }
      const priceInAUD = numericPrice / exchangeRateAUDtoPKR;
      return priceInAUD.toFixed(2);
    }
    return numericPrice.toFixed(2);
  };

  const displayCurrencySymbol = (currencyCode: 'PKR' | 'AUD') => {
    switch (currencyCode) {
      case 'PKR': return 'PKR ';
      case 'AUD': return 'AUD ';
      default: return '';
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's link from triggering when clicking 'Add to Cart'

    // Determine the ID to pass to addToCart, prioritizing _id
    const productIdForCart = product._id || product.id;

    if (!productIdForCart) {
        console.error("Product ID is missing for Add to Cart:", product);
        return;
    }
    // Pass the product object with a guaranteed _id field for cart context's expected type
    // Assuming CartItem type in CartContext expects _id, title, image, price
    await addToCart({
      _id: productIdForCart, // Ensure _id is present (either from real data or dummy.id)
      title: product.title,
      image: product.image,
      price: product.price
    }, 1);
  };

  const isAddToCartDisabled = cartLoading || product.stock === 0 || !isAuthReady;

  // Determine the product's unique identifier for the link
  const productLink = product._id ? `/products/${product._id}` : (product.id ? `/products/${product.id}` : '#');


  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col border border-neutral-200 relative group transition hover:shadow-lg">
      <Link href={productLink} className="block cursor-pointer">
        <div className="relative mb-3">
          <Image
            src={product.image || "https://placehold.co/220x160/EEEEEE/333333?text=No+Image"}
            alt={product.title}
            width={220}
            height={160}
            className="mx-auto h-36 object-contain"
            onError={(e) => {
                e.currentTarget.srcset = ''; // Clear srcset to prevent further attempts with original srcset
                e.currentTarget.src = "https://placehold.co/220x160/CCCCCC/666666?text=Image+Error";
            }}
          />
          {product.discount && product.discount > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="font-medium text-sm mb-2 line-clamp-2 min-h-[40px]">
            {product.title}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <button className="text-neutral-400 hover:text-red-500" aria-label="Add to wishlist">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.04 3 12.5 3.99 13.07 5.36C13.64 3.99 15.1 3 16.65 3C19.65 3 22 5.5 22 8.5C22 13.5 12 21 12 21Z" />
          </svg>
        </button>
        <button className="text-neutral-400 hover:text-blue-500" aria-label="Compare product">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        </button>
      </div>
      <div className="text-xs mb-2">
        <span
          className={`text-yellow-500 font-semibold ${
            product.stock <= 5 && product.stock > 0 ? "" : "hidden"
          }`}
        >
          ⚠️ Hurry! Less than {product.stock} left in stock
        </span>
        {product.stock === 0 && (
          <span className="text-red-500 font-semibold">Out of Stock!</span>
        )}
      </div>
      <div className="flex items-end gap-2 mb-2">
        {loadingRates || ratesError || exchangeRateAUDtoPKR === null ? (
          <span className="text-2xl font-bold text-gray-500">
            {loadingRates ? "Loading rates..." : (ratesError ? "Rates Error!" : "N/A")}
          </span>
        ) : (
          <>
            <span className="text-2xl font-bold text-red-600">
              {displayCurrencySymbol(currentCurrency)}{getConvertedPrice(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-base line-through text-neutral-400">
                {displayCurrencySymbol(currentCurrency)}{getConvertedPrice(product.oldPrice)}
              </span>
            )}
          </>
        )}
      </div>
      <button
        onClick={handleAddToCart}
        disabled={isAddToCartDisabled}
        className={`mt-auto bg-red-600 text-white font-bold rounded-full px-4 py-2 flex items-center gap-2 self-end justify-center transition duration-200 ${
          isAddToCartDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-700'
        }`}
      >
        {cartLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
        ) : (
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        )}
        <span className="font-bold text-lg">
          {cartLoading ? 'Adding...' : (!isAuthReady ? 'Loading Cart...' : 'Add to Cart')}
        </span>
      </button>
    </div>
  );
}

export default ProductCard;