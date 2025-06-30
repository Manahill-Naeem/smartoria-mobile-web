"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our context data
interface CurrencyContextType {
  currentCurrency: 'PKR' | 'AUD';
  exchangeRateAUDtoPKR: number | null; // AUD to PKR rate
  setCurrency: (currency: 'PKR' | 'AUD') => void;
  loadingRates: boolean;
  ratesError: string | null;
}

// Create the context with default values
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Props for the provider
interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState<'PKR' | 'AUD'>('PKR');
  const [exchangeRateAUDtoPKR, setExchangeRateAUDtoPKR] = useState<number | null>(null);
  const [loadingRates, setLoadingRates] = useState<boolean>(true);
  const [ratesError, setRatesError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch the AUD to PKR exchange rate
    const fetchRates = async () => {
      setLoadingRates(true);
      setRatesError(null);
      console.log("Fetching exchange rates for base: AUD..."); // Debug log
      try {
        // Fetch rates with AUD as base to get PKR rate directly
        const response = await fetch(`/api/convert?base=AUD`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch rates: ${response.status}`);
        }
        const data = await response.json();
        console.log("ExchangeRate-API Response (from /api/convert):", data); // Debug log

        // Ensure rates for PKR exist
        if (data.rates && typeof data.rates.PKR === 'number') {
          setExchangeRateAUDtoPKR(data.rates.PKR);
          console.log(`Successfully fetched AUD to PKR Rate: ${data.rates.PKR}`); // Debug log
        } else {
          throw new Error("PKR rate not found or invalid in fetched data. Response:", data);
        }
      } catch (err: any) {
        console.error("Error fetching AUD/PKR exchange rate in CurrencyContext:", err); // Debug log
        setRatesError(err.message || "Failed to fetch currency rates.");
        setExchangeRateAUDtoPKR(null); // Clear rate on error
      } finally {
        setLoadingRates(false);
      }
    };

    fetchRates();
  }, []); // Fetch only once on component mount

  const setCurrency = (currency: 'PKR' | 'AUD') => {
    console.log(`Currency changed from ${currentCurrency} to ${currency}`); // Debug log
    setCurrentCurrency(currency);
    // Optionally, save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCurrency', currency);
    }
  };

  // Load currency preference from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCurrency = localStorage.getItem('selectedCurrency') as 'PKR' | 'AUD';
      if (storedCurrency) {
        console.log("Loading stored currency from localStorage:", storedCurrency); // Debug log
        setCurrentCurrency(storedCurrency);
      }
    }
  }, []);

  const contextValue = {
    currentCurrency,
    exchangeRateAUDtoPKR,
    setCurrency,
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
