import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Heart, 
  MapPin, 
  Clock, 
  Phone, 
  Mail,
  Star,
  Search,
  Filter,
  Navigation,
  Building2,
  Calendar,
  Users,
  Droplet,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Car
} from "lucide-react";

// Mock blood bank data
const mockBloodBanks = [
  {
    id: 1,
    name: "NYC Blood Center",
    address: "310 E 67th St, New York, NY 10065",
    phone: "(212) 570-3000",
    email: "info@nybc.org",
    website: "https://nybc.org",
    distance: "0.8 miles",
    rating: 4.8,
    reviews: 234,
    hours: {
      weekdays: "8:00 AM - 6:00 PM",
      saturday: "8:00 AM - 4:00 PM",
      sunday: "9:00 AM - 3:00 PM"
    },
    services: ["Whole Blood", "Platelets", "Plasma", "Double Red Cells"],
    bloodTypes: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
    urgentNeeds: ["O-", "A-", "B+"],
    status: "Open",
    walkInsAccepted: true,
    appointmentRequired: false,
    emergencyAvailable: true,
    lastUpdated: "2024-08-25"
  },
  {
    id: 2,
    name: "Manhattan Blood Bank",
    address: "150 Amsterdam Ave, New York, NY 10023",
    phone: "(212) 555-0123",
    email: "contact@manhattanblood.org",
    website: "https://manhattanblood.org",
    distance: "1.2 miles",
    rating: 4.6,
    reviews: 189,
    hours: {
      weekdays: "7:00 AM - 7:00 PM",
      saturday: "8:00 AM - 5:00 PM",
      sunday: "Closed"
    },
    services: ["Whole Blood", "Platelets", "Plasma"],
    bloodTypes: ["O+", "A+", "A-", "B+", "AB+", "AB-"],
    urgentNeeds: ["A-", "AB-"],
    status: "Open",
    walkInsAccepted: true,
    appointmentRequired: true,
    emergencyAvailable: true,
    lastUpdated: "2024-08-24"
  },
  {
    id: 3,
    name: "Presbyterian Hospital Blood Center",
    address: "525 E 68th St, New York, NY 10065",
    phone: "(212) 746-4700",
    email: "bloodbank@nyp.org",
    website: "https://nyp.org/bloodbank",
    distance: "1.5 miles",
    rating: 4.7,
    reviews: 156,
    hours: {
      weekdays: "6:00 AM - 8:00 PM",
      saturday: "7:00 AM - 6:00 PM",
      sunday: "8:00 AM - 4:00 PM"
    },
    services: ["Whole Blood", "Platelets", "Plasma", "Double Red Cells", "Bone Marrow"],
    bloodTypes: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
    urgentNeeds: ["O+", "B-", "AB+"],
    status: "Open",
    walkInsAccepted: false,
    appointmentRequired: true,
    emergencyAvailable: true,
    lastUpdated: "2024-08-25"
  },
  {
    id: 4,
    name: "Mount Sinai Blood Donation Center",
    address: "1425 Madison Ave, New York, NY 10029",
    phone: "(212) 241-6500",
    email: "blooddonation@mountsinai.org",
    website: "https://mountsinai.org/blood",
    distance: "2.1 miles",
    rating: 4.5,
    reviews: 203,
    hours: {
      weekdays: "8:00 AM - 5:00 PM",
      saturday: "9:00 AM - 3:00 PM",
      sunday: "Closed"
    },
    services: ["Whole Blood", "Platelets", "Plasma"],
    bloodTypes: ["O+", "A+", "A-", "B+", "B-", "AB-"],
    urgentNeeds: ["B+", "AB-"],
    status: "Open",
    walkInsAccepted: true,
    appointmentRequired: false,
    emergencyAvailable: false,
    lastUpdated: "2024-08-24"
  },
  {
    id: 5,
    name: "Brooklyn Blood Services",
    address: "445 E 69th St, Brooklyn, NY 11203",
    phone: "(718) 555-0199",
    email: "info@brooklynblood.org",
    website: "https://brooklynblood.org",
    distance: "3.4 miles",
    rating: 4.4,
    reviews: 127,
    hours: {
      weekdays: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed"
    },
    services: ["Whole Blood", "Platelets"],
    bloodTypes: ["O+", "A+", "B+", "AB+"],
    urgentNeeds: ["O+", "A+"],
    status: "Open",
    walkInsAccepted: true,
    appointmentRequired: false,
    emergencyAvailable: true,
    lastUpdated: "2024-08-23"
  },
  {
    id: 6,
    name: "Queens Community Blood Bank",
    address: "82-68 164th St, Queens, NY 11432",
    phone: "(718) 555-0167",
    email: "contact@queensblood.org",
    website: "https://queensblood.org",
    distance: "4.2 miles",
    rating: 4.3,
    reviews: 98,
    hours: {
      weekdays: "8:30 AM - 5:30 PM",
      saturday: "9:00 AM - 2:00 PM",
      sunday: "Closed"
    },
    services: ["Whole Blood", "Plasma"],
    bloodTypes: ["O+", "O-", "A+", "B+", "B-"],
    urgentNeeds: ["O-", "B-"],
    status: "Limited Hours",
    walkInsAccepted: true,
    appointmentRequired: true,
    emergencyAvailable: false,
    lastUpdated: "2024-08-22"
  }
];

export function BloodBanks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBorough, setSelectedBorough] = useState("all");
  const [selectedServices, setSelectedServices] = useState("all");
  const [sortBy, setSortBy] = useState("distance");
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  // Filter and sort blood banks
  const filteredBloodBanks = mockBloodBanks
    .filter(bank => {
      const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bank.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBorough = selectedBorough === "all" || 
                           bank.address.toLowerCase().includes(selectedBorough.toLowerCase());
      
      const matchesServices = selectedServices === "all" || 
                            bank.services.some(service => service.toLowerCase() === selectedServices.toLowerCase());
      
      const hasUrgentNeeds = !showUrgentOnly || bank.urgentNeeds.length > 0;
      
      return matchesSearch && matchesBorough && matchesServices && hasUrgentNeeds;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return parseFloat(a.distance) - parseFloat(b.distance);
        case "rating":
          return b.rating - a.rating;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'Limited Hours': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Find Blood Banks Near You
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Locate certified blood donation centers in your area. Search by location, services, and availability.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Building2 className="w-4 h-4" />
              <span>{mockBloodBanks.length} certified centers</span>
              <span>•</span>
              <span>Updated daily</span>
              <span>•</span>
              <span>Emergency services available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search blood banks by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={selectedBorough} onValueChange={setSelectedBorough}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Borough" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="manhattan">Manhattan</SelectItem>
                  <SelectItem value="brooklyn">Brooklyn</SelectItem>
                  <SelectItem value="queens">Queens</SelectItem>
                  <SelectItem value="bronx">Bronx</SelectItem>
                  <SelectItem value="staten">Staten Island</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedServices} onValueChange={setSelectedServices}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="whole blood">Whole Blood</SelectItem>
                  <SelectItem value="platelets">Platelets</SelectItem>
                  <SelectItem value="plasma">Plasma</SelectItem>
                  <SelectItem value="double red cells">Double Red Cells</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant={showUrgentOnly ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowUrgentOnly(!showUrgentOnly)}
                className="flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Urgent Needs Only
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found {filteredBloodBanks.length} blood banks
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Open Now</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Urgent Needs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blood Banks List */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredBloodBanks.map(bank => (
              <Card key={bank.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{bank.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(bank.status)}>
                          {bank.status}
                        </Badge>
                        {bank.emergencyAvailable && (
                          <Badge className="bg-blue-100 text-blue-800">
                            24/7 Emergency
                          </Badge>
                        )}
                        {bank.urgentNeeds.length > 0 && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Urgent Needs
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{bank.rating}</span>
                        <span className="text-sm text-gray-500">({bank.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Navigation className="w-3 h-3" />
                        {bank.distance}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm">{bank.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm">{bank.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm">{bank.email}</span>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Hours of Operation
                    </h4>
                    <div className="text-sm space-y-1 ml-6">
                      <div className="flex justify-between">
                        <span>Mon - Fri:</span>
                        <span>{bank.hours.weekdays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday:</span>
                        <span>{bank.hours.saturday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday:</span>
                        <span>{bank.hours.sunday}</span>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Droplet className="w-4 h-4" />
                      Services Offered
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {bank.services.map(service => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Blood Types Accepted */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Blood Types Accepted</h4>
                    <div className="flex flex-wrap gap-2">
                      {bank.bloodTypes.map(type => (
                        <Badge 
                          key={type} 
                          variant="outline" 
                          className={`text-xs ${
                            bank.urgentNeeds.includes(type) 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {type}
                          {bank.urgentNeeds.includes(type) && (
                            <AlertCircle className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                    {bank.urgentNeeds.length > 0 && (
                      <p className="text-xs text-red-600 mt-2">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        Urgent need: {bank.urgentNeeds.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      {bank.walkInsAccepted ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                      <span>Walk-ins {bank.walkInsAccepted ? 'Accepted' : 'Not Accepted'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {bank.appointmentRequired ? (
                        <Calendar className="w-4 h-4 text-blue-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span>{bank.appointmentRequired ? 'Appointment Required' : 'No Appointment Needed'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    <Button className="flex-1 bg-red-600 hover:bg-red-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Donation
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Car className="w-4 h-4 mr-2" />
                      Directions
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Website
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBloodBanks.length === 0 && (
            <Card className="mt-8">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="font-medium text-gray-900">No blood banks found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search criteria or location filters.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setSelectedBorough("all");
                    setSelectedServices("all");
                    setShowUrgentOnly(false);
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Emergency Information */}
      <section className="py-12 bg-red-50 border-t">
        <div className="container mx-auto px-4 max-w-7xl">
          <Card className="border-red-200">
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="bg-red-600 p-3 rounded-full">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Emergency Blood Needs</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  In case of emergency, blood banks with 24/7 services can accept walk-in donations. 
                  For life-threatening situations, call 911 immediately.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="flex items-center gap-2 text-red-600">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Emergency: 911</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">
                      {mockBloodBanks.filter(b => b.emergencyAvailable).length} Emergency Centers Available
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Facts About Blood Donation</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Droplet className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-medium mb-2">Every 2 Seconds</h3>
                <p className="text-sm text-gray-600">Someone in the US needs blood</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">3 Lives Saved</h3>
                <p className="text-sm text-gray-600">With each donation</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">45 Minutes</h3>
                <p className="text-sm text-gray-600">Average donation time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-orange-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-medium mb-2">56 Days</h3>
                <p className="text-sm text-gray-600">Between whole blood donations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}