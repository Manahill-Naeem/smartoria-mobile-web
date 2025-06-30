import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white pt-10 pb-4 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo & Newsletter */}
        <div>
          <div className="mb-6">
            {/* Smartoria logo image, update path if needed */}
            <Image
              src="/Smartoria_logo.png"
              alt="Smartoria Logo"
              width={600}
              height={180}
              className="h-24 w-auto mb-2 object-contain"
            />
          </div>
          <div className="mb-6">
            <p className="font-semibold mb-2">Sign up for our newsletter</p>
            <form className="flex">
              <input type="email" placeholder="E-mail" className="bg-neutral-950 border border-neutral-800 rounded-l px-4 py-2 w-full text-white placeholder:text-neutral-400 focus:outline-none" />
              <button type="submit" className="bg-neutral-800 rounded-r px-4 flex items-center justify-center hover:bg-neutral-700">
                <span>&#8594;</span>
              </button>
            </form>
          </div>
          <div className="flex space-x-4 mt-8">
            <a href="#" aria-label="Facebook" className="hover:text-neutral-400"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H6v4h4v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            <a href="#" aria-label="Instagram" className="hover:text-neutral-400"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg></a>
          </div>
        </div>

        {/* About & Legal */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-200">Company</h3>
          <div className="flex flex-col space-y-2">
            <Link href="#" className="hover:text-neutral-400">About</Link>
            <Link href="#" className="hover:text-neutral-400">Contact</Link>
            <Link href="#" className="hover:text-neutral-400">Privacy Policy</Link>
            <Link href="#" className="hover:text-neutral-400">Terms of Use</Link>
          </div>
        </div>

        {/* Learn & Support */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-200">Learn & Support</h3>
          <div className="flex flex-col space-y-2">
            <Link href="#" className="hover:text-neutral-400">User Manuals</Link>
            <Link href="#" className="hover:text-neutral-400">FAQs</Link>
            <Link href="#" className="hover:text-neutral-400">Warranty</Link>
          </div>
        </div>

        {/* Brands & Categories */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-200">Categories</h3>
          <div className="flex flex-col space-y-2">
            <Link href="#" className="hover:text-neutral-400">Smartoria Brands</Link>
            <Link href="#" className="hover:text-neutral-400">Audio</Link>
            <Link href="#" className="hover:text-neutral-400">Cables</Link>
            <Link href="#" className="hover:text-neutral-400">Content Creation</Link>
            <Link href="#" className="hover:text-neutral-400">Gaming</Link>
            <Link href="#" className="hover:text-neutral-400">IT & Mobile Accessories</Link>
            <Link href="#" className="hover:text-neutral-400">Lighting</Link>
            <Link href="#" className="hover:text-neutral-400">Mounts & Brackets</Link>
            <Link href="#" className="hover:text-neutral-400">Power Solutions</Link>
            <Link href="#" className="hover:text-neutral-400">TV Antennas</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 border-t border-neutral-800 pt-4 text-sm text-neutral-400 flex flex-col md:flex-row justify-between items-center">
        <span>© 2025, Smartoria</span>
      </div>
    </footer>
  );
}
