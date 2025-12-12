import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { 
  Zap, 
  MapPin, 
  Shield, 
  Clock, 
  Smartphone, 
  Users, 
  Heart, 
  Bell,
  Database
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-Time Matching",
    description: "AI-powered algorithm instantly matches compatible donors with patients based on blood type, location, and urgency."
  },
  {
    icon: MapPin,
    title: "Location-Based Search",
    description: "Find the nearest available donors or blood banks within your area for faster response times."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "HIPAA-compliant platform ensuring all medical information is encrypted and protected."
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Round-the-clock access to emergency blood requests and donor notifications."
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Optimized mobile app for quick access during emergencies and on-the-go donations."
  },
  {
    icon: Users,
    title: "Community Network",
    description: "Build a trusted network of verified donors and healthcare providers in your area."
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Intelligent alerts for urgent requests, appointment reminders, and donation opportunities."
  },
  {
    icon: Database,
    title: "Inventory Tracking",
    description: "Real-time blood bank inventory management with expiration date tracking and alerts."
  },
  {
    icon: Heart,
    title: "Impact Dashboard",
    description: "Track your donation history and see the lives you've helped save through detailed analytics."
  }
];

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced technology meets humanitarian purpose. Our platform revolutionizes blood donation 
            with smart matching, real-time tracking, and seamless user experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}