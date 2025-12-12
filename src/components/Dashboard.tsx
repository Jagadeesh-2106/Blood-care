import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Heart, 
  Bell, 
  MapPin, 
  Clock, 
  User, 
  Building2, 
  AlertCircle, 
  CheckCircle,
  Search,
  Plus,
  LogOut,
  Settings,
  Activity,
  Home,
  Phone,
  Edit3,
  Save,
  AlertTriangle,
  Filter,
  Mail,
  Trash2,
  Menu,
  HelpCircle,
  Loader2,
  Switch,
  ArrowLeft,
  RefreshCw,
  BarChart3,
  Award,
  FileText,
  TrendingUp
} from "lucide-react";
import { FindBloodRequests } from "./FindBloodRequests";
import { ProfileSettings } from "./ProfileSettings";
import { DonorBloodRequests } from "./DonorBloodRequests";
import { NotificationCenter } from "./NotificationCenter";
import { BloodRequestForm } from "./BloodRequestForm";
import { AppointmentSystem } from "./AppointmentSystem";
import { DonorHomeDashboard } from "./DonorHomeDashboard";
import { EmergencyDashboard } from "./EmergencyDashboard";
import { ReportingDashboard } from "./ReportingDashboard";
import { profile } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";
import { notificationService } from "../utils/notificationService";

interface DashboardProps {
  userRole: 'donor' | 'patient' | 'clinic';
  onSignOut: () => void;
  onNavigateToHome?: () => void;
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

// Utility functions for styling
const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-green-100 text-green-800 border-green-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Fulfilled': return 'bg-green-100 text-green-800 border-green-200';
    case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function Dashboard({ userRole, onSignOut, onNavigateToHome }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationPollingRef = useRef<number | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Start notification polling for all user roles
  useEffect(() => {
    if (userProfile) {
      startNotificationPolling();
      
      // Request notification permission
      notificationService.requestPermission().then(granted => {
        if (granted) {
          console.log(`📳 Notification permission granted for ${userRole}`);
        }
      });
    }

    // Cleanup on unmount or role change
    return () => {
      if (notificationPollingRef.current) {
        notificationService.stopPolling(notificationPollingRef.current);
      }
    };
  }, [userProfile, userRole]);

  const startNotificationPolling = () => {
    if (!userProfile) return;
    
    const userId = userProfile.id;
    console.log(`🔔 Starting notification polling for ${userRole}:`, userId);
    
    // Start polling every 15 seconds, passing the user role
    notificationPollingRef.current = notificationService.startPolling(userId, userRole, 15000);
    
    // Also fetch current notification count
    fetchNotificationCount();
  };

  const fetchNotificationCount = async () => {
    if (!userProfile) return;
    
    try {
      const notifications = await notificationService.fetchNotifications(userProfile.id);
      const unreadCount = notifications.filter(n => !n.read).length;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.debug('Error fetching notification count:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const { profile: userProfileData } = await profile.get();
      setUserProfile(userProfileData);
      console.log('✅ Profile loaded successfully:', userProfileData.fullName);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      
      // Handle demo profile errors specifically
      if (error.message?.includes('Demo profile not found')) {
        console.log('🔧 Demo profile missing, attempting to restore...');
        
        // Try to restore demo profile from session
        const demoSession = localStorage.getItem('demo_session');
        if (demoSession) {
          try {
            const session = JSON.parse(demoSession);
            const email = session.user?.email;
            
            // Import DEMO_USERS and restore profile
            import('../utils/supabase/client').then(({ DEMO_USERS }) => {
              if (email && email in DEMO_USERS) {
                const restoredProfile = DEMO_USERS[email as keyof typeof DEMO_USERS].profile;
                localStorage.setItem('demo_profile', JSON.stringify(restoredProfile));
                setUserProfile(restoredProfile);
                console.log('✅ Demo profile restored and loaded');
                toast.success('Demo profile restored');
                return;
              }
            });
          } catch (restoreError) {
            console.warn('Failed to restore demo profile:', restoreError);
          }
        }
      }
      
      // Show error message
      toast.error('Failed to load user profile. Please try signing in again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToNewRequest = () => {
    setActiveTab("requests");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Loading Issue</h3>
            <p className="text-gray-600 mb-4">
              We're having trouble loading your profile. This might be a temporary network issue.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={fetchUserProfile} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={onSignOut} variant="ghost" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out & Try Demo Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate grid columns based on user role and available tabs (removed impact and availability tabs)
  const getTabsGridCols = () => {
    if (userRole === 'donor') {
      return 'grid-cols-5'; // Home, Requests, History, Profile, Notifications
    } else if (userRole === 'clinic') {
      return 'grid-cols-6'; // Home, New Request, History, Profile, Notifications, Reports, Emergency
    } else {
      return 'grid-cols-5'; // Home, New Request, History, Profile, Notifications (Reports removed)
    }
  };
  
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
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="hidden md:inline-flex">
                  {userRole === 'donor' ? 'Donor Dashboard' : 
                   userRole === 'clinic' ? 'Healthcare Dashboard' : 'Patient Dashboard'}
                </Badge>
                {notificationPollingRef.current && (
                  <Badge className="hidden md:inline-flex bg-green-100 text-green-800 border-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    {userRole === 'donor' ? 'Live Blood Request Matching' : 'Live Donor Response Alerts'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-red-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-semibold">Emergency: 911</span>
              </div>

              {onNavigateToHome && (
                <Button variant="outline" size="sm" onClick={onNavigateToHome}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}

              <div className="flex items-center gap-2">
                <Avatar 
                  className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-red-200 transition-all duration-200" 
                  onClick={() => setActiveTab("profile")}
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

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {/* First row - basic navigation */}
                <Button 
                  variant={activeTab === "home" ? "default" : "ghost"}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  onClick={() => {
                    setActiveTab("home");
                    setIsMenuOpen(false);
                  }}
                >
                  <Activity className="w-5 h-5" />
                  <span className="text-xs">Home</span>
                </Button>
                <Button 
                  variant={activeTab === "requests" ? "default" : "ghost"}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  onClick={() => {
                    setActiveTab("requests");
                    setIsMenuOpen(false);
                  }}
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
              </div>
              
              {/* Second row - additional features */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button 
                  variant={activeTab === "history" ? "default" : "ghost"}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  onClick={() => {
                    setActiveTab("history");
                    setIsMenuOpen(false);
                  }}
                >
                  <Clock className="w-5 h-5" />
                  <span className="text-xs">History</span>
                </Button>
                <Button 
                  variant={activeTab === "notifications" ? "default" : "ghost"}
                  className="flex flex-col items-center gap-1 h-auto py-3 relative"
                  onClick={() => {
                    setActiveTab("notifications");
                    setIsMenuOpen(false);
                    fetchNotificationCount();
                  }}
                >
                  <Bell className="w-5 h-5" />
                  <span className="text-xs">Alerts</span>
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-4 h-4 flex items-center justify-center rounded-full">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Button>
                <Button 
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  onClick={() => {
                    setActiveTab("profile");
                    setIsMenuOpen(false);
                  }}
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-xs">Profile</span>
                </Button>
              </div>

              {/* Third row - role-specific features (removed impact and certificates for donors, removed reports for patients) */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {userRole === 'clinic' && (
                  <Button 
                    variant={activeTab === "reports" ? "default" : "ghost"}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                    onClick={() => {
                      setActiveTab("reports");
                      setIsMenuOpen(false);
                    }}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-xs">Reports</span>
                  </Button>
                )}
                {userRole === 'clinic' && (
                  <Button 
                    variant={activeTab === "emergency" ? "default" : "ghost"}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                    onClick={() => {
                      setActiveTab("emergency");
                      setIsMenuOpen(false);
                    }}
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-xs">Emergency</span>
                  </Button>
                )}
              </div>
              
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-semibold">Emergency: 911</span>
                </div>
                {onNavigateToHome && (
                  <Button 
                    variant="outline" 
                    className="w-full mb-2"
                    onClick={onNavigateToHome}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${getTabsGridCols()} mb-8`}>
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            
            <TabsTrigger value="requests" className="flex items-center gap-2">
              {userRole === 'donor' ? <Heart className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span className="hidden sm:inline">{userRole === 'donor' ? 'Requests' : 'New Request'}</span>
            </TabsTrigger>
            
            {/* Removed availability/calendar tab */}
            
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              {notificationCount > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </TabsTrigger>
            
            {/* Removed impact and certificates tabs for donors, removed reports for patients */}
            
            {userRole === 'clinic' && (
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
            )}
            
            {userRole === 'clinic' && (
              <TabsTrigger value="emergency" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Emergency</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="home" className="space-y-6">
            {userRole === 'donor' ? (
              <DonorHomeDashboard userProfile={userProfile} setActiveTab={setActiveTab} />
            ) : (
              <PatientHomeDashboard userProfile={userProfile} onNavigateToNewRequest={navigateToNewRequest} setActiveTab={setActiveTab} />
            )}
          </TabsContent>

          <TabsContent value="requests">
            {userRole === 'donor' ? (
              <DonorBloodRequests userProfile={userProfile} />
            ) : (
              <PatientBloodRequestsTab userProfile={userProfile} />
            )}
          </TabsContent>

          {/* Removed availability tab content */}

          <TabsContent value="history">
            {userRole === 'donor' ? (
              <DonationHistory userProfile={userProfile} />
            ) : (
              <RequestHistory userProfile={userProfile} />
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <ProfileSettings userProfile={userProfile} onProfileUpdate={fetchUserProfile} />
            <AppointmentSystem userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter userProfile={userProfile} onNotificationUpdate={fetchNotificationCount} />
          </TabsContent>

          {/* Removed impact and certificates tabs content, removed reports for patients */}

          {userRole === 'clinic' && (
            <TabsContent value="reports">
              <ReportingDashboard userRole={userRole} userProfile={userProfile} />
            </TabsContent>
          )}

          {userRole === 'clinic' && (
            <TabsContent value="emergency">
              <EmergencyDashboard />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

// Patient/Clinic Dashboard Component
function PatientHomeDashboard({ userProfile, onNavigateToNewRequest, setActiveTab }: { 
  userProfile: UserProfile, 
  onNavigateToNewRequest?: () => void, 
  setActiveTab?: (tab: string) => void 
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Quick Stats */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Welcome back, {userProfile.fullName.split(' ')[0]}
          </CardTitle>
          <CardDescription>
            {userProfile.organizationName || 'Managing blood requests'} in {userProfile.location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-500">Active Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-500">Fulfilled Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-500">Matched Donors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {userProfile.organizationType || 'Healthcare'}
              </div>
              <div className="text-sm text-gray-500">Organization Type</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={onNavigateToNewRequest}>
            <Plus className="w-4 h-4 mr-2" />
            New Blood Request
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setActiveTab?.("notifications")}>
            <Bell className="w-4 h-4 mr-2" />
            View Notifications
          </Button>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Blood Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Heart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No recent requests</p>
            <p className="text-xs text-gray-400 mt-1">
              Create your first blood request to get started
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder components for missing functionality
function PatientBloodRequestsTab({ userProfile }: { userProfile: UserProfile }) {
  return (
    <div className="space-y-6">
      <BloodRequestForm userProfile={userProfile} />
    </div>
  );
}

function DonationHistory({ userProfile }: { userProfile: UserProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation History</CardTitle>
        <CardDescription>Your past blood donations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-500 py-8">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No donation history yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Your future donations will appear here
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestHistory({ userProfile }: { userProfile: UserProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request History</CardTitle>
        <CardDescription>Your past blood requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-500 py-8">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No request history yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Your future requests will appear here
          </p>
        </div>
      </CardContent>
    </Card>
  );
}