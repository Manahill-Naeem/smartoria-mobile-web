// src/context/CartContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app'; // Added getApps, getApp
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, Auth } from 'firebase/auth'; // Added Auth
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  getDocs,
  Firestore,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';

interface CartItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  addedAt?: Timestamp | FieldValue;
}

interface ProductForCart {
  _id?: string;
  id?: string;
  title: string;
  image: string;
  price: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductForCart, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartLoading: boolean;
  cartError: string | null;
  totalItems: number;
  subtotal: number;
  userId: string | null;
  isAuthReady: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
  firebaseConfig: string;
  initialAuthToken?: string;
  appId: string;
}

// Declare Firebase app and services OUTSIDE the component
// This ensures they are initialized only once per application lifecycle
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;

export const CartProvider: React.FC<CartProviderProps> = ({ children, firebaseConfig, initialAuthToken, appId }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState<boolean>(true);
  const [cartError, setCartError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  // Removed db state, will use firestoreDb directly
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  // This useEffect handles Firebase initialization and user authentication
  useEffect(() => {
    console.log("CartProvider: useEffect for Firebase init triggered.");

    // Only run this effect if window is defined (client-side) AND Firebase hasn't been initialized globally yet
    // Using getApps().length checks if *any* Firebase app has been initialized
    if (typeof window !== 'undefined' && getApps().length === 0 && firebaseConfig) {
      try {
        let config: {
          apiKey?: string;
          authDomain?: string;
          projectId?: string;
          storageBucket?: string;
          messagingSenderId?: string;
          appId?: string;
          measurementId?: string;
        } = {};

        try {
          config = JSON.parse(firebaseConfig);
          console.log("CartProvider: Found and parsed firebaseConfig prop.");
        } catch (e: unknown) {
          console.error("CartProvider: Failed to parse firebaseConfig prop:", e);
          if (e instanceof Error) {
            setCartError(`Firebase config parse error: ${e.message}`);
          } else {
            setCartError("Firebase config parse error: An unknown error occurred.");
          }
          // Set config to an empty object to prevent further initialization attempts with bad config
          config = {};
        }

        if (!config || Object.keys(config).length === 0 || !config.projectId) {
          throw new Error("Firebase config is completely missing or empty. Please ensure it's provided as a prop.");
        }

        // Initialize Firebase services and store them in the global variables
        firebaseApp = initializeApp(config as { [key: string]: string });
        firestoreDb = getFirestore(firebaseApp);
        firebaseAuth = getAuth(firebaseApp);

        console.log("CartProvider: Firebase app, Firestore, and Auth initialized.");

      } catch (e: unknown) {
        console.error("CartProvider: Failed to initialize Firebase (outer catch):", e);
        if (e instanceof Error) {
          // Check for the "already exists" error, which is harmless in HMR
          if (!/already exists/.test(e.message)) {
              setCartError(`Firebase initialization error: ${e.message}`);
          } else {
              console.warn("Firebase app already initialized by previous render. Reusing existing instance.");
              // Retrieve existing instances if this path is taken due to HMR
              firebaseApp = getApp();
              firebaseAuth = getAuth(firebaseApp);
              firestoreDb = getFirestore(firebaseApp);
          }
        } else {
          setCartError("Firebase initialization error: An unknown error occurred.");
        }
      }
    } else if (typeof window !== 'undefined' && getApps().length > 0) {
        console.log("CartProvider: Firebase already initialized, reusing existing instance.");
        // Ensure global variables are set if they weren't explicitly set in this render cycle
        if (!firebaseApp) firebaseApp = getApp();
        if (!firebaseAuth) firebaseAuth = getAuth(firebaseApp);
        if (!firestoreDb) firestoreDb = getFirestore(firebaseApp);
    }
     else if (typeof window !== 'undefined' && !firebaseConfig) {
      console.error("CartProvider: Firebase config prop is missing. Cannot initialize Firebase.");
      setCartError("Firebase config is missing. Please check setup.");
    }

    // AUTHENTICATION LOGIC: This should always run once Firebase Auth is available
    // Ensure firebaseAuth is available from the global variable
    if (firebaseAuth) {
        const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
            console.log("CartProvider: onAuthStateChanged callback triggered.");

            // Ensure firebaseAuth is not null in this callback
            if (!firebaseAuth) {
                console.error("Firebase Auth instance is unexpectedly null in onAuthStateChanged callback.");
                setIsAuthReady(true);
                return;
            }

            if (user) {
                setUserId(user.uid);
                console.log("Firebase Auth State Changed: User Logged In", user.uid);
            } else {
                console.log("Firebase Auth State Changed: No User. Attempting sign-in anonymously...");
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(firebaseAuth, initialAuthToken);
                        setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID());
                        console.log("CartProvider: Signed in with custom token successfully.");
                    } else {
                        await signInAnonymously(firebaseAuth);
                        setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID());
                        console.log("CartProvider: Signed in anonymously successfully.");
                    }
                } catch (anonError: unknown) {
                    console.error("CartProvider: Anonymous sign-in or custom token sign-in failed:", anonError);
                    if (anonError instanceof Error) {
                        setCartError(`Authentication failed: ${anonError.message}. Cart might not be saved.`);
                    } else {
                        setCartError("Authentication failed. Cart might not be saved.");
                    }
                    // Fallback to a random ID if auth truly fails, so cart can still function locally
                    setUserId(crypto.randomUUID());
                }
            }
            setIsAuthReady(true);
            console.log("CartProvider: setIsAuthReady(true) called. isAuthReady:", true);
        });

        return () => {
            if (unsubscribeAuth) {
                console.log("CartProvider: Unsubscribing from auth state changes (cleanup).");
                unsubscribeAuth();
            }
        };
    } else if (typeof window !== 'undefined' && getApps().length > 0 && !firebaseAuth) {
        // This case should ideally not happen if getAuth(firebaseApp) works, but as a fallback
        console.error("Firebase Auth instance not available despite app being initialized.");
        setCartError("Firebase Auth failed to initialize.");
        setIsAuthReady(true); // Indicate readiness even with error
    } else {
        // If firebaseConfig is missing or not client-side, set ready with error
        setIsAuthReady(true);
        if (typeof window !== 'undefined' && !firebaseConfig) {
            console.log("CartProvider: setIsAuthReady(true) due to missing config.");
        }
    }
  }, [firebaseConfig, initialAuthToken]); // Dependencies for this effect are only config-related props

  // This useEffect handles real-time cart item updates
  useEffect(() => {
    let unsubscribe: () => void | undefined;

    // Use the globally initialized firestoreDb and firebaseAuth for consistency
    if (firestoreDb && userId && isAuthReady) {
      setCartLoading(true);
      setCartError(null);
      try {
        const cartCollectionRef = collection(firestoreDb, `artifacts/${appId}/users/${userId}/cartItems`);
        console.log(`Listening to cart items at: artifacts/${appId}/users/${userId}/cartItems`);

        unsubscribe = onSnapshot(cartCollectionRef, (snapshot) => {
          const items: CartItem[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as CartItem;
            items.push({ ...data, productId: doc.id });
          });
          setCartItems(items);
          setCartLoading(false);
          console.log("Cart items updated from Firestore:", items);
        }, (error: unknown) => {
          console.error("Error fetching real-time cart updates:", error);
          if (error instanceof Error) {
            setCartError(`Failed to get real-time cart updates: ${error.message}`);
          } else {
            setCartError("Failed to get real-time cart updates: An unknown error occurred.");
          }
          setCartLoading(false);
        });
      } catch (e: unknown) {
        console.error("Error setting up onSnapshot for cart:", e);
        if (e instanceof Error) {
          setCartError(`Failed to load cart items: ${e.message}`);
        } else {
          setCartError("Failed to load cart items: An unknown error occurred.");
        }
        setCartLoading(false);
      }
    } else if (isAuthReady && !userId) {
      console.warn("Auth is ready but userId is null. Cart will not load.");
      setCartLoading(false);
      setCartError("User ID not available for cart. Please try refreshing.");
    }

    return () => {
      if (unsubscribe) {
        console.log("Unsubscribing from Firestore cart updates.");
        unsubscribe();
      }
    };
  }, [userId, isAuthReady, appId]); // Removed db from dependencies, using global firestoreDb

  const addToCart = useCallback(async (product: ProductForCart, quantity: number) => {
    if (!firestoreDb || !userId) { // Use global firestoreDb
      setCartError("Database or user not ready. Cannot add to cart.");
      console.error("addToCart: DB or userId not ready.");
      return;
    }
    setCartError(null);
    setCartLoading(true);

    try {
      const actualProductId = product._id || product.id;
      if (!actualProductId) {
        console.error("Cannot add to cart: Product has no _id or id.");
        setCartError("Product ID is missing.");
        return;
      }

      const cartItemRef = doc(firestoreDb, `artifacts/${appId}/users/${userId}/cartItems`, actualProductId); // Use global firestoreDb

      const existingItem = cartItems.find(item => item.productId === actualProductId);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        await updateDoc(cartItemRef, {
          quantity: newQuantity,
          addedAt: serverTimestamp(),
        });
        console.log(`Updated quantity for ${product.title} to ${newQuantity}`);
      } else {
        const newItem: CartItem = {
          productId: actualProductId,
          title: product.title,
          image: product.image,
          price: product.price,
          quantity: quantity,
          addedAt: serverTimestamp(),
        };
        await setDoc(cartItemRef, newItem);
        console.log(`Added ${product.title} to cart.`);
      }
    } catch (e: unknown) {
      console.error("Error adding/updating item to cart:", e);
      if (e instanceof Error) {
        setCartError(`Failed to add/update item: ${e.message}`);
      } else {
        setCartError("Failed to add/update item: An unknown error occurred.");
      }
    } finally {
      setCartLoading(false);
    }
  }, [userId, cartItems, appId]); // Removed db from dependencies

  const removeFromCart = useCallback(async (productId: string) => {
    if (!firestoreDb || !userId) { // Use global firestoreDb
      setCartError("Database or user not ready. Cannot remove from cart.");
      console.error("removeFromCart: DB or userId not ready.");
      return;
    }
    setCartError(null);
    setCartLoading(true);

    try {
      const cartItemRef = doc(firestoreDb, `artifacts/${appId}/users/${userId}/cartItems`, productId); // Use global firestoreDb
      await deleteDoc(cartItemRef);
      console.log(`Removed product ${productId} from cart.`);
    } catch (e: unknown) {
      console.error("Error removing item from cart:", e);
      if (e instanceof Error) {
        setCartError(`Failed to remove item: ${e.message}`);
      } else {
        setCartError("Failed to remove item: An unknown error occurred.");
      }
    } finally {
      setCartLoading(false);
    }
  }, [userId, appId]); // Removed db from dependencies

  const updateQuantity = useCallback(async (productId: string, newQuantity: number) => {
    if (!firestoreDb || !userId) { // Use global firestoreDb
      setCartError("Database or user not ready. Cannot update quantity.");
      console.error("updateQuantity: DB or userId not ready.");
      return;
    }
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    setCartError(null);
    setCartLoading(true);

    try {
      const cartItemRef = doc(firestoreDb, `artifacts/${appId}/users/${userId}/cartItems`, productId); // Use global firestoreDb
      await updateDoc(cartItemRef, { quantity: newQuantity, addedAt: serverTimestamp() });
      console.log(`Updated quantity for product ${productId} to ${newQuantity}.`);
    } catch (e: unknown) {
      console.error("Error updating quantity:", e);
      if (e instanceof Error) {
        setCartError(`Failed to update quantity: ${e.message}`);
      } else {
        setCartError("Failed to update quantity: An unknown error occurred.");
      }
    } finally {
      setCartLoading(false);
    }
  }, [userId, removeFromCart, appId]); // Removed db from dependencies

  const clearCart = useCallback(async () => {
    if (!firestoreDb || !userId) { // Use global firestoreDb
      setCartError("Database or user not ready. Cannot clear cart.");
      console.error("clearCart: DB or userId not ready.");
      return;
    }
    setCartError(null);
    setCartLoading(true);

    try {
      const cartCollectionRef = collection(firestoreDb, `artifacts/${appId}/users/${userId}/cartItems`); // Use global firestoreDb
      const querySnapshot = await getDocs(cartCollectionRef);
      const deletePromises = querySnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      console.log("Cart cleared.");
    } catch (e: unknown) {
      console.error("Error clearing cart:", e);
      if (e instanceof Error) {
        setCartError(`Failed to clear cart: ${e.message}`);
      } else {
        setCartError("Failed to clear cart: An unknown error occurred.");
      }
    } finally {
      setCartLoading(false);
    }
  }, [userId, appId]); // Removed db from dependencies

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartLoading,
    cartError,
    totalItems,
    subtotal,
    userId,
    isAuthReady,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {isAuthReady ? (
        children
      ) : (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <p className="text-lg text-gray-700">Loading application...</p>
          <p className="text-sm text-gray-500">Initializing Firebase and authenticating user...</p>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};