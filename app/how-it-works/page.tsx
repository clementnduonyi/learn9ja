// app/how-it-works/page.tsx
import Header from "@/ui/home/Header";
import Footer from "@/ui/Footer";
import Image from "next/image"; // Using Next.js Image component for visuals
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Optional: for FAQs
import { Card } from "@/components/ui/card"; // Optional: Can use Cards for steps too

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/*<Header />*/}
      <main className="flex-grow container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-4xl font-bold text-center mb-8 md:mb-12">How Learn9ja Works</h1>

        <div className="mx-auto text-lg text-gray-700 dark:text-gray-300 space-y-16">

          <p className="text-center md:text-left">
            Getting started with Learn9ja is simple, whether you're here to learn or to teach. Our platform is designed for clarity and ease of use, guiding you through each step to connect and engage in live video classes.
          </p>

          {/* ======================================= */}
          {/* Section: How It Works for Students */}
          {/* ======================================= */}
          <section className="pt-12"> {/* Add padding top to separate sections */}
            <h2 className="text-3xl font-bold mb-6 text-center md:text-left">For Students</h2>

            <div className="space-y-10"> {/* Space between steps */}

              {/* Student Step 1: Find a Class */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                 {/* Visual Placeholder (replace with actual screenshot/image) */}
                 <div className="md:w-1/2">
                   <Image
                     src="/illustrations/teacher.svg" // Replace with your image path
                     alt="Step 1: Find a Class Screenshot"
                     width={600}
                     height={400}
                     className="rounded-lg border"
                   />
                 </div>
                 {/* Content */}
                 <div className="md:w-1/2 space-y-3">
                   <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Step 1: Find a Teacher</h3>
                   <p>
                     Explore a wide range of subjects using our intuitive search and filtering options. Browse teacher profiles, read reviews, and view their schedules and expertise to find the perfect match for your learning goals.
                   </p>
                   {/* Optional: Add a CTA related to the step */}
                   <Link href="/find-teachers" className="text-primary hover:underline">Start Searching</Link>
                 </div>
              </div>

              {/* Student Step 2: Book a Session */}
              {/* Reverse layout for visual variation */}
               <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                 {/* Visual Placeholder */}
                 <div className="md:w-1/2">
                   <Image
                     src="/illustrations/schedule.svg" // Replace with your image path
                     alt="Step 2: Book a Session Screenshot"
                     width={600}
                     height={400}
                     className="rounded-lg border"
                   />
                 </div>
                 {/* Content */}
                 <div className="md:w-1/2 space-y-3">
                   <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Step 2: Book and Schedule</h3>
                   <p>
                     Once you've found a teacher, select an available time slot that fits your schedule. Our secure payment system processes the transaction smoothly. You'll receive instant confirmation and calendar invites.
                   </p>
                    {/* Optional: Add a CTA related to the step */}
                   <Link href="/find-teachers" className="text-primary hover:underline">Learn More About Booking</Link>
                 </div>
              </div>

               {/* Student Step 3: Join and Learn */}
               <div className="flex flex-col md:flex-row items-center gap-8">
                 {/* Visual Placeholder */}
                 <div className="md:w-1/2">
                   <Image
                     src="/illustrations/online-learning.svg" // Replace with your image path
                     alt="Step 3: Join Session Screenshot"
                     width={600}
                     height={400}
                     className="rounded-lg border"
                   />
                 </div>
                 {/* Content */}
                 <div className="md:w-1/2 space-y-3">
                   <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Step 3: Join Your Live Class</h3>
                   <p>
                     At the scheduled time, simply click the link from your dashboard or email to enter the virtual classroom. Engage with your teacher using high-quality video, chat, screen sharing, and other interactive tools.
                   </p>
                 </div>
              </div>

              {/* Add more student steps if necessary */}

            </div>
          </section>

          {/* ======================================= */}
          {/* Section: How It Works for Teachers */}
          {/* ======================================= */}
           <section className="pt-16"> {/* Add padding top to separate sections */}
            <h2 className="text-3xl font-bold mb-6 text-center md:text-left">For Teachers</h2>

            <div className="space-y-10"> {/* Space between steps */}

              {/* Teacher Step 1: Create Profile */}
               <div className="flex flex-col md:flex-row items-center gap-8">
                 {/* Visual Placeholder */}
                 <div className="md:w-1/2">
                   <Image
                     src="/illustrations/create-profile.svg" // Replace with your image path
                     alt="Teacher Step 1: Create Profile Screenshot"
                     width={600}
                     height={400}
                     className="rounded-lg border"
                   />
                 </div>
                 {/* Content */}
                 <div className="md:w-1/2 space-y-3">
                   <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Step 1: Build Your Profile</h3>
                   <p>
                     Create a compelling profile showcasing your expertise, qualifications, and teaching style. Upload a profile picture and introduction video to connect with potential students.
                   </p>
                    {/* Optional: Add a CTA related to the step */}
                   <Link href="/signup?role=teacher" className="text-primary hover:underline">Become a Teacher</Link>
                 </div>
              </div>

              {/* Teacher Step 2: List Classes */}
              {/* Reverse layout */}
               <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                 {/* Visual Placeholder */}
                 <div className="md:w-1/2">
                  <Image
                     src="/illustrations/availability.svg" // Replace with your image path
                     alt="Teacher Step 2: List Classes Screenshot"
                     width={600}
                     height={400}
                     className="rounded-lg border"
                   />
                 </div>
                 {/* Content */}
                 <div className="md:w-1/2 space-y-3">
                   <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Step 2: Define & List Your Offerings</h3>
                   <p>
                     Easily create listings for the subjects you teach. Set your own hourly rates, describe your class structure, and manage your calendar availability.
                   </p>
                 </div>
              </div>

               {/* Teacher Step 3: Teach & Manage */}
               <div className="flex flex-col md:flex-row items-center gap-8">
                 {/* Visual Placeholder */}
                 <div className="md:w-1/2">
                   <Image
                     src="/illustrations/online-class.svg" // Replace with your image path
                     alt="Teacher Step 3: Teach Screenshot"
                     width={600}
                     height={400}
                     className="rounded-lg border"
                   />
                 </div>
                 {/* Content */}
                 <div className="md:w-1/2 space-y-3">
                   <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Step 3: Teach and Grow</h3>
                   <p>
                     Utilize our integrated virtual classroom for live teaching. Manage bookings, communicate with students, and track your earnings directly from your dashboard. Focus on teaching, we handle the rest.
                   </p>
                 </div>
              </div>

              {/* Add more teacher steps if necessary */}

            </div>
          </section>

          {/* ======================================= */}
          {/* Optional Section: Technical Requirements */}
          {/* ======================================= */}
           
           <section className="pt-16">
               <h2 className="text-3xl font-bold mb-6 text-center md:text-left">Technical Requirements</h2>
               <div className="space-y-4">
                    <p>To ensure the best experience, please make sure you meet the following requirements:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Reliable internet connection (minimum 5+ Mbps Upload / 10+ Mbps Download recommended)</li>
                        <li>Modern web browser (latest versions of Chrome, Firefox, Safari, Edge)</li>
                        <li>Webcam and microphone</li>
                        <li>Desktop or laptop computer (mobile experience may be limited for teaching/certain features)</li>
                    </ul>
               </div>
           </section>
           

          {/* ======================================= */}
          {/* Optional Section: Process FAQs */}
          {/* ======================================= */}
           
           <section className="pt-16">
                <h2 className="text-3xl font-bold mb-6 text-center md:text-left">Process FAQs</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>How do I reschedule a class?</AccordionTrigger>
                    <AccordionContent>
                      [Detailed answer about rescheduling process]
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="faq-2">
                    <AccordionTrigger>What happens if I have a technical issue during a class?</AccordionTrigger>
                    <AccordionContent>
                       [Detailed answer about troubleshooting steps and support]
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