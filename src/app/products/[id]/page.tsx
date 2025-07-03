// app/products/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link'; // <--- Import Link
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Product } from '@/components/ProductCard';

export default function ProductDetailPage() {
  const pathname = usePathname();
  const productId = pathname ? pathname.split('/').pop() : null;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart, cartLoading, isAuthReady } = useCart();
  const { currentCurrency, exchangeRateAUDtoPKR, loadingRates, ratesError } = useCurrency();

  useEffect(() => {
    if (!productId) {
      setError("Product ID is missing in the URL.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Failed to fetch product: ${res.statusText}`);
        }
        const data: Product = await res.json();
        setProduct(data);
      } catch (err: unknown) { // <--- Changed to unknown
        console.error("Error fetching product:", err);
        // Type check 'err' before accessing properties
        setError(err instanceof Error ? err.message : "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const getConvertedPrice = (originalPrice: number): string => {
    const numericPrice = Number(originalPrice);

    if (isNaN(numericPrice)) {
      console.error("Invalid price received:", originalPrice);
      return "N/A";
    }

    if (loadingRates || exchangeRateAUDtoPKR === null) {
      return `Loading...`;
    }
    if (ratesError) {
      return `Error!`;
    }

    if (currentCurrency === 'PKR') {
      return numericPrice.toFixed(2);
    } else if (currentCurrency === 'AUD') {
      if (exchangeRateAUDtoPKR === 0) {
        console.error("Exchange rate for AUD to PKR is zero, cannot convert. Using original PKR price.");
        return numericPrice.toFixed(2);
      }
      const priceInAUD = numericPrice / exchangeRateAUDtoPKR;
      return priceInAUD.toFixed(2);
    }
    return numericPrice.toFixed(2);
  };

  const displayCurrencySymbol = (currencyCode: 'PKR' | 'AUD' | string) => {
    switch (currencyCode) {
      case 'PKR': return 'PKR ';
      case 'AUD': return 'AUD ';
      default: return '';
    }
  };

  const handleAddToCart = async () => {
    if (!product || !product._id) {
      console.error("Product data or ID is missing for Add to Cart.");
      return;
    }
    await addToCart(product, 1);
  };

  const isAddToCartDisabled = cartLoading || (product && product.stock === 0) || !isAuthReady;


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="ml-3 text-lg text-gray-700">Loading product details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 py-10 px-4">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Product!</h2>
        <p className="text-red-600 text-center">{error}</p>
        <p className="text-gray-500 mt-4">Please try again or go back to the homepage.</p>
        <Link href="/" className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">Go to Homepage</Link> {/* <--- Used Link */}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10 px-4">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Product Not Found</h2>
        <p className="text-gray-600">The product you are looking for does not exist or was removed.</p>
        <Link href="/" className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">Go to Homepage</Link> {/* <--- Used Link */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-10 bg-white rounded-lg shadow-xl p-6 md:p-10">
          {/* Product Image */}
          <div className="flex-shrink-0 md:w-1/2 flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <Image
              src={product.image || "https://placehold.co/400x300/EEEEEE/333333?text=No+Image"}
              alt={product.title}
              width={400}
              height={300}
              className="object-contain max-h-[400px] w-full rounded-md"
              priority
              onError={(e) => {
                e.currentTarget.srcset = '';
                e.currentTarget.src = "https://placehold.co/400x300/CCCCCC/666666?text=Image+Error";
              }}
            />
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{product.title}</h1>
              <p className="text-lg text-gray-600 mb-4">
                Category: <span className="font-semibold">{product.category}</span>
                {product.subcategory && (
                  <> / <span className="font-semibold">{product.subcategory}</span></>
                )}
              </p>

              <div className="flex items-center gap-4 mb-4">
                {loadingRates || ratesError || exchangeRateAUDtoPKR === null ? (
                  <span className="text-3xl font-bold text-gray-500">
                    {loadingRates ? "Loading rates..." : (ratesError ? "Rates Error!" : "N/A")}
                  </span>
                ) : (
                  <>
                    <span className="text-5xl font-bold text-red-600">
                      {displayCurrencySymbol(currentCurrency)}{getConvertedPrice(product.price)}
                    </span>
                    {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
                      <span className="text-xl line-through text-gray-400">
                        {displayCurrencySymbol(currentCurrency)}{getConvertedPrice(product.oldPrice)}
                      </span>
                    )}
                  </>
                )}
              </div>

              {product.discount && product.discount > 0 && (
                <div className="bg-green-100 text-green-700 text-lg font-bold px-4 py-2 rounded-md inline-block mb-4">
                  Save {product.discount}%!
                </div>
              )}

              <div className="text-sm text-gray-700 mb-6">
                {product.stock > 0 && product.stock <= 5 && (
                  <p className="text-yellow-600 font-semibold mb-2">⚠️ Hurry! Only {product.stock} left in stock</p>
                )}
                {product.stock === 0 && (
                  <p className="text-red-600 font-semibold mb-2">Out of Stock!</p>
                )}
                {product.stock > 5 && (
                  <p className="text-green-600 font-semibold mb-2">In Stock</p>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
              className={`w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition duration-200 text-2xl mt-6 ${
                isAddToCartDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
              aria-label={isAddToCartDisabled ? 'Cannot add to cart' : 'Add to cart'}
            >
              {cartLoading ? (
                 <svg className="animate-spin h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                 </svg>
               ) : (
                 <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                   <circle cx="9" cy="21" r="1" />
                   <circle cx="20" cy="21" r="1" />
                   <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                 </svg>
               )}
               <span className="font-bold text-lg">
                 {cartLoading ? 'Adding to Cart...' : (!isAuthReady ? 'Loading Cart...' : (product.stock === 0 ? 'Out of Stock' : 'Add to Cart'))}
               </span>
            </button>
          </div>
        </div>

        {/* Product Description Placeholder */}
        <div className="mt-12 bg-white rounded-lg shadow-xl p-6 md:p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 pb-3">Product Description</h2>
          <div className="text-gray-700 leading-relaxed space-y-4">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p>
              Praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}