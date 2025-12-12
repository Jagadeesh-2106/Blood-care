import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { 
  Heart, 
  Calendar, 
  Bell, 
  MapPin, 
  User, 
  Building2, 
  Activity,
  Search,
  Plus,
  LogOut,
  ChevronRight,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Phone,
  Menu,
  Settings,
  Home,
  HelpCircle,
  Loader2
} from "lucide-react";
import { FindBloodRequests } from "./FindBloodRequests";
import { useState, useEffect } from "react";
import { profile } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";

interface HomePageProps {
  userRole: 'donor' | 'patient' | 'clinic';
  onSignOut: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToBloodBanks?: () => void;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'donor' | 'patient' | 'clinic';
  bloodType?: string;
  location: string;
  phoneNumber: string;
  createdAt: string;
  isAvailable?: boolean;
  organizationType?: string;
  organizationName?: string;
}

export function HomePage({ userRole, onSignOut, onNavigateToDashboard, onNavigateToBloodBanks }: HomePageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const { profile: userProfileData } = await profile.get();
      setUserProfile(userProfileData);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-gray-600">Failed to load your profile</p>
          <Button onClick={fetchUserProfile} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Heart className="w-8 h-8 text-red-600" />
                <span className="text-lg font-bold text-gray-900">BloodConnect</span>
              </div>
              <Badge variant="secondary">
                Welcome Home
              </Badge>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-red-600"
                onClick={onNavigateToDashboard}
              >
                <Activity className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-red-600"
                onClick={onNavigateToDashboard}
              >
                {userRole === 'donor' ? (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Blood Requests
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    New Request
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-red-600"
                onClick={onNavigateToBloodBanks}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Blood Banks
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-red-600"
                onClick={onNavigateToDashboard}
              >
                <Clock className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-red-600"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
            </nav>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-red-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-semibold">Emergency: 911</span>
              </div>


              
              <div className="flex items-center gap-2">
                <Avatar 
                  className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-red-200 transition-all duration-200" 
                  onClick={onNavigateToDashboard}
                  title="View Profile"
                >
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">
                    {userProfile.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole === 'donor' ? userProfile.bloodType : 
                     userRole === 'clinic' ? (userProfile.organizationName || 'Medical Professional') :
                     'Patient'}
                  </p>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={onSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Icon Grid Layout */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center gap-1 h-auto py-3 text-gray-700 hover:text-red-600"
                  onClick={onNavigateToDashboard}
                >
                  <Activity className="w-5 h-5" />
                  <span className="text-xs">Dashboard</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center gap-1 h-auto py-3 text-gray-700 hover:text-red-600"
                  onClick={onNavigateToDashboard}
                >
                  {userRole === 'donor' ? (
                    <>
                      <Heart className="w-5 h-5" />
                      <span className="text-xs">Requests</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span className="text-xs">New</span>
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center gap-1 h-auto py-3 text-gray-700 hover:text-red-600"
                  onClick={onNavigateToDashboard}
                >
                  <Clock className="w-5 h-5" />
                  <span className="text-xs">History</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center gap-1 h-auto py-3 text-gray-700 hover:text-red-600"
                  onClick={() => {
                    onNavigateToDashboard();
                    setIsMenuOpen(false);
                  }}
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-xs">Profile</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center gap-1 h-auto py-3 text-gray-700 hover:text-red-600"
                  onClick={() => {
                    onNavigateToBloodBanks?.();
                    setIsMenuOpen(false);
                  }}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-xs">Blood Banks</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center gap-1 h-auto py-3 text-gray-700 hover:text-red-600"
                >
                  <Bell className="w-5 h-5" />
                  <span className="text-xs">Notifications</span>
                </Button>
              </div>
              
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-semibold">Emergency: 911</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-red-600 text-red-600 hover:bg-red-50"
                  onClick={onSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile.fullName.split(' ')[0]}!
          </h1>
          <p className="text-lg text-gray-600">
            {userRole === 'donor' 
              ? "Thank you for your continued commitment to saving lives through blood donation."
              : userRole === 'clinic' 
              ? "Manage your blood requests and connect with donors efficiently."
              : "Access blood donation resources and manage your medical needs."
            }
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Stats */}
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your Impact
              </CardTitle>
              <CardDescription>
                {userRole === 'donor' 
                  ? "Your donation statistics and impact on the community"
                  : "Your organization's blood management overview"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userRole === 'donor' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">0</div>
                    <div className="text-sm text-gray-600">Total Donations</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Lives Impacted</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {userProfile.isAvailable ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">Available Status</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {new Date(userProfile.createdAt).getFullYear()}
                    </div>
                    <div className="text-sm text-gray-600">Member Since</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">0</div>
                    <div className="text-sm text-gray-600">Active Requests</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">-</div>
                    <div className="text-sm text-gray-600">Available Donors</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Fulfilled Today</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {new Date(userProfile.createdAt).getFullYear()}
                    </div>
                    <div className="text-sm text-gray-600">Member Since</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {userRole === 'donor' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="font-medium">{userProfile.fullName}</h3>
                {userRole === 'donor' ? (
                  <>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {userProfile.bloodType}
                    </Badge>
                    <p className="text-sm text-gray-500">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {userProfile.location}
                    </p>
                    <p className="text-xs text-gray-400">
                      Member since {new Date(userProfile.createdAt).getFullYear()}
                    </p>
                    <Badge variant={userProfile.isAvailable ? "default" : "secondary"} className="mt-2">
                      {userProfile.isAvailable ? "Available to Donate" : "Not Available"}
                    </Badge>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      {userProfile.organizationName || (userRole === 'clinic' ? 'Medical Professional' : 'Patient')}
                    </p>
                    {userProfile.organizationType && (
                      <Badge variant="outline" className="capitalize">
                        {userProfile.organizationType}
                      </Badge>
                    )}
                    <p className="text-sm text-gray-500">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {userProfile.location}
                    </p>
                    <p className="text-xs text-gray-400">
                      Member since {new Date(userProfile.createdAt).getFullYear()}
                    </p>
                  </>
                )}
                <p className="text-xs text-gray-400">
                  <Phone className="w-3 h-3 inline mr-1" />
                  {userProfile.phoneNumber}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRole === 'donor' ? (
                  <>
                    <Button 
                      className="h-16 flex flex-col gap-2 bg-red-600 hover:bg-red-700"
                      onClick={onNavigateToDashboard}
                    >
                      <Search className="w-5 h-5" />
                      <span>Find Blood Requests</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col gap-2"
                      onClick={onNavigateToDashboard}
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Schedule Appointment</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col gap-2"
                      onClick={onNavigateToDashboard}
                    >
                      <Heart className="w-5 h-5" />
                      <span>View Matches</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col gap-2"
                      onClick={onNavigateToDashboard}
                    >
                      <Clock className="w-5 h-5" />
                      <span>Donation History</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      className="h-16 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700"
                      onClick={onNavigateToDashboard}
                    >
                      <Plus className="w-5 h-5" />
                      <span>New Blood Request</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col gap-2"
                      onClick={onNavigateToDashboard}
                    >
                      <Users className="w-5 h-5" />
                      <span>Find Donors</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col gap-2"
                      onClick={onNavigateToDashboard}
                    >
                      <Activity className="w-5 h-5" />
                      <span>Request Status</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col gap-2"
                      onClick={onNavigateToDashboard}
                    >
                      <Clock className="w-5 h-5" />
                      <span>Request History</span>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center text-gray-500 py-8">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs text-gray-400 mt-1">
                  {userRole === 'donor' 
                    ? "Start by finding blood requests to see your activity here"
                    : "Submit a blood request to see your activity here"
                  }
                </p>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-4"
                onClick={onNavigateToDashboard}
              >
                View Full Dashboard
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Functional Tabs */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Your Dashboard
              </CardTitle>
              <CardDescription>
                Access all your important functions in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userRole === 'donor' ? (
                <DonorTabs />
              ) : (
                <PatientTabs />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <Heart className="w-12 h-12 text-red-600 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">
                {userRole === 'donor' 
                  ? "Ready to save more lives?" 
                  : "Need blood for your patients?"
                }
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                {userRole === 'donor' 
                  ? "There are people in your community who need your help. Check for new blood requests or schedule your next donation."
                  : "Our platform connects you with verified donors quickly and efficiently. Submit a new request or check existing ones."
                }
              </p>
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700"
                onClick={onNavigateToDashboard}
              >
                {userRole === 'donor' ? "Find Blood Requests" : "Manage Requests"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Mock data for tabs
const mockAppointments = [
  {
    id: 1,
    date: "2024-09-20",
    time: "2:00 PM",
    location: "NYC Blood Center",
    address: "310 E 67th St, New York, NY",
    type: "Whole Blood",
    status: "Confirmed"
  },
  {
    id: 2,
    date: "2024-10-15",
    time: "10:30 AM",
    location: "Manhattan Blood Bank",
    address: "150 Amsterdam Ave, New York, NY",
    type: "Platelets",
    status: "Pending"
  }
];

const mockMatches = [
  {
    id: 1,
    hospital: "Mount Sinai Hospital",
    bloodType: "O+",
    urgency: "Critical",
    distance: "1.2 miles",
    matchDate: "2024-08-25",
    status: "New"
  },
  {
    id: 2,
    hospital: "NYU Langone Health",
    bloodType: "O+",
    urgency: "High",
    distance: "2.8 miles",
    matchDate: "2024-08-24",
    status: "Responded"
  }
];

const mockDonationHistory = [
  {
    id: 1,
    date: "2024-07-15",
    location: "NYC Blood Center",
    type: "Whole Blood",
    units: 1,
    recipientInfo: "Emergency Surgery Patient"
  },
  {
    id: 2,
    date: "2024-04-20",
    location: "Manhattan Blood Bank",
    type: "Platelets",
    units: 1,
    recipientInfo: "Cancer Patient"
  },
  {
    id: 3,
    date: "2024-01-10",
    location: "Presbyterian Hospital",
    type: "Whole Blood",
    units: 1,
    recipientInfo: "Trauma Patient"
  }
];

// Donor Tabs Component
function DonorTabs() {
  return (
    <Tabs defaultValue="find-requests" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="find-requests" className="text-xs">
          <Search className="w-4 h-4 mr-1" />
          Find Requests
        </TabsTrigger>
        <TabsTrigger value="schedule" className="text-xs">
          <Calendar className="w-4 h-4 mr-1" />
          Schedule
        </TabsTrigger>
        <TabsTrigger value="matches" className="text-xs">
          <Heart className="w-4 h-4 mr-1" />
          Matches
        </TabsTrigger>
        <TabsTrigger value="history" className="text-xs">
          <Clock className="w-4 h-4 mr-1" />
          History
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="find-requests" className="mt-4">
        <FindBloodRequests />
      </TabsContent>
      
      <TabsContent value="schedule" className="mt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Upcoming Appointments</h3>
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Schedule New
            </Button>
          </div>
          
          <div className="space-y-3">
            {mockAppointments.map(appointment => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{appointment.type}</Badge>
                        <Badge className={appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{appointment.location}</h4>
                      <p className="text-sm text-gray-500">{appointment.address}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {appointment.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appointment.time}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="matches" className="mt-4">
        <div className="space-y-4">
          <h3 className="font-medium">Current Matches</h3>
          
          <div className="space-y-3">
            {mockMatches.map(match => (
              <Card key={match.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={match.urgency === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {match.urgency}
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          {match.bloodType}
                        </Badge>
                        <Badge className={match.status === 'New' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                          {match.status}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{match.hospital}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {match.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Matched {match.matchDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700" disabled={match.status === 'Responded'}>
                        <Heart className="w-4 h-4 mr-1" />
                        {match.status === 'Responded' ? 'Responded' : 'Respond'}
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="history" className="mt-4">
        <div className="space-y-4">
          <h3 className="font-medium">Donation History</h3>
          
          <div className="space-y-3">
            {mockDonationHistory.map(donation => (
              <Card key={donation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{donation.type}</Badge>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                      <h4 className="font-medium">{donation.location}</h4>
                      <p className="text-sm text-gray-600">For: {donation.recipientInfo}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {donation.date}
                        </span>
                        <span>{donation.units} unit{donation.units > 1 ? 's' : ''} donated</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        View Certificate
                      </Button>
                      <Button variant="ghost" size="sm">
                        Share Impact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// Patient Tabs Component (placeholder)
function PatientTabs() {
  return (
    <Tabs defaultValue="new-request" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="new-request" className="text-xs">
          <Plus className="w-4 h-4 mr-1" />
          New Request
        </TabsTrigger>
        <TabsTrigger value="find-donors" className="text-xs">
          <Users className="w-4 h-4 mr-1" />
          Find Donors
        </TabsTrigger>
        <TabsTrigger value="status" className="text-xs">
          <Activity className="w-4 h-4 mr-1" />
          Status
        </TabsTrigger>
        <TabsTrigger value="history" className="text-xs">
          <Clock className="w-4 h-4 mr-1" />
          History
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="new-request" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Create New Blood Request</CardTitle>
            <CardDescription>Submit a new blood donation request for your patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Blood Type Required</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Units Needed</label>
                  <Input type="number" placeholder="1" min="1" max="10" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Urgency Level</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Required By</label>
                  <Input type="datetime-local" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Patient Information</label>
                <Input placeholder="Age, gender, medical condition (optional)" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Additional Notes</label>
                <textarea 
                  className="w-full p-2 border rounded-md" 
                  rows={3} 
                  placeholder="Any additional information about the request..."
                ></textarea>
              </div>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Submit Blood Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="find-donors" className="mt-4">
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">Find Donors</h3>
          <p className="text-sm text-gray-500">Search for available donors in your area.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="status" className="mt-4">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">Request Status</h3>
          <p className="text-sm text-gray-500">View the status of your blood requests.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="history" className="mt-4">
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">Request History</h3>
          <p className="text-sm text-gray-500">View your previous blood requests and their outcomes.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}