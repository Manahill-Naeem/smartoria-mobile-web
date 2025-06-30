"use client";
import { useEffect, useState } from "react";
import ProductCard, { Product } from "./ProductCard";

interface Props {
  category?: string;
  subcategory?: string;
}

const sortOptions = [
  { value: "best", label: "Best selling" },
  { value: "low", label: "Price: Low to High" },
  { value: "high", label: "Price: High to Low" },
  { value: "new", label: "Newest" },
];

export default function SortAndProductGrid({ category, subcategory }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState("best");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const res = await fetch("/api/products");
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      // Filter by category/subcategory if provided
      if (category) {
        data = data.filter((p: Product) =>
          p.category?.toLowerCase() === category.toLowerCase()
        );
      }
      if (subcategory) {
        data = data.filter((p: Product) =>
          p.subcategory?.toLowerCase() === subcategory.toLowerCase()
        );
      }
      // Sort
      if (sort === "low") data.sort((a: Product, b: Product) => a.price - b.price);
      else if (sort === "high") data.sort((a: Product, b: Product) => b.price - a.price);
      else if (sort === "new") data.sort((a: Product, b: Product) => (b._id || 0) > (a._id || 0) ? 1 : -1);
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, [category, subcategory, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-end items-center mb-4">
        <span className="font-semibold mr-2">Sort by:</span>
        <select
          className="bg-white border border-neutral-300 rounded px-3 py-1 font-medium focus:outline-none"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : products.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4 flex flex-col border border-neutral-200 animate-pulse">
              <div className="h-36 bg-neutral-200 rounded mb-3" />
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2" />
              <div className="h-8 bg-neutral-200 rounded w-1/2 mt-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.slice(0, 6).map(product => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
