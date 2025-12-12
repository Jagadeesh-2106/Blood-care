import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Heart, Users, Smartphone, ArrowRight } from "lucide-react";

interface CallToActionProps {
  onNavigateToRegister?: () => void;
}

export function CallToAction({ onNavigateToRegister }: CallToActionProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Ready to Save Lives?
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of heroes making a difference in their communities. 
                Every donation counts, every match saves a life.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-red-200 hover:border-red-400 transition-colors duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-red-200 transition-colors">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Be a Donor</h3>
                    <p className="text-sm text-gray-600">Help save lives in your community</p>
                  </div>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={onNavigateToRegister}
                  >
                    Register as Donor
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-blue-200 hover:border-blue-400 transition-colors duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Find Blood</h3>
                    <p className="text-sm text-gray-600">Connect with compatible donors</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={onNavigateToRegister}
                  >
                    Search Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Smartphone className="w-4 h-4" />
                <span>Download our mobile app for instant notifications</span>
              </div>
              <div className="flex gap-2">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play" 
                  className="h-10"
                />
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="Download on the App Store" 
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Quick Registration</h3>
                <p className="text-gray-600">Get started in less than 2 minutes</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-sm text-green-800">HIPAA Compliant</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-sm text-blue-800">24/7 Support</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-sm text-purple-800">Real-time Matching</span>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs text-gray-500">
                  By registering, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}