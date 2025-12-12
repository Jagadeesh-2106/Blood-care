import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  AlertTriangle, 
  Clock, 
  Package, 
  TrendingDown, 
  Bell, 
  RefreshCw,
  Calendar,
  Heart,
  Shield,
  Crown,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BloodUnit {
  id: string;
  bloodType: string;
  collectionDate: Date;
  expirationDate: Date;
  donorId: string;
  location: string;
  status: 'available' | 'reserved' | 'expired' | 'expiring-soon';
  volume: number; // in mL
}

interface InventoryLevel {
  bloodType: string;
  currentStock: number;
  minimumRequired: number;
  optimalLevel: number;
  criticalLevel: number;
  unitsExpiringSoon: number;
  totalVolume: number;
}

interface AlertNotification {
  id: string;
  type: 'low-stock' | 'critical-stock' | 'expiring-soon' | 'expired';
  bloodType: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: Date;
  acknowledged: boolean;
}

export function InventoryAlertsDashboard() {
  const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>([]);
  const [bloodUnits, setBloodUnits] = useState<BloodUnit[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Initialize demo data
  useEffect(() => {
    generateDemoData();
    
    // Auto-refresh every 30 seconds if enabled
    const interval = autoRefresh ? setInterval(() => {
      generateDemoData();
    }, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const generateDemoData = () => {
    setIsLoading(true);
    
    // Generate blood units with various expiration dates
    const units: BloodUnit[] = [];
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    bloodTypes.forEach(bloodType => {
      const unitCount = Math.floor(Math.random() * 50) + 10; // 10-60 units
      
      for (let i = 0; i < unitCount; i++) {
        const collectionDate = new Date();
        collectionDate.setDate(collectionDate.getDate() - Math.floor(Math.random() * 35)); // Up to 35 days old
        
        const expirationDate = new Date(collectionDate);
        expirationDate.setDate(expirationDate.getDate() + 42); // 42 days shelf life
        
        const daysUntilExpiry = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        let status: BloodUnit['status'] = 'available';
        if (daysUntilExpiry <= 0) {
          status = 'expired';
        } else if (daysUntilExpiry <= 5) {
          status = 'expiring-soon';
        } else if (Math.random() < 0.1) {
          status = 'reserved';
        }

        units.push({
          id: `unit-${bloodType}-${i}`,
          bloodType,
          collectionDate,
          expirationDate,
          donorId: `donor-${Math.floor(Math.random() * 1000)}`,
          location: `Refrigerator ${Math.floor(Math.random() * 10) + 1}`,
          status,
          volume: 450 // Standard blood bag volume
        });
      }
    });

    setBloodUnits(units);

    // Calculate inventory levels
    const levels: InventoryLevel[] = bloodTypes.map(bloodType => {
      const typeUnits = units.filter(unit => unit.bloodType === bloodType && unit.status !== 'expired');
      const availableUnits = typeUnits.filter(unit => unit.status === 'available');
      const expiringSoonUnits = typeUnits.filter(unit => unit.status === 'expiring-soon');
      
      // Different requirements based on blood type rarity
      let minimumRequired, optimalLevel, criticalLevel;
      if (bloodType === 'O-') {
        minimumRequired = 30;
        optimalLevel = 60;
        criticalLevel = 15;
      } else if (bloodType === 'O+') {
        minimumRequired = 25;
        optimalLevel = 50;
        criticalLevel = 12;
      } else if (bloodType.includes('-')) {
        minimumRequired = 15;
        optimalLevel = 30;
        criticalLevel = 8;
      } else {
        minimumRequired = 20;
        optimalLevel = 40;
        criticalLevel = 10;
      }

      return {
        bloodType,
        currentStock: availableUnits.length,
        minimumRequired,
        optimalLevel,
        criticalLevel,
        unitsExpiringSoon: expiringSoonUnits.length,
        totalVolume: availableUnits.reduce((sum, unit) => sum + unit.volume, 0)
      };
    });

    setInventoryLevels(levels);

    // Generate alerts
    generateAlerts(levels, units);
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const generateAlerts = (levels: InventoryLevel[], units: BloodUnit[]) => {
    const newAlerts: AlertNotification[] = [];
    
    levels.forEach(level => {
      // Critical stock alert
      if (level.currentStock <= level.criticalLevel) {
        newAlerts.push({
          id: `critical-${level.bloodType}-${Date.now()}`,
          type: 'critical-stock',
          bloodType: level.bloodType,
          message: `CRITICAL: Only ${level.currentStock} units of ${level.bloodType} remaining (minimum: ${level.criticalLevel})`,
          severity: 'high',
          timestamp: new Date(),
          acknowledged: false
        });
      }
      // Low stock alert
      else if (level.currentStock <= level.minimumRequired) {
        newAlerts.push({
          id: `low-${level.bloodType}-${Date.now()}`,
          type: 'low-stock',
          bloodType: level.bloodType,
          message: `Low stock: ${level.currentStock} units of ${level.bloodType} (minimum: ${level.minimumRequired})`,
          severity: 'medium',
          timestamp: new Date(),
          acknowledged: false
        });
      }

      // Expiring soon alert
      if (level.unitsExpiringSoon > 0) {
        newAlerts.push({
          id: `expiring-${level.bloodType}-${Date.now()}`,
          type: 'expiring-soon',
          bloodType: level.bloodType,
          message: `${level.unitsExpiringSoon} units of ${level.bloodType} expiring within 5 days`,
          severity: level.unitsExpiringSoon > 5 ? 'high' : 'medium',
          timestamp: new Date(),
          acknowledged: false
        });
      }
    });

    // Expired units alert
    const expiredUnits = units.filter(unit => unit.status === 'expired');
    if (expiredUnits.length > 0) {
      const expiredByType = expiredUnits.reduce((acc, unit) => {
        acc[unit.bloodType] = (acc[unit.bloodType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(expiredByType).forEach(([bloodType, count]) => {
        newAlerts.push({
          id: `expired-${bloodType}-${Date.now()}`,
          type: 'expired',
          bloodType,
          message: `${count} units of ${bloodType} have expired and need removal`,
          severity: 'high',
          timestamp: new Date(),
          acknowledged: false
        });
      });
    }

    setAlerts(newAlerts);

    // Show toast notifications for high severity alerts
    newAlerts.filter(alert => alert.severity === 'high').forEach(alert => {
      toast.error(alert.message, {
        description: `Blood Type: ${alert.bloodType}`,
        duration: 10000
      });
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getStockStatus = (level: InventoryLevel) => {
    if (level.currentStock <= level.criticalLevel) return 'critical';
    if (level.currentStock <= level.minimumRequired) return 'low';
    if (level.currentStock >= level.optimalLevel) return 'optimal';
    return 'normal';
  };

  const getStockPercentage = (level: InventoryLevel) => {
    return Math.min((level.currentStock / level.optimalLevel) * 100, 100);
  };

  const getBloodTypeIcon = (bloodType: string) => {
    if (bloodType === 'O-') return <Crown className="w-4 h-4 text-yellow-500" />;
    if (bloodType === 'AB+') return <Shield className="w-4 h-4 text-blue-500" />;
    return <Heart className="w-4 h-4 text-red-500" />;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const renderInventoryOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {inventoryLevels.map(level => {
          const status = getStockStatus(level);
          const percentage = getStockPercentage(level);
          
          return (
            <Card key={level.bloodType} className={`border-2 ${
              status === 'critical' ? 'border-red-200 bg-red-50' :
              status === 'low' ? 'border-orange-200 bg-orange-50' :
              status === 'optimal' ? 'border-green-200 bg-green-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getBloodTypeIcon(level.bloodType)}
                    <span>{level.bloodType}</span>
                  </div>
                  <Badge variant={
                    status === 'critical' ? 'destructive' :
                    status === 'low' ? 'secondary' :
                    'default'
                  }>
                    {status.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Stock Level</span>
                  <span className="font-semibold">{level.currentStock} units</span>
                </div>
                
                <Progress 
                  value={percentage} 
                  className={`h-2 ${
                    status === 'critical' ? '[&>div]:bg-red-500' :
                    status === 'low' ? '[&>div]:bg-orange-500' :
                    '[&>div]:bg-green-500'
                  }`}
                />
                
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Min required: {level.minimumRequired}</div>
                  <div>Optimal: {level.optimalLevel}</div>
                  {level.unitsExpiringSoon > 0 && (
                    <div className="text-orange-600 font-medium">
                      ⚠️ {level.unitsExpiringSoon} expiring soon
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Total Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryLevels.reduce((sum, level) => sum + level.currentStock, 0)} units
            </div>
            <div className="text-sm text-gray-600">
              {(inventoryLevels.reduce((sum, level) => sum + level.totalVolume, 0) / 1000).toFixed(1)}L total volume
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {inventoryLevels.reduce((sum, level) => sum + level.unitsExpiringSoon, 0)} units
            </div>
            <div className="text-sm text-gray-600">
              Within 5 days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(alert => !alert.acknowledged).length}
            </div>
            <div className="text-sm text-gray-600">
              Require attention
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
              <p className="text-gray-600">All inventory levels are within acceptable ranges</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        alerts.map(alert => (
          <Alert 
            key={alert.id} 
            className={`${
              alert.acknowledged ? 'opacity-60' : ''
            } ${
              alert.severity === 'high' ? 'border-red-200 bg-red-50' :
              alert.severity === 'medium' ? 'border-orange-200 bg-orange-50' :
              'border-yellow-200 bg-yellow-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {alert.severity === 'high' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                ) : alert.severity === 'medium' ? (
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                ) : (
                  <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{alert.bloodType}</Badge>
                    <Badge variant={
                      alert.severity === 'high' ? 'destructive' :
                      alert.severity === 'medium' ? 'secondary' :
                      'default'
                    }>
                      {alert.type.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(alert.timestamp)}
                    </span>
                  </div>
                  
                  <AlertDescription className={
                    alert.severity === 'high' ? 'text-red-800' :
                    alert.severity === 'medium' ? 'text-orange-800' :
                    'text-yellow-800'
                  }>
                    {alert.message}
                  </AlertDescription>
                </div>
              </div>
              
              {!alert.acknowledged && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="ml-4"
                >
                  Acknowledge
                </Button>
              )}
            </div>
          </Alert>
        ))
      )}
    </div>
  );

  const renderExpirationTracking = () => {
    const expiringSoon = bloodUnits.filter(unit => unit.status === 'expiring-soon');
    const expired = bloodUnits.filter(unit => unit.status === 'expired');
    
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Clock className="w-5 h-5" />
                Expiring Soon (≤5 days)
              </CardTitle>
              <CardDescription>
                Units requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expiringSoon.length === 0 ? (
                <div className="text-center py-4 text-gray-600">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  No units expiring soon
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {expiringSoon.map(unit => {
                    const daysLeft = Math.ceil((unit.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={unit.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getBloodTypeIcon(unit.bloodType)}
                          <div>
                            <div className="font-medium">{unit.bloodType}</div>
                            <div className="text-sm text-gray-600">{unit.location}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            {daysLeft}d left
                          </Badge>
                          <div className="text-xs text-gray-600 mt-1">
                            {unit.expirationDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <XCircle className="w-5 h-5" />
                Expired Units
              </CardTitle>
              <CardDescription>
                Units requiring immediate removal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expired.length === 0 ? (
                <div className="text-center py-4 text-gray-600">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  No expired units
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {expired.map(unit => {
                    const daysExpired = Math.floor((new Date().getTime() - unit.expirationDate.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={unit.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                          {getBloodTypeIcon(unit.bloodType)}
                          <div>
                            <div className="font-medium">{unit.bloodType}</div>
                            <div className="text-sm text-gray-600">{unit.location}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {daysExpired}d expired
                          </Badge>
                          <div className="text-xs text-gray-600 mt-1">
                            {unit.expirationDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expiration Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              7-Day Expiration Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                
                const unitsExpiringOnDate = bloodUnits.filter(unit => {
                  const unitExpiry = new Date(unit.expirationDate);
                  return unitExpiry.toDateString() === date.toDateString();
                });

                return (
                  <div key={i} className={`p-3 rounded-lg border ${
                    unitsExpiringOnDate.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'
                  }`}>
                    <div className="text-xs font-medium text-center mb-2">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-xs text-center mb-2">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    {unitsExpiringOnDate.length > 0 && (
                      <div className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          {unitsExpiringOnDate.length}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Inventory Alerts Dashboard
              </CardTitle>
              <CardDescription>
                Real-time monitoring of blood inventory levels and expiration tracking
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
              >
                <Zap className={`w-4 h-4 mr-2 ${autoRefresh ? 'text-green-600' : ''}`} />
                {autoRefresh ? 'Auto' : 'Manual'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={generateDemoData}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Inventory Overview</TabsTrigger>
          <TabsTrigger value="alerts">
            Active Alerts 
            {alerts.filter(alert => !alert.acknowledged).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.filter(alert => !alert.acknowledged).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expiration">Expiration Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderInventoryOverview()}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {renderAlerts()}
        </TabsContent>

        <TabsContent value="expiration" className="space-y-6">
          {renderExpirationTracking()}
        </TabsContent>
      </Tabs>
    </div>
  );
}