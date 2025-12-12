import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { OfflineModeIndicator } from "./OfflineModeIndicator";
import { 
  Heart, 
  Search, 
  Calendar, 
  Bell, 
  Settings, 
  LogOut, 
  User,
  MapPin,
  Phone,
  Mail,
  Droplets,
  Clock,
  Activity,
  Award,
  Users,
  Building2,
  ChevronRight,
  AlertCircle
} from "lucide-react";


interface UnifiedDashboardProps {
  onSignOut: () => void;
  onNavigateToHome: () => void;
  onNavigateToDonorDashboard: () => void;
  onNavigateToPatientDashboard: () => void;
  onNavigateToHospitalDirectory?: () => void;
}

export function UnifiedDashboard({ onSignOut, onNavigateToHome, onNavigateToDonorDashboard, onNavigateToPatientDashboard, onNavigateToHospitalDirectory }: UnifiedDashboardProps) {
  // Handle action selection and navigate to appropriate dashboard
  const handleActionSelect = (action: 'donate' | 'request') => {
    if (action === 'donate') {
      onNavigateToDonorDashboard();
    } else {
      onNavigateToPatientDashboard();
    }
  };

  // Main dashboard with action selection
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">BloodConnect</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <OfflineModeIndicator />
              <Button variant="ghost" size="sm" onClick={onSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to BloodConnect</h1>
          <p className="text-lg text-gray-600">
            Choose how you'd like to help save lives in your community today.
          </p>
        </div>

        {/* Action Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Donate Blood Card */}
          <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 border-2 hover:border-red-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <Badge variant="secondary" className="bg-red-50 text-red-700">
                  Donor
                </Badge>
              </div>
              <CardTitle className="text-2xl text-gray-900">Donate Blood</CardTitle>
              <CardDescription className="text-base">
                Share the gift of life by donating blood to help patients in need
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-red-500" />
                  Schedule donation appointments
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-red-500" />
                  Find nearby donation centers
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Activity className="w-4 h-4 mr-2 text-red-500" />
                  Track your donation history
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="w-4 h-4 mr-2 text-red-500" />
                  Earn recognition for your contributions
                </div>
              </div>
              <Separator />
              <Button 
                onClick={() => handleActionSelect('donate')}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
              >
                Start Donating
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Request Blood Card */}
          <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 border-2 hover:border-blue-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  Patient/Hospital
                </Badge>
              </div>
              <CardTitle className="text-2xl text-gray-900">Request Blood</CardTitle>
              <CardDescription className="text-base">
                Find and request blood for patients, emergencies, or medical procedures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                  Submit urgent blood requests
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  Connect with compatible donors
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                  Track request status in real-time
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                  Coordinate with blood banks
                </div>
              </div>
              <Separator />
              <Button 
                onClick={() => handleActionSelect('request')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                Request Blood
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 text-blue-600 mr-2" />
              Quick Access
            </CardTitle>
            <CardDescription>
              Essential tools and resources for blood donation and medical services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 border-blue-200"
                onClick={onNavigateToHospitalDirectory}
              >
                <Building2 className="w-8 h-8 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium">Hospital Directory</div>
                  <div className="text-xs text-gray-500">Find hospitals & blood banks</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50 border-green-200"
                onClick={() => alert('Coming soon! Blood bank locator feature will help you find the nearest blood banks.')}
              >
                <MapPin className="w-8 h-8 text-green-600" />
                <div className="text-center">
                  <div className="font-medium">Blood Bank Locator</div>
                  <div className="text-xs text-gray-500">Find nearby blood banks</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-purple-50 border-purple-200"
                onClick={() => alert('Coming soon! Emergency services feature will provide 24/7 emergency blood request support.')}
              >
                <Phone className="w-8 h-8 text-purple-600" />
                <div className="text-center">
                  <div className="font-medium">Emergency Services</div>
                  <div className="text-xs text-gray-500">24/7 emergency support</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Droplets className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">2,847</h3>
              <p className="text-sm text-gray-600">Lives Saved This Month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">15,432</h3>
              <p className="text-sm text-gray-600">Active Donors</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">287</h3>
              <p className="text-sm text-gray-600">Partner Hospitals</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">24/7</h3>
              <p className="text-sm text-gray-600">Emergency Support</p>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Choose your path and start making a difference in your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">For Blood Donors</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Schedule regular donation appointments</li>
                  <li>• Receive notifications for urgent requests</li>
                  <li>• Track your donation history and impact</li>
                  <li>• Connect with local blood donation drives</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">For Patients & Hospitals</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Submit urgent blood requests quickly</li>
                  <li>• Find compatible donors in your area</li>
                  <li>• Coordinate with blood banks and hospitals</li>
                  <li>• Track request status in real-time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}