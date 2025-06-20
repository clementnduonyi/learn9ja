
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
            Join Learn9ja today to connect with expert Nigerian teachers or share your knowledge
            by becoming a teacher on our platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button className="btn-primary px-8 py-6 text-base">
                Sign Up as a Student
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="btn-secondary px-8 py-6 text-base">
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
