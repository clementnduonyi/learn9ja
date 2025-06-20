// src/components/layout/DashboardSidebar.tsx
/*'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    LayoutDashboard, UserCircle, Settings, CalendarDays, Search, ListChecks, BookUser, LogOut, Bell // Added Bell
} from 'lucide-react'; // Import icons
import LogoutButton from '@/components/LogoutButton';
import type { LayoutUserData } from '@/app/dashboard/layout'; // Import type from layout
import { cn } from '@/lib/utils'; // Optional: for combining class names
import type { Role } from '@prisma/client'; // Import Gender & Role enums
import { getDisplayAvatar } from '@/lib/helpers'

interface DashboardSidebarProps {
    user: LayoutUserData;
}


// Define Link structure - ADD isSectionLink
interface NavLink {
    href: string;
    label: string;
    icon: React.ElementType; // Icon component
    roles: Role[]; // Use imported Role enum
    isSectionLink?: boolean; // <<< Added optional property for anchor links
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
    const pathname = usePathname(); // Hook to get current path (e.g., /dashboard/teacher)
    
    // Define base dashboard paths
    const teacherDashPath = '/dashboard/teacher';
    const studentDashPath = '/dashboard/student'; // Assuming this is the student dashboard route

    // Define all possible links with updated hrefs and isSectionLink flag
    const allLinks: NavLink[] = [
        // Role-Specific Dashboard Home Links
        { href: teacherDashPath, label: 'Dashboard', icon: LayoutDashboard, roles: ['TEACHER'], isSectionLink: false },
        { href: studentDashPath, label: 'Dashboard', icon: LayoutDashboard, roles: ['STUDENT'], isSectionLink: false },

        // Teacher Section Links (point within teacher dashboard)
        { href: `${teacherDashPath}#pending-requests`, label: 'Class Requests', icon: ListChecks, roles: ['TEACHER'], isSectionLink: true },
        { href: `${teacherDashPath}#upcoming-schedule`, label: 'My Schedule', icon: CalendarDays, roles: ['TEACHER'], isSectionLink: true },
        { href: "/profile/teacher/edit", label: 'Profile Settings', icon: BookUser, roles: ['TEACHER'], isSectionLink: true },

        // Student Links
        { href: '/find-teachers', label: 'Find Teacher', icon: Search, roles: ['STUDENT'], isSectionLink: false },
        { href: `${studentDashPath}#my-sessions`, label: 'My Sessions', icon: CalendarDays, roles: ['STUDENT'], isSectionLink: true }, // Link to section on student dash

        // Common Links (Separate Pages)
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, roles: ['STUDENT', 'TEACHER'], isSectionLink: false },
        { href: '/profile/me', label: 'View Profile', icon: UserCircle, roles: ['STUDENT', 'TEACHER'], isSectionLink: false },
        { href: '/settings', label: 'Account Settings', icon: Settings, roles: ['STUDENT', 'TEACHER'], isSectionLink: false },
    ];

    // Filter links based on user role
    const visibleLinks = allLinks.filter(link => user.role && link.roles.includes(user.role));

    const displayAvatar = getDisplayAvatar(user.avatarUrl, user.gender);


    return (
        <aside className="w-64 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-4 flex flex-col border-r dark:border-gray-700 fixed h-full lg:relative lg:translate-x-0 -translate-x-full transition-transform duration-300 ease-in-out z-40"> {/* Basic responsive setup *}
            {/* User Info Section *}
            {/*<div className="flex flex-col items-center mb-6 border-b dark:border-gray-700 pb-4">
                 <Image
                    src={displayAvatar} // Use calculated avatar
                    alt={user.name || 'User Avatar'}
                    width={80}
                    height={80}
                    className="rounded-full mb-2 border-2 border-indigo-200 dark:border-indigo-700 bg-gray-200" // Added bg color for placeholders
                    onError={(e) => { e.currentTarget.src = '/avatars/default-other.png'; }} // Fallback if image fails
                 />
                 <h3 className="font-semibold text-lg text-center">{user.name || 'User'}</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                 <span className="mt-2 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full capitalize">
                     {user.role?.toLowerCase()}
                 </span>
            </div>

            {/* Navigation Links *}
            <nav className="flex-grow space-y-1 overflow-y-auto">
                {visibleLinks.map((link) => {
                    // Active state logic:
                    const baseHref = link.href.split('#')[0]; // Get path without hash
                    const isActive = pathname === baseHref; // Highlight if base path matches current path


                    const isNotifications = link.label === 'Notifications';
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <link.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                            <span>{link.label}</span>
                            {/* Show badge only for Notifications link and if count > 0 *}
                            {isNotifications && user.unreadNotificationCount > 0 && (
                                <span className="ml-auto inline-block py-0.5 px-2 text-xs font-semibold rounded-full bg-red-500 text-white">
                                    {user.unreadNotificationCount > 9 ? '9+' : user.unreadNotificationCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button Section *}
            <div className="mt-auto pt-4 border-t dark:border-gray-700">
                {/* Ensure LogoutButton is imported and works *}
                <LogoutButton />
            </div>
        </aside>*/
    /*);
}*/



// src/components/layout/DashboardSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    LayoutDashboard, UserCircle, Settings, CalendarDays, Search, ListChecks, BookUser, LogOut, Bell // Added Bell
} from 'lucide-react'; // Import icons
import LogoutButton from '@/components/LogoutButton';
import type { LayoutUserData } from '@/app/dashboard/layout'; // Import type from layout
import { cn } from '@/lib/utils'; // Optional: for combining class names
import type { Role } from '@prisma/client'; // Import Gender & Role enums
import { getDisplayAvatar } from '@/lib/helpers'

interface DashboardSidebarProps {
    user: LayoutUserData;
    onClose?: () => void;  // New prop for closing sidebar on mobile
    isMobile?: boolean;    // New prop to know if we're on mobile
}

// Define Link structure - ADD isSectionLink
interface NavLink {
    href: string;
    label: string;
    icon: React.ElementType; // Icon component
    roles: Role[]; // Use imported Role enum
    isSectionLink?: boolean; // <<< Added optional property for anchor links
}

export default function DashboardSidebar({ 
    user, 
    onClose, 
    isMobile = false 
}: DashboardSidebarProps) {
    const pathname = usePathname(); // Hook to get current path (e.g., /dashboard/teacher)
    
    // Define base dashboard paths
    const teacherDashPath = '/dashboard/teacher';
    const studentDashPath = '/dashboard/student'; // Assuming this is the student dashboard route

    // Define all possible links with updated hrefs and isSectionLink flag
    const allLinks: NavLink[] = [
        // Role-Specific Dashboard Home Links
        { href: teacherDashPath, label: 'Dashboard', icon: LayoutDashboard, roles: ['TEACHER'], isSectionLink: false },
        { href: studentDashPath, label: 'Dashboard', icon: LayoutDashboard, roles: ['STUDENT'], isSectionLink: false },

        // Teacher Section Links (point within teacher dashboard)
        { href: `${teacherDashPath}#pending-requests`, label: 'Class Requests', icon: ListChecks, roles: ['TEACHER'], isSectionLink: true },
        { href: `${teacherDashPath}#upcoming-schedule`, label: 'My Schedule', icon: CalendarDays, roles: ['TEACHER'], isSectionLink: true },
        { href: "/profile/teacher/edit", label: 'Profile Settings', icon: BookUser, roles: ['TEACHER'], isSectionLink: true },

        // Student Links
        { href: '/find-teachers', label: 'Find Teacher', icon: Search, roles: ['STUDENT'], isSectionLink: false },
        { href: `${studentDashPath}#my-sessions`, label: 'My Sessions', icon: CalendarDays, roles: ['STUDENT'], isSectionLink: true }, // Link to section on student dash

        // Common Links (Separate Pages)
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, roles: ['STUDENT', 'TEACHER'], isSectionLink: false },
        { href: '/profile/me', label: 'View Profile', icon: UserCircle, roles: ['STUDENT', 'TEACHER'], isSectionLink: false },
        { href: '/settings', label: 'Account Settings', icon: Settings, roles: ['STUDENT', 'TEACHER'], isSectionLink: false },
    ];

    // Filter links based on user role
    const visibleLinks = allLinks.filter(link => user.role && link.roles.includes(user.role));

    const displayAvatar = getDisplayAvatar(user.avatarUrl, user.gender);

    const handleNavClick = () => {
        // Close sidebar when navigating on mobile
        if (isMobile && onClose) {
            onClose();
        }
    };

    return (
        <aside className={cn(
            "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-4 flex flex-col border-r dark:border-gray-700 h-full",
            isMobile ? "w-64" : "w-64 lg:w-72"
        )}>
            {/* User Info Section */}
            <div className="flex flex-col items-center mb-6 border-b dark:border-gray-700 pb-4">
                 <Image
                    src={displayAvatar} // Use calculated avatar
                    alt={user.name || 'User Avatar'}
                    width={80}
                    height={80}
                    className="rounded-full mb-2 border-2 border-indigo-200 dark:border-indigo-700 bg-gray-200" // Added bg color for placeholders
                    onError={(e) => { e.currentTarget.src = '/avatars/default-other.png'; }} // Fallback if image fails
                 />
                 <h3 className="font-semibold text-lg text-center">{user.name || 'User'}</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-full text-center px-2">{user.email}</p>
                 <span className="mt-2 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full capitalize">
                     {user.role?.toLowerCase()}
                 </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow space-y-1 overflow-y-auto">
                {visibleLinks.map((link) => {
                    // Active state logic:
                    const baseHref = link.href.split('#')[0]; // Get path without hash
                    const isActive = pathname === baseHref; // Highlight if base path matches current path

                    const isNotifications = link.label === 'Notifications';
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={handleNavClick}
                            className={cn(
                                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <link.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate">{link.label}</span>
                            {/* Show badge only for Notifications link and if count > 0 */}
                            {isNotifications && user.unreadNotificationCount > 0 && (
                                <span className="ml-auto inline-block py-0.5 px-2 text-xs font-semibold rounded-full bg-red-500 text-white flex-shrink-0">
                                    {user.unreadNotificationCount > 9 ? '9+' : user.unreadNotificationCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button Section */}
            <div className="mt-auto pt-4 border-t dark:border-gray-700">
                {/* Ensure LogoutButton is imported and works */}
                <div onClick={handleNavClick}>
                    <LogoutButton />
                </div>
            </div>
        </aside>
    );
}

