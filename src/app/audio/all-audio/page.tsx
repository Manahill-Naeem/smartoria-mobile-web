'use client';
import ProductCard, { Product } from "@/components/ProductCard"; // <--- Corrected import path
import { useState, useEffect } from "react";

const dummyProducts: Product[] = [
  {
    _id: "dummy-1", // <--- Changed 'id' to '_id' for compatibility with CartContext
    title: "Sony WH-1000XM5 Wireless Headphones",
    image: "/uploads/sony-wh1000xm5.jpg",
    price: 349.99,
    oldPrice: 399.99,
    stock: 10,
    discount: 13,
    category: "Audio",
    subcategory: "Headphones",
  },
  {
    _id: "dummy-2", // <--- Changed 'id' to '_id'
    title: "JBL Tune 510BT On-Ear Headphones",
    image: "/uploads/jbl-tune510bt.jpg",
    price: 49.99,
    oldPrice: 69.99,
    stock: 15,
    discount: 29,
    category: "Audio",
    subcategory: "Headphones",
  },
  {
    _id: "dummy-3", // <--- Changed 'id' to '_id'
    title: "Liquid Ears Wireless Earbuds",
    image: "/uploads/liquid-ears-earbuds.jpg",
    price: 29.99,
    oldPrice: 39.99,
    stock: 20,
    discount: 25,
    category: "Audio",
    subcategory: "Liquid Ears",
  },
  {
    _id: "dummy-4", // <--- Changed 'id' to '_id'
    title: "Bose SoundLink Flex Bluetooth Speaker",
    image: "/uploads/bose-soundlink-flex.jpg",
    price: 129.99,
    oldPrice: 149.99,
    stock: 8,
    discount: 13,
    category: "Audio",
    subcategory: "Speakers",
  },
  {
    _id: "dummy-5", // <--- Changed 'id' to '_id'
    title: "Anker Soundcore Mini Speaker",
    image: "/uploads/anker-mini.jpg",
    price: 24.99,
    oldPrice: 29.99,
    stock: 25,
    discount: 17,
    category: "Audio",
    subcategory: "Speakers",
  },
  {
    _id: "dummy-6", // <--- Changed 'id' to '_id'
    title: "Marshall Emberton II Bluetooth Speaker",
    image: "/uploads/marshall-emberton.jpg",
    price: 169.99,
    oldPrice: 199.99,
    stock: 5,
    discount: 15,
    category: "Audio",
    subcategory: "Speakers",
  },
];

export default function AllAudioPage() {
  const [showDummy, setShowDummy] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Try to fetch real products from API
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Filter for "Audio" category
        const audioProducts = Array.isArray(data) ? data.filter((p: Product) => p.category === "Audio") : [];

        if (audioProducts.length > 0) {
          setShowDummy(false);
          setProducts(audioProducts);
        } else {
          setShowDummy(true);
          // Assign unique _id to dummy products for CartContext compatibility
          setProducts(dummyProducts.map(p => ({ ...p, _id: p.id || Math.random().toString(36).substring(7) })));
        }
      })
      .catch((error) => {
        console.error("Error fetching audio products:", error);
        setShowDummy(true);
        // Assign unique _id to dummy products on fetch error too
        setProducts(dummyProducts.map(p => ({ ...p, _id: p.id || Math.random().toString(36).substring(7) })));
      })
      .finally(() => {
        setLoading(false); // Set loading to false after fetch attempt
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative w-full h-[320px] flex items-center justify-center"
        style={{
          backgroundImage:
            "url('/Smartoria_Logo.png'), linear-gradient(90deg, #0f2027 0%, #2c5364 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            All Audio
          </h1>
          <p className="text-lg md:text-xl text-white font-medium drop-shadow-md max-w-2xl mx-auto">
            All audio products in one place. Find your perfect sound companion.
          </p>
        </div>
      </div>
      {/* Sort and Product Grid */}
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
          <div className="text-center py-10">Loading audio products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {(showDummy ? dummyProducts : products).map((product, i) => ( // Use 'products' state directly
              <ProductCard key={product._id || product.id || i} product={product} />
            ))}
            {(!showDummy && products.length === 0) && ( // Added condition for no real products
                <div className="col-span-full text-center text-gray-500 p-8 border rounded-lg bg-white shadow-sm">
                    No audio products found in the database.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
