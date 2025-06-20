
import { Calendar, Clock, User } from "lucide-react";

const features = [
  {
    icon: <User className="h-8 w-8 text-learn9ja" />,
    title: "Expert Nigerian Teachers",
    description: "Connect with qualified Nigerian teachers specialized in various subjects and educational levels."
  },
  {
    icon: <Clock className="h-8 w-8 text-learn9ja" />,
    title: "Instant or Scheduled Classes",
    description: "Get help immediately with instant classes or schedule sessions for a time that works for you."
  },
  {
    icon: <Calendar className="h-8 w-8 text-learn9ja" />,
    title: "Premium Recording Access",
    description: "Subscribe to premium and access recordings of your classes for review at any time."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-learn9ja-dark">
            Why Choose <span className="text-learn9ja">Learn9ja</span>?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our platform provides the perfect environment for effective online learning tailored for Nigerians.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm card-hover"
            >
              <div className="h-14 w-14 bg-learn9ja/10 rounded-lg flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-learn9ja-dark mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
