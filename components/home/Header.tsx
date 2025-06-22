// components/Header.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils"; // Assuming you have utils for className merging

// This is a basic example. For complex nav, use Shadcn's NavigationMenu more fully.

const Header = () => {
  // TODO: Implement actual auth check (e.g., using Supabase auth hook)
  const isAuthenticated = false; // Placeholder

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo/App Name */}
        <Link href="/" className="mr-4 text-lg font-bold">
          Home
        </Link>

        {/* Navigation Links (Hidden on small screens, adjust breakpoints as needed) */}
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
            {/* Add more navigation items here */}
          </NavigationMenuList>
        </NavigationMenu>


        {/* Auth Buttons 
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            // TODO: Add user dropdown/dashboard link
            <Button variant="ghost" asChild>
               <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                 <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>*/}
      </div>
    </header>
  );
};

export default Header;