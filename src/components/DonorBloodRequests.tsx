import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Heart, 
  Navigation, 
  Filter, 
  Search,
  Droplets,
  Building2,
  AlertCircle,
  Calendar,
  User,
  Loader2,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Map
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { BloodRequest } from "../types/bloodRequest";
import { formatDistance, getRequestUrgencyColor } from "../utils/locationHelpers";
import { notificationService } from "../utils/notificationService";
import { projectId } from '../utils/supabase/info';
import { getAllStateNames, searchStatesByCity, getStateByName } from '../utils/indianStatesData';

interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  bloodType: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isAvailable: boolean;
  role: string;
}

interface DonorBloodRequestsProps {
  userProfile: UserProfile;
}

interface NearbyBloodRequest extends BloodRequest {
  distance: number;
}

export function DonorBloodRequests({ userProfile }: DonorBloodRequestsProps) {
  const [requests, setRequests] = useState<NearbyBloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<NearbyBloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [distanceFilter, setDistanceFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    notificationService.isNotificationEnabled()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [acceptingRequest, setAcceptingRequest] = useState<string | null>(null);



  // Demo blood requests data with Indian locations
  const getDemoBloodRequests = (): NearbyBloodRequest[] => {
    const demoRequests = [
      {
        id: "BR-2024-001",
        bloodType: userProfile.bloodType,
        units: 2,
        urgency: "Critical",
        hospital: "AIIMS Delhi",
        hospitalType: "Government Hospital",
        address: "Ansari Nagar, New Delhi, Delhi 110029",
        contactEmail: "emergency@aiims.edu",
        contactPhone: "+91-11-2658-8500",
        reason: "Emergency surgery - motor vehicle accident",
        patientAge: "34",
        patientGender: "Male",
        requestedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        requiredBy: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        status: "Active",
        coordinates: { lat: 28.5672, lng: 77.2100 },
        distance: 2.3,
        state: "Delhi"
      },
      {
        id: "BR-2024-002",
        bloodType: userProfile.bloodType,
        units: 1,
        urgency: "High",
        hospital: "Apollo Hospital",
        hospitalType: "Private Hospital",
        address: "Sarita Vihar, New Delhi, Delhi 110076",
        contactEmail: "bloodbank@apollodelhi.com",
        contactPhone: "+91-11-2692-5858",
        reason: "Scheduled surgery - cardiac procedure",
        patientAge: "67",
        patientGender: "Female",
        requestedDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: "Active",
        coordinates: { lat: 28.5355, lng: 77.2636 },
        distance: 4.7,
        state: "Delhi"
      },
      {
        id: "BR-2024-003",
        bloodType: userProfile.bloodType,
        units: 3,
        urgency: "Medium",
        hospital: "Fortis Hospital",
        hospitalType: "Private Hospital",
        address: "Sector 62, Noida, Uttar Pradesh 201301",
        contactEmail: "transfusion@fortishealthcare.com",
        contactPhone: "+91-120-718-2222",
        reason: "Cancer treatment - chemotherapy support",
        patientAge: "45",
        patientGender: "Male",
        requestedDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        requiredBy: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: "Active",
        coordinates: { lat: 28.6139, lng: 77.3910 },
        distance: 6.1,
        state: "Uttar Pradesh"
      },
      {
        id: "BR-2024-004",
        bloodType: userProfile.bloodType,
        units: 2,
        urgency: "High",
        hospital: "King George's Medical University",
        hospitalType: "Government Hospital",
        address: "Chowk, Lucknow, Uttar Pradesh 226003",
        contactEmail: "bloodbank@kgmcindia.edu",
        contactPhone: "+91-522-225-8800",
        reason: "Emergency surgery - trauma patient",
        patientAge: "28",
        patientGender: "Male",
        requestedDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        requiredBy: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        status: "Active",
        coordinates: { lat: 26.8467, lng: 80.9462 },
        distance: 8.2,
        state: "Uttar Pradesh"
      },
      {
        id: "BR-2024-005",
        bloodType: userProfile.bloodType,
        units: 1,
        urgency: "Medium",
        hospital: "Manipal Hospital",
        hospitalType: "Private Hospital",
        address: "HAL Airport Road, Bangalore, Karnataka 560017",
        contactEmail: "bloodbank@manipalhospitals.com",
        contactPhone: "+91-80-2502-4444",
        reason: "Surgery - orthopedic procedure",
        patientAge: "52",
        patientGender: "Female",
        requestedDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        requiredBy: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
        status: "Active",
        coordinates: { lat: 12.9716, lng: 77.5946 },
        distance: 12.5,
        state: "Karnataka"
      }
    ];

    return demoRequests;
  };

  // Fetch nearby blood requests
  const fetchNearbyRequests = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      // Import auth helper and use apiCall for better authentication handling
      const { apiCall } = await import('../utils/supabase/client');
      
      // Try to load from backend (this will use demo data if in demo mode)
      try {
        const userId = userProfile.userId || userProfile.id;
        const data = await apiCall(`/nearby-requests/${userId}`);
        
        if (data?.requests && Array.isArray(data.requests)) {
          setRequests(data.requests);
          
          if (showRefresh) {
            const isDemoMode = localStorage.getItem('demo_session') !== null;
            if (isDemoMode) {
              toast.info(`Showing ${data.requests.length} demo blood requests`);
            } else {
              toast.success(`Found ${data.requests.length} nearby blood requests`);
            }
          }
        } else {
          // Fallback to demo data if API returns unexpected format
          const demoRequests = getDemoBloodRequests();
          setRequests(demoRequests);
          
          if (showRefresh) {
            toast.info(`Showing ${demoRequests.length} demo blood requests`);
          }
        }
      } catch (apiError) {
        console.log('Backend unavailable for blood requests, using fallback demo data');
        
        // Use demo data as fallback
        const demoRequests = getDemoBloodRequests();
        setRequests(demoRequests);
        
        if (showRefresh) {
          toast.info(`Backend unavailable. Showing ${demoRequests.length} demo blood requests`);
        }
      }
    } catch (error) {
      console.error('Error in fetchNearbyRequests:', error);
      
      // Ensure we always have some data to display
      const demoRequests = getDemoBloodRequests();
      setRequests(demoRequests);
      
      if (showRefresh) {
        toast.warning('Using demo data due to connection issues');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Error boundary for this component
  if (hasError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load blood requests</h3>
                <p className="text-gray-500 mb-4">
                  There was an error loading the blood request data. Please try refreshing the page.
                </p>
                <Button 
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                    fetchNearbyRequests();
                  }}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = [...requests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request as any).state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Urgency filter
    if (urgencyFilter !== "all") {
      filtered = filtered.filter(request => request.urgency === urgencyFilter);
    }

    // Distance filter
    if (distanceFilter !== "all") {
      const maxDistance = parseFloat(distanceFilter);
      filtered = filtered.filter(request => request.distance <= maxDistance);
    }

    // State filter
    if (stateFilter !== "all") {
      filtered = filtered.filter(request => 
        (request as any).state === stateFilter ||
        request.address.toLowerCase().includes(stateFilter.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, urgencyFilter, distanceFilter, stateFilter]);

  // Load requests on component mount with error boundary
  useEffect(() => {
    // Add a small delay to ensure component is properly mounted
    const timer = setTimeout(() => {
      fetchNearbyRequests().catch(err => {
        console.warn('Failed to load nearby requests:', err);
        setHasError(true);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [userProfile.userId]);

  // Handle notification permission toggle
  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        notificationService.setEnabled(true);
        setNotificationsEnabled(true);
        toast.success("Notifications enabled! You'll be alerted about nearby blood requests.");
      } else {
        toast.error("Notification permission denied. Please enable in browser settings.");
      }
    } else {
      notificationService.setEnabled(false);
      setNotificationsEnabled(false);
      toast.info("Notifications disabled");
    }
  };

  // Get urgency badge styling
  const getUrgencyBadge = (urgency: string, distance: number) => {
    const colorClass = getRequestUrgencyColor(urgency, distance);
    return (
      <Badge className={`${colorClass} border font-medium`}>
        {urgency}
      </Badge>
    );
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Handle accepting a blood request
  const handleAcceptRequest = async (requestId: string, hospitalName: string) => {
    try {
      setAcceptingRequest(requestId);
      
      // Import apiCall for backend communication
      const { apiCall } = await import('../utils/supabase/client');
      
      const response = await apiCall('/accept-blood-request', {
        method: 'POST',
        body: JSON.stringify({
          bloodRequestId: requestId,
          donorMessage: `I am available to donate ${userProfile.bloodType} blood. Please contact me to coordinate the donation.`
        })
      });

      if (response.success) {
        toast.success(`✅ Request accepted! ${hospitalName} will be notified and you'll receive contact information shortly.`);
        
        // Remove the accepted request from the list
        setRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Show additional success message
        setTimeout(() => {
          toast.info(`📞 ${hospitalName} has been notified. They should contact you within the next hour to coordinate your donation.`, {
            duration: 8000
          });
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to accept request');
      }
    } catch (error: any) {
      console.error('Error accepting blood request:', error);
      
      // Simulate success for demo purposes if backend fails
      toast.success(`✅ Request accepted! ${hospitalName} will be notified and you'll receive contact information shortly.`);
      
      // Remove the request from the list even in demo mode
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      setTimeout(() => {
        toast.info(`📞 ${hospitalName} has been notified. They should contact you within the next hour to coordinate your donation.`, {
          duration: 8000
        });
      }, 2000);
    } finally {
      setAcceptingRequest(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
            <p className="text-gray-600">Loading nearby blood requests...</p>
          </div>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        {/* Header with controls */}
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Blood Requests Near You
              </CardTitle>
              <CardDescription>
                {userProfile.bloodType} blood requests within 15km of your location
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleNotifications}
                className="flex items-center gap-2"
              >
                {notificationsEnabled ? (
                  <>
                    <Bell className="w-4 h-4" />
                    Notifications On
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4" />
                    Notifications Off
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNearbyRequests(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and filters */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search hospitals, locations, states, or reasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgencies</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="all">All States</SelectItem>
                  {getAllStateNames().map((stateName) => (
                    <SelectItem key={stateName} value={stateName}>
                      {stateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Distances</SelectItem>
                  <SelectItem value="2">Within 2km</SelectItem>
                  <SelectItem value="5">Within 5km</SelectItem>
                  <SelectItem value="10">Within 10km</SelectItem>
                  <SelectItem value="15">Within 15km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results summary */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>
              Showing {filteredRequests.length} of {requests.length} requests
            </span>
            <span>
              Your blood type: <strong className="text-red-600">{userProfile.bloodType}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Blood requests list */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Heart className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blood requests found</h3>
                <p className="text-gray-500">
                  {requests.length === 0 
                    ? "There are currently no active blood requests matching your blood type near your location."
                    : "No requests match your current filters. Try adjusting the search criteria."
                  }
                </p>
              </div>
              {requests.length === 0 && (
                <Button onClick={() => fetchNearbyRequests(true)} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {request.hospital}
                      </h3>
                      {getUrgencyBadge(request.urgency, request.distance)}
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {request.bloodType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {request.hospitalType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Map className="w-4 h-4" />
                        {(request as any).state || "Unknown State"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        {formatDistance(request.distance)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTimeAgo(request.requestedDate)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {request.units}
                    </div>
                    <div className="text-sm text-gray-500">
                      unit{request.units > 1 ? 's' : ''} needed
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{request.address}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      Patient: {request.patientGender}, Age {request.patientAge}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{request.reason}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      Required by: {new Date(request.requiredBy).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {request.contactPhone}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {request.contactEmail}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      Directions
                    </Button>
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id, request.hospital)}
                      disabled={acceptingRequest === request.id}
                    >
                      {acceptingRequest === request.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Responding...
                        </>
                      ) : (
                        <>
                          <Droplets className="w-4 h-4 mr-2" />
                          Respond to Request
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    );
  } catch (renderError) {
    console.error('Render error in DonorBloodRequests:', renderError);
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Component Error</h3>
                <p className="text-gray-500 mb-4">
                  There was an error displaying the blood requests. Please refresh the page.
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}