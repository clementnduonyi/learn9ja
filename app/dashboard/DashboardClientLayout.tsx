// src/app/dashboard/DashboardClientLayout.tsx
'use client'; // This component MUST be a client component to use state and hooks

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import MobileHeader from '@/components/layout/MobileHeader';
// Assuming the LayoutUserData type is now in a shared types file
import type { LayoutUserData } from '@/lib/types';

// Define the props this client component expects to receive from its server parent
interface DashboardClientLayoutProps {
  children: React.ReactNode;
  user: LayoutUserData;
}

export default function DashboardClientLayout({ user, children }: DashboardClientLayoutProps) {
  // State to manage the sidebar's visibility on mobile screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Effect to automatically close the sidebar when the user navigates to a new page
  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* The Sidebar component receives props to control its state */}
      <DashboardSidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1">
        {/* The Mobile Header component receives a function to open the sidebar */}
        <MobileHeader
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        {/* The main content area where the page itself will be rendered */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
