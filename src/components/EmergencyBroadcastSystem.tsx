import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Users, Phone, Mail, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { notificationService } from '../utils/notificationService';

interface EmergencyRequest {
  id: string;
  bloodType: string;
  unitsNeeded: number;
  location: string;
  hospitalName: string;
  urgencyLevel: 'critical' | 'urgent' | 'high';
  createdAt: Date;
  escalationLevel: 0 | 1 | 2 | 3;
  status: 'active' | 'partially_fulfilled' | 'fulfilled' | 'escalated';
  contactAttempts: number;
  responseCount: number;
  estimatedTimeLeft?: string;
}

interface HospitalPartner {
  id: string;
  name: string;
  location: string;
  primaryContact: string;
  emergencyContact: string;
  email: string;
  tier: 1 | 2 | 3; // 1 = Primary, 2 = Secondary, 3 = Emergency backup
  availableBloodTypes: string[];
  lastResponseTime: string;
}

export function EmergencyBroadcastSystem() {
  const [activeRequests, setActiveRequests] = useState<EmergencyRequest[]>([]);
  const [hospitalPartners, setHospitalPartners] = useState<HospitalPartner[]>([]);
  const [newRequest, setNewRequest] = useState({
    bloodType: '',
    unitsNeeded: '',
    location: '',
    hospitalName: '',
    urgencyLevel: 'critical' as const,
    additionalNotes: ''
  });
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [escalationTimers, setEscalationTimers] = useState<Record<string, NodeJS.Timeout>>({});

  // Initialize demo data
  useEffect(() => {
    const initializeDemoData = () => {
      const demoRequests: EmergencyRequest[] = [
        {
          id: 'emergency-001',
          bloodType: 'O-',
          unitsNeeded: 8,
          location: 'Mumbai, Maharashtra',
          hospitalName: 'Lilavati Hospital',
          urgencyLevel: 'critical',
          createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          escalationLevel: 0,
          status: 'active',
          contactAttempts: 12,
          responseCount: 3,
          estimatedTimeLeft: '15 min'
        },
        {
          id: 'emergency-002',
          bloodType: 'AB+',
          unitsNeeded: 4,
          location: 'Delhi, NCR',
          hospitalName: 'AIIMS Delhi',
          urgencyLevel: 'urgent',
          createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          escalationLevel: 1,
          status: 'escalated',
          contactAttempts: 28,
          responseCount: 7
        }
      ];

      const demoPartners: HospitalPartner[] = [
        {
          id: 'partner-001',
          name: 'RedCross Blood Bank Mumbai',
          location: 'Mumbai, Maharashtra',
          primaryContact: '+91 98765 43210',
          emergencyContact: '+91 98765 43211',
          email: 'emergency@redcrossmumbai.org',
          tier: 1,
          availableBloodTypes: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
          lastResponseTime: '2 min'
        },
        {
          id: 'partner-002',
          name: 'Tata Memorial Blood Bank',
          location: 'Mumbai, Maharashtra',
          primaryContact: '+91 98765 43212',
          emergencyContact: '+91 98765 43213',
          email: 'blood@tmc.gov.in',
          tier: 1,
          availableBloodTypes: ['O+', 'O-', 'A+', 'B+', 'AB+'],
          lastResponseTime: '5 min'
        },
        {
          id: 'partner-003',
          name: 'Apollo Hospital Blood Bank',
          location: 'Delhi, NCR',
          primaryContact: '+91 98765 43214',
          emergencyContact: '+91 98765 43215',
          email: 'emergency@apollodelhi.com',
          tier: 2,
          availableBloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
          lastResponseTime: '8 min'
        }
      ];

      setActiveRequests(demoRequests);
      setHospitalPartners(demoPartners);
    };

    initializeDemoData();
  }, []);

  // Auto-escalation system - check every minute
  useEffect(() => {
    const checkEscalation = () => {
      setActiveRequests(prev => prev.map(request => {
        const minutesElapsed = Math.floor((Date.now() - request.createdAt.getTime()) / (1000 * 60));
        
        if (request.status === 'active' && minutesElapsed >= 30 && request.escalationLevel === 0) {
          toast.error(`Emergency request ${request.id} auto-escalated after 30 minutes`);
          
          // Send auto-escalation notification
          notificationService.broadcastEmergencyAlert({
            id: request.id,
            bloodType: request.bloodType,
            hospitalName: request.hospitalName,
            unitsNeeded: request.unitsNeeded,
            location: request.location,
            urgencyLevel: request.urgencyLevel,
            escalationLevel: 1
          });
          
          return {
            ...request,
            escalationLevel: 1,
            status: 'escalated' as const
          };
        }
        
        if (request.status === 'escalated' && minutesElapsed >= 60 && request.escalationLevel === 1) {
          toast.error(`Emergency request ${request.id} escalated to Level 2 after 60 minutes`);
          
          // Send level 2 escalation notification
          notificationService.broadcastEmergencyAlert({
            id: request.id,
            bloodType: request.bloodType,
            hospitalName: request.hospitalName,
            unitsNeeded: request.unitsNeeded,
            location: request.location,
            urgencyLevel: request.urgencyLevel,
            escalationLevel: 2
          });
          
          return {
            ...request,
            escalationLevel: 2
          };
        }
        
        if (request.escalationLevel === 2 && minutesElapsed >= 90 && request.escalationLevel === 2) {
          toast.error(`Emergency request ${request.id} escalated to Maximum Level after 90 minutes`);
          
          // Send maximum escalation notification
          notificationService.broadcastEmergencyAlert({
            id: request.id,
            bloodType: request.bloodType,
            hospitalName: request.hospitalName,
            unitsNeeded: request.unitsNeeded,
            location: request.location,
            urgencyLevel: request.urgencyLevel,
            escalationLevel: 3
          });
          
          return {
            ...request,
            escalationLevel: 3
          };
        }
        
        return request;
      }));
    };

    const interval = setInterval(checkEscalation, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const createEmergencyRequest = async () => {
    if (!newRequest.bloodType || !newRequest.unitsNeeded || !newRequest.hospitalName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreatingRequest(true);

    try {
      const request: EmergencyRequest = {
        id: `emergency-${Date.now()}`,
        bloodType: newRequest.bloodType,
        unitsNeeded: parseInt(newRequest.unitsNeeded),
        location: newRequest.location,
        hospitalName: newRequest.hospitalName,
        urgencyLevel: newRequest.urgencyLevel,
        createdAt: new Date(),
        escalationLevel: 0,
        status: 'active',
        contactAttempts: 0,
        responseCount: 0
      };

      setActiveRequests(prev => [request, ...prev]);
      
      // Trigger emergency broadcast
      await broadcastEmergencyRequest(request);
      
      // Reset form
      setNewRequest({
        bloodType: '',
        unitsNeeded: '',
        location: '',
        hospitalName: '',
        urgencyLevel: 'critical',
        additionalNotes: ''
      });

      toast.success('Emergency broadcast sent to all available donors and partners');
    } catch (error) {
      toast.error('Failed to create emergency request');
    } finally {
      setIsCreatingRequest(false);
    }
  };

  const broadcastEmergencyRequest = async (request: EmergencyRequest) => {
    // Simulate emergency broadcast to all stakeholders
    const relevantPartners = hospitalPartners.filter(partner => 
      partner.availableBloodTypes.includes(request.bloodType) &&
      partner.location.includes(request.location.split(',')[0])
    );

    // Broadcast to hospital partners first (immediate)
    relevantPartners.forEach(partner => {
      console.log(`🚨 Emergency broadcast to ${partner.name}: ${request.bloodType} needed`);
    });

    // Broadcast to all donors in the area (immediate)
    console.log(`🚨 Broadcasting to all ${request.bloodType} donors in ${request.location}`);
    
    // Send emergency broadcast notification
    await notificationService.broadcastEmergencyAlert({
      id: request.id,
      bloodType: request.bloodType,
      hospitalName: request.hospitalName,
      unitsNeeded: request.unitsNeeded,
      location: request.location,
      urgencyLevel: request.urgencyLevel,
      escalationLevel: request.escalationLevel
    });
    
    // Update contact attempts
    setActiveRequests(prev => 
      prev.map(req => 
        req.id === request.id 
          ? { ...req, contactAttempts: relevantPartners.length + 150 } // Simulated donor contacts
          : req
      )
    );
  };

  const escalateRequest = async (requestId: string) => {
    const requestToEscalate = activeRequests.find(r => r.id === requestId);
    if (!requestToEscalate) return;

    setActiveRequests(prev =>
      prev.map(request => {
        if (request.id === requestId) {
          const newLevel = Math.min(request.escalationLevel + 1, 3) as 0 | 1 | 2 | 3;
          
          // Trigger additional contacts based on escalation level
          if (newLevel === 1) {
            toast.warning('Escalating to secondary hospital network');
          } else if (newLevel === 2) {
            toast.error('Escalating to emergency backup network');
          } else if (newLevel === 3) {
            toast.error('Maximum escalation: Contacting government emergency services');
          }

          // Send escalation notification
          notificationService.broadcastEmergencyAlert({
            id: request.id,
            bloodType: request.bloodType,
            hospitalName: request.hospitalName,
            unitsNeeded: request.unitsNeeded,
            location: request.location,
            urgencyLevel: request.urgencyLevel,
            escalationLevel: newLevel
          });

          return {
            ...request,
            escalationLevel: newLevel,
            status: 'escalated' as const,
            contactAttempts: request.contactAttempts + (newLevel * 50)
          };
        }
        return request;
      })
    );
  };

  const markAsFulfilled = (requestId: string) => {
    setActiveRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: 'fulfilled' as const }
          : request
      )
    );
    toast.success('Emergency request marked as fulfilled');
  };

  const getEscalationBadgeColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-yellow-100 text-yellow-800';
      case 1: return 'bg-orange-100 text-orange-800';
      case 2: return 'bg-red-100 text-red-800';
      case 3: return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600';
      case 'urgent': return 'text-orange-600';
      case 'high': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h1>Emergency Broadcast System</h1>
        </div>
        <Badge variant="destructive" className="animate-pulse">
          {activeRequests.filter(r => r.status === 'active').length} Active Emergency
        </Badge>
      </div>

      {/* Create New Emergency Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Create Emergency Broadcast
          </CardTitle>
          <CardDescription>
            Send immediate alerts to all donors and hospital partners for critical blood shortages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Blood Type Required *</label>
              <Select value={newRequest.bloodType} onValueChange={(value) => setNewRequest(prev => ({ ...prev, bloodType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
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
            </div>

            <div>
              <label className="block mb-2">Units Needed *</label>
              <Input
                type="number"
                placeholder="Number of units"
                value={newRequest.unitsNeeded}
                onChange={(e) => setNewRequest(prev => ({ ...prev, unitsNeeded: e.target.value }))}
              />
            </div>

            <div>
              <label className="block mb-2">Hospital Name *</label>
              <Input
                placeholder="Hospital or medical facility name"
                value={newRequest.hospitalName}
                onChange={(e) => setNewRequest(prev => ({ ...prev, hospitalName: e.target.value }))}
              />
            </div>

            <div>
              <label className="block mb-2">Location</label>
              <Input
                placeholder="City, State"
                value={newRequest.location}
                onChange={(e) => setNewRequest(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div>
              <label className="block mb-2">Urgency Level</label>
              <Select value={newRequest.urgencyLevel} onValueChange={(value: any) => setNewRequest(prev => ({ ...prev, urgencyLevel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical (Life-threatening)</SelectItem>
                  <SelectItem value="urgent">Urgent (24 hours)</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block mb-2">Additional Notes</label>
            <Textarea
              placeholder="Any additional information about the emergency..."
              value={newRequest.additionalNotes}
              onChange={(e) => setNewRequest(prev => ({ ...prev, additionalNotes: e.target.value }))}
              rows={3}
            />
          </div>

          <Button 
            onClick={createEmergencyRequest} 
            disabled={isCreatingRequest}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isCreatingRequest ? 'Broadcasting...' : 'Send Emergency Broadcast'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Emergency Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Active Emergency Requests
            <Badge className="ml-auto">{activeRequests.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRequests.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No active emergency requests</p>
          ) : (
            <div className="space-y-4">
              {activeRequests.map((request) => (
                <div key={request.id} className={`p-4 border rounded-lg ${request.status === 'fulfilled' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          {request.bloodType}
                        </Badge>
                        <Badge className={getEscalationBadgeColor(request.escalationLevel)}>
                          Escalation Level {request.escalationLevel}
                        </Badge>
                        <span className={`capitalize ${getUrgencyColor(request.urgencyLevel)}`}>
                          {request.urgencyLevel}
                        </span>
                        {request.estimatedTimeLeft && (
                          <Badge variant="destructive" className="animate-pulse">
                            <Clock className="w-3 h-3 mr-1" />
                            {request.estimatedTimeLeft}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold">{request.hospitalName}</h3>
                      <p className="text-sm text-muted-foreground">{request.location}</p>
                      <p className="text-sm">
                        <strong>{request.unitsNeeded} units needed</strong> • 
                        Created {Math.floor((Date.now() - request.createdAt.getTime()) / (1000 * 60))} minutes ago
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {request.contactAttempts} contacts
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {request.responseCount} responses
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {request.status !== 'fulfilled' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => escalateRequest(request.id)}
                            disabled={request.escalationLevel >= 3}
                          >
                            Escalate
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => markAsFulfilled(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Fulfilled
                          </Button>
                        </>
                      )}
                      {request.status === 'fulfilled' && (
                        <Badge className="bg-green-100 text-green-800">
                          ✓ Fulfilled
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hospital Partnership Network */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Hospital Partnership Network
          </CardTitle>
          <CardDescription>
            Emergency contact chain for coordinated blood supply response
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospitalPartners.map((partner) => (
              <div key={partner.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{partner.name}</h4>
                  <Badge 
                    variant={partner.tier === 1 ? 'destructive' : partner.tier === 2 ? 'default' : 'secondary'}
                  >
                    Tier {partner.tier}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{partner.location}</p>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{partner.primaryContact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{partner.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Responds in {partner.lastResponseTime}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Available Blood Types:</p>
                  <div className="flex flex-wrap gap-1">
                    {partner.availableBloodTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Protocol Info */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Emergency Escalation Protocol:</strong> Level 0 (Immediate broadcast) → Level 1 (30 min: Secondary network) → 
          Level 2 (60 min: Emergency backup) → Level 3 (90 min: Government services). 
          All escalations are automatic but can be manually triggered for faster response.
        </AlertDescription>
      </Alert>
    </div>
  );
}