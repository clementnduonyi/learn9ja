
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image"



const HeroSection = () => {
  return (
    <section className="pt-16 pb-12 md:pt-20 md:pb-20 hero-gradient">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-learn9ja-dark">
            Live Classes, Real Connections.<br />
              <span className="text-learn9ja animate-pulse">One Click Away</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 animate-slide-up" style={{animationDelay: '0.2s'}}>
            Seamless video classes connecting students and teachers worldwide. Experience dynamic, real-time learning from the comfort of your home. Find instant help or schedule sessions for any subject, at any level.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{animationDelay: '0.4s'}}>
              <Link href="/signup">
                <Button className="bg-learn9ja w-full sm:w-auto text-base text-learn9ja-white py-6 px-8">
                  Start Learning Now
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" className="bg-learn9ja-white text-learn9ja w-full sm:w-auto text-base py-6 px-8">
                  Become a Teacher
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 mt-8 lg:mt-0 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-learn9ja/10 rounded-full"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-learn9ja/10 rounded-full"></div>
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1513258496099-48168024aec0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80" 
                  alt="Online learning"
                  width="800"
                  height="600"
                  className="w-full h-auto rounded-2xl aspect-[16/10] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-lg font-medium">Live classes with vetted teachers globally</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
