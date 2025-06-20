// components/Footer.tsx
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full border-t bg-gray-100 dark:bg-gray-800 py-8">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:px-6 md:flex-row">
        {/* Logo/App Name */}
        <Link href="/" className="text-lg font-bold">
          Learn<span className='text-[#92E3A9]'>9ja</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/about" className="hover:underline">
            About Us
          </Link>
          <Link href="/how-it-works" className="hover:underline">
            How it Works
          </Link>
           <Link href="/features" className="hover:underline">
            Features
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © 2025 Learn9ja. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;