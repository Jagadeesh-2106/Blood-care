import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { 
  FileDown, 
  FileText, 
  Download, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Droplets,
  Building2,
  Clock,
  Search,
  RefreshCw,
  Printer,
  Mail
} from "lucide-react";
// Simple chart replacements for better compatibility
const SimpleLineChart = ({ data, height = 300 }: { data: any[], height?: number }) => (
  <div className="w-full bg-gray-50 rounded-lg p-4 flex items-center justify-center" style={{ height }}>
    <div className="text-center text-gray-600">
      <TrendingUp className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm">Trends Chart</p>
      <p className="text-xs">{data.length} months of data</p>
    </div>
  </div>
);

const SimpleBarChart = ({ data, height = 300 }: { data: any[], height?: number }) => (
  <div className="w-full bg-gray-50 rounded-lg p-4 flex items-center justify-center" style={{ height }}>
    <div className="text-center text-gray-600">
      <BarChart3 className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm">Blood Type Distribution</p>
      <p className="text-xs">{data.length} blood types</p>
    </div>
  </div>
);

interface ReportingDashboardProps {
  userRole: 'donor' | 'patient' | 'clinic';
  userProfile: {
    id: string;
    fullName: string;
    role: string;
    organizationName?: string;
  };
}

interface ReportData {
  id: string;
  title: string;
  type: 'donation' | 'request' | 'inventory' | 'impact';
  description: string;
  dateRange: string;
  status: 'ready' | 'generating' | 'error';
  lastGenerated: string;
  size: string;
}

interface FilterOptions {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate: string;
  endDate: string;
  bloodTypes: string[];
  locations: string[];
  status: string[];
  reportTypes: string[];
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const REPORT_COLORS = ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#2563eb', '#7c3aed', '#db2777'];

const mockReportData: ReportData[] = [
  {
    id: '1',
    title: 'Monthly Donation Summary',
    type: 'donation',
    description: 'Comprehensive overview of all donations for the current month',
    dateRange: 'Jan 2024',
    status: 'ready',
    lastGenerated: '2024-01-28T10:30:00Z',
    size: '2.4 MB'
  },
  {
    id: '2',
    title: 'Blood Request Analytics',
    type: 'request',
    description: 'Analysis of blood requests, fulfillment rates, and response times',
    dateRange: 'Q4 2023',
    status: 'ready',
    lastGenerated: '2024-01-15T14:20:00Z',
    size: '1.8 MB'
  },
  {
    id: '3',
    title: 'Inventory Status Report',
    type: 'inventory',
    description: 'Current blood bank inventory levels and expiration tracking',
    dateRange: 'Current',
    status: 'ready',
    lastGenerated: '2024-01-28T09:15:00Z',
    size: '1.2 MB'
  },
  {
    id: '4',
    title: 'Community Impact Report',
    type: 'impact',
    description: 'Lives saved, community engagement, and donor retention metrics',
    dateRange: '2023 Annual',
    status: 'ready',
    lastGenerated: '2024-01-20T16:45:00Z',
    size: '5.6 MB'
  }
];

const mockChartData = [
  { month: 'Jul', donations: 45, requests: 52, fulfilled: 48 },
  { month: 'Aug', donations: 52, requests: 48, fulfilled: 45 },
  { month: 'Sep', donations: 48, requests: 65, fulfilled: 58 },
  { month: 'Oct', donations: 61, requests: 55, fulfilled: 52 },
  { month: 'Nov', donations: 55, requests: 70, fulfilled: 63 },
  { month: 'Dec', donations: 67, requests: 58, fulfilled: 55 },
  { month: 'Jan', donations: 58, requests: 75, fulfilled: 68 }
];

const mockBloodTypeData = [
  { bloodType: 'O+', donations: 28, requests: 32, color: '#dc2626' },
  { bloodType: 'A+', donations: 24, requests: 26, color: '#ea580c' },
  { bloodType: 'B+', donations: 18, requests: 22, color: '#d97706' },
  { bloodType: 'AB+', donations: 12, requests: 15, color: '#ca8a04' },
  { bloodType: 'O-', donations: 15, requests: 18, color: '#65a30d' },
  { bloodType: 'A-', donations: 11, requests: 14, color: '#2563eb' },
  { bloodType: 'B-', donations: 8, requests: 11, color: '#7c3aed' },
  { bloodType: 'AB-', donations: 5, requests: 7, color: '#db2777' }
];

export function ReportingDashboard({ userRole, userProfile }: ReportingDashboardProps) {
  const [reports, setReports] = useState<ReportData[]>(mockReportData);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'month',
    startDate: '',
    endDate: '',
    bloodTypes: [],
    locations: [],
    status: [],
    reportTypes: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newReport: ReportData = {
      id: Date.now().toString(),
      title: `${reportType} Report`,
      type: reportType as any,
      description: `Generated ${reportType} report based on current filters`,
      dateRange: 'Custom',
      status: 'ready',
      lastGenerated: new Date().toISOString(),
      size: '1.5 MB'
    };
    
    setReports(prev => [newReport, ...prev]);
    setIsGenerating(false);
  };

  const handleExportPDF = async (reportId: string) => {
    // In a real implementation, this would generate and download a PDF
    console.log('Exporting PDF for report:', reportId);
    
    // Mock PDF generation
    const report = reports.find(r => r.id === reportId);
    if (report) {
      // Create a simple PDF-like blob for demonstration
      const pdfContent = `
        ${report.title}
        Generated: ${new Date(report.lastGenerated).toLocaleString()}
        
        This is a mock PDF export. In a real implementation, this would contain:
        - Detailed charts and graphs
        - Data tables
        - Statistical analysis
        - Professional formatting
      `;
      
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleExportCSV = async (reportId: string) => {
    // In a real implementation, this would generate and download a CSV
    console.log('Exporting CSV for report:', reportId);
    
    const report = reports.find(r => r.id === reportId);
    if (report) {
      // Mock CSV data
      const csvContent = [
        ['Date', 'Donations', 'Requests', 'Fulfilled'],
        ...mockChartData.map(row => [row.month, row.donations, row.requests, row.fulfilled])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleBulkExport = (format: 'pdf' | 'csv') => {
    selectedReports.forEach(reportId => {
      if (format === 'pdf') {
        handleExportPDF(reportId);
      } else {
        handleExportCSV(reportId);
      }
    });
    setSelectedReports([]);
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'donation': return <Droplets className="w-4 h-4" />;
      case 'request': return <Users className="w-4 h-4" />;
      case 'inventory': return <Building2 className="w-4 h-4" />;
      case 'impact': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'generating': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reporting Dashboard</h2>
          <p className="text-gray-600">Generate and export comprehensive reports</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports" className="text-xs sm:text-sm px-1 sm:px-3">Available Reports</TabsTrigger>
          <TabsTrigger value="generate" className="text-xs sm:text-sm px-1 sm:px-3">Generate New</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm px-1 sm:px-3">Analytics</TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs sm:text-sm px-1 sm:px-3">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Bulk Actions */}
          {selectedReports.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {selectedReports.length} report{selectedReports.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleBulkExport('pdf')}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkExport('csv')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedReports([])}>
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reports List */}
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Checkbox
                        checked={selectedReports.includes(report.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedReports([...selectedReports, report.id]);
                          } else {
                            setSelectedReports(selectedReports.filter(id => id !== report.id));
                          }
                        }}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getReportTypeIcon(report.type)}
                          <h3 className="font-semibold">{report.title}</h3>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{report.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📅 {report.dateRange}</span>
                          <span>📊 {report.size}</span>
                          <span>🕒 Generated {new Date(report.lastGenerated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 ml-4">
                      <Button size="sm" onClick={() => handleExportPDF(report.id)} className="text-xs sm:text-sm">
                        <FileDown className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExportCSV(report.id)} className="text-xs sm:text-sm">
                        <Download className="w-4 h-4 mr-1" />
                        CSV
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs sm:text-sm">
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Report Generator */}
            <Card>
              <CardHeader>
                <CardTitle>Generate New Report</CardTitle>
                <CardDescription>Create custom reports based on your criteria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donation">Donation Summary</SelectItem>
                      <SelectItem value="request">Request Analytics</SelectItem>
                      <SelectItem value="inventory">Inventory Report</SelectItem>
                      <SelectItem value="impact">Impact Analysis</SelectItem>
                      <SelectItem value="donor">Donor Statistics</SelectItem>
                      <SelectItem value="financial">Financial Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={filters.dateRange} onValueChange={(value: any) => setFilters({...filters, dateRange: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filters.dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input 
                        type="date" 
                        value={filters.startDate}
                        onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input 
                        type="date" 
                        value={filters.endDate}
                        onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={() => handleGenerateReport('Custom')}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Reports</CardTitle>
                <CardDescription>Generate common reports instantly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleGenerateReport('Daily Summary')}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Daily Summary Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleGenerateReport('Blood Type Analysis')}
                >
                  <PieChart className="w-4 h-4 mr-2" />
                  Blood Type Analysis
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleGenerateReport('Donor Engagement')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Donor Engagement Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleGenerateReport('Emergency Response')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Emergency Response Metrics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Donation vs Request Trends</CardTitle>
                <CardDescription>7-month comparison overview</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart data={mockChartData} height={300} />
              </CardContent>
            </Card>

            {/* Blood Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Blood Type Distribution</CardTitle>
                <CardDescription>Donations vs requests by blood type</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={mockBloodTypeData} height={300} />
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">87%</div>
                <div className="text-sm text-gray-600">Fulfillment Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">2.4h</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600">342</div>
                <div className="text-sm text-gray-600">Active Donors</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">1,248</div>
                <div className="text-sm text-gray-600">Lives Saved</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Automatically generated reports sent to your email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No scheduled reports yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Set up automatic report generation and delivery
                </p>
                <Button className="mt-4" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}