'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import ProductCard, { Product } from "@/components/ProductCard"; // <--- Import Product interface here

// HeroSection component remains the same for now, but could be moved to components/HeroSection.tsx
function HeroSection() {
  return (
    <section className="relative w-full h-[340px] md:h-[400px] flex items-center justify-center bg-neutral-900 overflow-hidden">
      <Image
        src="/hero-img.jpeg"
        alt="Phone Accessories Background"
        fill
        className="object-cover opacity-60"
        priority
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Phone Accessories
        </h1>
        <p className="text-lg md:text-xl text-white font-medium max-w-2xl">
          Today&apos;s smartphone is a supercomputer that deserves the very best {/* Already using &apos;, which is correct */}
          accessories to protect and enhance your experience. Also, express your
          own style with the use of funky colours and innovative designs.
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]); // <--- Specified Product[] type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State for error handling

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Failed to fetch products: ${res.statusText}`);
        }
        const data: Product[] = await res.json(); // <--- Specified Product[] type for data
        // Ensure data is an array, if not, default to empty array
        setProducts(Array.isArray(data) ? data : []);
      } catch (err: unknown) { // <--- Changed 'any' to 'unknown'
        console.error("Error fetching products for Home page:", err);
        // Safely access err.message if it's an Error instance
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load products: An unknown error occurred."); // Generic error for non-Error objects
        }
        setProducts([]); // Clear products on error
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-end items-center mb-4">
          <label htmlFor="sort-by" className="font-semibold mr-2">Sort by:</label>
          <select id="sort-by" className="bg-white border border-neutral-300 rounded px-3 py-1 font-medium focus:outline-none">
            <option>Best selling</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
        </div>
        {loading ? (
          <div className="text-center py-10 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-lg text-gray-700">Loading products...</span>
          </div>
        ) : error ? (
          <div className="col-span-full text-center text-red-600 p-8 border border-red-300 bg-red-50 rounded-lg shadow-sm">
            <p className="font-bold text-xl mb-2">Error loading products!</p>
            <p>{error}</p>
            <p className="mt-4 text-gray-700">Please try refreshing the page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 p-8 border rounded-lg bg-white shadow-sm">
                No products found. Please add some products via the admin panel.
              </div>
            ) : (
              products.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}