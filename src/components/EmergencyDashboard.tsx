import { useState } from 'react';
import { AlertTriangle, Users, Clock, TestTube } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EmergencyBroadcastSystem } from './EmergencyBroadcastSystem';
import { EmergencyEscalationManager } from './EmergencyEscalationManager';
import { HospitalPartnershipChain } from './HospitalPartnershipChain';
import { EmergencyTestComponent } from './EmergencyTestComponent';

export function EmergencyDashboard() {
  const [activeTab, setActiveTab] = useState('broadcast');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h1>Emergency Management Center</h1>
        </div>
      </div>

      {/* Emergency Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="broadcast" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Emergency Broadcast</span>
          </TabsTrigger>
          <TabsTrigger value="escalation" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Escalation Manager</span>
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Hospital Network</span>
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            <span className="hidden sm:inline">Test System</span>
          </TabsTrigger>
        </TabsList>

        {/* Emergency Broadcast System */}
        <TabsContent value="broadcast" className="space-y-6">
          <EmergencyBroadcastSystem />
        </TabsContent>

        {/* Emergency Escalation Manager */}
        <TabsContent value="escalation" className="space-y-6">
          <EmergencyEscalationManager />
        </TabsContent>

        {/* Hospital Partnership Chain */}
        <TabsContent value="partnerships" className="space-y-6">
          <HospitalPartnershipChain />
        </TabsContent>

        {/* Test System */}
        <TabsContent value="test" className="space-y-6">
          <EmergencyTestComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}