import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar,
  Package,
  Heart,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Bell,
  Crown,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BloodUnit {
  id: string;
  bloodType: string;
  donorId: string;
  donorName: string;
  collectionDate: Date;
  expirationDate: Date;
  location: string;
  status: 'fresh' | 'good' | 'expiring-soon' | 'critical' | 'expired';
  volume: number;
  testResults: 'pending' | 'passed' | 'failed';
  batchNumber: string;
  temperature: number;
  lastTempCheck: Date;
}

interface ExpirationStats {
  totalUnits: number;
  freshUnits: number;
  goodUnits: number;
  expiringSoon: number;
  critical: number;
  expired: number;
  totalValue: number;
  potentialWaste: number;
}

export function BloodUnitExpirationTracker() {
  const [bloodUnits, setBloodUnits] = useState<BloodUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<BloodUnit[]>([]);
  const [stats, setStats] = useState<ExpirationStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBloodType, setFilterBloodType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'expiration' | 'collection' | 'bloodType'>('expiration');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    generateDemoData();
    
    // Auto-refresh every minute
    const interval = autoRefresh ? setInterval(generateDemoData, 60000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    applyFilters();
  }, [bloodUnits, searchTerm, filterStatus, filterBloodType, sortBy]);

  const generateDemoData = () => {
    setIsLoading(true);
    
    const units: BloodUnit[] = [];
    const locations = ['Refrigerator A1', 'Refrigerator A2', 'Refrigerator B1', 'Refrigerator B2', 'Mobile Unit 1', 'Mobile Unit 2'];
    
    // Generate units with realistic distribution of expiration dates
    bloodTypes.forEach(bloodType => {
      const unitCount = Math.floor(Math.random() * 30) + 15; // 15-45 units per type
      
      for (let i = 0; i < unitCount; i++) {
        const collectionDate = new Date();
        // Random collection date within last 40 days
        collectionDate.setDate(collectionDate.getDate() - Math.floor(Math.random() * 40));
        
        const expirationDate = new Date(collectionDate);
        expirationDate.setDate(expirationDate.getDate() + 42); // 42-day shelf life
        
        const daysUntilExpiry = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        let status: BloodUnit['status'];
        if (daysUntilExpiry <= 0) {
          status = 'expired';
        } else if (daysUntilExpiry <= 2) {
          status = 'critical';
        } else if (daysUntilExpiry <= 5) {
          status = 'expiring-soon';
        } else if (daysUntilExpiry <= 14) {
          status = 'good';
        } else {
          status = 'fresh';
        }

        units.push({
          id: `BU${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          bloodType,
          donorId: `D${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          donorName: `Donor ${Math.floor(Math.random() * 1000)}`,
          collectionDate,
          expirationDate,
          location: locations[Math.floor(Math.random() * locations.length)],
          status,
          volume: 450, // Standard blood bag volume
          testResults: Math.random() > 0.05 ? 'passed' : Math.random() > 0.5 ? 'pending' : 'failed',
          batchNumber: `BT${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          temperature: Math.round((Math.random() * 2 + 2) * 10) / 10, // 2-4°C
          lastTempCheck: new Date(Date.now() - Math.floor(Math.random() * 3600000)) // Within last hour
        });
      }
    });

    setBloodUnits(units);
    calculateStats(units);
    setIsLoading(false);
  };

  const calculateStats = (units: BloodUnit[]) => {
    const validUnits = units.filter(unit => unit.testResults === 'passed');
    
    const stats: ExpirationStats = {
      totalUnits: validUnits.length,
      freshUnits: validUnits.filter(unit => unit.status === 'fresh').length,
      goodUnits: validUnits.filter(unit => unit.status === 'good').length,
      expiringSoon: validUnits.filter(unit => unit.status === 'expiring-soon').length,
      critical: validUnits.filter(unit => unit.status === 'critical').length,
      expired: validUnits.filter(unit => unit.status === 'expired').length,
      totalValue: validUnits.length * 200, // Assuming $200 per unit
      potentialWaste: validUnits.filter(unit => ['critical', 'expired'].includes(unit.status)).length * 200
    };

    setStats(stats);

    // Send notifications for critical units
    const criticalUnits = validUnits.filter(unit => unit.status === 'critical');
    const expiredUnits = validUnits.filter(unit => unit.status === 'expired');
    
    if (criticalUnits.length > 0) {
      toast.warning(`${criticalUnits.length} blood units are critically close to expiration (≤2 days)`, {
        description: 'Immediate action required',
        duration: 8000
      });
    }
    
    if (expiredUnits.length > 0) {
      toast.error(`${expiredUnits.length} blood units have expired and need removal`, {
        description: 'Remove from inventory immediately',
        duration: 10000
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...bloodUnits];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(unit =>
        unit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.donorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(unit => unit.status === filterStatus);
    }

    // Blood type filter
    if (filterBloodType !== 'all') {
      filtered = filtered.filter(unit => unit.bloodType === filterBloodType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'expiration':
          return a.expirationDate.getTime() - b.expirationDate.getTime();
        case 'collection':
          return b.collectionDate.getTime() - a.collectionDate.getTime();
        case 'bloodType':
          return a.bloodType.localeCompare(b.bloodType);
        default:
          return 0;
      }
    });

    setFilteredUnits(filtered);
  };

  const getStatusColor = (status: BloodUnit['status']) => {
    switch (status) {
      case 'fresh': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'expiring-soon': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: BloodUnit['status']) => {
    const variants = {
      fresh: 'default',
      good: 'secondary',
      'expiring-soon': 'secondary',
      critical: 'destructive',
      expired: 'secondary'
    } as const;

    return <Badge variant={variants[status]}>{status.replace('-', ' ').toUpperCase()}</Badge>;
  };

  const getDaysUntilExpiry = (expirationDate: Date) => {
    return Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const getShelfLifePercentage = (collectionDate: Date, expirationDate: Date) => {
    const totalShelfLife = expirationDate.getTime() - collectionDate.getTime();
    const timeElapsed = new Date().getTime() - collectionDate.getTime();
    return Math.max(0, Math.min(100, (timeElapsed / totalShelfLife) * 100));
  };

  const getBloodTypeIcon = (bloodType: string) => {
    if (bloodType === 'O-') return <Crown className="w-4 h-4 text-yellow-500" />;
    if (bloodType === 'AB+') return <Shield className="w-4 h-4 text-blue-500" />;
    return <Heart className="w-4 h-4 text-red-500" />;
  };

  const exportData = () => {
    const csvContent = [
      ['Unit ID', 'Blood Type', 'Donor ID', 'Collection Date', 'Expiration Date', 'Days Until Expiry', 'Status', 'Location', 'Test Results'].join(','),
      ...filteredUnits.map(unit => [
        unit.id,
        unit.bloodType,
        unit.donorId,
        unit.collectionDate.toLocaleDateString(),
        unit.expirationDate.toLocaleDateString(),
        getDaysUntilExpiry(unit.expirationDate),
        unit.status,
        unit.location,
        unit.testResults
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blood-units-expiration-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-600" />
                Blood Unit Expiration Tracker
              </CardTitle>
              <CardDescription>
                Monitor blood unit freshness with 5-day warning system and automated alerts
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
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

              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Total Units</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalUnits}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Fresh</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.freshUnits}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Good</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.goodUnits}</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Expiring Soon</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Critical</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Expired</span>
              </div>
              <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search Units</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="ID, Donor, Batch, Location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="fresh">Fresh</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="blood-type-filter">Blood Type</Label>
              <Select value={filterBloodType} onValueChange={setFilterBloodType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {bloodTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expiration">Expiration Date</SelectItem>
                  <SelectItem value="collection">Collection Date</SelectItem>
                  <SelectItem value="bloodType">Blood Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterBloodType('all');
                  setSortBy('expiration');
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {stats && (stats.critical > 0 || stats.expired > 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>Urgent Action Required:</strong> 
            {stats.critical > 0 && ` ${stats.critical} units are critically close to expiration (≤2 days)`}
            {stats.critical > 0 && stats.expired > 0 && ', '}
            {stats.expired > 0 && ` ${stats.expired} units have expired and need immediate removal`}
          </AlertDescription>
        </Alert>
      )}

      {/* Units Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Units ({filteredUnits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit ID</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shelf Life</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Test Status</TableHead>
                  <TableHead>Temperature</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.slice(0, 50).map(unit => {
                  const daysLeft = getDaysUntilExpiry(unit.expirationDate);
                  const shelfLifePercentage = getShelfLifePercentage(unit.collectionDate, unit.expirationDate);
                  
                  return (
                    <TableRow key={unit.id} className={
                      unit.status === 'expired' ? 'bg-red-50' :
                      unit.status === 'critical' ? 'bg-orange-50' :
                      ''
                    }>
                      <TableCell className="font-mono text-sm">{unit.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getBloodTypeIcon(unit.bloodType)}
                          <span className="font-medium">{unit.bloodType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(unit.status)}</TableCell>
                      <TableCell>
                        <div className="w-20">
                          <Progress value={shelfLifePercentage} className="h-2" />
                          <div className="text-xs text-gray-600 mt-1">
                            {Math.round(shelfLifePercentage)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {unit.expirationDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={
                          daysLeft <= 0 ? 'text-red-600 font-semibold' :
                          daysLeft <= 2 ? 'text-red-500 font-semibold' :
                          daysLeft <= 5 ? 'text-orange-500 font-medium' :
                          'text-gray-600'
                        }>
                          {daysLeft <= 0 ? 'EXPIRED' : `${daysLeft}d`}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{unit.location}</TableCell>
                      <TableCell>
                        <Badge variant={
                          unit.testResults === 'passed' ? 'default' :
                          unit.testResults === 'pending' ? 'secondary' :
                          'destructive'
                        }>
                          {unit.testResults}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className={
                            unit.temperature >= 2 && unit.temperature <= 6 ? 'text-green-600' : 'text-red-600'
                          }>
                            {unit.temperature}°C
                          </div>
                          <div className="text-xs text-gray-500">
                            {unit.lastTempCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredUnits.length > 50 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing first 50 of {filteredUnits.length} units. Use filters to narrow results.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}