// app/layout.tsx
'use client';

import './globals.css';
import Navbar from '@/components/Navbar';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';
import Footer from '@/components/Footer';

// IMPORTANT: Ensure globals.d.ts has the correct declarations for these.
// Example:
// declare var __app_id: string | undefined;
// declare var __firebase_config: string | undefined;
// declare var __initial_auth_token: string | undefined;


if (typeof window !== 'undefined') {
  if (typeof window.__app_id === 'undefined') {
    window.__app_id = process.env.NEXT_PUBLIC_APP_ID || 'local-dev-app';
    console.warn("Using default or environment-provided '__app_id' for local development.");
  }

  // __firebase_config is loaded from .env.local if Canvas hasn't provided it
  if (typeof window.__firebase_config === 'undefined') {
    // Check if all required environment variables for Firebase are available
    if (
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    ) {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Include if using Analytics
      };
      window.__firebase_config = JSON.stringify(firebaseConfig);
      console.warn("Firebase config loaded from .env.local for local development.");
    } else {
      console.error("Missing one or more NEXT_PUBLIC_FIREBASE_ environment variables for local Firebase config. Please check your .env.local file.");
      // Fallback: provide an empty object, which will cause the API key error
      window.__firebase_config = JSON.stringify({});
    }
  }

  if (typeof window.__initial_auth_token === 'undefined') {
    window.__initial_auth_token = '';
    console.warn("No '__initial_auth_token' provided for local development.");
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <CurrencyProvider>
            <Navbar />
            {children}
            <Footer/>
          </CurrencyProvider>
        </CartProvider>
      </body>
    </html>
  );
}
