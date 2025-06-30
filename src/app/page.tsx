'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard"; // <--- Updated import path
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';

// HeroSection component remains the same
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
          Today's smartphone is a supercomputer that deserves the very best
          accessories to protect and enhance your experience. Also, express your
          own style with the use of funky colours and innovative designs.
        </p>
      </div>
    </section>
  );
}

// ProductCard component is now imported from its own file
// No need to define it here anymore.

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
            throw new Error(`Failed to fetch products: ${res.statusText}`);
        }
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching products for Home page:", error);
        setProducts([]);
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
          <span className="font-semibold mr-2">Sort by:</span>
          <select className="bg-white border border-neutral-300 rounded px-3 py-1 font-medium focus:outline-none">
            <option>Best selling</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
        </div>
        {loading ? (
          <div className="text-center py-10">Loading products...</div>
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
