// components/HeroSection.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="w-full md:py-16 lg:py-20  dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
          {/* Text Content */}
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                 Live Classes, Real Connections.
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400 mx-auto lg:mx-0">
                 Seamless video classes connecting students and teachers worldwide. Experience dynamic, real-time learning from the comfort of your home.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
              <Button asChild size="lg">
                <Link href="/find-teachers">Find a Teacher</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                 <Link href="/signup">Become a Teacher</Link>
              </Button>
            </div>
          </div>

          {/* Placeholder Image/Visual */}
          <Image
            src="/illustrations/hero.svg" // Replace with an actual image path
            width="800"
            height="600"
            alt="Hero Image"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;