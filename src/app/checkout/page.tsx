// app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Navigation ke liye
import { useCart } from '@/context/CartContext'; // Cart context se items lene ke liye
import { useCurrency } from '@/context/CurrencyContext'; // Currency conversion ke liye

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, totalItems, clearCart, cartLoading, cartError, userId, isAuthReady } = useCart();
  const { currentCurrency, exchangeRateAUDtoPKR, loadingRates, ratesError } = useCurrency();

  // Shipping details ke form ke liye state
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });

  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderPlacementError, setOrderPlacementError] = useState<string | null>(null);
  const [orderPlacedSuccessfully, setOrderPlacedSuccessfully] = useState(false); // Naya state order ki kamyab placement track karne ke liye
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cashOnDelivery'); // Payment method state

  // Cart empty hone par ya auth errors par redirect karne ke liye useEffect
  useEffect(() => {
    // Sirf tab redirect karein jab cart empty ho AUR abhi koi order place na hua ho
    if (isAuthReady && !cartLoading && cartItems.length === 0 && !orderPlacedSuccessfully) {
      const timer = setTimeout(() => {
        if (cartItems.length === 0 && !orderPlacedSuccessfully) {
          // Delay ke baad dobara check karein
          // alert() ki jagah custom modal istemal karein
          const modalDiv = document.createElement('div');
          modalDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50';
          modalDiv.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-xl text-center">
              <h3 class="text-xl font-bold mb-4">Aapki cart khali hai.</h3>
              <p class="mb-6">Checkout karne se pehle items add karein.</p>
              <button id="modal-ok-button" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">OK</button>
            </div>
          `;
          document.body.appendChild(modalDiv);

          document.getElementById('modal-ok-button')?.addEventListener('click', () => {
            document.body.removeChild(modalDiv);
            router.push('/'); // Homepage par redirect karein
          });
        }
      }, 500); // 0.5 second ka delay
      return () => clearTimeout(timer);
    }
    if (cartError) {
      // alert() ki jagah custom modal istemal karein
      const modalDiv = document.createElement('div');
      modalDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50';
      modalDiv.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-xl text-center">
          <h3 class="text-xl font-bold mb-4">Cart load karne mein ghalti:</h3>
          <p class="mb-6">${cartError}. Dobara koshish karein.</p>
          <button id="modal-ok-button" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">OK</button>
        </div>
      `;
      document.body.appendChild(modalDiv);

      document.getElementById('modal-ok-button')?.addEventListener('click', () => {
        document.body.removeChild(modalDiv);
        router.push('/'); // Homepage par redirect karein
      });
    }
  }, [cartItems, cartLoading, isAuthReady, cartError, router, orderPlacedSuccessfully]); // orderPlacedSuccessfully ko dependencies mein shamil karein

  // Form input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  // Price conversion logic (ProductCard se copy kiya gaya)
  const getConvertedPrice = (originalPrice: number) => {
    if (loadingRates || exchangeRateAUDtoPKR === null) {
      return `Load ho raha hai...`;
    }
    if (ratesError) {
      return `Ghalti!`;
    }

    if (currentCurrency === 'PKR') {
      return originalPrice.toFixed(2);
    } else if (currentCurrency === 'AUD') {
      if (exchangeRateAUDtoPKR === 0) {
        console.error("AUD se PKR exchange rate zero hai, convert nahin kiya ja sakta.");
        return "N/A";
      }
      const priceInAUD = originalPrice / exchangeRateAUDtoPKR;
      return priceInAUD.toFixed(2);
    }
    return originalPrice.toFixed(2);
  };

  const displayCurrencySymbol = (currencyCode: 'PKR' | 'AUD') => {
    switch (currencyCode) {
      case 'PKR': return 'PKR ';
      case 'AUD': return 'AUD ';
      default: return '';
    }
  };

  const calculateConvertedSubtotal = () => {
    if (loadingRates || ratesError || exchangeRateAUDtoPKR === null) {
      return 'N/A';
    }
    const convertedSub = currentCurrency === 'PKR' ? subtotal : (subtotal / exchangeRateAUDtoPKR);
    return convertedSub.toFixed(2);
  };

  // Order place karne ka handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault(); // Default form submission ko rokein
    setOrderPlacementError(null);
    setIsProcessingOrder(true);

    if (!isAuthReady || !userId) {
      setOrderPlacementError("Cart load ho raha hai ya user authenticated nahin hai. Intezaar karein.");
      setIsProcessingOrder(false);
      return;
    }

    if (cartItems.length === 0) {
      setOrderPlacementError("Aapki cart khali hai.");
      setIsProcessingOrder(false);
      return;
    }

    // Form ki bunyadi validation
    const { fullName, email, phone, address, city, zipCode, country } = shippingDetails;
    if (!fullName || !email || !phone || !address || !city || !zipCode || !country) {
      setOrderPlacementError("Baraye meherbani, sabhi shipping details fill karein.");
      setIsProcessingOrder(false);
      return;
    }

    try {
      // Order details object
      const orderData = {
        userId: userId,
        items: cartItems.map(item => ({ // Cart items ka snapshot
          productId: item.productId,
          title: item.title,
          image: item.image,
          price: item.price, // Asal qeemat (PKR)
          quantity: item.quantity
        })),
        totalAmountPKR: subtotal, // Asal currency (PKR) mein total amount
        totalAmountConverted: parseFloat(calculateConvertedSubtotal()), // Converted amount
        currencyAtOrder: currentCurrency, // Jis currency mein order place kiya gaya
        exchangeRateAtOrder: exchangeRateAUDtoPKR, // Order ke waqt ki exchange rate
        shippingDetails: shippingDetails, // Shipping form ki details
        paymentMethod: selectedPaymentMethod, // Payment method
        orderDate: new Date().toISOString(), // Timestamp ke liye ISO string
        status: 'pending', // Order ka initial status
      };

      // Order save karne ke liye API call
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Order place karne mein nakami: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Order kamyabi se place ho gaya:', result);

      // --- Bohat Zaroori Tabdeeli: orderPlacedSuccessfully ko true karein cart clear karne se PEHLE ---
      setOrderPlacedSuccessfully(true);
      await clearCart(); // Kamyab order ke baad cart clear karein
      router.push(`/order-confirmation?orderId=${result.insertedId}`); // Confirmation page par redirect karein

    } catch (error: any) {
      console.error('Order place karne mein ghalti:', error);
      setOrderPlacementError(error.message || "Order place karne se qasir.");
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Agar cart load ho raha hai ya tayar nahin hai
  if (!isAuthReady || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="ml-3 text-lg text-gray-700">Cart load ho raha hai...</span>
      </div>
    );
  }

  // Agar cart load hone ke baad khali hai
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white py-10 px-4">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Aapki cart khali hai!</h2>
        <p className="text-gray-600">Aage badhne se pehle kuch items add karein.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
        >
          Shopping shuru karein
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Details Form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Shipping Details</h2>
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Poora Naam</label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={shippingDetails.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={shippingDetails.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={shippingDetails.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Pata</label>
                <textarea
                  name="address"
                  id="address"
                  value={shippingDetails.address}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">Sheher</label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={shippingDetails.city}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    id="zipCode"
                    value={shippingDetails.zipCode}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">Mulk</label>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    value={shippingDetails.country}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {orderPlacementError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                  <p className="font-bold">Order Mein Ghalti:</p>
                  <p>{orderPlacementError}</p>
                </div>
              )}

              {/* Payment Method Section */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Ka Tareeqa</h3>
                <div className="space-y-4">
                  {/* Cash On Delivery (COD) Option */}
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 flex items-center">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cashOnDelivery"
                      checked={selectedPaymentMethod === 'cashOnDelivery'}
                      onChange={() => setSelectedPaymentMethod('cashOnDelivery')}
                      className="form-radio text-blue-600 h-5 w-5"
                    />
                    <label htmlFor="cod" className="ml-3 text-gray-700 font-medium">Cash On Delivery (COD)</label>
                  </div>
                  <p className="text-sm text-gray-500 ml-8 -mt-3 mb-4">Aapke darwaze par delivery par pay karein.</p>

                  {/* Bank Transfer Option */}
                  {/**
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 flex items-center">
                    <input
                      type="radio"
                      id="bankTransfer"
                      name="paymentMethod"
                      value="bankTransfer"
                      checked={selectedPaymentMethod === 'bankTransfer'}
                      onChange={() => setSelectedPaymentMethod('bankTransfer')}
                      className="form-radio text-blue-600 h-5 w-5"
                    />
                    <label htmlFor="bankTransfer" className="ml-3 text-gray-700 font-medium">Bank Transfer</label>
                  </div>

                  {/* Bank Transfer Details (Conditionally Displayed) */}
                  {/* {selectedPaymentMethod === 'bankTransfer' && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md ml-8 mt-2 shadow-sm">
                      <p className="font-bold mb-2">Baraye meherbani is account mein payment transfer karein:</p>
                      <p><strong>Bank Name:</strong> ABC Bank</p>
                      <p><strong>Account Name:</strong> Smartoria Mobile Store</p>
                      <p><strong>Account Number:</strong> 1234567890</p>
                      <p><strong>IBAN:</strong> PKXXABCYYYYYYYYYYYYYYYYY</p>
                      <p className="mt-2 text-sm">Payment transfer karne ke baad, screen shot ya transaction ID hamare email par share karein: <span className="font-semibold">payment@smartoria.com</span></p>
                    </div>
                  )}
                  */}
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingOrder || !isAuthReady || cartItems.length === 0}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 ${
                  isProcessingOrder || !isAuthReady || cartItems.length === 0 ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isProcessingOrder ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : (
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                )}
                <span>{isProcessingOrder ? 'Order Process Ho Raha Hai...' : 'Order Place Karein'}</span>
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 bg-white p-8 rounded-lg shadow-md h-fit sticky top-28">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Order Ka Khulasa</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image
                      src={item.image || "https://placehold.co/60x40/EEEEEE/333333?text=No+Image"}
                      alt={item.title}
                      width={60}
                      height={40}
                      className="object-cover rounded-md mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {displayCurrencySymbol(currentCurrency)}{getConvertedPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-bold text-gray-900 mt-2">
                <span>Total:</span>
                <span>
                  {displayCurrencySymbol(currentCurrency)}{calculateConvertedSubtotal()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
