// src/components/layout/Navbar.tsx
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server'; // Use server client
import prisma from '@/lib/prisma'; // Need prisma to get profile/count
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react'; // Import icon
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils"; // Assuming you have utils for className merging
import { getDisplayAvatar } from '@/lib/helpers'


// Make Navbar an async component to fetch data
export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let profileData = null;
  let unreadCount = 0;

  if (authUser) {
      try {
          // Fetch profile (for avatar/gender) and notification count in parallel
          [profileData, unreadCount] = await Promise.all([
              prisma.user.findUnique({
                  where: { id: authUser.id },
                  select: { avatarUrl: true, gender: true }
              }),
              prisma.notification?.count({
                  where: { userId: authUser.id, isRead: false }
              })
          ]);
      } catch (error) {
          console.error("Navbar failed to fetch profile/count:", error);
          // Handle error gracefully, maybe show default icons
      }
  }

  const displayAvatar = getDisplayAvatar(profileData?.avatarUrl, profileData?.gender);

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md sticky top-0 z-50"> {/* Made sticky */}
      <div className="container flex h-14 items-center justify-between px-4 md:px-6"> {/* Adjusted padding */}
        <Link href="/" className="text-xl text-learn9ja font-bold hover:text-green-400 dark:hover:text-indigo-400">
         Learn9ja
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/how-it-works" className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50")}>
                  How it Works
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                <Link href="/find-teachers" className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50")}>
                  Find a Teacher
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
              <Link href="/signup" className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50")}>
                Become a Teacher
              </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/services" className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50")}>
                  Services
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
            <NavigationMenuLink asChild>
                <Link href="/about" className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50")}>
                  About Us
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            {/* Add more navigation items here */}
          </NavigationMenuList>
        </NavigationMenu>
       
        <div className="space-x-4 flex items-center">
          
          {authUser ? (
            <>
             <Link href="/dashboard" className={cn("group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50")}>
                  Dashboard
              </Link>
              {/* Notification Bell */}
              <Link href="/dashboard/notifications" className="relative p-1 rounded-full text-gray-600 dark:text-gray-400 hover:text-text-[#92E3A9] dark:hover:text-text-[#92E3A9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-[#92E3A9]">
                 <span className="sr-only">View notifications</span>
                 <Bell className="h-6 w-6" aria-hidden="true" />
                 {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 px-1 block h-4 w-4 transform -translate-y-1 translate-x-1 rounded-full text-white shadow-solid bg-red-700 text-xs items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                 )}
              </Link>

              {/* User Avatar */}
              <Link href="/profile/me" className="flex items-center">
                 <span className="sr-only">Open user menu</span>
                 <Image
                    src={displayAvatar}
                    alt="User Avatar"
                    width={32} // Smaller size for navbar
                    height={32}
                    className="rounded-full bg-gray-200 border border-gray-300 dark:border-gray-600"
                    // onError={(e) => { e.currentTarget.src = '/avatars/default-other.svg'; }}
                 />
              </Link>

              {/* Logout Button */}
              <LogoutButton />
            </>
          ) : (
            <>
              {/* Login/Signup Buttons */}
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
