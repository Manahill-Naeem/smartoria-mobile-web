import Head from 'next/head';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Smartoria | Premium Mobile Accessories & Electronics</title>
        <meta name="description" content="Learn about Smartoria, your trusted source for premium mobile accessories, electronics, and tech gadgets in Pakistan. Discover our mission, values, and commitment to quality and customer service." />
        <meta name="keywords" content="About Smartoria, mobile accessories, electronics, tech store, Pakistan, quality, customer service" />
      </Head>
      <div className="min-h-[80vh] w-full py-12 px-4">
        <h1 className="text-4xl font-extrabold mb-8 text-blue-900">About Smartoria</h1>
        <p className="mb-4 text-lg text-gray-700">
          <strong>Smartoria</strong> is Pakistan&apos;s trusted online store for premium mobile accessories and electronics. Our mission is to empower your digital lifestyle with the latest, most reliable, and stylish products—delivered with exceptional customer service.
        </p>
        <p className="mb-4 text-lg text-gray-700">
          Since 2025, Smartoria has been the go-to destination for tech enthusiasts and everyday users alike. We offer a curated selection of genuine products, including chargers, cables, headphones, power banks, and the newest gadgets—all at competitive prices and with fast nationwide delivery.
        </p>
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2 text-blue-800">Why choose Smartoria?</h2>
          <ul className="list-disc pl-8 text-gray-700 space-y-1">
            <li>100% original and high-quality products</li>
            <li>Wide range of mobile accessories and electronics</li>
            <li>Secure online shopping experience</li>
            <li>Fast shipping across Pakistan</li>
            <li>Dedicated customer support</li>
          </ul>
        </div>
        <p className="text-lg text-gray-700">
          Thank you for choosing Smartoria. We look forward to serving you and making your tech experience better every day!
        </p>
      </div>
    </>
  );
}
