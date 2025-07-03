import Link from 'next/link';
import { Twitter, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-white pt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand and Description */}
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-learn9ja">
              Learn9ja
            </Link>
            <p className="mt-4 text-sm text-gray-500 max-w-md">
              Your trusted partner in academic success. Connecting students with expert teachers for personalized, one-on-one learning experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/find-teachers" className="text-gray-600 hover:text-learn9ja">Find a Teacher</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-learn9ja">About Us</Link></li>
              <li><Link href="/pricing" className="text-gray-600 hover:text-learn9ja">Pricing</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-gray-800">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/terms" className="text-gray-600 hover:text-learn9ja">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-learn9ja">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between border-t pt-6 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Learn9ja. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-4 sm:mt-0">
            <Link href="#" className="text-gray-500 hover:text-learn9ja">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-500 hover:text-learn9ja">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-500 hover:text-learn9ja">
              <Instagram className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;