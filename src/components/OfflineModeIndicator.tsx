import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, Zap } from 'lucide-react';

export function OfflineModeIndicator() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const checkDemoMode = () => {
      const demoSession = localStorage.getItem('demo_session');
      setIsDemoMode(demoSession !== null);
    };

    checkDemoMode();
    
    // Check every few seconds in case demo mode changes
    const interval = setInterval(checkDemoMode, 3000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isDemoMode) {
    return null;
  }

  return (
    <Badge 
      variant="secondary" 
      className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
    >
      <Zap className="w-3 h-3" />
      Demo Mode (Offline)
    </Badge>
  );
}