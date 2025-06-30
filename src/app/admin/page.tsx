"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Product {
  _id?: string;
  title: string;
  image: string; // This is the image URL
  price: number;
  oldPrice?: number;
  stock: number;
  discount?: number;
  category?: string;
  subcategory?: string;
}

const categories = [
  {
    name: 'Audio',
    sub: ['All Audio', 'Liquid Ears', 'Headphones', 'Speakers'],
  },
  {
    name: 'Cables',
    sub: ['All Cables', 'HDMI', 'USB', 'Lightning'],
  },
  { name: 'Content Creation', sub: [] },
  { name: 'Gaming', sub: [] },
  { name: 'IT & Mobile Accessories', sub: [] },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>({ title: "", image: "", price: 0, oldPrice: 0, stock: 0, discount: 0, category: '', subcategory: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null); // Kept for showing selected file name/info if needed
  const [uploading, setUploading] = useState(false); // State to track image upload progress
  const [message, setMessage] = useState(''); // To show success/error messages to the user

  // Fetch products on component mount and handle admin login check
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("isAdmin") !== "true") {
        window.location.href = "/admin-login"; // Redirect if not admin
      } else {
        fetchProducts(); // Only fetch products if admin
      }
    }
  }, []);

  // Function to fetch products from the API
  async function fetchProducts() {
    setLoading(true);
    setMessage(''); // Clear previous messages
    try {
      const res = await fetch("/api/products");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setMessage("Failed to load products.");
      setProducts([]); // Clear products on error
    } finally {
      setLoading(false);
    }
  }

  // Handle form submission (Add or Update Product)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); // Start general loading indicator
    setMessage(''); // Clear previous messages

    // --- Critical Validation Checks before submission ---
    if (uploading) {
        setMessage("Please wait for the image to finish uploading.");
        setLoading(false);
        return;
    }
    // If adding a new product AND no image URL is set in the form state
    if (!editingId && !form.image) {
        setMessage("Please upload an image for the new product.");
        setLoading(false);
        return;
    }
    // Frontend validation for required fields
    if (!form.title || !form.category || !form.subcategory || form.price <= 0 || form.stock <= 0) {
        setMessage("Please fill all required product details (Title, Category, Subcategory, Price, Stock).");
        setLoading(false);
        return;
    }
    // --- End Critical Validation Checks ---

    try {
      if (editingId) {
        // Update existing product
        const res = await fetch("/api/products/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...form }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Failed to update product: ${errorData.error || res.statusText}`);
        }
        setMessage("Product updated successfully!");
      } else {
        // Add new product
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Failed to add product: ${errorData.error || res.statusText}`);
        }
        setMessage("Product added successfully!");
      }

      // Reset form and related states after successful submission
      setForm({ title: "", image: "", price: 0, oldPrice: 0, stock: 0, discount: 0, category: '', subcategory: '' });
      setEditingId(null);
      setImageFile(null); // Clear file input's internal state
      // Re-fetch products to display the new/updated one on the list
      fetchProducts();
    } catch (error) {
      console.error("Error submitting product:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : "An unknown error occurred."}`);
    } finally {
      setLoading(false); // Stop general loading indicator
    }
  }

  // Handle product deletion
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return; // Simple confirmation

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch("/api/products/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to delete product: ${errorData.error || res.statusText}`);
      }
      setMessage("Product deleted successfully!");
      fetchProducts(); // Re-fetch products after deletion
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : "An unknown error occurred."}`);
    } finally {
      setLoading(false);
    }
  }

  // Populate form for editing
  function handleEdit(product: Product) {
    setForm(product);
    setEditingId(product._id!);
    // When editing, if an image exists, it will show in preview.
    // User can re-upload if they want to change the image.
    setMessage(''); // Clear messages when starting edit
  }

  // Handle image file selection and upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
        setForm(f => ({ ...f, image: "" })); // Clear image if no file selected (e.g., user cancels)
        setImageFile(null);
        return;
    }

    setUploading(true); // Start image uploading indicator
    setMessage('Uploading image...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Image upload failed: ${errorData.error || res.statusText}`);
      }
      const data = await res.json();
      setForm(f => ({ ...f, image: data.url })); // Update form state with the image URL
      setImageFile(file); // Store the file object (e.g., to show file name to user)
      setMessage("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage(`Image upload error: ${error instanceof Error ? error.message : "An unknown error occurred."}`);
      setForm(f => ({ ...f, image: "" })); // Clear image in form state on error
      setImageFile(null);
    } finally {
      setUploading(false); // Stop image uploading indicator
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin: Manage Products</h1>

      {message && (
        <div className={`p-3 mb-4 rounded ${message.startsWith("Error") ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 mb-8 flex flex-col gap-4">
        {/* Category Dropdown */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="category" className="text-xs font-semibold mb-1">Category</label>
            <select
              id="category"
              className="border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="subcategory" className="text-xs font-semibold mb-1">Subcategory</label>
            <select
              id="subcategory"
              className="border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={form.subcategory}
              onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
              required
              disabled={!form.category || !categories.find(cat => cat.name === form.category)?.sub.length}
            >
              <option value="">Select Subcategory</option>
              {categories.find(cat => cat.name === form.category)?.sub.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
        <input
          className="border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Title"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          required
        />
        <input
          type="file"
          accept="image/*"
          className="border px-3 py-2 rounded-md text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          onChange={handleImageUpload}
          // Only require file input if adding new product and no image is set
          required={!editingId && !form.image}
          key={imageFile?.name || 'no-file'} // Reset input when imageFile changes (e.g., after submission)
        />
        {uploading && <div className="text-blue-600 text-sm mt-1">Uploading image...</div>}
        {form.image && (
          <div className="mb-2 flex items-center gap-2">
            <Image src={form.image} alt="Preview" width={120} height={80} className="object-contain border rounded-md" />
            <span className="text-sm text-gray-600">Image selected: {imageFile ? imageFile.name : 'Current Image'}</span>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 flex flex-col">
            <label htmlFor="price" className="text-xs font-semibold mb-1">Price</label>
            <input
              id="price"
              className="border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="oldPrice" className="text-xs font-semibold mb-1">Old Price (optional)</label>
            <input
              id="oldPrice"
              className="border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              type="number"
              placeholder="Old Price"
              value={form.oldPrice || ""}
              onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="stock" className="text-xs font-semibold mb-1">Stock</label>
            <input
              id="stock"
              className="border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor="discount" className="text-xs font-semibold mb-1">Discount % (optional)</label>
            <input
              id="discount"
              className="border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              type="number"
              placeholder="Discount %"
              value={form.discount || ""}
              onChange={e => setForm(f => ({ ...f, discount: e.target.value ? Number(e.target.value) : undefined }))}
              min={0}
              max={100}
            />
            <span className="text-xs text-gray-500 mt-1">Leave blank if no discount</span>
          </div>
        </div>
        <button
          type="submit"
          className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md flex items-center justify-center gap-2 transition duration-200 ${loading || uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={loading || uploading} 
        >
          {(loading || uploading) && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          )}
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">All Products</h2>
      {loading ? (
        <div className="text-center text-gray-600">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 p-8 border rounded-lg bg-white shadow-sm">
              No products found. Add some from the form above!
            </div>
          ) : (
            products.map(product => (
              <div key={product._id} className="bg-white rounded-xl shadow-md p-4 flex flex-col border border-neutral-200 relative group transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="relative mb-3 flex justify-center items-center h-36 w-full">
                  <Image
                    src={product.image || "[https://placehold.co/220x160/EEEEEE/333333?text=No+Image](https://placehold.co/220x160/EEEEEE/333333?text=No+Image)"}
                    alt={product.title}
                    width={220} // Fixed width, adjust as needed
                    height={160} // Fixed height, adjust as needed
                    className="object-contain max-h-full max-w-full"
                    onError={(e) => {
                      // Fallback for broken images
                      e.currentTarget.srcset = ''; // Clear srcset to prevent re-attempts
                      e.currentTarget.src = "[https://placehold.co/220x160/CCCCCC/666666?text=Image+Error](https://placehold.co/220x160/CCCCCC/666666?text=Image+Error)";
                    }}
                  />
                </div>
                <div className="font-semibold text-neutral-800 text-base mb-1 line-clamp-2 min-h-[40px]">{product.title}</div>
                <div className="text-sm text-neutral-500 mb-2">
                    {product.category} {product.subcategory ? ` / ${product.subcategory}` : ''}
                </div>
                <div className="flex items-end justify-between gap-2 mb-2 mt-auto pt-2">
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-red-600">${product.price.toFixed(2)}</span>
                        {product.oldPrice && product.oldPrice > product.price && ( // Only show old price if it's higher
                            <span className="text-base line-through text-neutral-400">${product.oldPrice.toFixed(2)}</span>
                        )}
                    </div>
                    {product.discount && product.discount > 0 && (
                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{product.discount}% OFF
                        </span>
                    )}
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                    <div className="text-xs text-yellow-600 font-semibold mb-2">
                        ⚠️ Hurry! Only {product.stock} left in stock
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="text-xs text-red-600 font-semibold mb-2">
                        Out of Stock!
                    </div>
                )}
                <div className="flex gap-2 mt-auto border-t pt-3 border-neutral-100">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm font-medium transition duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id!)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
