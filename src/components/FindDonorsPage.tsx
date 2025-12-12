import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  Heart, 
  MapPin, 
  Clock, 
  Phone, 
  Mail,
  Star,
  Search,
  Filter,
  Users,
  Droplet,
  CheckCircle,
  Calendar,
  Shield,
  Navigation,
  AlertCircle,
  MessageCircle
} from "lucide-react";

// Mock donor data
const mockDonors = [
  {
    id: 1,
    name: "Michael R.",
    bloodType: "O+",
    location: "Manhattan, NY",
    distance: "1.2 miles",
    lastDonation: "2 months ago",
    totalDonations: 15,
    availability: "Available Today",
    rating: 4.9,
    isVerified: true,
    emergencyDonor: true,
    profileImage: "",
    joinDate: "2020",
    healthStatus: "Excellent",
    preferredTimes: ["Morning", "Afternoon"],
    preferredLocations: ["NYC Blood Center", "Mount Sinai"]
  },
  {
    id: 2,
    name: "Jennifer L.",
    bloodType: "A-",
    location: "Brooklyn, NY",
    distance: "3.1 miles",
    lastDonation: "1 month ago",
    totalDonations: 22,
    availability: "Available Tomorrow",
    rating: 4.8,
    isVerified: true,
    emergencyDonor: true,
    profileImage: "",
    joinDate: "2019",
    healthStatus: "Excellent",
    preferredTimes: ["Evening"],
    preferredLocations: ["Brooklyn Blood Bank", "Presbyterian Hospital"]
  },
  {
    id: 3,
    name: "David W.",
    bloodType: "B+",
    location: "Queens, NY",
    distance: "4.5 miles",
    lastDonation: "3 months ago",
    totalDonations: 8,
    availability: "Available This Week",
    rating: 4.7,
    isVerified: true,
    emergencyDonor: false,
    profileImage: "",
    joinDate: "2021",
    healthStatus: "Good",
    preferredTimes: ["Morning"],
    preferredLocations: ["Queens Community Blood Bank"]
  },
  {
    id: 4,
    name: "Lisa K.",
    bloodType: "AB-",
    location: "Manhattan, NY",
    distance: "2.0 miles",
    lastDonation: "6 weeks ago",
    totalDonations: 18,
    availability: "Available Today",
    rating: 4.9,
    isVerified: true,
    emergencyDonor: true,
    profileImage: "",
    joinDate: "2018",
    healthStatus: "Excellent",
    preferredTimes: ["Afternoon", "Evening"],
    preferredLocations: ["NYC Blood Center", "Manhattan Blood Bank"]
  },
  {
    id: 5,
    name: "Robert M.",
    bloodType: "O-",
    location: "Bronx, NY",
    distance: "5.2 miles",
    lastDonation: "5 weeks ago",
    totalDonations: 31,
    availability: "Available This Week",
    rating: 5.0,
    isVerified: true,
    emergencyDonor: true,
    profileImage: "",
    joinDate: "2017",
    healthStatus: "Excellent",
    preferredTimes: ["Morning", "Afternoon", "Evening"],
    preferredLocations: ["Any certified facility"]
  },
  {
    id: 6,
    name: "Amanda S.",
    bloodType: "A+",
    location: "Staten Island, NY",
    distance: "8.1 miles",
    lastDonation: "4 months ago",
    totalDonations: 12,
    availability: "Available Next Week",
    rating: 4.6,
    isVerified: true,
    emergencyDonor: false,
    profileImage: "",
    joinDate: "2022",
    healthStatus: "Good",
    preferredTimes: ["Afternoon"],
    preferredLocations: ["Staten Island Blood Center"]
  }
];

export function FindDonorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [sortBy, setSortBy] = useState("distance");

  // Filter and sort donors
  const filteredDonors = mockDonors
    .filter(donor => {
      const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          donor.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBloodType = selectedBloodType === "all" || donor.bloodType === selectedBloodType;
      
      const matchesLocation = selectedLocation === "all" || 
                            donor.location.toLowerCase().includes(selectedLocation.toLowerCase());
      
      const matchesAvailability = selectedAvailability === "all" ||
                                (selectedAvailability === "today" && donor.availability.includes("Today")) ||
                                (selectedAvailability === "week" && donor.availability.includes("Week")) ||
                                (selectedAvailability === "tomorrow" && donor.availability.includes("Tomorrow"));
      
      const matchesEmergency = !emergencyOnly || donor.emergencyDonor;
      
      return matchesSearch && matchesBloodType && matchesLocation && matchesAvailability && matchesEmergency;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return parseFloat(a.distance) - parseFloat(b.distance);
        case "rating":
          return b.rating - a.rating;
        case "donations":
          return b.totalDonations - a.totalDonations;
        case "recent":
          // Simple mock sorting by last donation
          const aMonths = parseInt(a.lastDonation.split(' ')[0]);
          const bMonths = parseInt(b.lastDonation.split(' ')[0]);
          return aMonths - bMonths;
        default:
          return 0;
      }
    });

  const getAvailabilityColor = (availability: string) => {
    if (availability.includes("Today")) return 'bg-green-100 text-green-800';
    if (availability.includes("Tomorrow")) return 'bg-blue-100 text-blue-800';
    if (availability.includes("Week")) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Find Blood Donors
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Connect with verified blood donors in your area. Search by blood type, location, and availability 
              to find the perfect match for your needs.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              <span>{mockDonors.length} active donors</span>
              <span>•</span>
              <span>{mockDonors.filter(d => d.emergencyDonor).length} emergency responders</span>
              <span>•</span>
              <span>Available 24/7</span>
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
                placeholder="Search donors by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Blood Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Location" />
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

              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Time</SelectItem>
                  <SelectItem value="today">Available Today</SelectItem>
                  <SelectItem value="tomorrow">Available Tomorrow</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="donations">Total Donations</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant={emergencyOnly ? "default" : "outline"} 
                size="sm"
                onClick={() => setEmergencyOnly(!emergencyOnly)}
                className="flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Emergency Only
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found {filteredDonors.length} donors
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Available Today</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Emergency Donor</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donors List */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredDonors.map(donor => (
              <Card key={donor.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={donor.profileImage} />
                        <AvatarFallback className="text-lg bg-red-100 text-red-700">
                          {donor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{donor.name}</CardTitle>
                          {donor.isVerified && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-50 text-red-700 border-red-200">
                            {donor.bloodType}
                          </Badge>
                          <Badge className={getAvailabilityColor(donor.availability)}>
                            {donor.availability}
                          </Badge>
                          {donor.emergencyDonor && (
                            <Badge className="bg-orange-100 text-orange-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Emergency
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{donor.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Navigation className="w-3 h-3" />
                        {donor.distance}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{donor.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-gray-500" />
                        <span>{donor.totalDonations} donations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>Last: {donor.lastDonation}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Member since {donor.joinDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{donor.healthStatus} health</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{Math.round(donor.totalDonations * 3)} lives saved</span>
                      </div>
                    </div>
                  </div>

                  {/* Preferred Times */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Preferred Donation Times</h4>
                    <div className="flex flex-wrap gap-2">
                      {donor.preferredTimes.map(time => (
                        <Badge key={time} variant="outline" className="text-xs">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Locations */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Preferred Locations</h4>
                    <div className="flex flex-wrap gap-2">
                      {donor.preferredLocations.map(location => (
                        <Badge key={location} variant="outline" className="text-xs">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    <Button className="flex-1 bg-red-600 hover:bg-red-700">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Request
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Heart className="w-4 h-4 mr-2" />
                      Save Donor
                    </Button>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-bold text-red-600">{donor.totalDonations}</div>
                        <div className="text-gray-500">Donations</div>
                      </div>
                      <div>
                        <div className="font-bold text-blue-600">{donor.rating}</div>
                        <div className="text-gray-500">Rating</div>
                      </div>
                      <div>
                        <div className="font-bold text-green-600">{Math.round(donor.totalDonations * 3)}</div>
                        <div className="text-gray-500">Lives Saved</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDonors.length === 0 && (
            <Card className="mt-8">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Users className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="font-medium text-gray-900">No donors found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search criteria or expanding your location range.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setSelectedBloodType("all");
                    setSelectedLocation("all");
                    setSelectedAvailability("all");
                    setEmergencyOnly(false);
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Blood Type Compatibility Guide */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Blood Type Compatibility Guide
            </h2>
            <p className="text-lg text-gray-600">
              Understanding which blood types can donate to which recipients
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Universal Donors & Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Droplet className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Universal Donor</h3>
                    <Badge className="bg-red-100 text-red-800 text-lg px-3 py-1 mb-3">O-</Badge>
                    <p className="text-gray-600">
                      O- blood can be given to anyone. These donors are especially valuable 
                      in emergency situations when there's no time for blood typing.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Universal Recipient</h3>
                    <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1 mb-3">AB+</Badge>
                    <p className="text-gray-600">
                      AB+ individuals can receive blood from any blood type, making them 
                      universal recipients but can only donate to other AB+ individuals.
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Quick Compatibility Reference:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="font-medium">O+ can donate to:</div>
                      <div>O+, A+, B+, AB+</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">O- can donate to:</div>
                      <div>Everyone</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">A+ can donate to:</div>
                      <div>A+, AB+</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">AB+ can receive from:</div>
                      <div>Everyone</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-12 bg-red-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <Card className="border-red-200 max-w-2xl mx-auto">
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Emergency Blood Needs</h2>
                <p className="text-gray-600">
                  For life-threatening situations requiring immediate blood, contact emergency services 
                  or use our 24/7 emergency hotline for fastest response.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700">
                    <Phone className="w-5 h-5 mr-2" />
                    Call 911 (Life-threatening)
                  </Button>
                  <Button size="lg" variant="outline" className="border-red-600 text-red-600">
                    <Heart className="w-5 h-5 mr-2" />
                    Emergency Blood Hotline
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Emergency hotline connects you directly with on-call donors and emergency blood banks
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}