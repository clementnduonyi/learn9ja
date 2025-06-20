// app/features/page.tsx
import Header from "@/ui/home/Header";
import Footer from "@/ui/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Image from "next/image"; // Using Next.js Image component for visuals
import { Video, MessageSquare, CalendarDays, User, CreditCard, History, Bell, LayoutDashboard, LifeBuoy, ShieldCheck } from "lucide-react"; // Example icons
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; 

// Reuse the IconPlaceholder pattern
const IconPlaceholder = ({ children, colorClass = 'bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary-foreground' }: { children: React.ReactNode, colorClass?: string }) => (
  <div className={`w-12 h-12 flex items-center justify-center rounded-full mb-4 ${colorClass}`}>
    {children}
  </div>
);

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-4xl font-bold text-center mb-8 md:mb-12">Powerful Features for Effective Learning & Teaching</h1>

        <div className="mx-auto text-lg text-gray-700 dark:text-gray-300 space-y-16"> {/* Increased space between sections */}

          <p className="text-center md:text-left max-w-4xl mx-auto">
            Demirite is packed with features designed to provide a seamless, engaging, and productive experience for both students and teachers in live online environments.
          </p>

          {/* ======================================= */}
          {/* Section: Core Classroom Features */}
          {/* ======================================= */}
          <section className="pt-12">
            <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Core Classroom Experience</h2>

            {/* Grid of Core Feature Cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

              {/* Feature 1: High-Quality Live Video */}
              <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <Video className="w-6 h-6" /> */}
                  <IconPlaceholder colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"><Video className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">High-Definition Live Video</CardTitle> {/* Slightly more detailed title */}
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left space-y-2">
                   <p>
                     Experience crystal clear, low-latency video and audio powered by LiveKit. Focus on the lesson, not technical distractions.
                   </p>
                   {/* Optional small visual */}
                   <div className="mt-4">
                       <Image src="/illustrations/hd-video.svg" alt="HD Video Feature" width={400} height={250} className="rounded-md border" />
                   </div>
                </CardContent>
              </Card>

              {/* Feature 2: Interactive Tools */}
              <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <MessageSquare className="w-6 h-6" /> */}
                  <IconPlaceholder colorClass="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"><MessageSquare className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Dynamic Interactive Tools</CardTitle> {/* Slightly more detailed title */}
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left space-y-2">
                  <p>
                    Engage students with built-in tools:
                  </p>
                  <ul className="list-disc list-inside">
                    <li>Integrated Text Chat</li>
                    <li>Collaborative Whiteboard</li>
                    <li>One-Click Screen Sharing</li>
                    <li>Raise Hand / Reactions</li>
                    <li>File sharing</li>
                  </ul>
                   {/* Optional small visual */}
                   <div className="mt-4">
                       <Image src="/illustrations/built-in-tools.svg" alt="Interactive Tools Feature" width={400} height={250} className="rounded-md border" />
                   </div>
                </CardContent>
              </Card>

              {/* Feature 3: Session Replays */}
               <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <History className="w-6 h-6" /> */}
                  <IconPlaceholder colorClass="bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300"><History className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">On-Demand Session Replays</CardTitle> {/* Slightly more detailed title */}
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left space-y-2">
                  <p>
                     Catch up on missed points or review key concepts. Access a full video replay of your live session available for up to **1 hour** after the class concludes directly from your student dashboard.
                  </p>
                   <p className="font-semibold text-gray-800 dark:text-gray-100">Available exclusively for Premium Subscribers.</p>
                   {/* Optional small visual */}
                   <div className="mt-4">
                       <Image src="/illustrations/session-replay.svg" alt="Session Replays Feature" width={400} height={250} className="rounded-md border" />
                   </div>
                </CardContent>
              </Card>

            </div>
          </section>


          {/* ======================================= */}
          {/* Section: Platform Management Features */}
          {/* ======================================= */}
           <section className="pt-16">
            <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Management & Convenience</h2>

            {/* Grid of Management Feature Cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

              {/* Feature 4: Easy Scheduling & Booking */}
               <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <CalendarDays className="w-6 h-6" /> */}
                  <IconPlaceholder colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"><CalendarDays className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Flexible Scheduling & Booking</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left space-y-2">
                   <p>
                     Easily find available slots and book classes in just a few clicks. Teachers can set complex recurring availability or manage one-off sessions via a clear calendar interface.
                   </p>
                    {/* Optional small visual */}
                   <div className="mt-4">
                      {/*} <Image src="/placeholder-feature-scheduling.jpg" alt="Scheduling Feature" width={400} height={250} className="rounded-md border" />*/}
                   </div>
                </CardContent>
              </Card>

              {/* Feature 5: Detailed User Profiles */}
              <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <User className="w-6 h-6" /> */}
                  <IconPlaceholder colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"><User className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Rich Teacher & Student Profiles</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left space-y-2">
                  <p>
                    Learn more about who you're connecting with. Teacher profiles include qualifications, subject lists, availability, student reviews, and introduction videos. Student profiles help teachers understand learning needs.
                  </p>
                   {/* Optional small visual */}
                   <div className="mt-4">
                       {/*<Image src="/placeholder-feature-profile.jpg" alt="Profile Feature" width={400} height={250} className="rounded-md border" />*/}
                   </div>
                </CardContent>
              </Card>

              {/* Feature 6: Secure Payments */}
               <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <CreditCard className="w-6 h-6" /> */}
                  <IconPlaceholder colorClass="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"><CreditCard className="w-6 h-6" /> </IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Safe & Secure Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left space-y-2">
                  <p>
                    All payments are handled through a trusted third-party processor Paysatck, ensuring your financial information is protected with industry-standard security measures.
                  </p>
                   {/* Optional small visual */}
                   <div className="mt-4">
                       {/*<Image src="/placeholder-feature-payment.jpg" alt="Payment Feature" width={400} height={250} className="rounded-md border" />*/}
                    </div>
                </CardContent>
              </Card>

               {/* Feature 7: Notifications */}
               <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <Bell className="w-6 h-6" /> */}
                  <IconPlaceholder colorClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"><Bell className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Timely Notifications</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left space-y-2">
                  <p>
                   Stay informed about upcoming classes, new messages, booking requests, and other important activity via email and in-app notifications.
                  </p>
                   {/* Optional small visual */}
                   <div className="mt-4">
                       {/*<Image src="/placeholder-feature-notifications.jpg" alt="Notifications Feature" width={400} height={250} className="rounded-md border" />*/}
                   </div>
                </CardContent>
              </Card>

               {/* Feature 8: Intuitive Dashboard */}
               <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <LayoutDashboard className="w-6 h-6" /> */}
                  <IconPlaceholder colorClass="bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300"><LayoutDashboard className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Personalized Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left space-y-2">
                  <p>
                    Manage your classes, view history, track earnings (for teachers), manage your profile, and access settings all from a central, easy-to-navigate dashboard.
                  </p>
                   {/* Optional small visual */}
                   <div className="mt-4">
                      {/*} <Image src="/placeholder-feature-dashboard.jpg" alt="Dashboard Feature" width={400} height={250} className="rounded-md border" />*/}
                   </div>
                </CardContent>
              </Card>

              {/* Feature 9: Dedicated Support */}
               <Card className="flex flex-col p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 mb-4 flex flex-col items-center">
                   {/* Replace with <LifeBuoy className="w-6 h-6" /> */}
                  <IconPlaceholder colorClass="bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300"><LifeBuoy className="w-6 h-6" /></IconPlaceholder>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">Responsive Support</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm text-gray-600 dark:text-gray-400 text-left space-y-2">
                  <p>
                   Our support team is available to help you with any questions or issues you encounter on the platform. Access help resources and contact support directly.
                  </p>
                   {/* Optional small visual */}
                   <div className="mt-4">
                       {/*<Image src="/placeholder-feature-support.jpg" alt="Support Feature" width={400} height={250} className="rounded-md border" />*/}
                   </div>
                </CardContent>
              </Card>


            </div>
          </section>


           {/* ======================================= */}
           {/* Section: Technology & Reliability (Optional) */}
           {/* ======================================= */}
           
           <section className="pt-16">
               <h2 className="text-3xl font-bold mb-6 text-center md:text-left">Reliable & Secure Platform</h2>
               <div className="space-y-4 text-lg">
                    <p>Built on a robust and modern technology stack, Demirite is designed for speed, security, and stability:</p>
                     <ul className="list-disc list-inside space-y-2">
                        <li>Secure user authentication powered by <a href="https://supabase.io" className="underline" target="_blank">Supabase Auth</a>.</li>
                         <li>Reliable data storage and management with <a href="https://supabase.io" className="underline" target="_blank">Supabase Database</a>.</li>
                         <li>Fast and responsive frontend built with <a href="https://nextjs.org" className="underline" target="_blank">Next.js</a>.</li>
                         <li>Scalable infrastructure to support growing usage.</li>
                         <li>Data protected with industry-standard encryption.</li>
                         <li>Illustration<a href="https://storyset.com/online">Online illustrations by Storyset</a></li>
                    </ul>
               </div>
           </section>
            

           {/* ======================================= */}
           {/* Optional Section: Features FAQs */}
           {/* ======================================= */}
        
           <section className="pt-8">
                <h2 className="text-3xl font-bold mb-6 text-center md:text-left">Features FAQs</h2>
                 <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-feature-1">
                    <AccordionTrigger>Are sessions recorded?</AccordionTrigger>
                    <AccordionContent>
                      [Detailed answer about recording policy, availability, storage - reference replay feature]
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="faq-feature-2">
                    <AccordionTrigger>What payment methods are supported?</AccordionTrigger>
                    <AccordionContent>
                       [Detailed answer about supported payment methods via your processor]
                    </AccordionContent>
                  </AccordionItem>
                   {/* Add more FAQs */}
                </Accordion>
           </section>
           


        </div>
      </main>
    </div>
  );
}