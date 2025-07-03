
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-learn9ja-green-pale to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-learn9ja-dark">
            Ready to transform your learning experience?
          </h2>
          <p className="mt-6 text-lg text-gray-600">
            Join Learn9ja today and connect with expert teachers worldwide or share your knowledge.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-center animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Link href="/signup">
              <Button className="bg-learn9ja w-full sm:w-auto text-base text-learn9ja-white py-6 px-8">
                Sign up as a student
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="bg-learn9ja-white text-learn9ja w-full sm:w-auto text-base py-6 px-8">
                Become a Teacher
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
