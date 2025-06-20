// src/components/layout/ResponsiveDashboardWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import type { LayoutUserData } from '@/app/dashboard/layout';

interface ResponsiveDashboardWrapperProps {
    user: LayoutUserData;
    children: React.ReactNode;
}

export default function ResponsiveDashboardWrapper({
    user,
    children,
}: ResponsiveDashboardWrapperProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if screen is mobile size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMobile && sidebarOpen) {
                const sidebar = document.getElementById('dashboard-sidebar');
                const hamburger = document.getElementById('hamburger-button');
                
                if (sidebar && !sidebar.contains(event.target as Node) && 
                    hamburger && !hamburger.contains(event.target as Node)) {
                    setSidebarOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, sidebarOpen]);

    // Close sidebar on route change for mobile
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [isMobile]);

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Component */}
            <div
                id="dashboard-sidebar"
                className={`
                    ${isMobile 
                        ? `fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${
                            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                          }`
                        : 'relative'
                    }
                `}
            >
                <DashboardSidebar 
                    user={user} 
                    onClose={() => setSidebarOpen(false)}
                    isMobile={isMobile}
                />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header with Hamburger */}
                <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                    <button
                        id="hamburger-button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Toggle sidebar"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {sidebarOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                    
                    {/* Optional: Add logo or title for mobile 
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>*/}
                    
                    {/* User Avatar on Mobile Header 
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>*/}
                </div>

                {/* Page Content */}
                <div className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}