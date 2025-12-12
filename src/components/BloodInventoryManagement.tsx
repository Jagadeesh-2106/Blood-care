import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { BloodCompatibilityMatrix } from "./BloodCompatibilityMatrix";
import { InventoryAlertsDashboard } from "./InventoryAlertsDashboard";
import { BloodUnitExpirationTracker } from "./BloodUnitExpirationTracker";
import { 
  Droplets, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  MapPin,
  Filter,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Clock,
  Building2,
  CheckCircle,
  XCircle,
  Loader2,
  Heart,
  Shield,
  Bell
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface BloodUnit {
  id: string;
  bloodType: string;
  quantity: number;
  donationDate: string;
  expirationDate: string;
  donorId: string;
  donorName: string;
  location: string;
  center: string;
  status: 'Available' | 'Reserved' | 'Used' | 'Expired' | 'Testing' | 'Quarantined';
  batchNumber: string;
  testResults?: {
    bloodType: boolean;
    HIV: boolean;
    Hepatitis: boolean;
    Syphilis: boolean;
    testDate: string;
  };
}

interface InventoryStats {
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  expiringSoon: number;
  criticallyLow: string[];
}

interface UserProfile {
  id: string;
  role: string;
  fullName: string;
  email: string;
}

interface BloodInventoryManagementProps {
  userProfile: UserProfile;
}

export function BloodInventoryManagement({ userProfile }: BloodInventoryManagementProps) {
  const [inventory, setInventory] = useState<BloodUnit[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<BloodUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [stats, setStats] = useState<InventoryStats>({
    totalUnits: 0,
    availableUnits: 0,
    reservedUnits: 0,
    expiringSoon: 0,
    criticallyLow: []
  });

  // Demo inventory data
  const getDemoInventory = (): BloodUnit[] => {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const locations = ['New York Blood Center', 'Manhattan Central', 'Brooklyn Heights', 'Queens Medical', 'Bronx General'];
    const statuses: BloodUnit['status'][] = ['Available', 'Reserved', 'Testing', 'Available', 'Available'];
    
    return Array.from({ length: 150 }, (_, i) => {
      const donationDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const expirationDate = new Date(donationDate.getTime() + 42 * 24 * 60 * 60 * 1000); // 42 days shelf life
      
      return {
        id: `BU-${String(i + 1).padStart(4, '0')}`,
        bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
        quantity: 1, // Standard unit
        donationDate: donationDate.toISOString(),
        expirationDate: expirationDate.toISOString(),
        donorId: `donor-${Math.floor(Math.random() * 1000)}`,
        donorName: `Donor ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 100)}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        center: locations[Math.floor(Math.random() * locations.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        batchNumber: `BTH-${Date.now().toString().slice(-6)}-${String(i + 1).padStart(3, '0')}`,
        testResults: {
          bloodType: true,
          HIV: false,
          Hepatitis: false,
          Syphilis: false,
          testDate: new Date(donationDate.getTime() + 24 * 60 * 60 * 1000).toISOString()
        }
      };
    });
  };

  // Calculate inventory statistics
  const calculateStats = (inventoryData: BloodUnit[]): InventoryStats => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const totalUnits = inventoryData.length;
    const availableUnits = inventoryData.filter(unit => unit.status === 'Available').length;
    const reservedUnits = inventoryData.filter(unit => unit.status === 'Reserved').length;
    const expiringSoon = inventoryData.filter(unit => {
      const expirationDate = new Date(unit.expirationDate);
      return expirationDate <= sevenDaysFromNow && expirationDate > now && unit.status === 'Available';
    }).length;

    // Calculate critically low blood types (less than 10 units available)
    const bloodTypeCounts: Record<string, number> = {};
    inventoryData.forEach(unit => {
      if (unit.status === 'Available') {
        bloodTypeCounts[unit.bloodType] = (bloodTypeCounts[unit.bloodType] || 0) + 1;
      }
    });
    
    const criticallyLow = Object.keys(bloodTypeCounts).filter(type => bloodTypeCounts[type] < 10);

    return {
      totalUnits,
      availableUnits,
      reservedUnits,
      expiringSoon,
      criticallyLow
    };
  };

  // Load inventory data
  const loadInventory = async () => {
    try {
      setIsLoading(true);
      
      // For now, use demo data - in production, this would call your API
      const demoData = getDemoInventory();
      setInventory(demoData);
      setStats(calculateStats(demoData));
      
      toast.success(`Loaded ${demoData.length} blood units from inventory`);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter inventory
  useEffect(() => {
    let filtered = [...inventory];

    if (searchTerm) {
      filtered = filtered.filter(unit =>
        unit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.center.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (bloodTypeFilter !== "all") {
      filtered = filtered.filter(unit => unit.bloodType === bloodTypeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(unit => unit.status === statusFilter);
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter(unit => unit.location === locationFilter);
    }

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, bloodTypeFilter, statusFilter, locationFilter]);

  // Load data on component mount
  useEffect(() => {
    loadInventory();
  }, []);

  // Get status badge styling
  const getStatusBadge = (status: BloodUnit['status']) => {
    const statusStyles = {
      'Available': 'bg-green-100 text-green-800 border-green-200',
      'Reserved': 'bg-blue-100 text-blue-800 border-blue-200',
      'Used': 'bg-gray-100 text-gray-800 border-gray-200',
      'Expired': 'bg-red-100 text-red-800 border-red-200',
      'Testing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Quarantined': 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return (
      <Badge className={`${statusStyles[status]} border font-medium`}>
        {status}
      </Badge>
    );
  };

  // Get blood type color
  const getBloodTypeColor = (bloodType: string) => {
    const colors = {
      'A+': 'bg-red-500',
      'A-': 'bg-red-400',
      'B+': 'bg-blue-500',
      'B-': 'bg-blue-400',
      'AB+': 'bg-purple-500',
      'AB-': 'bg-purple-400',
      'O+': 'bg-green-500',
      'O-': 'bg-green-400'
    };
    return colors[bloodType as keyof typeof colors] || 'bg-gray-500';
  };

  // Calculate days until expiration
  const getDaysUntilExpiration = (expirationDate: string) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get unique locations for filter
  const uniqueLocations = [...new Set(inventory.map(unit => unit.location))].sort();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
            <p className="text-gray-600">Loading blood inventory...</p>
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
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-red-600" />
            Comprehensive Blood Inventory Management
          </CardTitle>
          <CardDescription>
            Complete blood inventory system with alerts, expiration tracking, and compatibility matrix
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Management Tabs */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Inventory Alerts
          </TabsTrigger>
          <TabsTrigger value="expiration" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Expiration Tracking
          </TabsTrigger>
          <TabsTrigger value="compatibility" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Compatibility Matrix
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Unit Management
          </TabsTrigger>
        </TabsList>

        {/* Inventory Alerts Dashboard */}
        <TabsContent value="alerts">
          <InventoryAlertsDashboard />
        </TabsContent>

        {/* Expiration Tracking */}
        <TabsContent value="expiration">
          <BloodUnitExpirationTracker />
        </TabsContent>

        {/* Blood Compatibility Matrix */}
        <TabsContent value="compatibility">
          <BloodCompatibilityMatrix />
        </TabsContent>

        {/* Traditional Unit Management */}
        <TabsContent value="management">
          <div className="space-y-6">
            {/* Header with quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Units</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUnits}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Available</p>
                      <p className="text-2xl font-bold text-green-600">{stats.availableUnits}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Critical Types</p>
                      <p className="text-2xl font-bold text-red-600">{stats.criticallyLow.length}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Critical alerts */}
            {stats.criticallyLow.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Critical Blood Type Shortage</h4>
                      <p className="text-red-700 mb-2">
                        The following blood types have critically low inventory (less than 10 units):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {stats.criticallyLow.map(type => (
                          <Badge key={type} className="bg-red-100 text-red-800 border-red-300">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main inventory management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      Blood Unit Management
                    </CardTitle>
                    <CardDescription>
                      Track and manage individual blood units across all locations
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadInventory}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Blood Unit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by unit ID, donor name, batch number, or center..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Blood Types</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Reserved">Reserved</SelectItem>
                        <SelectItem value="Testing">Testing</SelectItem>
                        <SelectItem value="Used">Used</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Quarantined">Quarantined</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {uniqueLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results summary */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>
                    Showing {filteredInventory.length} of {inventory.length} blood units
                  </span>
                </div>

                {/* Inventory table */}
                <div className="overflow-x-auto">
                  <div className="space-y-3">
                    {filteredInventory.slice(0, 20).map((unit) => {
                      const daysUntilExpiry = getDaysUntilExpiration(unit.expirationDate);
                      const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                      const isExpired = daysUntilExpiry <= 0;
                      
                      return (
                        <Card key={unit.id} className={`${isExpired ? 'border-red-200 bg-red-50' : isExpiringSoon ? 'border-orange-200 bg-orange-50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full ${getBloodTypeColor(unit.bloodType)} flex items-center justify-center text-white font-bold`}>
                                  {unit.bloodType}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">{unit.id}</h4>
                                    {getStatusBadge(unit.status)}
                                    {isExpiringSoon && (
                                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Expiring in {daysUntilExpiry} days
                                      </Badge>
                                    )}
                                    {isExpired && (
                                      <Badge className="bg-red-100 text-red-800 border-red-200">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Expired
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>Donor: {unit.donorName}</span>
                                    <span>Batch: {unit.batchNumber}</span>
                                    <span className="flex items-center gap-1">
                                      <Building2 className="w-3 h-3" />
                                      {unit.location}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-sm text-gray-600 mb-1">
                                  Donated: {formatDate(unit.donationDate)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Expires: {formatDate(unit.expirationDate)}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {filteredInventory.length > 20 && (
                    <div className="mt-4 text-center text-sm text-gray-600">
                      Showing first 20 of {filteredInventory.length} units. Use filters to narrow results.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}