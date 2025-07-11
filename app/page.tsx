import Link from 'next/link'
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
      
        <HeroSection />
        
        
        <BenefitsSection />
        
        <section className="py-16 bg-learn9ja-gray">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-learn9ja-dark">
                Featured <span className="text-learn9ja">Teachers</span>
              </h2>
              <p className="my-3 text-lg text-gray-600">
                Meet some of our top-rated and vetted teachers of the week.
              </p>
            </div>
      
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
            
            <div className="mt-10 mx-auto text-center w-50">
              <Link href="/find-teachers" className="btn-primary inline-flex px-8">
                View All Teachers
              </Link>
            </div>
          {/*</div>*/}
        </section>

        <FeaturesSection />
        
        <CTASection />
     
    </div>


)
  
}