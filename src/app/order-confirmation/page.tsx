// app/order-confirmation/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react'; // Removed useState

// New ConfettiEffect Component
function ConfettiEffect() {
  useEffect(() => {
    const confettiColors = ['#fde047', '#fb7185', '#60a5fa', '#34d399'];
    const confettiElements: HTMLDivElement[] = [];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      document.body.appendChild(confetti);
      confettiElements.push(confetti);
    }

    // Remove confetti after some time
    const timer = setTimeout(() => {
      confettiElements.forEach(c => c.remove());
    }, 5000);

    // Cleanup function to remove confetti if the component unmounts early
    return () => {
      clearTimeout(timer);
      confettiElements.forEach(c => c.remove());
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    // Confetti CSS for basic animation
    <style jsx global>{`
      .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        opacity: 0;
        transform: translateY(0) rotateZ(0deg);
        animation: confetti-fall 3s ease-out forwards;
        z-index: 9999;
      }

      @keyframes confetti-fall {
        0% {
          opacity: 1;
          transform: translateY(-100vh) rotateZ(0deg);
        }
        100% {
          opacity: 0;
          transform: translateY(100vh) rotateZ(720deg);
        }
      }
    `}</style>
  );
}


export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId'); // Get orderId from URL query parameter

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {orderId && <ConfettiEffect />} {/* Conditionally render ConfettiEffect */}

      <div className="bg-white p-10 rounded-lg shadow-xl text-center max-w-lg w-full transform transition-all duration-300 scale-95 hover:scale-100">
        <svg
          className="mx-auto text-green-500 w-24 h-24 mb-6 animate-bounce"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true" // Decorative icon
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Order Successful!</h1>
        <p className="text-xl text-gray-700 mb-6">Thank you for your order.</p>
        {orderId && (
          <p className="text-lg text-gray-600 mb-6">Your Order ID is: <span className="font-mono bg-gray-100 px-3 py-1 rounded-md text-blue-700 select-all">{orderId}</span></p>
        )}
        <p className="text-md text-gray-500 mb-8">You will receive a confirmation email shortly regarding your order status.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
          aria-label="Back to Homepage"
        >
          Back to Homepage
        </button>
      </div>
    </div>
  );
}