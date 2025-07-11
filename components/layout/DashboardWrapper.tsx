// src/components/layout/DashboardWrapper.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import MobileHeader from '@/components/layout/MobileHeader';
import type { LayoutUserData } from '@/lib/types'; // Assuming shared types file
import DashboardFooter from '@/components/layout/DashboardFooter';
import { updateUserActivity } from '@/app/actions/userActions'; // Import the new action


interface DashboardWrapperProps {
  children: React.ReactNode;
  user: LayoutUserData;
}

export default function DashboardWrapper({ user, children }: DashboardWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);


  // --- NEW: Periodically update user activity for teachers ---
  useEffect(() => {
    // Only run this logic if the logged-in user is a teacher
    if (user?.role === 'TEACHER') {
      // Update immediately on load
      updateUserActivity();

      // Then, update every 3 minutes
      const interval = setInterval(() => {
        console.log("Updating teacher activity timestamp...");
        updateUserActivity();
      }, 3 * 60 * 1000); // 180000 milliseconds

      // Clean up the interval when the component unmounts
      return () => clearInterval(interval);
    }
  }, [user?.role]); // Rerun if the user object changes


  return (
    // The root container for the entire dashboard view
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* The Sidebar component manages its own mobile vs. desktop visibility */}
      <DashboardSidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* This container holds the mobile header and main content */}
      {/* FIX: On large screens, add a left margin equal to the sidebar's width (w-64 = 16rem) */}
      <div className="flex flex-col flex-1 w-full lg:ml-64">
        {/* The Mobile Header is only visible on small screens */}
        <MobileHeader
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        {/*
          FIX:
          - 'pt-14' pushes mobile content below the 'h-14' MobileHeader.
          - 'lg:pt-8' resets the padding for desktop view.
          - 'p-4' and 'lg:p-8' provide consistent padding on all sides.
        */}
        <main className="flex-1 p-4 pt-20 lg:pt-8 lg:p-8">
          {children}
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
