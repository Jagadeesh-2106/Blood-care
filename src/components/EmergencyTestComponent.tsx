import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle } from 'lucide-react';
import { notificationService } from '../utils/notificationService';
import { toast } from 'sonner@2.0.3';

export function EmergencyTestComponent() {
  const [isTesting, setIsTesting] = useState(false);

  const testEmergencyNotification = async () => {
    setIsTesting(true);
    
    try {
      // Test emergency broadcast notification
      await notificationService.broadcastEmergencyAlert({
        id: 'test-emergency-001',
        bloodType: 'O-',
        hospitalName: 'Test Hospital',
        unitsNeeded: 5,
        location: 'Test City, Test State',
        urgencyLevel: 'critical',
        escalationLevel: 0
      });
      
      toast.success('Emergency notification test completed!');
    } catch (error) {
      toast.error('Emergency notification test failed');
      console.error('Test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const testEscalatedNotification = async () => {
    setIsTesting(true);
    
    try {
      // Test escalated emergency notification
      await notificationService.broadcastEmergencyAlert({
        id: 'test-emergency-002',
        bloodType: 'AB+',
        hospitalName: 'Test Hospital 2',
        unitsNeeded: 3,
        location: 'Test City 2, Test State',
        urgencyLevel: 'critical',
        escalationLevel: 2
      });
      
      toast.success('Escalated emergency notification test completed!');
    } catch (error) {
      toast.error('Escalated emergency notification test failed');
      console.error('Test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Emergency Notification Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={testEmergencyNotification}
            disabled={isTesting}
            variant="destructive"
          >
            Test Emergency Broadcast
          </Button>
          
          <Button
            onClick={testEscalatedNotification}
            disabled={isTesting}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Test Escalated Emergency
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Click these buttons to test emergency notification system integration.
          Make sure your browser allows notifications for the best experience.
        </p>
      </CardContent>
    </Card>
  );
}