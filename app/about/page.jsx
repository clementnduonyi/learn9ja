//import Header from "@/components/home/Header";


export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/*<Header />*/}
      <main className="flex-grow container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>

        <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-700 dark:text-gray-300">
          <p>
            Welcome to <b>Learn9ja</b>, your dedicated platform for seamless and engaging live online learning. Founded in 2025, our mission is to connect passionate educators with eager students from around the globe, fostering real-time interaction and dynamic educational experiences that go beyond traditional online courses.
          </p>

          <p>
            In today's fast-paced world, we believe that access to personalized, interactive learning is more important than ever. We built Learn9ja to overcome the limitations of static content, providing a robust, easy-to-use platform where live video classes thrive. For students, this means instant access to expert tutors, the ability to ask questions in the moment, and learning tailored to their needs. For teachers, it offers intuitive tools to share their knowledge, reach a wider audience, and build a sustainable teaching practice without the technical hassle.
          </p>

          <p>
            Powered by modern technologies like Next.js and supported by Supabase for secure authentication and data management, our platform is designed for reliability, speed, and a user-friendly experience. We are constantly working to improve and expand our features to ensure Learn9ja remains the premier destination for live online education.
          </p>

          <p>
            Join our growing community and experience the difference that live, connected learning can make. Whether you're looking to master a new skill, get STEM lesson teacher for your children/ward or share your expertise with the world, Demirite is here to support your journey.
          </p>

          {/* Optional: Add a section about your team or values */}
          
          <h2 className="text-3xl font-bold mt-8 mb-4 text-center md:text-left">Our Values</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Empowering Educators and Learners</li>
            <li>Fostering Real Connection</li>
            <li>Ensuring Accessibility and Ease of Use</li>
            <li>Committing to Continuous Improvement</li>
          </ul>
         
        </div>
      </main>
    </div>
  );
}