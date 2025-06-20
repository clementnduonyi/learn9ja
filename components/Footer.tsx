
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-learn9ja/5 border-t border-gray-100">
      <div className="container mx-auhref px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-learn9ja">Learn9ja</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 max-w-xs">
              Connecting Nigerian students with qualified teachers for personalized online learning experiences.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">For Students</h3>
            <ul className="space-y-3">
              <li><Link href="/find-teachers" className="text-sm text-gray-600 hover:text-learn9ja">Find Teachers</Link></li>
              <li><Link href="/pricing" className="text-sm text-gray-600 hover:text-learn9ja">Pricing</Link></li>
              <li><Link href="/how-it-works" className="text-sm text-gray-600 hover:text-learn9ja">How It Works</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">For Teachers</h3>
            <ul className="space-y-3">
              <li><Link href="/signup" className="text-sm text-gray-600 hover:text-learn9ja">Become a Teacher</Link></li>
              <li><Link href="/pricing" className="text-sm text-gray-600 hover:text-learn9ja">Premium Benefits</Link></li>
              <li><Link href="/" className="text-sm text-gray-600 hover:text-learn9ja">Resources</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-gray-600 hover:text-learn9ja">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-600 hover:text-learn9ja">Contact</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-600 hover:text-learn9ja">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-learn9ja">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8">
          <p className="text-sm text-center text-gray-600">
            © {new Date().getFullYear()} Learn9ja. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
