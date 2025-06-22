// components/HowItWorksSection.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Assuming you have lucide-react installed and configured with shadcn-ui
import { Search, CalendarDays, Video, UserPlus, BookOpen, Award } from "lucide-react"; // Example icons from lucide-react
// Using placeholder icons for broader compatibility if lucide isn't set up yet

// Placeholder for icons - replace with actual components from your icon library
// Make sure these placeholders or your actual icons are visually distinct and clear
const IconPlaceholder = ({ children }: { children: React.ReactNode }) => (
  <div className="w-12 h-12 flex items-center justify-center rounded-full mb-4 text-primary bg-primary/10 dark:bg-primary/30 dark:text-primary-foreground">
    {children}
  </div>
);

const HowItWorksSection = () => {
  return (
    <section className="w-full py-12 md:py-20 lg:py-24 bg-gray-50 dark:bg-gray-800">
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">Geting Started</h2>
        <p className="max-w-[900px] mx-auto mt-4 text-gray-600 md:text-xl dark:text-gray-400">
          Connecting with experts or sharing your knowledge is easier than you think. Follow these simple steps:
        </p>

        <div className="grid gap-8 mt-16 lg:grid-cols-2 xl:gap-12"> {/* Adjusted gap and added XL breakpoint gap */}
          {/* How it Works for Students */}
          <div>
            <h3 className="text-2xl font-semibold mb-8 text-gray-800 dark:text-gray-200">For Students</h3>
            {/* Grid of Cards */}
            <div className="grid gap-6 md:grid-cols-3">

              {/* Card 1: Find */}
              <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1"> {/* Removed items-center text-center */}
                <CardHeader className="p-0 mb-4 flex flex-col items-center"> {/* Center icon in header */}
                  {/* Replace with <Search className="w-6 h-6" /> */}
                  <IconPlaceholder><Search className="w-6 h-6" /></IconPlaceholder>
                  {/* Removed numbering, reduced font size slightly */}
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Find Your Class</CardTitle>
                </CardHeader>
                {/* Ensure content is left-aligned */}
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
                  Browse subjects and teacher profiles to find the perfect live class for you.
                </CardContent>
              </Card>

              {/* Card 2: Book */}
               <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <CalendarDays className="w-6 h-6" /> */}
                  <IconPlaceholder><CalendarDays className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Book a Session</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
                  Easily schedule and confirm your live video class session at a time that works for you.
                </CardContent>
              </Card>

              {/* Card 3: Learn */}
               <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <Video className="w-6 h-6" /> */}
                  <IconPlaceholder><Video className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Join & Learn Live</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
                  Connect via live video, interact directly, and get your questions answered instantly.
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How it Works for Teachers */}
          <div>
             <h3 className="text-2xl font-semibold mb-8 text-gray-800 dark:text-gray-200">For Teachers</h3>
              {/* Grid of Cards */}
             <div className="grid gap-6 md:grid-cols-3">

              {/* Card 1: Create */}
               <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <UserPlus className="w-6 h-6" /> */}
                  <IconPlaceholder><UserPlus className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Create Your Profile</CardTitle> {/* Slightly improved title */}
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
                  Set up your teacher profile, highlight your expertise, and manage your availability easily.
                </CardContent>
              </Card>

              {/* Card 2: List */}
               <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <BookOpen className="w-6 h-6" /> */}
                  <IconPlaceholder><BookOpen className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">List Your Classes</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
                  Easily define your subjects, structure your lessons, and set your preferred rates.
                </CardContent>
              </Card>

              {/* Card 3: Teach */}
               <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <Award className="w-6 h-6" /> */}
                  <IconPlaceholder><Award className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Teach & Engage</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
                  Use our platform tools to deliver engaging, high-quality live video lessons and connect with students.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;