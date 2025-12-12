import { Button } from "./ui/button";
import { Heart, Menu, Phone } from "lucide-react";
import { useState } from "react";
import { OfflineModeIndicator } from "./OfflineModeIndicator";
import { Notifications } from "./Notifications";

interface HeaderProps {
  onNavigateToRegister?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToSignIn?: () => void;
  onNavigateToBloodBanks?: () => void;
  onNavigateToHospitalDirectory?: () => void;
  onNavigateToHowItWorks?: () => void;
  onNavigateToFindDonors?: () => void;
  onNavigateToAbout?: () => void;
  userId?: string;
}

export function Header({ 
  onNavigateToRegister, 
  onNavigateToHome, 
  onNavigateToSignIn, 
  onNavigateToBloodBanks,
  onNavigateToHospitalDirectory,
  onNavigateToHowItWorks,
  onNavigateToFindDonors,
  onNavigateToAbout,
  userId
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateToHome}>
            <Heart className="w-8 h-8 text-red-600" />
            <span className="text-lg font-bold text-gray-900">BloodConnect</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Navigation items removed */}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <OfflineModeIndicator />
            <div className="flex items-center gap-2 text-red-600">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-semibold">Emergency: 911</span>
            </div>
            <Button 
              variant="outline" 
              className="border-red-600 text-red-600 hover:bg-red-50"
              onClick={onNavigateToSignIn}
            >
              Sign In
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={onNavigateToRegister}
            >
              Register
            </Button>
            
            {/* Notifications */}
            {userId && <Notifications userId={userId} />}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <div className="flex justify-center mb-2">
                <OfflineModeIndicator />
              </div>
              {/* Blood Banks navigation removed */}
              <div className="flex flex-col gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  onClick={onNavigateToSignIn}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={onNavigateToRegister}
                >
                  Register
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}