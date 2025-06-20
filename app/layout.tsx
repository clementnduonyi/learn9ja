import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './global.css'; // Tailwind styles
import Navbar from '@/components/NavBar'; // Assuming Navbar component exists
import { Toaster } from "@/components/ui/sonner"
import Footer from '@/components/Footer'; // Assuming Footer component exists

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Learn9ja | Learn Nigeria', // Change title
  description: 'Learning the Nigeria Way. Get expart help on Homework for your children in all subject, on live video classes session', // Change description
};

// Ensure layout is a Server Component by default (no 'use client')
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/* Navbar will fetch session server-side */}
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8"> {/* Example main styling */}
          {children}
        </main>
        <Toaster />
        <Footer />
        {/* Add Toaster component from shadcn/ui here if using */}
        {/* <Toaster /> */}
      </body>
    </html>
  );
}