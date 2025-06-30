"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, Auth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  addDoc,
  getDocs,
  Firestore,
  serverTimestamp,
  DocumentData,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';

interface CartItem {
  productId: string; // This will always be a string when stored in Firestore (doc.id)
  title: string;
  image: string;
  price: number;
  quantity: number;
  addedAt?: Timestamp | FieldValue;
}

// Define the type for the product object passed to addToCart
interface ProductForCart {
  _id?: string; // Make _id optional for addToCart, as dummy products might use 'id'
  id?: string; // Allow 'id' for dummy products
  title: string;
  image: string;
  price: number;
}

interface CartContextType {
  cartItems: CartItem[];
  // Change parameter type to use ProductForCart
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
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState<boolean>(true);
  const [cartError, setCartError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  // Firebase Initialization and Authentication
  useEffect(() => {
    if (typeof window !== 'undefined' && !db) {
      try {
        let config: any;
        if (typeof __firebase_config !== 'undefined' && __firebase_config) {
          try {
            config = JSON.parse(__firebase_config);
          } catch (e) {
            console.error("Failed to parse __firebase_config:", e);
            config = {};
          }
        } else {
          console.warn("No __firebase_config found. Using dummy config for development.");
          config = {
            apiKey: "YOUR_DEV_API_KEY",
            authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_PROJECT_ID.appspot.com",
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
            appId: "YOUR_APP_ID",
            measurementId: "YOUR_MEASUREMENT_ID"
          };
        }

        if (!config || Object.keys(config).length === 0 || !config.projectId) {
            throw new Error("Firebase config is completely missing or empty. Please ensure it's provided or correctly configured for development.");
        }

        const app = initializeApp(config);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestoreDb);
        setAuth(firebaseAuth);

        const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
          if (user) {
            setUserId(user.uid);
            console.log("Firebase Auth State Changed: User Logged In", user.uid);
          } else {
            console.log("Firebase Auth State Changed: No User. Attempting sign-in anonymously...");
            try {
              if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(firebaseAuth, __initial_auth_token);
                setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID());
                console.log("Signed in with custom token successfully.");
              } else {
                await signInAnonymously(firebaseAuth);
                setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID());
                console.log("Signed in anonymously successfully.");
              }
            } catch (anonError) {
              console.error("Anonymous sign-in or custom token sign-in failed:", anonError);
              setCartError("Authentication failed. Cart might not be saved.");
              setUserId(crypto.randomUUID());
            }
          }
          setIsAuthReady(true);
        });

        return () => {
          if (unsubscribeAuth) unsubscribeAuth();
        };

      } catch (e: any) {
        console.error("Failed to initialize Firebase:", e);
        setCartError(`Firebase initialization error: ${e.message}`);
        setIsAuthReady(true);
      }
    }
  }, []);

  // Fetch cart items from Firestore
  useEffect(() => {
    let unsubscribe: () => void;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'development-app-id';

    if (db && userId && isAuthReady) {
      setCartLoading(true);
      setCartError(null);
      try {
        const cartCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/cartItems`);
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
        }, (error: any) => {
          console.error("Error fetching real-time cart updates:", error);
          setCartError(`Failed to get real-time cart updates: ${error.message}`);
          setCartLoading(false);
        });
      } catch (e: any) {
        console.error("Error setting up onSnapshot for cart:", e);
        setCartError(`Failed to load cart items: ${e.message}`);
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
  }, [db, userId, isAuthReady]);

  // Add/Update item in cart
  // Use ProductForCart type for the product parameter
  const addToCart = useCallback(async (product: ProductForCart, quantity: number) => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'development-app-id';

    if (!db || !userId) {
      setCartError("Database or user not ready. Cannot add to cart.");
      console.error("addToCart: DB or userId not ready.");
      return;
    }
    setCartError(null);
    setCartLoading(true);

    try {
      // Determine the actual product ID to use for Firestore document
      const actualProductId = product._id || product.id;
      if (!actualProductId) {
        console.error("Cannot add to cart: Product has no _id or id.");
        setCartError("Product ID is missing.");
        setCartLoading(false);
        return;
      }

      const cartItemRef = doc(db, `artifacts/${appId}/users/${userId}/cartItems`, actualProductId);

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
          productId: actualProductId, // Use the determined ID
          title: product.title,
          image: product.image,
          price: product.price,
          quantity: quantity,
          addedAt: serverTimestamp(),
        };
        await setDoc(cartItemRef, newItem);
        console.log(`Added ${product.title} to cart.`);
      }
    } catch (e: any) {
      console.error("Error adding/updating item to cart:", e);
      setCartError(`Failed to add/update item: ${e.message}`);
    } finally {
        setCartLoading(false);
    }
  }, [db, userId, cartItems]);

  const removeFromCart = useCallback(async (productId: string) => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'development-app-id';

    if (!db || !userId) {
      setCartError("Database or user not ready. Cannot remove from cart.");
      return;
    }
    setCartError(null);
    setCartLoading(true);

    try {
      const cartItemRef = doc(db, `artifacts/${appId}/users/${userId}/cartItems`, productId);
      await deleteDoc(cartItemRef);
      console.log(`Removed product ${productId} from cart.`);
    } catch (e: any) {
      console.error("Error removing item from cart:", e);
      setCartError(`Failed to remove item: ${e.message}`);
    } finally {
        setCartLoading(false);
    }
  }, [db, userId]);

  const updateQuantity = useCallback(async (productId: string, newQuantity: number) => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'development-app-id';

    if (!db || !userId) {
      setCartError("Database or user not ready. Cannot update quantity.");
      return;
    }
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    setCartError(null);
    setCartLoading(true);

    try {
      const cartItemRef = doc(db, `artifacts/${appId}/users/${userId}/cartItems`, productId);
      await updateDoc(cartItemRef, { quantity: newQuantity, addedAt: serverTimestamp() });
      console.log(`Updated quantity for product ${productId} to ${newQuantity}.`);
    } catch (e: any) {
      console.error("Error updating quantity:", e);
      setCartError(`Failed to update quantity: ${e.message}`);
    } finally {
        setCartLoading(false);
    }
  }, [db, userId, removeFromCart]);

  const clearCart = useCallback(async () => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'development-app-id';

    if (!db || !userId) {
      setCartError("Database or user not ready. Cannot clear cart.");
      return;
    }
    setCartError(null);
    setCartLoading(true);

    try {
      const cartCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/cartItems`);
      const querySnapshot = await getDocs(cartCollectionRef);
      const deletePromises = querySnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      console.log("Cart cleared.");
    } catch (e: any) {
      console.error("Error clearing cart:", e);
      setCartError(`Failed to clear cart: ${e.message}`);
    } finally {
        setCartLoading(false);
    }
  }, [db, userId]);

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
          <p className="text-sm text-gray-500">Establishing secure connection for cart.</p>
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
