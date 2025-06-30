import Head from 'next/head';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact Smartoria | Customer Support & Inquiries</title>
        <meta name="description" content="Contact Smartoria for customer support, product inquiries, or feedback. Reach us via email, phone, or our online contact form. We're here to help you with all your mobile accessory and electronics needs." />
        <meta name="keywords" content="Contact Smartoria, customer support, help, mobile accessories, electronics, Pakistan, email, phone" />
      </Head>
      <section className="relative w-full min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center py-16 px-4">
        <div className="max-w-4xl w-full mx-auto bg-white/90 rounded-2xl shadow-xl p-8 md:p-12 flex flex-col md:flex-row gap-10 md:gap-16 items-center">
          {/* Left: Contact Info */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2">Contact Us</h1>
            <p className="text-lg text-gray-700 mb-4">
              Have a question, feedback, or need support? <strong>Smartoria</strong> is here to help! Reach out to us using the details below or fill out our contact form. Our team responds quickly to all customer inquiries.
            </p>
            <div className="space-y-2 text-base text-gray-800">
              <div>
                <span className="font-semibold">Email:</span> <a href="mailto:support@smartoria.com" className="text-blue-700 hover:underline">support@smartoria.com</a>
              </div>
              <div>
                <span className="font-semibold">Phone:</span> <a href="tel:+923001234567" className="text-blue-700 hover:underline">+92 300 1234567</a>
              </div>
              <div>
                <span className="font-semibold">Address:</span> Smartoria HQ, Main Boulevard, Lahore, Pakistan
              </div>
            </div>
          </div>
          {/* Right: Contact Form */}
          <form className="w-full md:w-1/2 bg-blue-50/80 rounded-xl shadow p-6 flex flex-col gap-4" aria-label="Contact form">
            <input type="text" placeholder="Your Name" className="border border-blue-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            <input type="email" placeholder="Your Email" className="border border-blue-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            <textarea placeholder="Your Message" className="border border-blue-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" rows={4} required></textarea>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition">Send Message</button>
          </form>
        </div>
      </section>
    </>
  );
}
