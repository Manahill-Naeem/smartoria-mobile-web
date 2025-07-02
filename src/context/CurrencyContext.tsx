// src/context/CurrencyContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Define the shape of your currency context
interface CurrencyContextType {
  currentCurrency: 'PKR' | 'AUD';
  setCurrency: (currency: 'PKR' | 'AUD') => void;
  exchangeRateAUDtoPKR: number | null;
  loadingRates: boolean;
  ratesError: string | null;
}

// Create the context
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Define props for the provider
interface CurrencyProviderProps {
  children: ReactNode;
}

// Global variable declarations for environment variables (if used this way)
declare global {
  var __NEXT_PUBLIC_EXCHANGE_RATE_API_KEY: string | undefined;
}

// Currency Provider Component
export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState<'PKR' | 'AUD'>('PKR');
  const [exchangeRateAUDtoPKR, setExchangeRateAUDtoPKR] = useState<number | null>(null);
  const [loadingRates, setLoadingRates] = useState<boolean>(true);
  const [ratesError, setRatesError] = useState<string | null>(null);

  const fetchExchangeRate = useCallback(async () => {
    setLoadingRates(true);
    setRatesError(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY || (typeof __NEXT_PUBLIC_EXCHANGE_RATE_API_KEY !== 'undefined' ? __NEXT_PUBLIC_EXCHANGE_RATE_API_KEY : '');

      if (!apiKey || apiKey === "YOUR_EXCHANGE_RATE_API_KEY") {
          throw new Error("Exchange Rate API Key is missing or invalid. Please check NEXT_PUBLIC_EXCHANGE_RATE_API_KEY environment variable.");
      }

      // Using ExchangeRate-API (formerly Exchangerate.host/Fixer) - make sure your key is valid for this endpoint
      // You might need to adjust the endpoint if your API key is for a different service or version.
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/AUD`); // Fetch rates relative to AUD
      const data = await response.json();

      if (data.result === 'success' && data.conversion_rates && data.conversion_rates.PKR) {
        setExchangeRateAUDtoPKR(data.conversion_rates.PKR);
      } else {
        throw new Error(data.error_type || "Failed to fetch exchange rates.");
      }
    } catch (error: unknown) {
      console.error("Error fetching exchange rates:", error);
      if (error instanceof Error) {
        setRatesError(`Failed to fetch exchange rates: ${error.message}.`);
      } else {
        setRatesError("Failed to fetch exchange rates: An unknown error occurred.");
      }
      setExchangeRateAUDtoPKR(null); // Reset on error
    } finally {
      setLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRate(); // Initial fetch
    // Optional: refetch periodically, but be mindful of API limits
    // const interval = setInterval(fetchExchangeRate, 3600000); // Every hour
    // return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  // Handle currency change
  const setCurrencyHandler = useCallback((currency: 'PKR' | 'AUD') => {
    setCurrentCurrency(currency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCurrency', currency);
    }
  }, []);


  const contextValue = {
    currentCurrency,
    setCurrency: setCurrencyHandler,
    exchangeRateAUDtoPKR,
    loadingRates,
    ratesError,
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use the currency context
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};