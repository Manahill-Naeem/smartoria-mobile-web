'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCurrency } from '@/context/CurrencyContext'; // Assuming this path is correct
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';

// Categories array (assuming it's still the same)
const categories = [
    {
        name: 'Audio',
        sub: [
            // { name: 'All Audio', href: '/audio/all-audio' },
            { name: 'Liquid Ears', href: '/audio/liquid-ears' },
            { name: 'Headphones', href: '/audio/headphones' },
            { name: 'Speakers', href: '/audio/speakers' },
        ],
    },
    {
        name: 'Cables',
        sub: [
            // { name: 'All Cables', //href: '/cables' },
            { name: 'HDMI', href: '/cables/hdmi' },
            { name: 'USB', href: '/cables/usb' },
            { name: 'Lightning', href: '/cables/lightning' },
        ],
    },
    { name: 'Content Creation', sub: [] },
    { name: 'Gaming', sub: [] },
    { name: 'IT & Mobile Accessories', sub: [] },
];

// CurrencySwitcher component (make sure this is present and correct)
// Added an isMobile prop to allow for conditional styling
function CurrencySwitcher({ isMobile = false }) {
    const { currentCurrency, setCurrency, loadingRates, ratesError } = useCurrency();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedCurrency = localStorage.getItem('selectedCurrency') as 'PKR' | 'AUD';
            if (storedCurrency && storedCurrency !== currentCurrency) {
                setCurrency(storedCurrency);
            }
        }
    }, [currentCurrency, setCurrency]);

    return (
        <div className={`flex items-center bg-neutral-800 rounded-lg shadow-inner ${isMobile ? 'px-2 py-1' : 'px-3 py-1.5'}`}>
            <span className={`text-white ${isMobile ? 'text-xs' : 'text-sm'} mr-1 font-medium`}>Currency:</span>
            <select
                value={currentCurrency}
                onChange={e => setCurrency(e.target.value as 'PKR' | 'AUD')}
                className={`bg-neutral-800 text-white border-none focus:ring-1 focus:ring-blue-500 focus:outline-none ${isMobile ? 'text-xs' : 'text-sm'} font-semibold cursor-pointer py-0.5 rounded-md`}
                disabled={loadingRates}
            >
                <option value="PKR">PKR</option>
                <option value="AUD">AUD</option>
            </select>
            {loadingRates && (
                <svg className="animate-spin h-4 w-4 ml-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
            )}
            {ratesError && (
                <span className="ml-2 text-red-300 text-xs" title={ratesError}>!</span>
            )}
        </div>
    );
}

// Cart Modal Component (make sure this is present and correct)
function CartModal({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartLoading, cartError, subtotal, totalItems, userId, isAuthReady } = useCart();
    const { currentCurrency, exchangeRateAUDtoPKR, loadingRates, ratesError } = useCurrency();

    const getConvertedPrice = (originalPrice: number) => {
        if (loadingRates || exchangeRateAUDtoPKR === null) {
            return `Loading...`;
        }
        if (ratesError) {
            return `Error!`;
        }
        const numericPrice = Number(originalPrice);
        if (isNaN(numericPrice)) {
            console.error("Invalid price for conversion:", originalPrice);
            return "N/A";
        }

        if (currentCurrency === 'PKR') {
            return numericPrice.toFixed(2);
        } else if (currentCurrency === 'AUD') {
            if (exchangeRateAUDtoPKR === 0) {
                console.error("Exchange rate for AUD to PKR is zero, cannot convert.");
                return "N/A";
            }
            const priceInAUD = numericPrice / exchangeRateAUDtoPKR;
            return priceInAUD.toFixed(2);
        }
        return numericPrice.toFixed(2);
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

    const handleProceedToCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative p-6">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    aria-label="Close cart"
                >
                    &times;
                </button>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Cart ({totalItems} items)</h2>

                {!isAuthReady ? (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                        <p className="font-bold">Loading Cart...</p>
                        <p>Establishing secure connection for your cart. Please wait.</p>
                    </div>
                ) : (
                    cartError ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                            <p className="font-bold">Error loading cart!</p>
                            <p>{cartError}</p>
                        </div>
                    ) : (
                        cartLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                                <p className="ml-3 text-lg text-gray-700">Loading cart items...</p>
                            </div>
                        ) : (
                            cartItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-600 text-lg">
                                    Your cart is empty. Start shopping!
                                </div>
                            ) : (
                                <>
                                    {userId && (
                                        <p className="text-sm text-gray-500 mb-4 text-center">Your Cart ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{userId}</span></p>
                                    )}
                                    <div className="space-y-4 mb-6">
                                        {cartItems.map((item) => (
                                            <div key={item.productId} className="flex items-center border-b pb-4 last:border-b-0 last:pb-0">
                                                <Image
                                                    src={item.image || "https://placehold.co/80x60/EEEEEE/333333?text=No+Image"}
                                                    alt={item.title}
                                                    width={80}
                                                    height={60}
                                                    className="object-cover rounded-md mr-4"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Price: {displayCurrencySymbol(currentCurrency)}{getConvertedPrice(item.price)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors"
                                                        disabled={cartLoading || item.quantity <= 1}
                                                        aria-label={`Decrease quantity of ${item.title}`}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold text-lg">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors"
                                                        disabled={cartLoading}
                                                        aria-label={`Increase quantity of ${item.title}`}
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(item.productId)}
                                                        className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                                                        disabled={cartLoading}
                                                        aria-label={`Remove ${item.title} from cart`}
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center text-2xl font-bold border-t pt-4">
                                        <span>Subtotal:</span>
                                        <span>
                                            {displayCurrencySymbol(currentCurrency)}{calculateConvertedSubtotal()}
                                        </span>
                                    </div>
                                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={handleProceedToCheckout}
                                            className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-md shadow-md hover:bg-blue-700 transition duration-200 text-lg"
                                            disabled={cartLoading || cartItems.length === 0}
                                        >
                                            Proceed to Checkout
                                        </button>
                                        <button
                                            onClick={() => { if(confirm("Are you sure you want to clear your cart?")) clearCart(); }}
                                            className="flex-1 bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-md shadow-md hover:bg-gray-400 transition duration-200 text-lg"
                                            disabled={cartLoading}
                                        >
                                            Clear Cart
                                        </button>
                                    </div>
                                </>
                            )
                        )
                    )
                )}
            </div>
        </div>
    );
}


export default function Navbar() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { totalItems, cartLoading } = useCart();
    const router = useRouter(); // This line is correct and necessary for router.push

    return (
        <nav className="bg-neutral-900 sticky top-0 z-50 shadow-lg">
            {/* Desktop Navbar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <Link href="/">
                        <Image
                            src="/Smartoria_logo.png"
                            alt="Smartoria Logo"
                            width={600}
                            height={180}
                            className="h-32 w-auto object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* Navigation Links (Desktop) */}
                <div className="hidden md:flex space-x-8 items-center">
                    <Link href="/" className="font-semibold text-white hover:text-gray-300 transition-colors duration-200">
                        Home
                    </Link>
                    {/* Categories Dropdown */}
                    <div className="relative group">
                        <button className="font-semibold flex items-center text-white hover:text-gray-300 focus:outline-none transition-colors duration-200">
                            Categories <span className="ml-1 text-gray-400">▼</span>
                        </button>
                        <div className="absolute left-0 top-full mt-2 bg-neutral-900 rounded-lg shadow-xl py-2 min-w-[220px] opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-300 transform scale-95 group-hover:scale-100 z-30 origin-top-left">
                            {categories.map(cat => (
                                <div key={cat.name} className="relative group/item">
                                    <button className="w-full text-left px-6 py-2 text-white hover:bg-neutral-800 font-medium flex items-center justify-between transition-colors duration-200">
                                        {cat.name}
                                        {cat.sub.length > 0 && <span className="ml-2 text-gray-400">&gt;</span>}
                                    </button>
                                    {/* Submenu */}
                                    {cat.sub.length > 0 && (
                                        <div className="absolute left-full top-0 mt-0 bg-neutral-900 rounded-lg shadow-xl py-2 min-w-[180px] opacity-0 group-hover/item:opacity-100 group-hover/item:visible invisible transition-all duration-300 transform scale-95 group-hover/item:scale-100 z-40 origin-top-left">
                                            {cat.sub.map(sub => (
                                                <Link
                                                    key={sub.name}
                                                    href={sub.href}
                                                    className="block px-6 py-2 text-white hover:bg-neutral-800 whitespace-nowrap transition-colors duration-200"
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <Link href="/about" className="font-semibold text-white hover:text-gray-300 transition-colors duration-200">
                        About
                    </Link>
                    <Link href="/contact" className="font-semibold text-white hover:text-gray-300 transition-colors duration-200">
                        Contact
                    </Link>
                </div>

                {/* Icons and Currency Switcher (Desktop) */}
                <div className="hidden md:flex items-center space-x-6">
                    {/* Currency Converter */}
                    <div>
                        <CurrencySwitcher /> {/* UNCOMMENTED HERE */}
                    </div>
                    {/* Search Icon */}
                    <button className="text-white hover:text-gray-300 transition-colors duration-200" aria-label="Search">
                        <svg
                            width="22"
                            height="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                    {/* Cart Icon */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative text-white hover:text-gray-300 transition-colors duration-200"
                        aria-label={`Cart with ${totalItems} items`}
                    >
                        <svg
                            width="22"
                            height="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {!cartLoading && totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                        {cartLoading && (
                            <svg className="animate-spin absolute -top-2 -right-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Icons and Hamburger (Visible on Mobile) */}
                {/* Changed space-x-4 to gap-x-2 and added flex-nowrap to prevent wrapping */}
                <div className="md:hidden flex items-center gap-x-2 flex-nowrap overflow-x-auto">
                    {/* Currency Converter for Mobile - Pass isMobile prop */}
                    <div className="flex-shrink-0">
                        <CurrencySwitcher isMobile={true} />
                    </div>
                    {/* Search Icon for Mobile */}
                    <button className="text-white hover:text-gray-300 transition-colors duration-200 flex-shrink-0" aria-label="Search">
                        <svg
                            width="22"
                            height="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                    {/* Cart Icon for Mobile */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative text-white hover:text-gray-300 transition-colors duration-200 flex-shrink-0"
                        aria-label={`Cart with ${totalItems} items`}
                    >
                        <svg
                            width="22"
                            height="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {!cartLoading && totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                        {cartLoading && (
                            <svg className="animate-spin absolute -top-2 -right-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                        )}
                    </button>
                    {/* Mobile Menu Button */}
                    <button
                        className="flex items-center px-2 py-1 border rounded text-white border-neutral-300 flex-shrink-0"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-neutral-900 border-t border-neutral-700 px-4 pb-4">
                    <div className="flex flex-col gap-2 mt-2">
                        <Link href="/" className="text-white hover:text-blue-400 font-medium" onClick={() => setMenuOpen(false)}>Home</Link>
                        {/* Categories Dropdown for Mobile */}
                        <div className="relative">
                            <button
                                className="w-full text-left py-2 text-white hover:text-blue-400 font-medium flex items-center justify-between"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMenuOpen(false);
                                    router.push('/categories');
                                }}
                            >
                                Categories <span className="ml-1 text-gray-400">▼</span>
                            </button>
                             <div className="pl-4 border-l border-neutral-700">
                                {categories.map(cat => (
                                    <div key={cat.name}>
                                        <Link
                                            href={cat.sub.length > 0 ? cat.sub[0].href : '#'} // Link to first sub or '#'
                                            className="block py-2 text-white hover:text-blue-400 font-medium"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            {cat.name}
                                        </Link>
                                        {cat.sub.length > 0 && (
                                            <div className="pl-4">
                                                {cat.sub.map(sub => (
                                                    <Link
                                                        key={sub.name}
                                                        href={sub.href}
                                                        className="block py-1 text-sm text-gray-300 hover:text-blue-400"
                                                        onClick={() => setMenuOpen(false)}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Link href="/about" className="text-white hover:text-blue-400 font-medium" onClick={() => setMenuOpen(false)}>About</Link>
                        <Link href="/contact" className="text-white hover:text-blue-400 font-medium" onClick={() => setMenuOpen(false)}>Contact</Link>
                    </div>
                </div>
            )}
            {isCartOpen && <CartModal onClose={() => setIsCartOpen(false)} />}
        </nav>
    );
}