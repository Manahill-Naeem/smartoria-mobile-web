// ./src/app/admin-login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState(""); // This state is used in the input and handleSubmit
  const [error, setError] = useState<string | null>(null); // This state is used to display errors
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); // Clear previous errors
    // Send password to server for verification
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      localStorage.setItem("isAdmin", "true");
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error || "Incorrect password");
    }
  }

  // Ab yeh component kuch render karega, warna woh hamesha 'null' return kar raha tha
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        <form onSubmit={handleSubmit}> {/* handleSubmit ko form ke onSubmit par attach kiya */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // setPassword is used here
              required
            />
          </div>
          {error && ( // error state ko display kiya
            <p className="text-red-500 text-xs italic mb-4">{error}</p>
          )}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}