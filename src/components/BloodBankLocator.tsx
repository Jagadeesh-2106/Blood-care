import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  MapPin,
  Navigation,
  Clock,
  Phone,
  Mail,
  Star,
  Filter,
  Search,
  RefreshCw,
  Building2,
  Heart,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Calendar,
  Map as MapIcon
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface BloodCenter {
  id: string;
  name: string;
  type: 'Blood Bank' | 'Hospital' | 'Donation Center' | 'Mobile Unit';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  email: string;
  website?: string;
  operatingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  services: string[];
  bloodTypes: string[];
  currentWaitTime: number; // minutes
  capacity: number;
  currentOccupancy: number;
  rating: number;
  reviewCount: number;
  distance?: number;
  status: 'Open' | 'Closed' | 'Busy' | 'Emergency Only';
  lastUpdated: string;
  hasParking: boolean;
  isWheelchairAccessible: boolean;
  acceptsWalkIns: boolean;
  requiresAppointment: boolean;
}

interface UserProfile {
  id: string;
  fullName: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
}

interface BloodBankLocatorProps {
  userProfile: UserProfile;
}

export function BloodBankLocator({ userProfile }: BloodBankLocatorProps) {
  const [centers, setCenters] = useState<BloodCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<BloodCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("distance");
  const [showMap, setShowMap] = useState(false);

  // Demo blood centers data
  const getDemoCenters = (): BloodCenter[] => [
    {
      id: "center-001",
      name: "NYC Blood Center - Manhattan",
      type: "Blood Bank",
      address: "310 E 67th St",
      city: "New York",
      state: "NY",
      zipCode: "10065",
      coordinates: { lat: 40.7614, lng: -73.9566 },
      phone: "(212) 570-3000",
      email: "manhattan@nybloodcenter.org",
      website: "https://nybloodcenter.org",
      operatingHours: {
        Monday: { open: "08:00", close: "19:00" },
        Tuesday: { open: "08:00", close: "19:00" },
        Wednesday: { open: "08:00", close: "19:00" },
        Thursday: { open: "08:00", close: "19:00" },
        Friday: { open: "08:00", close: "17:00" },
        Saturday: { open: "09:00", close: "15:00" },
        Sunday: { closed: true }
      },
      services: ["Whole Blood Donation", "Platelet Donation", "Plasma Donation", "Double Red Cell", "Blood Testing"],
      bloodTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      currentWaitTime: 15,
      capacity: 50,
      currentOccupancy: 32,
      rating: 4.8,
      reviewCount: 1247,
      distance: 2.3,
      status: "Open",
      lastUpdated: new Date().toISOString(),
      hasParking: true,
      isWheelchairAccessible: true,
      acceptsWalkIns: true,
      requiresAppointment: false
    },
    {
      id: "center-002",
      name: "Mount Sinai Hospital Blood Bank",
      type: "Hospital",
      address: "1468 Madison Ave",
      city: "New York",
      state: "NY",
      zipCode: "10029",
      coordinates: { lat: 40.7831, lng: -73.9571 },
      phone: "(212) 241-6500",
      email: "bloodbank@mountsinai.org",
      operatingHours: {
        Monday: { open: "07:00", close: "21:00" },
        Tuesday: { open: "07:00", close: "21:00" },
        Wednesday: { open: "07:00", close: "21:00" },
        Thursday: { open: "07:00", close: "21:00" },
        Friday: { open: "07:00", close: "21:00" },
        Saturday: { open: "08:00", close: "18:00" },
        Sunday: { open: "08:00", close: "18:00" }
      },
      services: ["Emergency Blood Supply", "Whole Blood Donation", "Platelet Donation", "Blood Testing", "Cross Matching"],
      bloodTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      currentWaitTime: 25,
      capacity: 40,
      currentOccupancy: 38,
      rating: 4.5,
      reviewCount: 892,
      distance: 3.1,
      status: "Busy",
      lastUpdated: new Date().toISOString(),
      hasParking: true,
      isWheelchairAccessible: true,
      acceptsWalkIns: false,
      requiresAppointment: true
    },
    {
      id: "center-003",
      name: "Brooklyn Community Blood Center",
      type: "Donation Center",
      address: "450 Clarkson Ave",
      city: "Brooklyn",
      state: "NY",
      zipCode: "11203",
      coordinates: { lat: 40.6501, lng: -73.9496 },
      phone: "(718) 270-2100",
      email: "brooklyn@nybloodcenter.org",
      operatingHours: {
        Monday: { open: "09:00", close: "18:00" },
        Tuesday: { open: "09:00", close: "18:00" },
        Wednesday: { open: "09:00", close: "18:00" },
        Thursday: { open: "09:00", close: "18:00" },
        Friday: { open: "09:00", close: "16:00" },
        Saturday: { open: "10:00", close: "14:00" },
        Sunday: { closed: true }
      },
      services: ["Whole Blood Donation", "Platelet Donation", "Plasma Donation", "Community Outreach"],
      bloodTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      currentWaitTime: 10,
      capacity: 35,
      currentOccupancy: 18,
      rating: 4.6,
      reviewCount: 634,
      distance: 8.7,
      status: "Open",
      lastUpdated: new Date().toISOString(),
      hasParking: true,
      isWheelchairAccessible: true,
      acceptsWalkIns: true,
      requiresAppointment: false
    },
    {
      id: "center-004",
      name: "Queens Medical Center Blood Bank",
      type: "Hospital",
      address: "82-68 164th St",
      city: "Jamaica",
      state: "NY",
      zipCode: "11432",
      coordinates: { lat: 40.7058, lng: -73.7947 },
      phone: "(718) 883-3000",
      email: "bloodbank@qmc.org",
      operatingHours: {
        Monday: { open: "07:00", close: "20:00" },
        Tuesday: { open: "07:00", close: "20:00" },
        Wednesday: { open: "07:00", close: "20:00" },
        Thursday: { open: "07:00", close: "20:00" },
        Friday: { open: "07:00", close: "18:00" },
        Saturday: { open: "08:00", close: "16:00" },
        Sunday: { open: "10:00", close: "16:00" }
      },
      services: ["Emergency Blood Supply", "Whole Blood Donation", "Platelet Donation", "Blood Testing", "Rare Blood Types"],
      bloodTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      currentWaitTime: 20,
      capacity: 45,
      currentOccupancy: 28,
      rating: 4.3,
      reviewCount: 756,
      distance: 12.4,
      status: "Open",
      lastUpdated: new Date().toISOString(),
      hasParking: true,
      isWheelchairAccessible: true,
      acceptsWalkIns: true,
      requiresAppointment: false
    },
    {
      id: "center-005",
      name: "Mobile Blood Drive - Central Park",
      type: "Mobile Unit",
      address: "Central Park South & 5th Ave",
      city: "New York",
      state: "NY",
      zipCode: "10019",
      coordinates: { lat: 40.7676, lng: -73.9784 },
      phone: "(212) 570-3000",
      email: "mobile@nybloodcenter.org",
      operatingHours: {
        Monday: { closed: true },
        Tuesday: { closed: true },
        Wednesday: { open: "10:00", close: "16:00" },
        Thursday: { closed: true },
        Friday: { closed: true },
        Saturday: { open: "09:00", close: "17:00" },
        Sunday: { closed: true }
      },
      services: ["Whole Blood Donation", "Community Outreach"],
      bloodTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      currentWaitTime: 5,
      capacity: 20,
      currentOccupancy: 8,
      rating: 4.7,
      reviewCount: 234,
      distance: 1.8,
      status: "Open",
      lastUpdated: new Date().toISOString(),
      hasParking: false,
      isWheelchairAccessible: false,
      acceptsWalkIns: true,
      requiresAppointment: false
    },
    {
      id: "center-006",
      name: "Bronx Emergency Blood Center",
      type: "Blood Bank",
      address: "1400 Pelham Pkwy S",
      city: "Bronx",
      state: "NY",
      zipCode: "10461",
      coordinates: { lat: 40.8566, lng: -73.8477 },
      phone: "(718) 430-3000",
      email: "bronx@emergencyblood.org",
      operatingHours: {
        Monday: { open: "06:00", close: "22:00" },
        Tuesday: { open: "06:00", close: "22:00" },
        Wednesday: { open: "06:00", close: "22:00" },
        Thursday: { open: "06:00", close: "22:00" },
        Friday: { open: "06:00", close: "22:00" },
        Saturday: { open: "06:00", close: "22:00" },
        Sunday: { open: "06:00", close: "22:00" }
      },
      services: ["Emergency Blood Supply", "Whole Blood Donation", "Platelet Donation", "Plasma Donation", "24/7 Service"],
      bloodTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      currentWaitTime: 30,
      capacity: 60,
      currentOccupancy: 55,
      rating: 4.4,
      reviewCount: 1089,
      distance: 15.2,
      status: "Emergency Only",
      lastUpdated: new Date().toISOString(),
      hasParking: true,
      isWheelchairAccessible: true,
      acceptsWalkIns: false,
      requiresAppointment: true
    }
  ];

  // Load centers data
  const loadCenters = async () => {
    try {
      setIsLoading(true);
      
      const demoCenters = getDemoCenters();
      setCenters(demoCenters);
      
      toast.success(`Found ${demoCenters.length} blood centers near you`);
    } catch (error) {
      console.error('Error loading centers:', error);
      toast.error('Failed to load blood centers');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort centers
  useEffect(() => {
    let filtered = [...centers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(center => center.type === typeFilter);
    }

    // Service filter
    if (serviceFilter !== "all") {
      filtered = filtered.filter(center => center.services.includes(serviceFilter));
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(center => center.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case "distance":
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "waitTime":
        filtered.sort((a, b) => a.currentWaitTime - b.currentWaitTime);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredCenters(filtered);
  }, [centers, searchTerm, typeFilter, serviceFilter, statusFilter, sortBy]);

  useEffect(() => {
    loadCenters();
  }, []);

  // Get status badge styling
  const getStatusBadge = (status: BloodCenter['status']) => {
    const statusStyles = {
      'Open': 'bg-green-100 text-green-800 border-green-200',
      'Closed': 'bg-gray-100 text-gray-800 border-gray-200',
      'Busy': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Emergency Only': 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge className={`${statusStyles[status]} border font-medium`}>
        {status}
      </Badge>
    );
  };

  // Get current operating status
  const getCurrentStatus = (center: BloodCenter) => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todayHours = center.operatingHours[dayName];
    if (todayHours?.closed) {
      return { status: 'Closed', text: 'Closed today' };
    }
    
    if (todayHours && currentTime >= todayHours.open && currentTime <= todayHours.close) {
      return { status: 'Open', text: `Open until ${todayHours.close}` };
    }
    
    return { status: 'Closed', text: 'Closed now' };
  };

  // Format distance
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  // Get today's hours
  const getTodayHours = (center: BloodCenter) => {
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = center.operatingHours[dayName];
    
    if (todayHours?.closed) {
      return 'Closed today';
    }
    
    return `${todayHours?.open} - ${todayHours?.close}`;
  };

  // Get unique services for filter
  const uniqueServices = [...new Set(centers.flatMap(center => center.services))].sort();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
            <p className="text-gray-600">Finding blood centers near you...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Blood Bank Locator
              </CardTitle>
              <CardDescription>
                Find blood donation centers and hospitals near you
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowMap(!showMap)}>
                <MapIcon className="w-4 h-4 mr-2" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
              <Button variant="outline" size="sm" onClick={loadCenters}>
                <RefreshCw className="w-4 h-4 mr-2" />
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
                placeholder="Search by name, location, or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Blood Bank">Blood Bank</SelectItem>
                  <SelectItem value="Hospital">Hospital</SelectItem>
                  <SelectItem value="Donation Center">Donation Center</SelectItem>
                  <SelectItem value="Mobile Unit">Mobile Unit</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {uniqueServices.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Open">Open Now</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Busy">Busy</SelectItem>
                  <SelectItem value="Emergency Only">Emergency Only</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="waitTime">Wait Time</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results summary */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>
              Showing {filteredCenters.length} of {centers.length} centers
            </span>
            <span>
              Sorted by {sortBy}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Map placeholder */}
      {showMap && (
        <Card>
          <CardContent className="p-6">
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center space-y-2">
                <MapIcon className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-gray-600">Interactive map would be displayed here</p>
                <p className="text-sm text-gray-500">
                  Integration with Google Maps API for real-time locations and directions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Centers list */}
      {filteredCenters.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No centers found</h3>
                <p className="text-gray-500">
                  No blood centers match your current search criteria. Try adjusting your filters.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCenters.map((center) => {
            const currentStatus = getCurrentStatus(center);
            const occupancyPercentage = Math.round((center.currentOccupancy / center.capacity) * 100);
            
            return (
              <Card key={center.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {center.name}
                        </h3>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {center.type}
                        </Badge>
                        {getStatusBadge(center.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {center.distance && formatDistance(center.distance)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {center.rating} ({center.reviewCount} reviews)
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Wait: {center.currentWaitTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {occupancyPercentage}% full
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <Badge className={currentStatus.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {currentStatus.text}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        Today: {getTodayHours(center)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-600">
                          <div>{center.address}</div>
                          <div>{center.city}, {center.state} {center.zipCode}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{center.phone}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{center.email}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Services</h4>
                        <div className="flex flex-wrap gap-1">
                          {center.services.slice(0, 3).map((service) => (
                            <Badge key={service} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {center.services.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{center.services.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {center.hasParking && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Parking
                          </span>
                        )}
                        {center.isWheelchairAccessible && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Accessible
                          </span>
                        )}
                        {center.acceptsWalkIns ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Walk-ins
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Appointment required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Last updated: {new Date(center.lastUpdated).toLocaleTimeString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Navigation className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                      {center.website && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Website
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}