import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Users, Phone, Mail, ArrowUp, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { notificationService } from '../utils/notificationService';

interface EscalationRule {
  id: string;
  name: string;
  description: string;
  triggerAfterMinutes: number;
  escalationLevel: number;
  actions: string[];
  contactGroups: string[];
  isActive: boolean;
}

interface EscalationContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  group: string;
  priority: number;
  lastContactTime?: Date;
  responseRate: number;
}

interface ActiveEscalation {
  id: string;
  requestId: string;
  bloodType: string;
  hospital: string;
  startTime: Date;
  currentLevel: number;
  nextEscalationTime: Date;
  contactsReached: number;
  responsesReceived: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export function EmergencyEscalationManager() {
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>([]);
  const [escalationContacts, setEscalationContacts] = useState<EscalationContact[]>([]);
  const [activeEscalations, setActiveEscalations] = useState<ActiveEscalation[]>([]);

  // Initialize demo data
  useEffect(() => {
    const initializeData = () => {
      const demoRules: EscalationRule[] = [
        {
          id: 'rule-001',
          name: 'Level 1 - Local Network',
          description: 'Contact all donors and local blood banks in the immediate area',
          triggerAfterMinutes: 0,
          escalationLevel: 1,
          actions: ['SMS to all registered donors', 'Call local blood banks', 'Mobile app push notifications'],
          contactGroups: ['local_donors', 'local_blood_banks'],
          isActive: true
        },
        {
          id: 'rule-002',
          name: 'Level 2 - Regional Network',
          description: 'Expand to regional hospitals and blood banks within 50km radius',
          triggerAfterMinutes: 30,
          escalationLevel: 2,
          actions: ['Regional hospital network alert', 'Blood bank partnership network', 'Social media emergency post'],
          contactGroups: ['regional_hospitals', 'partner_blood_banks', 'emergency_volunteers'],
          isActive: true
        },
        {
          id: 'rule-003',
          name: 'Level 3 - State Network',
          description: 'Contact state-level blood transfusion services and emergency services',
          triggerAfterMinutes: 60,
          escalationLevel: 3,
          actions: ['State Blood Transfusion Council', 'Emergency services coordination', 'Media alert'],
          contactGroups: ['state_officials', 'emergency_services', 'media_contacts'],
          isActive: true
        },
        {
          id: 'rule-004',
          name: 'Level 4 - National Emergency',
          description: 'Activate national emergency protocols and government intervention',
          triggerAfterMinutes: 90,
          escalationLevel: 4,
          actions: ['National Blood Transfusion Council', 'Health Ministry notification', 'Inter-state coordination'],
          contactGroups: ['national_officials', 'health_ministry', 'interstate_network'],
          isActive: true
        }
      ];

      const demoContacts: EscalationContact[] = [
        {
          id: 'contact-001',
          name: 'Dr. Rajesh Kumar',
          role: 'Emergency Blood Bank Coordinator',
          phone: '+91 98765 43210',
          email: 'rajesh.kumar@redcross.org',
          group: 'local_blood_banks',
          priority: 1,
          responseRate: 95
        },
        {
          id: 'contact-002',
          name: 'Mumbai Blood Bank Network',
          role: 'Regional Coordinator',
          phone: '+91 98765 43211',
          email: 'emergency@mumbaibloodbank.org',
          group: 'regional_hospitals',
          priority: 1,
          responseRate: 88
        },
        {
          id: 'contact-003',
          name: 'Maharashtra State Blood Services',
          role: 'State Coordinator',
          phone: '+91 98765 43212',
          email: 'emergency@maharashtrablood.gov.in',
          group: 'state_officials',
          priority: 1,
          responseRate: 92
        },
        {
          id: 'contact-004',
          name: 'National Blood Emergency Hotline',
          role: 'National Emergency Response',
          phone: '1075',
          email: 'emergency@nationalblood.gov.in',
          group: 'national_officials',
          priority: 1,
          responseRate: 98
        }
      ];

      const demoActiveEscalations: ActiveEscalation[] = [
        {
          id: 'escalation-001',
          requestId: 'emergency-001',
          bloodType: 'O-',
          hospital: 'Lilavati Hospital',
          startTime: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
          currentLevel: 1,
          nextEscalationTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
          contactsReached: 156,
          responsesReceived: 23,
          status: 'in_progress'
        },
        {
          id: 'escalation-002',
          requestId: 'emergency-002',
          bloodType: 'AB+',
          hospital: 'AIIMS Delhi',
          startTime: new Date(Date.now() - 65 * 60 * 1000), // 65 minutes ago
          currentLevel: 3,
          nextEscalationTime: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes from now
          contactsReached: 342,
          responsesReceived: 78,
          status: 'in_progress'
        }
      ];

      setEscalationRules(demoRules);
      setEscalationContacts(demoContacts);
      setActiveEscalations(demoActiveEscalations);
    };

    initializeData();
  }, []);

  // Auto-escalation timer
  useEffect(() => {
    const checkEscalations = () => {
      setActiveEscalations(prev => prev.map(escalation => {
        if (escalation.status === 'in_progress' && new Date() >= escalation.nextEscalationTime) {
          const nextLevel = escalation.currentLevel + 1;
          const nextRule = escalationRules.find(rule => rule.escalationLevel === nextLevel);
          
          if (nextRule) {
            toast.error(`Escalating ${escalation.bloodType} request to Level ${nextLevel}`);
            
            // Send escalation notification
            notificationService.broadcastEmergencyAlert({
              id: escalation.requestId,
              bloodType: escalation.bloodType,
              hospitalName: escalation.hospital,
              unitsNeeded: 1, // Default value for escalation manager
              location: 'Emergency Location',
              urgencyLevel: 'critical',
              escalationLevel: nextLevel
            });
            
            return {
              ...escalation,
              currentLevel: nextLevel,
              nextEscalationTime: new Date(Date.now() + 30 * 60 * 1000), // Next escalation in 30 minutes
              contactsReached: escalation.contactsReached + 50, // Simulated additional contacts
            };
          }
        }
        return escalation;
      }));
    };

    const interval = setInterval(checkEscalations, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [escalationRules]);

  const manualEscalate = (escalationId: string) => {
    setActiveEscalations(prev => prev.map(escalation => {
      if (escalation.id === escalationId && escalation.currentLevel < 4) {
        const nextLevel = escalation.currentLevel + 1;
        toast.warning(`Manually escalating to Level ${nextLevel}`);
        
        // Send manual escalation notification
        notificationService.broadcastEmergencyAlert({
          id: escalation.requestId,
          bloodType: escalation.bloodType,
          hospitalName: escalation.hospital,
          unitsNeeded: 1,
          location: 'Emergency Location',
          urgencyLevel: 'critical',
          escalationLevel: nextLevel
        });
        
        return {
          ...escalation,
          currentLevel: nextLevel,
          nextEscalationTime: new Date(Date.now() + 30 * 60 * 1000),
          contactsReached: escalation.contactsReached + 50,
        };
      }
      return escalation;
    }));
  };

  const pauseEscalation = (escalationId: string) => {
    setActiveEscalations(prev => prev.map(escalation => {
      if (escalation.id === escalationId) {
        toast.info('Escalation paused');
        return {
          ...escalation,
          status: 'pending' as const
        };
      }
      return escalation;
    }));
  };

  const resumeEscalation = (escalationId: string) => {
    setActiveEscalations(prev => prev.map(escalation => {
      if (escalation.id === escalationId) {
        toast.info('Escalation resumed');
        return {
          ...escalation,
          status: 'in_progress' as const
        };
      }
      return escalation;
    }));
  };

  const completeEscalation = (escalationId: string) => {
    setActiveEscalations(prev => prev.map(escalation => {
      if (escalation.id === escalationId) {
        toast.success('Emergency request fulfilled - escalation completed');
        return {
          ...escalation,
          status: 'completed' as const
        };
      }
      return escalation;
    }));
  };

  const getTimeUntilNext = (nextTime: Date) => {
    const minutes = Math.max(0, Math.floor((nextTime.getTime() - Date.now()) / (1000 * 60)));
    return minutes > 0 ? `${minutes} min` : 'Now';
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-red-100 text-red-800';
      case 4: return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (escalation: ActiveEscalation) => {
    const totalMinutesForLevel = 30; // Each level lasts 30 minutes
    const minutesElapsed = Math.floor((Date.now() - escalation.startTime.getTime()) / (1000 * 60));
    const minutesInCurrentLevel = minutesElapsed % totalMinutesForLevel;
    return Math.min((minutesInCurrentLevel / totalMinutesForLevel) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-orange-600" />
          <h1>Emergency Escalation Manager</h1>
        </div>
        <Badge variant="outline">
          {activeEscalations.filter(e => e.status === 'in_progress').length} Active Escalations
        </Badge>
      </div>

      {/* Active Escalations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUp className="w-5 h-5" />
            Active Escalations
          </CardTitle>
          <CardDescription>
            Real-time monitoring of emergency request escalations with automated timers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeEscalations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No active escalations</p>
          ) : (
            <div className="space-y-4">
              {activeEscalations.map((escalation) => (
                <div key={escalation.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          {escalation.bloodType}
                        </Badge>
                        <Badge className={getLevelColor(escalation.currentLevel)}>
                          Level {escalation.currentLevel}
                        </Badge>
                        <Badge variant={escalation.status === 'completed' ? 'default' : 'destructive'}>
                          {escalation.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold">{escalation.hospital}</h3>
                      <p className="text-sm text-muted-foreground">
                        Started {Math.floor((Date.now() - escalation.startTime.getTime()) / (1000 * 60))} minutes ago
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {escalation.contactsReached} contacted
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {escalation.responsesReceived} responses
                        </span>
                        {escalation.status === 'in_progress' && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Next in {getTimeUntilNext(escalation.nextEscalationTime)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {escalation.status === 'in_progress' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => manualEscalate(escalation.id)}
                            disabled={escalation.currentLevel >= 4}
                          >
                            <ArrowUp className="w-4 h-4 mr-1" />
                            Escalate Now
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => pauseEscalation(escalation.id)}
                          >
                            Pause
                          </Button>
                        </>
                      )}
                      
                      {escalation.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => resumeEscalation(escalation.id)}
                        >
                          Resume
                        </Button>
                      )}
                      
                      {escalation.status !== 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => completeEscalation(escalation.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {escalation.status === 'in_progress' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress to next level</span>
                        <span>{Math.round(getProgressPercentage(escalation))}%</span>
                      </div>
                      <Progress value={getProgressPercentage(escalation)} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escalation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Escalation Rules & Timeline
          </CardTitle>
          <CardDescription>
            Automated escalation protocol with defined triggers and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {escalationRules.map((rule, index) => (
              <div key={rule.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getLevelColor(rule.escalationLevel)}>
                        {rule.name}
                      </Badge>
                      <Badge variant="outline">
                        Triggers after {rule.triggerAfterMinutes} minutes
                      </Badge>
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                    
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Actions:</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {rule.actions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Contact Groups:</h4>
                        <div className="flex flex-wrap gap-1">
                          {rule.contactGroups.map((group) => (
                            <Badge key={group} variant="outline" className="text-xs">
                              {group.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Emergency Contact Directory
          </CardTitle>
          <CardDescription>
            Key contacts for each escalation level with response rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {escalationContacts.map((contact) => (
              <div key={contact.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{contact.name}</h4>
                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {contact.responseRate}% response rate
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {contact.group.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Escalation System Status:</strong> All automated timers are active. 
          Emergency requests will automatically escalate every 30 minutes unless manually controlled. 
          Response times are monitored in real-time for system optimization.
        </AlertDescription>
      </Alert>
    </div>
  );
}