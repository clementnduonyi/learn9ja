
// /components/layout/Navbar.tsx
'use client'; 

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Bell, Menu, X } from 'lucide-react';
import type { LayoutUserData } from '@/lib/types'; // Use a shared user data type
import type { Gender } from '@prisma/client';
import LogoutButton from './LogoutButton';




// Helper function
function getDisplayAvatar(avatarUrl: string | null | undefined, gender: Gender | null | undefined): string {
    if (avatarUrl) return avatarUrl;
    switch (gender) { case 'MALE': return '/avatars/default-male.svg'; case 'FEMALE': return '/avatars/default-female.svg'; default: return '/avatars/default-other.svg'; }
}

export default function Navbar({ user, className = '' }: { user: LayoutUserData | null, className?: string }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    

    const displayAvatar = getDisplayAvatar(user?.avatarUrl, user?.gender);

    return (
        <nav className={`bg-white shadow-md fixed top-0 left-0 w-full z-20 ${className}`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold text-learn9ja">
                      Learn9ja
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden lg:flex items-center space-x-6">
                        <Link href="/find-teachers" className="text-gray-600 hover:text-learn9ja">Find a Teacher</Link>
                        <Link href="/pricing" className="text-gray-600 hover:text-learn9ja">Pricing</Link>
                        <Link href="/about" className="text-gray-600 hover:text-learn9ja">About Us</Link>
                    </div>

                    {/* Auth Buttons & Icons */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-learn9ja">Dashboard</Link>
                                <Link href="/dashboard/notifications" className="relative p-1 rounded-full text-gray-600   hover:text-learn9ja"
                                >
                                    <Bell className="h-6 w-6" />
                                    {user.unreadNotificationCount > 0 && <span className="absolute top-0 right-0 block h-4 w-4 text-xs flex items-center justify-center font-bold rounded-full text-white bg-red-500"
                                    >
                                      {user.unreadNotificationCount > 9 ? '9+' : user.unreadNotificationCount}
                                    </span>
                                      }
                                    </Link>
                                <Link href="/profile/me">
                                    <Image src={displayAvatar} alt="User Avatar" width={32} height={32} className="rounded-full" />
                                </Link>
                                 <LogoutButton />
                            </>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                  <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild size="sm" className="bg-learn9ja hover:bg-learn9ja/90"
                                >
                                  <Link href="/signup">Sign Up</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} variant="ghost" size="icon">
                            {isMobileMenuOpen ? <X /> : <Menu />}
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4">
                    <div className="container mx-auto px-4 space-y-3">
                        <Link href="/find-teachers" className="block text-gray-600 hover:text-learn9ja">Find a Teacher</Link>
                        <Link href="/pricing" className="block text-gray-600 hover:text-learn9ja">Pricing</Link>
                        <Link href="/about" className="block text-gray-600 hover:text-learn9ja">About Us</Link>
                        <div className="border-t pt-4 mt-4 space-y-3">
                            {user ? (
                                <>
                                    <Link href="/dashboard" className="block font-medium text-gray-800">Dashboard</Link>
                                    <Link href="/profile/me" className="block font-medium text-gray-800">My Profile</Link>
                                    <LogoutButton />
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="block font-medium text-gray-800">Login</Link>
                                    <Button asChild size="sm" className="w-full bg-learn9ja hover:bg-learn9ja/90"><Link href="/signup">Sign Up</Link></Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

