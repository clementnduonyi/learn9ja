
// /components/layout/DashboardSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { X, LayoutDashboard, UserCircle, Settings, CalendarDays, Search, ListChecks, BookUser, Bell } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import { Button } from "@/components/ui/button"
import type { LayoutUserData } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { Role } from '@prisma/client';
import { getDisplayAvatar } from '@/lib/helpers'



interface NavLink { href: string; label: string; icon: React.ElementType; roles: Role[]; isSectionLink?: boolean; }

interface DashboardSidebarProps {
    user: LayoutUserData;
    isOpen: boolean;
    onClose: () => void;
}

export default function DashboardSidebar({ user, isOpen, onClose }: DashboardSidebarProps) {
    const pathname = usePathname();
    const displayAvatar = getDisplayAvatar(user.avatarUrl, user.gender);

    const teacherDashPath = '/dashboard/teacher';
    const studentDashPath = '/dashboard/student';

    const allLinks: NavLink[] = [
        { href: teacherDashPath, label: 'Dashboard', icon: LayoutDashboard, roles: ['TEACHER'] },
        { href: studentDashPath, label: 'Dashboard', icon: LayoutDashboard, roles: ['STUDENT'] },
        { href: `${teacherDashPath}#pending-requests`, label: 'Class Requests', icon: ListChecks, roles: ['TEACHER'], isSectionLink: true },
        { href: `${teacherDashPath}#upcoming-schedule`, label: 'My Schedule', icon: CalendarDays, roles: ['TEACHER'], isSectionLink: true },
        { href: `/profile/teacher/edit`, label: 'Profile & Settings', icon: BookUser, roles: ['TEACHER'], isSectionLink: true },
        { href: '/find-teachers', label: 'Find Teacher', icon: Search, roles: ['STUDENT'] },
        { href: `${studentDashPath}#my-sessions`, label: 'My Sessions', icon: CalendarDays, roles: ['STUDENT'], isSectionLink: true },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, roles: ['STUDENT', 'TEACHER'] },
        { href: '/profile/me', label: 'View Profile', icon: UserCircle, roles: ['STUDENT', 'TEACHER'] },
        { href: '/settings', label: 'Account Settings', icon: Settings, roles: ['STUDENT', 'TEACHER'] },
    ];
    const visibleLinks = allLinks.filter(link => user.role && link.roles.includes(user.role));

    return (
        <>
            {/* Backdrop for mobile */}
            <div className={cn("fixed inset-0 bg-black/60 z-30 lg:hidden", isOpen ? "block" : "hidden")} onClick={onClose} />

            <aside className={cn(
                "fixed top-10 left-0 h-full w-64 bg-white p-4 flex flex-col  z-40 transition-transform duration-300 ease-in-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between mb-4">
                     {/*<Link href="/" className="font-bold text-xl text-learn9ja">Learn9ja</Link>*/}
                     <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close menu</span>
                     </Button>
                </div>

                <div className="flex flex-col items-center mb-6 border-b pb-4">
                    <Image src={displayAvatar} alt={user.name || 'User Avatar'} width={80} height={80} className="rounded-full mb-2 border-2 border-learn9ja bg-gray-200" />
                    <h3 className="font-semibold text-lg text-center text-gray-800">{user.name || 'User'}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className="mt-2 text-xs font-medium bg-learn9ja/10 text-learn9ja px-2 py-0.5 rounded-full capitalize">
                        {user.role?.toLowerCase()}
                    </span>
                </div>

                <nav className="flex-grow space-y-1 overflow-y-auto">
                    {visibleLinks.map((link) => {
                        const baseHref = link.href.split('#')[0];
                        const isActive = pathname === baseHref;
                        return (
                            <Link key={link.href} href={link.href} className={cn( "flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 transition-colors", isActive ? 'bg-learn9ja/10 text-learn9ja font-semibold' : 'hover:bg-gray-100 hover:text-gray-900' )}>
                                <link.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                <span>{link.label}</span>
                                {link.label === 'Notifications' && user.unreadNotificationCount > 0 && (
                                    <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-red-500 text-white">{user.unreadNotificationCount > 9 ? '9+' : user.unreadNotificationCount}</span>
                                )}
                            </Link>
                        );
                    })}
                    <div className="mt-auto pt-4 border-t"><LogoutButton /></div>
                </nav>
            </aside>
        </>
    );
}

