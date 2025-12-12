import { useState, useEffect } from 'react';
import { Building2, Phone, Mail, MapPin, Clock, Users, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';

interface HospitalPartner {
  id: string;
  name: string;
  type: 'hospital' | 'blood_bank' | 'clinic' | 'government' | 'ngo';
  location: {
    city: string;
    state: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  contacts: {
    primaryContact: string;
    emergencyContact: string;
    email: string;
    alternatePhone?: string;
  };
  tier: 1 | 2 | 3; // 1 = Primary, 2 = Secondary, 3 = Emergency backup
  capacity: {
    totalBeds?: number;
    bloodBankCapacity: number;
    averageMonthlyDonations: number;
  };
  capabilities: {
    bloodTypes: string[];
    emergencyResponse: boolean;
    mobileBanks: boolean;
    plasmapheresis: boolean;
    pediatricBlood: boolean;
  };
  performance: {
    responseTime: string;
    fulfillmentRate: number;
    lastResponseTime: Date;
    collaborationScore: number;
  };
  availability: {
    status: 'active' | 'limited' | 'unavailable';
    lastUpdated: Date;
    specialNotes?: string;
  };
  isActive: boolean;
}

interface PartnershipRequest {
  id: string;
  emergencyType: 'blood_shortage' | 'mass_casualty' | 'disaster_response' | 'rare_blood_type';
  bloodType: string;
  unitsNeeded: number;
  urgencyLevel: 'critical' | 'urgent' | 'high';
  location: string;
  requestingHospital: string;
  contactedPartners: string[];
  responses: { partnerId: string; response: 'accepted' | 'declined' | 'pending'; timestamp: Date; notes?: string }[];
  createdAt: Date;
  status: 'pending' | 'in_progress' | 'fulfilled' | 'escalated';
}

export function HospitalPartnershipChain() {
  const [partners, setPartners] = useState<HospitalPartner[]>([]);
  const [partnershipRequests, setPartnershipRequests] = useState<PartnershipRequest[]>([]);
  const [selectedTier, setSelectedTier] = useState<'all' | 1 | 2 | 3>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    type: 'hospital' as const,
    city: '',
    state: '',
    address: '',
    primaryContact: '',
    emergencyContact: '',
    email: '',
    tier: 1 as const,
    bloodBankCapacity: '',
    emergencyResponse: true
  });

  // Initialize demo data
  useEffect(() => {
    const initializeDemoData = () => {
      const demoPartners: HospitalPartner[] = [
        {
          id: 'partner-001',
          name: 'Tata Memorial Hospital',
          type: 'hospital',
          location: {
            city: 'Mumbai',
            state: 'Maharashtra',
            address: 'Dr. E Borges Road, Parel, Mumbai',
            coordinates: { lat: 19.0176, lng: 72.8562 }
          },
          contacts: {
            primaryContact: '+91 22 2417 7000',
            emergencyContact: '+91 22 2417 7001',
            email: 'emergency@tmc.gov.in',
            alternatePhone: '+91 22 2417 7002'
          },
          tier: 1,
          capacity: {
            totalBeds: 629,
            bloodBankCapacity: 500,
            averageMonthlyDonations: 2000
          },
          capabilities: {
            bloodTypes: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
            emergencyResponse: true,
            mobileBanks: true,
            plasmapheresis: true,
            pediatricBlood: true
          },
          performance: {
            responseTime: '2-5 min',
            fulfillmentRate: 94,
            lastResponseTime: new Date(Date.now() - 5 * 60 * 1000),
            collaborationScore: 98
          },
          availability: {
            status: 'active',
            lastUpdated: new Date(Date.now() - 30 * 60 * 1000)
          },
          isActive: true
        },
        {
          id: 'partner-002',
          name: 'King Edward Memorial Hospital',
          type: 'hospital',
          location: {
            city: 'Mumbai',
            state: 'Maharashtra',
            address: 'Acharya Donde Marg, Parel, Mumbai',
            coordinates: { lat: 19.0176, lng: 72.8422 }
          },
          contacts: {
            primaryContact: '+91 22 2413 6051',
            emergencyContact: '+91 22 2413 6052',
            email: 'emergency@kem.edu',
          },
          tier: 1,
          capacity: {
            totalBeds: 1800,
            bloodBankCapacity: 800,
            averageMonthlyDonations: 3500
          },
          capabilities: {
            bloodTypes: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
            emergencyResponse: true,
            mobileBanks: true,
            plasmapheresis: false,
            pediatricBlood: true
          },
          performance: {
            responseTime: '3-7 min',
            fulfillmentRate: 91,
            lastResponseTime: new Date(Date.now() - 12 * 60 * 1000),
            collaborationScore: 95
          },
          availability: {
            status: 'active',
            lastUpdated: new Date(Date.now() - 45 * 60 * 1000)
          },
          isActive: true
        },
        {
          id: 'partner-003',
          name: 'AIIMS Delhi',
          type: 'hospital',
          location: {
            city: 'New Delhi',
            state: 'Delhi',
            address: 'Ansari Nagar, New Delhi',
            coordinates: { lat: 28.5672, lng: 77.2100 }
          },
          contacts: {
            primaryContact: '+91 11 2658 8500',
            emergencyContact: '+91 11 2658 8700',
            email: 'emergency@aiims.edu',
          },
          tier: 1,
          capacity: {
            totalBeds: 2478,
            bloodBankCapacity: 1000,
            averageMonthlyDonations: 4500
          },
          capabilities: {
            bloodTypes: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
            emergencyResponse: true,
            mobileBanks: true,
            plasmapheresis: true,
            pediatricBlood: true
          },
          performance: {
            responseTime: '1-3 min',
            fulfillmentRate: 97,
            lastResponseTime: new Date(Date.now() - 2 * 60 * 1000),
            collaborationScore: 99
          },
          availability: {
            status: 'active',
            lastUpdated: new Date(Date.now() - 15 * 60 * 1000)
          },
          isActive: true
        },
        {
          id: 'partner-004',
          name: 'Indian Red Cross Society Blood Bank',
          type: 'blood_bank',
          location: {
            city: 'Bangalore',
            state: 'Karnataka',
            address: 'Red Cross Bhavan, Race Course Road, Bangalore',
            coordinates: { lat: 12.9716, lng: 77.5946 }
          },
          contacts: {
            primaryContact: '+91 80 2226 4424',
            emergencyContact: '+91 80 2226 4425',
            email: 'bloodbank@redcrossbangalore.org',
          },
          tier: 2,
          capacity: {
            bloodBankCapacity: 600,
            averageMonthlyDonations: 2800
          },
          capabilities: {
            bloodTypes: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
            emergencyResponse: true,
            mobileBanks: true,
            plasmapheresis: false,
            pediatricBlood: false
          },
          performance: {
            responseTime: '5-10 min',
            fulfillmentRate: 87,
            lastResponseTime: new Date(Date.now() - 20 * 60 * 1000),
            collaborationScore: 88
          },
          availability: {
            status: 'active',
            lastUpdated: new Date(Date.now() - 60 * 60 * 1000)
          },
          isActive: true
        },
        {
          id: 'partner-005',
          name: 'Voluntary Blood Donors Association',
          type: 'ngo',
          location: {
            city: 'Chennai',
            state: 'Tamil Nadu',
            address: 'Anna Nagar, Chennai',
            coordinates: { lat: 13.0827, lng: 80.2707 }
          },
          contacts: {
            primaryContact: '+91 44 2628 4567',
            emergencyContact: '+91 44 2628 4568',
            email: 'emergency@vbdachennai.org',
          },
          tier: 3,
          capacity: {
            bloodBankCapacity: 200,
            averageMonthlyDonations: 800
          },
          capabilities: {
            bloodTypes: ['O+', 'A+', 'B+', 'AB+'],
            emergencyResponse: true,
            mobileBanks: false,
            plasmapheresis: false,
            pediatricBlood: false
          },
          performance: {
            responseTime: '10-15 min',
            fulfillmentRate: 78,
            lastResponseTime: new Date(Date.now() - 35 * 60 * 1000),
            collaborationScore: 82
          },
          availability: {
            status: 'limited',
            lastUpdated: new Date(Date.now() - 90 * 60 * 1000),
            specialNotes: 'Limited capacity due to ongoing blood drive'
          },
          isActive: true
        }
      ];

      const demoRequests: PartnershipRequest[] = [
        {
          id: 'request-001',
          emergencyType: 'blood_shortage',
          bloodType: 'O-',
          unitsNeeded: 12,
          urgencyLevel: 'critical',
          location: 'Mumbai, Maharashtra',
          requestingHospital: 'Lilavati Hospital',
          contactedPartners: ['partner-001', 'partner-002'],
          responses: [
            { partnerId: 'partner-001', response: 'accepted', timestamp: new Date(Date.now() - 10 * 60 * 1000), notes: 'Can provide 8 units immediately' },
            { partnerId: 'partner-002', response: 'pending', timestamp: new Date(Date.now() - 5 * 60 * 1000) }
          ],
          createdAt: new Date(Date.now() - 15 * 60 * 1000),
          status: 'in_progress'
        }
      ];

      setPartners(demoPartners);
      setPartnershipRequests(demoRequests);
    };

    initializeDemoData();
  }, []);

  const addNewPartner = () => {
    if (!newPartner.name || !newPartner.primaryContact || !newPartner.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const partner: HospitalPartner = {
      id: `partner-${Date.now()}`,
      name: newPartner.name,
      type: newPartner.type,
      location: {
        city: newPartner.city,
        state: newPartner.state,
        address: newPartner.address,
        coordinates: { lat: 0, lng: 0 } // Would be geocoded in real app
      },
      contacts: {
        primaryContact: newPartner.primaryContact,
        emergencyContact: newPartner.emergencyContact,
        email: newPartner.email
      },
      tier: newPartner.tier,
      capacity: {
        bloodBankCapacity: parseInt(newPartner.bloodBankCapacity) || 0,
        averageMonthlyDonations: 0
      },
      capabilities: {
        bloodTypes: ['O+', 'A+', 'B+', 'AB+'], // Default selection
        emergencyResponse: newPartner.emergencyResponse,
        mobileBanks: false,
        plasmapheresis: false,
        pediatricBlood: false
      },
      performance: {
        responseTime: 'Not tracked',
        fulfillmentRate: 0,
        lastResponseTime: new Date(),
        collaborationScore: 0
      },
      availability: {
        status: 'active',
        lastUpdated: new Date()
      },
      isActive: true
    };

    setPartners(prev => [partner, ...prev]);
    setIsAddingPartner(false);
    setNewPartner({
      name: '',
      type: 'hospital',
      city: '',
      state: '',
      address: '',
      primaryContact: '',
      emergencyContact: '',
      email: '',
      tier: 1,
      bloodBankCapacity: '',
      emergencyResponse: true
    });

    toast.success('New hospital partner added successfully');
  };

  const initiateEmergencyContact = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (partner) {
      toast.info(`Emergency contact initiated with ${partner.name}`);
      // In real app, this would trigger actual contact methods
    }
  };

  const filteredPartners = partners.filter(partner => {
    if (selectedTier !== 'all' && partner.tier !== selectedTier) return false;
    if (selectedState !== 'all' && partner.location.state !== selectedState) return false;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'blood_bank': return '🩸';
      case 'clinic': return '🏪';
      case 'government': return '🏛️';
      case 'ngo': return '🤝';
      default: return '🏥';
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueStates = [...new Set(partners.map(p => p.location.state))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h1>Hospital Partnership Chain</h1>
          </div>
          <Badge variant="outline">
            {partners.filter(p => p.isActive).length} Active Partners
          </Badge>
        </div>
        
        <Dialog open={isAddingPartner} onOpenChange={setIsAddingPartner}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Hospital Partner</DialogTitle>
              <DialogDescription>
                Add a new hospital or blood bank to the emergency partnership network
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Name *</label>
                  <Input
                    value={newPartner.name}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Hospital or organization name"
                  />
                </div>
                <div>
                  <label className="block mb-2">Type</label>
                  <Select value={newPartner.type} onValueChange={(value: any) => setNewPartner(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="blood_bank">Blood Bank</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="ngo">NGO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">City</label>
                  <Input
                    value={newPartner.city}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block mb-2">State</label>
                  <Input
                    value={newPartner.state}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-2">Address</label>
                <Textarea
                  value={newPartner.address}
                  onChange={(e) => setNewPartner(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full address"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Primary Contact *</label>
                  <Input
                    value={newPartner.primaryContact}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, primaryContact: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block mb-2">Emergency Contact</label>
                  <Input
                    value={newPartner.emergencyContact}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Email *</label>
                  <Input
                    type="email"
                    value={newPartner.email}
                    onChange={(e) => setNewPartner(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="emergency@hospital.com"
                  />
                </div>
                <div>
                  <label className="block mb-2">Partnership Tier</label>
                  <Select value={newPartner.tier.toString()} onValueChange={(value) => setNewPartner(prev => ({ ...prev, tier: parseInt(value) as 1 | 2 | 3 }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tier 1 (Primary)</SelectItem>
                      <SelectItem value="2">Tier 2 (Secondary)</SelectItem>
                      <SelectItem value="3">Tier 3 (Emergency Backup)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block mb-2">Blood Bank Capacity</label>
                <Input
                  type="number"
                  value={newPartner.bloodBankCapacity}
                  onChange={(e) => setNewPartner(prev => ({ ...prev, bloodBankCapacity: e.target.value }))}
                  placeholder="Number of units"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddingPartner(false)}>
                  Cancel
                </Button>
                <Button onClick={addNewPartner}>
                  Add Partner
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block mb-2 text-sm">Filter by Tier</label>
              <Select value={selectedTier.toString()} onValueChange={(value) => setSelectedTier(value === 'all' ? 'all' : parseInt(value) as 1 | 2 | 3)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="1">Tier 1 (Primary)</SelectItem>
                  <SelectItem value="2">Tier 2 (Secondary)</SelectItem>
                  <SelectItem value="3">Tier 3 (Emergency)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm">Filter by State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partnership Network */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Partnership Network
            <Badge className="ml-auto">{filteredPartners.length} Partners</Badge>
          </CardTitle>
          <CardDescription>
            Emergency contact chain for coordinated blood supply response
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPartners.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No partners match the selected filters</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner) => (
                <div key={partner.id} className="p-4 border rounded-lg space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getTypeIcon(partner.type)}</span>
                        <h3 className="font-semibold text-sm leading-tight">{partner.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{partner.location.city}, {partner.location.state}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getTierColor(partner.tier)} size="sm">
                        Tier {partner.tier}
                      </Badge>
                      <Badge className={getStatusColor(partner.availability.status)} size="sm">
                        {partner.availability.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Response Time:</span>
                      <span className="font-medium">{partner.performance.responseTime}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Fulfillment Rate:</span>
                      <span className="font-medium">{partner.performance.fulfillmentRate}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Collaboration Score:</span>
                      <span className="font-medium">{partner.performance.collaborationScore}/100</span>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold">Capabilities:</h4>
                    <div className="flex flex-wrap gap-1">
                      {partner.capabilities.emergencyResponse && (
                        <Badge variant="outline" size="sm">24/7 Emergency</Badge>
                      )}
                      {partner.capabilities.mobileBanks && (
                        <Badge variant="outline" size="sm">Mobile Banks</Badge>
                      )}
                      {partner.capabilities.plasmapheresis && (
                        <Badge variant="outline" size="sm">Plasmapheresis</Badge>
                      )}
                      {partner.capabilities.pediatricBlood && (
                        <Badge variant="outline" size="sm">Pediatric</Badge>
                      )}
                    </div>
                  </div>

                  {/* Blood Types */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold">Available Blood Types:</h4>
                    <div className="flex flex-wrap gap-1">
                      {partner.capabilities.bloodTypes.map((type) => (
                        <Badge key={type} variant="secondary" size="sm">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>{partner.contacts.primaryContact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{partner.contacts.emergencyContact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{partner.contacts.email}</span>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Blood Bank Capacity:</span>
                      <span className="font-medium">{partner.capacity.bloodBankCapacity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Donations:</span>
                      <span className="font-medium">{partner.capacity.averageMonthlyDonations}</span>
                    </div>
                  </div>

                  {/* Special Notes */}
                  {partner.availability.specialNotes && (
                    <Alert className="p-2">
                      <AlertTriangle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        {partner.availability.specialNotes}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => initiateEmergencyContact(partner.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Emergency Contact
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Partnership Requests */}
      {partnershipRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Active Partnership Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {partnershipRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive">{request.bloodType}</Badge>
                        <Badge variant="outline">{request.urgencyLevel}</Badge>
                        <span className="text-sm font-medium">{request.unitsNeeded} units needed</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Requested by {request.requestingHospital} in {request.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor((Date.now() - request.createdAt.getTime()) / (1000 * 60))} minutes ago
                      </p>
                    </div>
                    <Badge className={request.status === 'fulfilled' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Partner Responses:</h4>
                    {request.responses.map((response) => {
                      const partner = partners.find(p => p.id === response.partnerId);
                      return (
                        <div key={response.partnerId} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>{partner?.name || 'Unknown Partner'}</span>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={response.response === 'accepted' ? 'default' : response.response === 'declined' ? 'destructive' : 'secondary'}
                              size="sm"
                            >
                              {response.response}
                            </Badge>
                            {response.response === 'accepted' && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Info */}
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          <strong>Partnership Network Status:</strong> {partners.filter(p => p.isActive).length} active partners across {uniqueStates.length} states. 
          Emergency contact protocols are automated with real-time availability tracking. 
          Tier 1 partners are contacted first, followed by automatic escalation to lower tiers if needed.
        </AlertDescription>
      </Alert>
    </div>
  );
}