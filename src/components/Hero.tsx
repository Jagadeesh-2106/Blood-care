import { Button } from "./ui/button";
import { Heart, Clock, Users, Shield } from "lucide-react";

interface HeroProps {
  onNavigateToRegister?: () => void;
  onNavigateToSignIn?: () => void;
}

export function Hero({ onNavigateToRegister, onNavigateToSignIn }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 py-20 lg:py-32">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full">
                <Heart className="w-4 h-4" />
                <span>Save Lives • Real-Time Matching</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
                Blood Connect platform
              </h1>
              <p className="text-xl text-gray-600">
                Connecting donors and patients instantly through AI-powered matching. 
                Reduce waiting times, save more lives, and make blood donation more efficient than ever.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={onNavigateToRegister}
              >
                <Heart className="w-5 h-5 mr-2" />
                Register as Donor
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-red-600 text-red-600 hover:bg-red-50"
                onClick={onNavigateToRegister}
              >
                <Users className="w-5 h-5 mr-2" />
                Find Blood
              </Button>
            </div>

            {/* Demo Account Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm font-medium text-blue-900 mb-2">🚀 Try Demo Accounts (No Registration Required)</div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>👤 <strong>Donor:</strong> donor@demo.com / Demo123!</div>
                  <div>🏥 <strong>Patient:</strong> patient@demo.com / Demo123!</div>
                  <div>🩺 <strong>Hospital:</strong> hospital@demo.com / Demo123!</div>
                </div>
                <div className="text-xs text-blue-600 mt-2">✨ Full platform access • Works offline • No setup required</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={onNavigateToSignIn}
                >
                  Try Demo Login →
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">10K+</div>
                <div className="text-sm text-gray-600">Active Donors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">500+</div>
                <div className="text-sm text-gray-600">Lives Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">2 min</div>
                <div className="text-sm text-gray-600">Avg Match Time</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="font-semibold text-green-800">Match Found!</div>
                    <div className="text-sm text-green-600">Compatible donor 2.3km away</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Blood Type: O+</span>
                    <span className="text-sm font-semibold text-red-600">URGENT</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Location: City Hospital</span>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Security: HIPAA Compliant</span>
                    <Shield className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-red-100 rounded-full opacity-60"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-pink-100 rounded-full opacity-40"></div>
          </div>
        </div>
      </div>
    </section>
  );
}