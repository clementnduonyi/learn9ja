// components/CallToActionSection.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CallToActionSection = () => {
  return (
    <section className="w-full py-12 md:py-20 lg:py-24 bg-primary dark:bg-primary text-primary-foreground text-center">
      <div className="container px-4 md:px-6 space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
          Ready to Get Started?
        </h2>
        <p className="max-w-[800px] mx-auto md:text-xl">
          Join our platform today and experience the future of live online learning and teaching.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row justify-center">
           <Button asChild size="lg" className="text-primary bg-primary-foreground hover:bg-primary-foreground/90">
              <Link href="/signup">Sign Up Now - It's Free!</Link>
           </Button>
           <Button variant="outline" size="lg" asChild className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/find-teachers">Find a Teacher</Link>
           </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;