'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';



export default function FooterWrapper() {
  const pathname = usePathname();

  // Define routes where navbar should be hidden on mobile
  const hidFooterHere = ['/dashboard', '/profile'];
  const shouldHideFooterHere = hidFooterHere.some(route =>
    pathname.startsWith(route)
  );

  // Pass responsive className directly to Navbar
  return (
    <Footer
      className={shouldHideFooterHere ? 'hidden' : 'block'}
    />
  );
}