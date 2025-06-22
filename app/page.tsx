import HeroSection from "@/components/HeroSection"
// import HowItWorksSection from "@/ui/home/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import TeacherCard from '@/components/TeacherCard'
import CTASection from "@/components/CTASection";
import { getFeaturedTeachers } from "@/app/actions/teacherActions";



export default async function HomePage() {

  const featuredTeachers = await getFeaturedTeachers();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow mt-16">
        <HeroSection />
        
        <FeaturesSection />
        
        <section className="py-16 bg-learn9ja-gray">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-learn9ja-dark">
                Featured <span className="text-learn9ja-green">Teachers</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Meet some of our top-rated Nigerian teachers ready to help you excel.
              </p>
            </div>
            
            {/*<div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">*/}
            {featuredTeachers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 5. Map over the fetched data and pass it to the TeacherCard component */}
                {featuredTeachers.map((teacher) => (
                  <TeacherCard key={teacher.id} teacher={teacher} />
                ))}
              </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No featured teachers available at the moment. Please check back later!
                </p>
              )}
            </div>
            
            <div className="mt-12 text-center">
              <a href="/signup" className="btn-primary inline-flex px-8">
                View All Teachers
              </a>
            </div>
          {/*</div>*/}
        </section>

         <BenefitsSection />
        
        <CTASection />
      </main>
    </div>


)
  
}