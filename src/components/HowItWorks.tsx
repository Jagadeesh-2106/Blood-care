import { Card, CardContent } from "./ui/card";
import { UserPlus, Search, Heart, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register",
    description: "Create your profile as a donor or patient with basic medical information",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: Search,
    title: "Smart Matching",
    description: "Our AI instantly finds compatible matches based on blood type and location",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: Heart,
    title: "Connect",
    description: "Get notified of matches and coordinate with healthcare providers",
    color: "bg-red-100 text-red-600"
  },
  {
    icon: CheckCircle,
    title: "Save Lives",
    description: "Complete the donation process and track your impact on the community",
    color: "bg-green-100 text-green-600"
  }
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four simple steps to connect life-saving donors with patients in need
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="relative">
                    <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto`}>
                      <step.icon className="w-8 h-8" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-gray-300 z-10"></div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Emergency? Our platform responds in under 2 minutes for critical cases.
          </p>
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-6 py-3 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">24/7 Emergency Response Available</span>
          </div>
        </div>
      </div>
    </section>
  );
}