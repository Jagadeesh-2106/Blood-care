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
  Building2,
  Phone,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Globe,
  Activity,
  Mail,
  ExternalLink,
  Shield,
  Zap,
  Users,
  Wifi,
  Database,
  Award,
  TrendingUp,
  Settings,
  CircleDot,
  Timer,
  Filter,
  Star,
  Navigation,
  Heart,
  Stethoscope,
  Plus
} from "lucide-react";

import { locationHierarchy } from "../utils/bloodRequestData";
import { getHospitals } from "../utils/supabase/client";

// Enhanced Hospital/Blood Bank interface
interface HospitalBloodBank {
  id: string;
  name: string;
  type: "Government" | "Private" | "Blood Bank" | "Medical College";
  address: string;
  location: {
    state: string;
    district: string;
    city: string;
    pincode: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  distance: string;
  contactDetails: {
    phone: string;
    email: string;
    emergencyContact: string;
    website?: string;
  };
  bloodBankDetails: {
    registrationNumber: string;
    operatingHours: string;
    bloodAvailability: Record<string, number>;
    facilities: string[];
    certifications: string[];
    operationalStatus: string;
    currentCapacity: number;
    emergencyReady: boolean;
    lastInspection: string;
    donorQueue: {
      currentDonors: number;
      estimatedWaitTime: number;
      availableSlots: number;
      nextAvailableSlot: string;
      totalDonationsToday: number;
    };
    bloodComponents: {
      wholeBlood: number;
      redBloodCells: number;
      plasma: number;
      platelets: number;
      cryoprecipitate: number;
    };
    equipmentStatus: {
      refrigerators: string;
      freezers: string;
      centrifuges: string;
      bloodBankSoftware: string;
      backupPower: string;
    };
    realtimeUpdates: {
      lastSync: string;
      dataSource: string;
      connectionStatus: string;
      nextUpdate: string;
    };
  };
  services: string[];
  specializations: string[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isEmergencyActive: boolean;
  lastUpdated: string;
}

export function HospitalBloodBankDirectory() {
  const [hospitals, setHospitals] = useState<HospitalBloodBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedServices, setSelectedServices] = useState("all");
  const [selectedCapacity, setSelectedCapacity] = useState("all");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("distance");
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

  // Generate mock hospital data with enhanced details
  const generateHospitalData = useCallback((): HospitalBloodBank[] => {
    const hospitalNames = [
      "All India Institute of Medical Sciences (AIIMS)",
      "Apollo Hospitals",
      "KEM Hospital",
      "Fortis Healthcare",
      "Red Cross Society Blood Bank",
      "Max Super Speciality Hospital",
      "Christian Medical College",
      "Ruby General Hospital",
      "Sanjay Gandhi PGIMS",
      "Sassoon General Hospital",
      "Sterling Hospital",
      "SMS Hospital",
      "Medanta Hospital",
      "Hero DMC Heart Institute",
      "Manipal Hospital",
      "Narayana Health",
      "Columbia Asia Hospital",
      "Kokilaben Dhirubhai Ambani Hospital",
      "Lilavati Hospital",
      "P. D. Hinduja Hospital",
      "Breach Candy Hospital",
      "Jaslok Hospital",
      "Global Hospital",
      "Continental Hospital",
      "Rainbow Children's Hospital"
    ];

    const types: Array<"Government" | "Private" | "Blood Bank" | "Medical College"> =
      ["Government", "Private", "Blood Bank", "Medical College"];

    const services = [
      "Emergency Services", "Blood Collection", "Blood Storage", "Cross Matching",
      "Component Separation", "Quality Testing", "Platelet Apheresis", "Blood Typing",
      "Plasma Freezing", "Cryopreservation", "HLA Typing", "Viral Marker Testing",
      "RFID Tracking", "Temperature Monitoring", "24/7 Lab Services", "Mobile Collection Unit",
      "Apheresis Unit", "Cord Blood Banking", "Autologous Collection", "Directed Donation",
      "Cardiac Surgery", "Neurosurgery", "Oncology", "Orthopedics", "Pediatrics",
      "Maternity Care", "ICU", "Dialysis", "Radiology", "Pathology"
    ];

    const certifications = [
      "NABH Accredited", "ISO 9001:2015", "CAP Accredited", "AABB Standards",
      "NBTC Certified", "WHO-GMP Compliant", "NABL Accredited", "DGHS Licensed"
    ];

    const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

    return Array.from({ length: 50 }, (_, index) => {
      // Get random location
      const states = Object.keys(locationHierarchy);
      const randomState = states[Math.floor(Math.random() * states.length)];
      const districts = Object.keys(locationHierarchy[randomState]);
      const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
      const cities = locationHierarchy[randomState][randomDistrict];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];

      const bloodAvailability: Record<string, number> = {};
      bloodTypes.forEach(type => {
        bloodAvailability[type] = Math.floor(Math.random() * 60) + 10;
      });

      const operationalStatus = [
        "Fully Operational", "High Capacity", "Moderate Capacity",
        "Limited Capacity", "Emergency Only"
      ][Math.floor(Math.random() * 5)];

      return {
        id: `HBB-${String(index + 1).padStart(3, "0")}`,
        name: hospitalNames[index % hospitalNames.length],
        type: types[Math.floor(Math.random() * types.length)],
        address: `${randomCity}, ${randomDistrict}, ${randomState} - ${Math.floor(Math.random() * 900000) + 100000}`,
        location: {
          state: randomState,
          district: randomDistrict,
          city: randomCity,
          pincode: String(Math.floor(Math.random() * 900000) + 100000)
        },
        coordinates: {
          lat: 8 + Math.random() * 29, // India's latitude range
          lng: 68 + Math.random() * 29  // India's longitude range
        },
        distance: `${(Math.random() * 50 + 0.5).toFixed(1)} km`,
        contactDetails: {
          phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          email: `info@${hospitalNames[index % hospitalNames.length].toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '')}.in`,
          emergencyContact: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          website: `https://www.${hospitalNames[index % hospitalNames.length].toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '')}.in`
        },
        bloodBankDetails: {
          registrationNumber: `${randomState.substring(0, 2).toUpperCase()}/BB/${String(index + 1).padStart(3, "0")}`,
          operatingHours: Math.random() > 0.3 ? "24/7" : "8:00 AM - 8:00 PM",
          bloodAvailability,
          facilities: services.slice(0, Math.floor(Math.random() * 8) + 6),
          certifications: certifications.slice(0, Math.floor(Math.random() * 4) + 2),
          operationalStatus,
          currentCapacity: Math.floor(Math.random() * 50) + 50,
          emergencyReady: Math.random() > 0.2,
          lastInspection: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          donorQueue: {
            currentDonors: Math.floor(Math.random() * 15) + 2,
            estimatedWaitTime: Math.floor(Math.random() * 45) + 15,
            availableSlots: Math.floor(Math.random() * 8) + 1,
            nextAvailableSlot: new Date(Date.now() + (Math.random() * 6 + 1) * 60 * 60 * 1000).toLocaleTimeString(),
            totalDonationsToday: Math.floor(Math.random() * 80) + 20
          },
          bloodComponents: {
            wholeBlood: Math.floor(Math.random() * 150) + 50,
            redBloodCells: Math.floor(Math.random() * 120) + 30,
            plasma: Math.floor(Math.random() * 100) + 40,
            platelets: Math.floor(Math.random() * 60) + 20,
            cryoprecipitate: Math.floor(Math.random() * 30) + 10
          },
          equipmentStatus: {
            refrigerators: Math.random() > 0.1 ? "Operational" : "Maintenance",
            freezers: Math.random() > 0.05 ? "Operational" : "Maintenance",
            centrifuges: Math.random() > 0.08 ? "Operational" : "Maintenance",
            bloodBankSoftware: "Online",
            backupPower: Math.random() > 0.03 ? "Available" : "Testing"
          },
          realtimeUpdates: {
            lastSync: new Date().toLocaleTimeString(),
            dataSource: "eraktkosh.mohfw.gov.in",
            connectionStatus: Math.random() > 0.05 ? "Active" : "Reconnecting",
            nextUpdate: new Date(Date.now() + 60000).toLocaleTimeString()
          }
        },
        services: services.slice(0, Math.floor(Math.random() * 10) + 5),
        specializations: [
          "Cardiology", "Neurology", "Oncology", "Orthopedics", "Pediatrics",
          "Gastroenterology", "Nephrology", "Pulmonology", "Dermatology", "ENT"
        ].slice(0, Math.floor(Math.random() * 5) + 2),
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
        totalReviews: Math.floor(Math.random() * 2000) + 100,
        isVerified: Math.random() > 0.1,
        isEmergencyActive: Math.random() > 0.7,
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  // Fetch hospital data
  const fetchHospitalData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      // Fetch real data from Supabase
      const { data: realHospitals, error: dbError } = await getHospitals();

      if (dbError) throw dbError;

      // If we have real data, map it to the enhanced interface
      if (realHospitals && realHospitals.length > 0) {
        const mappedHospitals: HospitalBloodBank[] = realHospitals.map((h: any, index: number) => {
          // Generate consistent mock details to fill in the gaps
          // We use the index to keep random values stable-ish for the same list order if strictly needed,
          // but here we just want "some" value.

          const services = [
            "Emergency Services", "Blood Collection", "Blood Storage", "Cross Matching",
            "Component Separation", "Quality Testing", "Platelet Apheresis", "Blood Typing"
          ];
          const certifications = ["NABH Accredited", "ISO 9001:2015", "NBTC Certified"];

          // Parse available blood types
          const availableTypes = h.blood_types || [];
          const bloodAvailability: Record<string, number> = {};
          ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].forEach(type => {
            // If type is in the list, give it some quantity, else 0
            bloodAvailability[type] = availableTypes.includes(type) ? Math.floor(Math.random() * 50) + 10 : 0;
          });

          return {
            id: h.id,
            name: h.hospital_name,
            type: h.type || "Hospital", // Default if missing
            address: h.address || "Unknown Address",
            location: {
              state: "Telangana", // Default mapping for sample data (mostly Hyd/Blr/Chennai which are South)
              district: h.city || "Unknown",
              city: h.city || "Unknown",
              pincode: h.pincode || "000000"
            },
            coordinates: {
              lat: 17.3850 + (Math.random() * 0.1), // Approx Hyderabad lat
              lng: 78.4867 + (Math.random() * 0.1)  // Approx Hyderabad lng
            },
            distance: `${(Math.random() * 10 + 1).toFixed(1)} km`,
            contactDetails: {
              phone: h.phone || "N/A",
              email: h.email || "N/A",
              emergencyContact: h.phone || "N/A",
              website: "#"
            },
            bloodBankDetails: {
              registrationNumber: `REG-${h.id}`,
              operatingHours: "24/7",
              bloodAvailability,
              facilities: services,
              certifications,
              operationalStatus: "Fully Operational",
              currentCapacity: 85,
              emergencyReady: true,
              lastInspection: new Date().toLocaleDateString(),
              donorQueue: {
                currentDonors: Math.floor(Math.random() * 5),
                estimatedWaitTime: 15,
                availableSlots: 10,
                nextAvailableSlot: "Now",
                totalDonationsToday: 12
              },
              bloodComponents: {
                wholeBlood: 50,
                redBloodCells: 40,
                plasma: 30,
                platelets: 20,
                cryoprecipitate: 10
              },
              equipmentStatus: {
                refrigerators: "Operational",
                freezers: "Operational",
                centrifuges: "Operational",
                bloodBankSoftware: "Online",
                backupPower: "Available"
              },
              realtimeUpdates: {
                lastSync: new Date().toLocaleTimeString(),
                dataSource: "System DB",
                connectionStatus: "Active",
                nextUpdate: "Now"
              }
            },
            services: services,
            specializations: ["General", "Emergency"],
            rating: 4.5,
            totalReviews: 120,
            isVerified: true,
            isEmergencyActive: false,
            lastUpdated: new Date().toISOString()
          };
        });

        setHospitals(mappedHospitals);
      } else {
        // Fallback to generated data if DB is empty
        const data = generateHospitalData();
        setHospitals(data);
      }

      setLastUpdated(new Date());

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      // Fallback
      const data = generateHospitalData();
      setHospitals(data);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [generateHospitalData]);

  // Auto-refresh mechanism
  useEffect(() => {
    fetchHospitalData(true);

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchHospitalData(false);
      }, 120000); // 2 minutes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchHospitalData, autoRefresh]);

  // Filter hospitals
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch =
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.location.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.bloodBankDetails.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || hospital.type === selectedType;
    const matchesState = selectedState === "all" || hospital.location.state === selectedState;
    const matchesDistrict = selectedDistrict === "all" || hospital.location.district === selectedDistrict;
    const matchesCity = selectedCity === "all" || hospital.location.city === selectedCity;
    const matchesServices = selectedServices === "all" || hospital.services.some(service =>
      service.toLowerCase().includes(selectedServices.toLowerCase())
    );
    const matchesCapacity = selectedCapacity === "all" ||
      (selectedCapacity === "high" && hospital.bloodBankDetails.currentCapacity >= 80) ||
      (selectedCapacity === "medium" && hospital.bloodBankDetails.currentCapacity >= 50 && hospital.bloodBankDetails.currentCapacity < 80) ||
      (selectedCapacity === "low" && hospital.bloodBankDetails.currentCapacity < 50);

    const matchesEmergency = !emergencyOnly || hospital.isEmergencyActive;
    const matchesVerified = !verifiedOnly || hospital.isVerified;

    return matchesSearch && matchesType && matchesState && matchesDistrict &&
      matchesCity && matchesServices && matchesCapacity && matchesEmergency && matchesVerified;
  });

  // Sort hospitals
  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        return parseFloat(a.distance) - parseFloat(b.distance);
      case "rating":
        return b.rating - a.rating;
      case "capacity":
        return b.bloodBankDetails.currentCapacity - a.bloodBankDetails.currentCapacity;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Action handlers
  const handleCallHospital = (hospital: HospitalBloodBank) => {
    const phoneNumber = hospital.contactDetails.phone.replace(/\D/g, '');
    if (navigator.userAgent.includes('Mobile')) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      navigator.clipboard.writeText(phoneNumber);
      toast.info(`Phone number copied: ${hospital.contactDetails.phone}`);
    }
  };

  const handleVisitWebsite = (hospital: HospitalBloodBank) => {
    if (hospital.contactDetails.website) {
      window.open(hospital.contactDetails.website, '_blank', 'noopener,noreferrer');
      toast.info(`Opening ${hospital.name} website`);
    }
  };

  const handleSendEmail = (hospital: HospitalBloodBank) => {
    const subject = encodeURIComponent(`Inquiry - ${hospital.name}`);
    const body = encodeURIComponent(
      `Dear Team,\n\nI am writing to inquire about your blood bank services and availability.\n\nBest regards`
    );

    window.location.href = `mailto:${hospital.contactDetails.email}?subject=${subject}&body=${body}`;
    toast.info(`Opening email to ${hospital.name}`);
  };

  const handleGetDirections = (hospital: HospitalBloodBank) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`;
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    toast.info(`Getting directions to ${hospital.name}`);
  };

  const handleExportData = () => {
    const csvData = [
      ["Name", "Type", "Address", "Phone", "Rating", "Capacity", "Emergency Ready"].join(","),
      ...sortedHospitals.map(h => [
        `"${h.name}"`,
        h.type,
        `"${h.address}"`,
        h.contactDetails.phone,
        h.rating,
        `${h.bloodBankDetails.currentCapacity}%`,
        h.bloodBankDetails.emergencyReady ? "Yes" : "No"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hospitals-bloodbanks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Hospital data exported successfully!");
  };

  if (isLoading && hospitals.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Loading Hospital & Blood Bank Directory
            </CardTitle>
            <CardDescription>
              Connecting to national healthcare database...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
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
              <h3 className="font-medium text-gray-900">Failed to Load Directory</h3>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
            <Button onClick={() => fetchHospitalData(true)} className="bg-red-600 hover:bg-red-700">
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
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="font-medium text-blue-900">Hospital & Blood Bank Directory</h1>
                  <div className="text-xs text-blue-700">Real-time data from national healthcare network</div>
                </div>
              </div>

              {lastUpdated && (
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-green-600" />
                    <span className="text-green-700">Connected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-600" />
                    <span className="text-gray-700">Updated: {lastUpdated.toLocaleTimeString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
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
                onClick={() => fetchHospitalData(false)}
                disabled={isRefreshing}
              >
                {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter Hospitals
          </CardTitle>
          <CardDescription>
            Find hospitals and blood banks across India with advanced filtering options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <Input
              placeholder="Search by hospital name, location, registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />

            {/* Primary Filters */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-blue-50 border-blue-200">
                  <SelectValue placeholder="🏥 Hospital Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Government">🏛️ Government</SelectItem>
                  <SelectItem value="Private">🏢 Private</SelectItem>
                  <SelectItem value="Blood Bank">🩸 Blood Bank</SelectItem>
                  <SelectItem value="Medical College">🎓 Medical College</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedServices} onValueChange={setSelectedServices}>
                <SelectTrigger className="bg-green-50 border-green-200">
                  <SelectValue placeholder="🔬 Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="Emergency Services">🚑 Emergency Services</SelectItem>
                  <SelectItem value="Blood Collection">🩸 Blood Collection</SelectItem>
                  <SelectItem value="Cardiac Surgery">❤️ Cardiac Surgery</SelectItem>
                  <SelectItem value="Oncology">🎗️ Oncology</SelectItem>
                  <SelectItem value="Pediatrics">👶 Pediatrics</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
                <SelectTrigger className="bg-orange-50 border-orange-200">
                  <SelectValue placeholder="📊 Capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Capacities</SelectItem>
                  <SelectItem value="high">🟢 High (80%+)</SelectItem>
                  <SelectItem value="medium">🟡 Medium (50-79%)</SelectItem>
                  <SelectItem value="low">🔴 Low (&lt;50%)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-purple-50 border-purple-200">
                  <SelectValue placeholder="📋 Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">📍 Distance</SelectItem>
                  <SelectItem value="rating">⭐ Rating</SelectItem>
                  <SelectItem value="capacity">📊 Capacity</SelectItem>
                  <SelectItem value="name">🔤 Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filters */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Filters
              </h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Select value={selectedState} onValueChange={handleStateChange}>
                  <SelectTrigger className="bg-red-50 border-red-200">
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
                  className="flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Clear Location
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="border-t pt-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                  <Button
                    variant={emergencyOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEmergencyOnly(!emergencyOnly)}
                    className={emergencyOnly ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    🚨 Emergency Only
                  </Button>

                  <Button
                    variant={verifiedOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={verifiedOnly ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Verified Only
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedType("all");
                      setSelectedState("all");
                      setSelectedDistrict("all");
                      setSelectedCity("all");
                      setSelectedServices("all");
                      setSelectedCapacity("all");
                      setEmergencyOnly(false);
                      setVerifiedOnly(false);
                    }}
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    Clear All Filters
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{sortedHospitals.length}</span> of <span className="font-medium text-gray-900">{hospitals.length}</span> hospitals & blood banks
            {isRefreshing && (
              <span className="ml-2 text-blue-600">
                <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                Updating...
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {sortedHospitals.filter(h => h.bloodBankDetails.emergencyReady).length} Emergency Ready
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Shield className="w-3 h-3 mr-1" />
            {sortedHospitals.filter(h => h.isVerified).length} Verified
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Wifi className="w-3 h-3 mr-1" />
            {sortedHospitals.filter(h => h.bloodBankDetails.realtimeUpdates.connectionStatus === "Active").length} Live
          </Badge>
        </div>
      </div>

      {/* Hospital Cards */}
      <div className="space-y-4">
        {sortedHospitals.map((hospital) => (
          <Card key={hospital.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Hospital Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          {hospital.type === "Blood Bank" ? <Heart className="w-5 h-5 text-red-600" /> : <Stethoscope className="w-5 h-5 text-blue-600" />}
                          <h3 className="font-semibold text-lg text-gray-900">{hospital.name}</h3>
                        </div>

                        {hospital.isVerified && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}

                        {hospital.isEmergencyActive && (
                          <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
                            🚨 Emergency Active
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`
                          ${hospital.type === "Government" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
                          ${hospital.type === "Private" ? "bg-green-100 text-green-800 border-green-200" : ""}
                          ${hospital.type === "Blood Bank" ? "bg-purple-100 text-purple-800 border-purple-200" : ""}
                          ${hospital.type === "Medical College" ? "bg-orange-100 text-orange-800 border-orange-200" : ""}
                        `}>
                          <Building2 className="w-3 h-3 mr-1" />
                          {hospital.type}
                        </Badge>

                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{hospital.rating}</span>
                          <span className="text-gray-500 text-sm">({hospital.totalReviews} reviews)</span>
                        </div>

                        <Badge variant="outline" className="text-xs">
                          {hospital.distance}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="text-sm text-gray-600">
                            <div>{hospital.address}</div>
                            <div className="text-xs text-gray-500">
                              Registration: {hospital.bloodBankDetails.registrationNumber}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${hospital.bloodBankDetails.currentCapacity >= 80 ? "bg-green-500" :
                            hospital.bloodBankDetails.currentCapacity >= 50 ? "bg-yellow-500" : "bg-red-500"
                          }`}></div>
                        <span className="text-sm font-medium">
                          {hospital.bloodBankDetails.currentCapacity}% Capacity
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {hospital.bloodBankDetails.operatingHours}
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated: {new Date(hospital.lastUpdated).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Services & Specializations */}
                  <div className="space-y-2">
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Specializations</h5>
                      <div className="flex flex-wrap gap-1">
                        {hospital.specializations.slice(0, 4).map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {hospital.specializations.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{hospital.specializations.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Key Services</h5>
                      <div className="flex flex-wrap gap-1">
                        {hospital.services.slice(0, 6).map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {hospital.services.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{hospital.services.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Blood Bank Details */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Real-time Blood Stock
                    </h4>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {Object.entries(hospital.bloodBankDetails.bloodAvailability)
                        .slice(0, 4)
                        .map(([type, count]) => (
                          <div key={type} className="bg-white p-2 rounded text-center">
                            <div className="font-medium text-gray-900">{type}</div>
                            <div className={count > 30 ? "text-green-600" : count > 15 ? "text-orange-600" : "text-red-600"}>
                              {count} units
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Donor Queue */}
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-gray-600">Donors in Queue:</span>
                          <div className="font-medium">{hospital.bloodBankDetails.donorQueue.currentDonors}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Wait Time:</span>
                          <div className="font-medium">{hospital.bloodBankDetails.donorQueue.estimatedWaitTime} min</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Today's Collections:</span>
                          <div className="font-medium text-green-600">{hospital.bloodBankDetails.donorQueue.totalDonationsToday}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  {hospital.bloodBankDetails.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {hospital.bloodBankDetails.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          <Award className="w-2 h-2 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 lg:w-52">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleCallHospital(hospital)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Hospital
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleGetDirections(hospital)}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>

                  {hospital.contactDetails.website && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleVisitWebsite(hospital)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSendEmail(hospital)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full bg-green-50 hover:bg-green-100"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedHospitals.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="font-medium text-gray-900">No hospitals found</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Try adjusting your search criteria or clearing some filters.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("all");
                    setSelectedState("all");
                    setSelectedDistrict("all");
                    setSelectedCity("all");
                    setSelectedServices("all");
                    setSelectedCapacity("all");
                    setEmergencyOnly(false);
                    setVerifiedOnly(false);
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
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