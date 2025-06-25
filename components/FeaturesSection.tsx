
import { Clock, CreditCard, MessageSquare, UserCheck, Video } from "lucide-react";

const features = [
  {
    icon: <Video className="h-8 w-8 text-learn9ja" />,
    title: "Live video",
    description: "Crystal clear audio and video ensure you don&apos;t miss a single detail in your live sessions..."
  },
  {
    icon: <Clock className="h-8 w-8 text-learn9ja" />,
    title: "Instant or Scheduled Classes",
    description: "Get help immediately with instant classes or schedule sessions for any time that works for you."
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-learn9ja" />,
    title: "Interactive Tools",
    description: "Subscribe to premium and access recordings of your classes for review at any time."
  },
  {
    icon: <UserCheck className="h-8 w-8 text-learn9ja" />,
    title: "Vetted Teachers",
    description: "Explore comprehensive profiles of thoroughly vetted teacher with security checks, expertise, reviews, and teaching styles."
  },
  {
    icon: <CreditCard className="h-8 w-8 text-learn9ja" />,
    title: "Secure Payments",
    description: "We partner Paystack payment for seamless and secure payment processing."
  },
  {
    icon: <CreditCard className="h-8 w-8 text-learn9ja" />,
    title: "Session Replays",
    description: "Review your live sessions with a replay available for up to 1 hour post-session."
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
            Explore the powerful features that make learning and teaching on Learn9ja a breeze and rewarding.
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
