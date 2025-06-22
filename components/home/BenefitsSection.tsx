// components/BenefitsSection.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// Assuming you have lucide-react installed and configured with shadcn-ui
import { Zap, Users, Clock, DollarSign } from "lucide-react"; // Example icons

// Placeholder for icons - replace with actual components from your icon library
// Using distinct colors for variety
const IconPlaceholder = ({ children, colorClass = 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' }: { children: React.ReactNode, colorClass?: string }) => (
  <div className={`w-12 h-12 flex items-center justify-center rounded-full mb-4 ${colorClass}`}>
    {children}
  </div>
);

const BenefitsSection = () => {
  return (
    <section className="w-full py-12 md:py-20 lg:py-24"> {/* Background removed here, can add if needed */}
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">Why Choose Learn9ja?</h2>
        <p className="max-w-[900px] mx-auto mt-4 text-gray-600 md:text-xl dark:text-gray-400">
          Experience the best in live online learning and teaching with these key advantages:
        </p>

        {/* Grid for Benefit Cards - Explicitly 4 columns on large screens */}
        <div className="grid gap-8 mt-12 md:grid-cols-2 lg:grid-cols-4 xl:gap-12">

          {/* Benefit 1: Engaging & Interactive */}
          {/* Applied hover effects and transition */}
          <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0 mb-4 flex flex-col items-center"> {/* Center icon in header */}
               {/* Replace with <Zap className="w-6 h-6" /> */}
              <IconPlaceholder colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"><Zap className="w-6 h-6" /> </IconPlaceholder>
              {/* Consistent title styling */}
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Engaging & Interactive</CardTitle>
            </CardHeader>
            {/* Consistent content styling - text left-aligned */}
            <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
              Live video allows for real-time questions, dynamic discussions, and personalized feedback.
            </CardContent>
          </Card>

          {/* Benefit 2: Global Reach */}
           <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0 mb-4 flex flex-col items-center">
               {/* Replace with <Users className="w-6 h-6" /> */}
              <IconPlaceholder colorClass="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"><Users className="w-6 h-6" /> </IconPlaceholder>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Global Reach</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
              Connect with exceptional teachers and eager students from anywhere in the world.
            </CardContent>
          </Card>

          {/* Benefit 3: Flexible & Convenient */}
           <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0 mb-4 flex flex-col items-center">
               {/* Replace with <Clock className="w-6 h-6" /> */}
              <IconPlaceholder colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"><Clock className="w-6 h-6" /> </IconPlaceholder>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Flexible & Convenient</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
              Learn or teach on your schedule, making it easy to fit education into your busy life.
            </CardContent>
          </Card>

          {/* Benefit 4: Opportunity for Teachers */}
           <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0 mb-4 flex flex-col items-center">
               {/* Replace with <DollarSign className="w-6 h-6" /> */}
              <IconPlaceholder colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"><DollarSign className="w-6 h-6" /></IconPlaceholder>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Opportunity for Teachers</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left">
              Monetize your expertise, reach a wider audience, and build your teaching business.
            </CardContent>
          </Card>

           {/* Removed extra benefit placeholders */}

        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;