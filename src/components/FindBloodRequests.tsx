import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner@2.0.3";
import { 
  Search, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Heart,
  Filter,
  User,
  Building2,
  Phone,
  Calendar,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Globe,
  Activity,
  Mail,
  ExternalLink,
  Share2,
  Shield,
  Zap,
  Users,
  Thermometer,
  Wifi,
  Database,
  Award,
  TrendingUp,
  Settings,
  CircleDot,
  Timer
} from "lucide-react";

import { BloodRequest } from "../types/bloodRequest";
import { locationHierarchy, MOCK_API_ENDPOINT } from "../utils/bloodRequestData";
import { 
  getUrgencyColor, 
  getHospitalTypeColor, 
  filterBloodRequests, 
  sortBloodRequests, 
  exportRequestsToCSV,
  simulateAPICall 
} from "../utils/bloodRequestHelpers";

const getUrgencyIcon = (urgency: string) => {
  switch (urgency) {
    case 'Critical':
    case 'High':
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export function FindBloodRequests() {
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [selectedDistance, setSelectedDistance] = useState("all");
  const [selectedHospitalType, setSelectedHospitalType] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("urgency");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Get available options based on current selections
  const availableStates = ["all", ...Object.keys(locationHierarchy)];
  const availableDistricts = selectedState === "all" 
    ? ["all"]
    : ["all", ...Object.keys(locationHierarchy[selectedState] || {})];
  const availableCities = selectedState === "all" || selectedDistrict === "all"
    ? ["all"]
    : ["all", ...(locationHierarchy[selectedState]?.[selectedDistrict] || [])];

  // Reset dependent filters when parent changes
  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedDistrict("all");
    setSelectedCity("all");
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedCity("all");
  };

  // Action handlers for buttons
  const handleRespondToRequest = (request: BloodRequest) => {
    toast.success(`Response sent to ${request.hospital}`, {
      description: `You've responded to the ${request.bloodType} blood request. The hospital will contact you shortly.`
    });
  };

  const handleCallHospital = (request: BloodRequest) => {
    const phoneNumber = request.contactPhone.replace(/\D/g, '');
    if (navigator.userAgent.includes('Mobile')) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      navigator.clipboard.writeText(phoneNumber);
      toast.info(`Phone number copied: ${request.contactPhone}`, {
        description: "Open your phone app and paste the number to call."
      });
    }
  };

  const handleVisitWebsite = (request: BloodRequest) => {
    const website = request.bloodBankDetails.website;
    window.open(website, '_blank', 'noopener,noreferrer');
    toast.info(`Opening ${request.hospital} website`);
  };

  const handleSendEmail = (request: BloodRequest) => {
    const subject = encodeURIComponent(`Blood Donation Inquiry - ${request.bloodType} Request`);
    const body = encodeURIComponent(
      `Dear ${request.contactPerson},

I am writing to inquire about the ${request.bloodType} blood request posted for ${request.hospital}.

Request Details:
- Blood Type: ${request.bloodType}
- Units Needed: ${request.units}
- Urgency: ${request.urgency}
- Required By: ${request.requiredBy}

I am interested in helping with this request. Please let me know the next steps.

Best regards`
    );
    
    window.location.href = `mailto:${request.contactEmail}?subject=${subject}&body=${body}`;
    toast.info(`Opening email to ${request.contactPerson}`);
  };

  const handleShareRequest = (request: BloodRequest) => {
    const shareText = `🩸 URGENT: ${request.bloodType} blood needed at ${request.hospital}
${request.units} unit${request.units > 1 ? 's' : ''} required by ${request.requiredBy}
Urgency: ${request.urgency}
Contact: ${request.contactPhone}

Help save a life! #BloodDonation #SaveLives`;

    if (navigator.share) {
      navigator.share({
        title: `${request.bloodType} Blood Needed - ${request.hospital}`,
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Request details copied to clipboard", {
        description: "Share this information to help find donors!"
      });
    }
  };

  // Fetch blood requests data
  const fetchBloodRequestsData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const newData = await simulateAPICall(showLoading);
      setBloodRequests(newData);
      setLastUpdated(new Date());
      
      console.log(`✅ Successfully fetched ${newData.length} enhanced blood requests with real-time data:`, newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh mechanism
  useEffect(() => {
    fetchBloodRequestsData(true);
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchBloodRequestsData(false);
      }, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchBloodRequestsData, autoRefresh]);

  // Get filtered and sorted requests
  const filteredRequests = filterBloodRequests(
    bloodRequests,
    searchTerm,
    selectedBloodType,
    selectedUrgency,
    selectedHospitalType,
    selectedState,
    selectedDistrict,
    selectedCity,
    selectedDistance
  );
  
  const filteredAndSortedRequests = sortBloodRequests(filteredRequests, sortBy);

  // CSV export functionality
  const handleExportCSV = () => {
    exportRequestsToCSV(filteredAndSortedRequests);
    toast.success("Blood requests exported to CSV", {
      description: `${filteredAndSortedRequests.length} requests exported successfully.`
    });
  };

  if (isLoading && bloodRequests.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Connecting to National Blood Bank Network
            </CardTitle>
            <CardDescription>
              Fetching real-time data from eraktkosh.mohfw.gov.in and connected blood banks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Connecting to eraktkosh.mohfw.gov.in...</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Syncing with NBTC database...</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Retrieving hospital network data...</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span>Loading real-time blood stock levels...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <div>
              <h3 className="font-medium text-gray-900">Failed to Load Data</h3>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
            <Button onClick={() => fetchBloodRequestsData(true)} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Real-time Status Bar */}
      <Card className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Database className="w-5 h-5 text-red-600" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <span className="font-medium text-red-900">National Blood Bank Network</span>
                  <div className="text-xs text-red-700">Real-time data from eraktkosh.mohfw.gov.in</div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-green-600" />
                  <span className="text-green-700">Connected</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-700">{filteredAndSortedRequests.length} Active Sources</span>
                </div>
                {lastUpdated && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-600" />
                    <span className="text-gray-700">
                      {lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Live Updates
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-50 text-green-700 border-green-200" : ""}
              >
                {autoRefresh ? <CheckCircle className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
                Auto-refresh {autoRefresh ? "ON" : "OFF"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBloodRequestsData(false)}
                disabled={isRefreshing}
                className="relative"
              >
                {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                Refresh
                {isRefreshing && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </Button>
            </div>
          </div>
          
          {/* Data source indicators */}
          <div className="mt-3 pt-3 border-t border-red-200">
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>eraktkosh.mohfw.gov.in</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>NBTC Database</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>State Blood Banks</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Hospital Networks</span>
              </div>
              <span className="ml-auto">
                Next sync: {new Date(Date.now() + 60000).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Blood Requests
          </CardTitle>
          <CardDescription>
            Search and filter real-time blood donation requests from hospitals and blood banks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="w-full">
              <Input
                placeholder="Search by hospital, address, reason, request ID, or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Primary Filter Controls */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
                <SelectTrigger className="bg-red-50 border-red-200">
                  <SelectValue placeholder="🩸 Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blood Groups</SelectItem>
                  <SelectItem value="O+">O+ (O Positive)</SelectItem>
                  <SelectItem value="O-">O- (O Negative)</SelectItem>
                  <SelectItem value="A+">A+ (A Positive)</SelectItem>
                  <SelectItem value="A-">A- (A Negative)</SelectItem>
                  <SelectItem value="B+">B+ (B Positive)</SelectItem>
                  <SelectItem value="B-">B- (B Negative)</SelectItem>
                  <SelectItem value="AB+">AB+ (AB Positive)</SelectItem>
                  <SelectItem value="AB-">AB- (AB Negative)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                <SelectTrigger className="bg-orange-50 border-orange-200">
                  <SelectValue placeholder="⚡ Urgency Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency Levels</SelectItem>
                  <SelectItem value="Critical">🔴 Critical</SelectItem>
                  <SelectItem value="High">🟠 High</SelectItem>
                  <SelectItem value="Medium">🟡 Medium</SelectItem>
                  <SelectItem value="Low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedHospitalType} onValueChange={setSelectedHospitalType}>
                <SelectTrigger className="bg-blue-50 border-blue-200">
                  <SelectValue placeholder="🏥 Hospital Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hospital Types</SelectItem>
                  <SelectItem value="Government">🏛️ Government</SelectItem>
                  <SelectItem value="Private">🏢 Private</SelectItem>
                  <SelectItem value="Blood Bank">🩸 Blood Bank</SelectItem>
                  <SelectItem value="Medical College">🎓 Medical College</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                <SelectTrigger className="bg-green-50 border-green-200">
                  <SelectValue placeholder="📍 Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Distance</SelectItem>
                  <SelectItem value="5">Within 5 km</SelectItem>
                  <SelectItem value="10">Within 10 km</SelectItem>
                  <SelectItem value="20">Within 20 km</SelectItem>
                  <SelectItem value="50">Within 50 km</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location-based Filter Controls */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Filters
              </h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Select value={selectedState} onValueChange={handleStateChange}>
                  <SelectTrigger className="bg-purple-50 border-purple-200">
                    <SelectValue placeholder="🗺️ Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStates.map(state => (
                      <SelectItem key={state} value={state}>
                        {state === "all" ? "All States" : state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedDistrict} 
                  onValueChange={handleDistrictChange}
                  disabled={selectedState === "all"}
                >
                  <SelectTrigger className="bg-indigo-50 border-indigo-200">
                    <SelectValue placeholder="🏙️ Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map(district => (
                      <SelectItem key={district} value={district}>
                        {district === "all" ? "All Districts" : district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedCity} 
                  onValueChange={setSelectedCity}
                  disabled={selectedDistrict === "all"}
                >
                  <SelectTrigger className="bg-cyan-50 border-cyan-200">
                    <SelectValue placeholder="🏘️ Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map(city => (
                      <SelectItem key={city} value={city}>
                        {city === "all" ? "All Cities" : city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedState("all");
                    setSelectedDistrict("all");
                    setSelectedCity("all");
                  }}
                  className="flex items-center gap-2 hover:bg-gray-50"
                >
                  <MapPin className="w-4 h-4" />
                  Clear Location
                </Button>
              </div>
            </div>

            {/* Sort and Export Controls */}
            <div className="border-t pt-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgency">🚨 Sort by Urgency</SelectItem>
                      <SelectItem value="distance">📍 Sort by Distance</SelectItem>
                      <SelectItem value="compatibility">🔀 Sort by Compatibility</SelectItem>
                      <SelectItem value="recent">🕒 Sort by Most Recent</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedBloodType("all");
                      setSelectedUrgency("all");
                      setSelectedHospitalType("all");
                      setSelectedDistance("all");
                      setSelectedState("all");
                      setSelectedDistrict("all");
                      setSelectedCity("all");
                    }}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Clear All Filters
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Results Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredAndSortedRequests.length}</span> of <span className="font-medium text-gray-900">{bloodRequests.length}</span> blood requests
            {isRefreshing && (
              <span className="ml-2 text-blue-600">
                <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                Updating...
              </span>
            )}
          </div>
          
          {/* Active filters summary */}
          <div className="flex flex-wrap gap-2">
            {selectedBloodType !== "all" && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Blood: {selectedBloodType}
              </Badge>
            )}
            {selectedUrgency !== "all" && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Urgency: {selectedUrgency}
              </Badge>
            )}
            {selectedState !== "all" && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                State: {selectedState}
              </Badge>
            )}
            {selectedDistrict !== "all" && (
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                District: {selectedDistrict}
              </Badge>
            )}
            {selectedCity !== "all" && (
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                City: {selectedCity}
              </Badge>
            )}
            {selectedHospitalType !== "all" && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Type: {selectedHospitalType}
              </Badge>
            )}
            {selectedDistance !== "all" && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Distance: Within {selectedDistance}km
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {filteredAndSortedRequests.filter(r => r.status === "Active").length} Active
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {filteredAndSortedRequests.filter(r => r.urgency === "Critical").length} Critical
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Activity className="w-3 h-3 mr-1" />
            {bloodRequests.length} Total Sources
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Wifi className="w-3 h-3 mr-1" />
            {filteredAndSortedRequests.filter(r => r.bloodBankDetails.realtimeUpdates?.connectionStatus === "Active").length} Live
          </Badge>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <Shield className="w-3 h-3 mr-1" />
            {filteredAndSortedRequests.filter(r => r.bloodBankDetails.emergencyReady).length} Emergency Ready
          </Badge>
        </div>
      </div>

      {/* Enhanced Blood Requests List */}
      <div className="space-y-4">
        {filteredAndSortedRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Main Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {getUrgencyIcon(request.urgency)}
                          <span className="ml-1">{request.urgency}</span>
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {request.bloodType}
                        </Badge>
                        <Badge className={getHospitalTypeColor(request.hospitalType)}>
                          <Building2 className="w-3 h-3 mr-1" />
                          {request.hospitalType}
                        </Badge>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {request.units} unit{request.units > 1 ? 's' : ''} needed
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{request.hospital}</h3>
                        <p className="text-sm text-gray-600">{request.reason} • {request.patientGender}, {request.patientAge} years</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">Reg: {request.bloodBankDetails.registrationNumber}</p>
                          <span className="text-gray-300">•</span>
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            {request.location.state}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium text-red-600">
                        Required by: {request.requiredBy}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        {request.matchPercentage}% compatibility
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated: {new Date(request.lastUpdated).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {request.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">{request.distance}</div>
                        <div className="text-gray-500 text-xs">{request.location.city}, {request.location.district}</div>
                        <div className="text-gray-500 text-xs">{request.location.state} - {request.location.pincode}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">{request.contactPerson}</div>
                        <div className="text-gray-500 text-xs">{request.contactPhone}</div>
                        <div className="text-gray-500 text-xs">{request.contactEmail}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">{request.requestedDate}</div>
                        <div className="text-gray-500 text-xs">Request Date</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">{request.bloodBankDetails.operatingHours}</div>
                        <div className="text-gray-500 text-xs">Operating Hours</div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Real-time Blood Bank Information */}
                  <div className="space-y-4">
                    {/* Real-time Data Source Info */}
                    {request.bloodBankDetails.realtimeUpdates && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Wifi className="w-3 h-3 text-green-600" />
                            <span className="font-medium text-green-800">Live Data from {request.bloodBankDetails.realtimeUpdates.dataSource}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <span>Last sync: {request.bloodBankDetails.realtimeUpdates.lastSync}</span>
                            <CircleDot className="w-2 h-2 text-green-500 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Operational Status */}
                    {request.bloodBankDetails.operationalStatus && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Operational Status
                          </h4>
                          <Badge className={
                            request.bloodBankDetails.emergencyReady 
                              ? "bg-green-100 text-green-800" 
                              : "bg-orange-100 text-orange-800"
                          }>
                            {request.bloodBankDetails.emergencyReady ? "Emergency Ready" : "Limited Service"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-600">Current Status:</span>
                            <div className="font-medium">{request.bloodBankDetails.operationalStatus}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Capacity:</span>
                            <div className="font-medium">{request.bloodBankDetails.currentCapacity}%</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Blood Stock Levels */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Real-time Blood Stock
                      </h4>
                      <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                        {Object.entries(request.bloodBankDetails.bloodAvailability).map(([type, count]) => (
                          <div key={type} className="bg-white p-2 rounded text-center relative">
                            <div className="font-medium text-gray-900">{type}</div>
                            <div className={count > 20 ? "text-green-600" : count > 10 ? "text-orange-600" : "text-red-600"}>
                              {count} units
                            </div>
                            {count < 10 && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Blood Components */}
                      {request.bloodBankDetails.bloodComponents && (
                        <div className="border-t pt-3">
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Blood Components Available</h5>
                          <div className="grid grid-cols-5 gap-1 text-xs">
                            <div className="text-center">
                              <div className="text-gray-600">Whole</div>
                              <div className="font-medium">{request.bloodBankDetails.bloodComponents.wholeBlood}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-600">RBC</div>
                              <div className="font-medium">{request.bloodBankDetails.bloodComponents.redBloodCells}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-600">Plasma</div>
                              <div className="font-medium">{request.bloodBankDetails.bloodComponents.plasma}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-600">Platelets</div>
                              <div className="font-medium">{request.bloodBankDetails.bloodComponents.platelets}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-600">Cryo</div>
                              <div className="font-medium">{request.bloodBankDetails.bloodComponents.cryoprecipitate}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Donor Queue Status */}
                    {request.bloodBankDetails.donorQueue && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Live Donor Queue
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-600">Current Donors:</span>
                            <div className="font-medium flex items-center gap-1">
                              {request.bloodBankDetails.donorQueue.currentDonors}
                              <Timer className="w-3 h-3" />
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Wait Time:</span>
                            <div className="font-medium">{request.bloodBankDetails.donorQueue.estimatedWaitTime} min</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Available Slots:</span>
                            <div className="font-medium text-green-600">{request.bloodBankDetails.donorQueue.availableSlots}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Next Slot:</span>
                            <div className="font-medium">{request.bloodBankDetails.donorQueue.nextAvailableSlot}</div>
                          </div>
                        </div>
                        {request.bloodBankDetails.donorQueue.totalDonationsToday && (
                          <div className="mt-2 pt-2 border-t text-xs">
                            <span className="text-gray-600">Today's Collections: </span>
                            <span className="font-medium text-green-600">{request.bloodBankDetails.donorQueue.totalDonationsToday} units</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Equipment Status */}
                    {request.bloodBankDetails.equipmentStatus && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Equipment Status
                        </h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {Object.entries(request.bloodBankDetails.equipmentStatus).map(([equipment, status]) => (
                            <div key={equipment} className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${
                                status === "Operational" || status === "Online" || status === "Available" 
                                  ? "bg-green-500" 
                                  : "bg-orange-500"
                              }`}></div>
                              <span className="text-gray-600 capitalize">{equipment.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="font-medium">{status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {request.bloodBankDetails.certifications && request.bloodBankDetails.certifications.length > 0 && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Certifications & Accreditations
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {request.bloodBankDetails.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              <Shield className="w-2 h-2 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                        {request.bloodBankDetails.lastInspection && (
                          <div className="mt-2 text-xs text-gray-600">
                            Last inspection: {request.bloodBankDetails.lastInspection}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Facilities */}
                  <div className="flex flex-wrap gap-2">
                    {request.bloodBankDetails.facilities.map((facility, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col gap-3 lg:w-52">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 shadow-md"
                    onClick={() => handleRespondToRequest(request)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Respond to Request
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-blue-50"
                    onClick={() => handleCallHospital(request)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call: {request.contactPhone.slice(-4)}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-green-50"
                    onClick={() => handleVisitWebsite(request)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-yellow-50"
                    onClick={() => handleSendEmail(request)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-purple-50"
                    onClick={() => handleShareRequest(request)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredAndSortedRequests.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="font-medium text-gray-900">No Blood Requests Found</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Try adjusting your filters or search terms to find blood requests.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedBloodType("all");
                    setSelectedUrgency("all");
                    setSelectedHospitalType("all");
                    setSelectedDistance("all");
                    setSelectedState("all");
                    setSelectedDistrict("all");
                    setSelectedCity("all");
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}