// src/components/layout/MobileHeader.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';
import type { LayoutUserData } from '@/lib/types'; // Import user data type
import LogoutButton from '@/components/LogoutButton';

interface MobileHeaderProps {
  onMenuClick: () => void; // Function to open the sidebar
  user: LayoutUserData;
}

export default function MobileHeader({ onMenuClick, user }: MobileHeaderProps) {
  return (
    // This header is hidden on large screens and up
    <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onMenuClick}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      
      <Link href="/" className="flex-1">
        <h1 className="font-bold text-lg text-learn9ja">Learn9ja</h1>
      </Link>

      <Link
        href="/dashboard/notifications"
        className="relative rounded-full p-1 text-gray-600 hover:text-learn9ja focus:outline-none"
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-5 w-5" />
        {user?.unreadNotificationCount > 0 && (
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </Link>
      <LogoutButton />
    </header>
  );
}