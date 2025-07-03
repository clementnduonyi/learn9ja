'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/NavBar';
import type { LayoutUserData } from '@/lib/types';


export default function NavbarWrapper({ user }: { user: LayoutUserData | null }) {
  const pathname = usePathname();

  // Define routes where navbar should be hidden on mobile
  const mobileHiddenRoutes = ['/dashboard', '/profile'];
  const shouldHideOnMobile = mobileHiddenRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Pass responsive className directly to Navbar
  return (
    <Navbar
      user={user}
      className={shouldHideOnMobile ? 'hidden lg:block' : ''}
    />
  );
}