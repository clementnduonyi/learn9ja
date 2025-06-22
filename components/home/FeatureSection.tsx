// components/FeaturesSection.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// Assuming you have lucide-react installed and configured with shadcn-ui
import { Video, MessageSquare, CalendarDays, User, CreditCard, History } from "lucide-react"; // Example icons

// Placeholder for icons - reuse the pattern with potential color variations
const IconPlaceholder = ({ children, colorClass = 'bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-foreground' }: { children: React.ReactNode, colorClass?: string }) => (
  <div className={`w-12 h-12 flex items-center justify-center rounded-full mb-4 ${colorClass}`}>
    {children}
  </div>
);

const FeaturesSection = () => {
  return (
    <section className="w-full py-12 md:py-20 lg:py-24 bg-gray-50 dark:bg-gray-800"> {/* Using a background color like How it Works */}
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">Designed for Seamless Live Education</h2>
        <p className="max-w-[900px] mx-auto mt-4 text-gray-600 md:text-xl dark:text-gray-400">
          Explore the powerful features that make learning and teaching on Demirite a breeze.
        </p>

        {/* Grid for Feature Cards - 3 columns on large screens for 6 items */}
        <div className="grid gap-8 mt-12 md:grid-cols-2 lg:grid-cols-3 xl:gap-12">

          {/* Feature 1: High-Quality Live Video */}
          <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0 mb-4 flex flex-col items-center">
              {/* Replace with <Video className="w-6 h-6" /> */}
              <IconPlaceholder colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"><Video className="w-6 h-6" /></IconPlaceholder>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">High-Quality Live Video</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
              Crystal clear audio and video ensure you don&apos;t miss a single detail in your live sessions.
            </CardContent>
          </Card>

          {/* Feature 2: Interactive Tools */}
          <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0 mb-4 flex flex-col items-center">
               {/* Replace with <MessageSquare className="w-6 h-6" /> */}
              <IconPlaceholder colorClass="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"> <MessageSquare className="w-6 h-6" /></IconPlaceholder>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Interactive Tools</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
              Engage with chat, screen sharing, and virtual whiteboards for dynamic lessons.
            </CardContent>
          </Card>

          {/* Feature 3: Easy Scheduling */}
           <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0 mb-4 flex flex-col items-center">
               {/* Replace with <CalendarDays className="w-6 h-6" /> */}
              <IconPlaceholder colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"><CalendarDays className="w-6 h-6" /></IconPlaceholder>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Easy Scheduling & Booking</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
              Find a teacher that meet your needs, or manage your availability effortlessly.
            </CardContent>
          </Card>

          {/* Feature 4: Teacher Profiles */}
           <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0 mb-4 flex flex-col items-center">
               {/* Replace with <User className="w-6 h-6" /> */}
              <IconPlaceholder colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"><User className="w-6 h-6" /></IconPlaceholder>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Vetted Teachers</CardTitle> {/* Slightly reworded */}
            </CardHeader>
            <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
              Explore comprehensive profiles of thoroughly vetted teacher with security checks, expertise, reviews, and teaching styles.
            </CardContent>
          </Card>

           {/* Feature 5: Secure Payments */}
           <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0 mb-4 flex flex-col items-center">
               {/* Replace with <CreditCard className="w-6 h-6" /> */}
              <IconPlaceholder colorClass="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"><CreditCard className="w-6 h-6" /></IconPlaceholder>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Secure Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
              Handle payments securely and conveniently with Paystack payment.
            </CardContent>
          </Card>

           {/* Feature 6: Video Replay (NEW) */}
           <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0 mb-4 flex flex-col items-center">
               {/* Replace with <History className="w-6 h-6" /> */}
              <IconPlaceholder colorClass="bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300"><History className="w-6 h-6" /></IconPlaceholder> {/* Using a rewind/history icon */}
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Session Replays</CardTitle> {/* Title */}
            </CardHeader>
            <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
              Review your live sessions with a replay available for up to 1 hour post-session. <strong className="text-gray-800 dark:text-gray-100">Premium Subscribers Only.</strong> {/* Added premium info */}
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;