import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  Download, 
  FileText, 
  Award, 
  Heart,
  Calendar,
  MapPin,
  User,
  Building2,
  Printer,
  Mail,
  Share2,
  Check,
  Star,
  Shield
} from "lucide-react";

interface CertificateGeneratorProps {
  userProfile: {
    id: string;
    fullName: string;
    bloodType?: string;
    location: string;
    role: string;
  };
}

interface CertificateData {
  donorName: string;
  bloodType: string;
  donationDate: string;
  donationLocation: string;
  donationCount: number;
  organizationName: string;
  certificateType: 'single' | 'milestone' | 'annual' | 'recognition';
  customMessage: string;
  officialSignature: string;
  certificateNumber: string;
}

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: 'formal' | 'modern' | 'elegant' | 'medical';
}

const certificateTemplates: CertificateTemplate[] = [
  {
    id: 'formal',
    name: 'Formal Certificate',
    description: 'Traditional formal design with official styling',
    preview: '🏛️ Classic formal layout',
    style: 'formal'
  },
  {
    id: 'modern',
    name: 'Modern Certificate',
    description: 'Contemporary design with clean lines',
    preview: '🎨 Modern minimal design',
    style: 'modern'
  },
  {
    id: 'elegant',
    name: 'Elegant Certificate',
    description: 'Sophisticated design with decorative elements',
    preview: '✨ Elegant decorative style',
    style: 'elegant'
  },
  {
    id: 'medical',
    name: 'Medical Certificate',
    description: 'Professional medical theme with health symbols',
    preview: '⚕️ Medical professional theme',
    style: 'medical'
  }
];

export function DonationCertificateGenerator({ userProfile }: CertificateGeneratorProps) {
  const [certificateData, setCertificateData] = useState<CertificateData>({
    donorName: userProfile.fullName,
    bloodType: userProfile.bloodType || 'O+',
    donationDate: new Date().toISOString().split('T')[0],
    donationLocation: userProfile.location,
    donationCount: 1,
    organizationName: 'BloodConnect Network',
    certificateType: 'single',
    customMessage: '',
    officialSignature: 'Dr. Sarah Johnson, MD - Medical Director',
    certificateNumber: `BC-${Date.now()}`
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('formal');
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    
    // Simulate certificate generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would:
    // 1. Generate a PDF using libraries like jsPDF or Puppeteer
    // 2. Add official stamps/watermarks
    // 3. Store certificate data in database
    // 4. Generate unique certificate ID
    
    console.log('Generating certificate with data:', certificateData);
    setIsGenerating(false);
  };

  const handleDownloadPDF = () => {
    // Mock PDF download
    const pdfContent = generateCertificateHTML();
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BloodDonation_Certificate_${certificateData.certificateNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateCertificateHTML = () => {
    const template = certificateTemplates.find(t => t.id === selectedTemplate);
    const templateStyle = getTemplateStyles(template?.style || 'formal');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Blood Donation Certificate</title>
    <style>
        ${templateStyle}
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="logo">
                <div class="logo-circle">
                    <span class="logo-text">❤️</span>
                </div>
                <h1>BloodConnect</h1>
            </div>
            <div class="cert-number">Certificate No: ${certificateData.certificateNumber}</div>
        </div>
        
        <div class="title-section">
            <h2>CERTIFICATE OF APPRECIATION</h2>
            <div class="subtitle">For Life-Saving Blood Donation</div>
        </div>
        
        <div class="content">
            <div class="recipient-line">
                This is to certify that
            </div>
            <div class="recipient-name">${certificateData.donorName}</div>
            <div class="certification-text">
                has generously donated blood on <strong>${new Date(certificateData.donationDate).toLocaleDateString()}</strong>
                at <strong>${certificateData.donationLocation}</strong>. This noble act of donating 
                <strong>${certificateData.bloodType}</strong> blood demonstrates exceptional commitment to saving lives 
                and serving the community.
                ${certificateData.donationCount > 1 ? `This marks their <strong>${certificateData.donationCount}${getOrdinalSuffix(certificateData.donationCount)}</strong> donation with our organization.` : ''}
            </div>
            ${certificateData.customMessage ? `<div class="custom-message">${certificateData.customMessage}</div>` : ''}
        </div>
        
        <div class="footer">
            <div class="signature-section">
                <div class="signature-line"></div>
                <div class="signature-text">${certificateData.officialSignature}</div>
                <div class="signature-title">Medical Director</div>
            </div>
            <div class="date-section">
                <div class="date">Date: ${new Date().toLocaleDateString()}</div>
                <div class="organization">${certificateData.organizationName}</div>
            </div>
        </div>
        
        <div class="seal">
            <div class="seal-circle">
                <div class="seal-text">OFFICIAL<br/>SEAL</div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  };

  const getTemplateStyles = (style: string) => {
    const baseStyles = `
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: 'Times New Roman', serif; 
            background: #f9f9f9; 
        }
        .certificate { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 60px; 
            border: 10px solid #dc2626; 
            position: relative;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 40px; 
        }
        .logo { 
            display: flex; 
            align-items: center; 
            gap: 15px; 
        }
        .logo-circle { 
            width: 60px; 
            height: 60px; 
            background: #dc2626; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 24px; 
        }
        .logo h1 { 
            margin: 0; 
            color: #dc2626; 
            font-size: 28px; 
        }
        .cert-number { 
            font-size: 14px; 
            color: #666; 
        }
        .title-section { 
            text-align: center; 
            margin-bottom: 40px; 
        }
        .title-section h2 { 
            font-size: 36px; 
            color: #dc2626; 
            margin: 0; 
            letter-spacing: 2px; 
        }
        .subtitle { 
            font-size: 18px; 
            color: #666; 
            margin-top: 10px; 
        }
        .content { 
            text-align: center; 
            margin-bottom: 50px; 
        }
        .recipient-line { 
            font-size: 18px; 
            margin-bottom: 10px; 
        }
        .recipient-name { 
            font-size: 32px; 
            font-weight: bold; 
            color: #dc2626; 
            margin: 20px 0; 
            text-decoration: underline; 
        }
        .certification-text { 
            font-size: 16px; 
            line-height: 1.6; 
            margin: 20px 0; 
            text-align: justify; 
        }
        .custom-message { 
            font-style: italic; 
            margin-top: 20px; 
            padding: 20px; 
            background: #f5f5f5; 
            border-left: 4px solid #dc2626; 
        }
        .footer { 
            display: flex; 
            justify-content: space-between; 
            align-items: end; 
        }
        .signature-section { 
            text-align: center; 
        }
        .signature-line { 
            width: 200px; 
            height: 1px; 
            background: #333; 
            margin-bottom: 10px; 
        }
        .signature-text { 
            font-weight: bold; 
        }
        .signature-title { 
            font-size: 14px; 
            color: #666; 
        }
        .date-section { 
            text-align: right; 
        }
        .date { 
            margin-bottom: 10px; 
        }
        .organization { 
            font-weight: bold; 
            color: #dc2626; 
        }
        .seal { 
            position: absolute; 
            bottom: 20px; 
            right: 20px; 
        }
        .seal-circle { 
            width: 80px; 
            height: 80px; 
            border: 3px solid #dc2626; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: rgba(220, 38, 38, 0.1); 
        }
        .seal-text { 
            font-size: 10px; 
            font-weight: bold; 
            text-align: center; 
            color: #dc2626; 
        }
    `;

    // Add style-specific modifications
    switch (style) {
      case 'modern':
        return baseStyles + `
          .certificate { border: 5px solid #2563eb; font-family: 'Helvetica', sans-serif; }
          .logo h1, .title-section h2, .recipient-name, .organization { color: #2563eb; }
          .logo-circle, .seal-circle { background: #2563eb; border-color: #2563eb; }
        `;
      case 'elegant':
        return baseStyles + `
          .certificate { border: 8px double #7c3aed; background: #fefefe; }
          .logo h1, .title-section h2, .recipient-name, .organization { color: #7c3aed; }
          .logo-circle, .seal-circle { background: #7c3aed; border-color: #7c3aed; }
          .title-section h2 { text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
        `;
      case 'medical':
        return baseStyles + `
          .certificate { border: 6px solid #16a34a; }
          .logo h1, .title-section h2, .recipient-name, .organization { color: #16a34a; }
          .logo-circle, .seal-circle { background: #16a34a; border-color: #16a34a; }
          .logo-circle { font-size: 20px; }
        `;
      default:
        return baseStyles;
    }
  };

  const getOrdinalSuffix = (num: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  };

  const getCertificateTypeDescription = (type: string) => {
    switch (type) {
      case 'single': return 'Certificate for a single blood donation';
      case 'milestone': return 'Special recognition for donation milestones';
      case 'annual': return 'Annual appreciation certificate';
      case 'recognition': return 'Special recognition certificate';
      default: return 'Standard donation certificate';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Certificate Generator</h2>
          <p className="text-gray-600">Create official donation certificates</p>
        </div>
        <Button onClick={handleGenerateCertificate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Generating...
            </>
          ) : (
            <>
              <Award className="w-4 h-4 mr-2" />
              Generate Certificate
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Certificate Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Certificate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Donor Name</Label>
                <Input
                  value={certificateData.donorName}
                  onChange={(e) => setCertificateData({...certificateData, donorName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Select value={certificateData.bloodType} onValueChange={(value) => setCertificateData({...certificateData, bloodType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Donation Date</Label>
                <Input
                  type="date"
                  value={certificateData.donationDate}
                  onChange={(e) => setCertificateData({...certificateData, donationDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={certificateData.donationLocation}
                  onChange={(e) => setCertificateData({...certificateData, donationLocation: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Certificate Type</Label>
                <Select value={certificateData.certificateType} onValueChange={(value: any) => setCertificateData({...certificateData, certificateType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Donation</SelectItem>
                    <SelectItem value="milestone">Milestone Achievement</SelectItem>
                    <SelectItem value="annual">Annual Recognition</SelectItem>
                    <SelectItem value="recognition">Special Recognition</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {getCertificateTypeDescription(certificateData.certificateType)}
                </p>
              </div>

              {certificateData.certificateType === 'milestone' && (
                <div className="space-y-2">
                  <Label>Donation Count</Label>
                  <Input
                    type="number"
                    min="1"
                    value={certificateData.donationCount}
                    onChange={(e) => setCertificateData({...certificateData, donationCount: parseInt(e.target.value) || 1})}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Template</CardTitle>
              <CardDescription>Choose the design style for your certificate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {certificateTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id 
                      ? 'border-red-600 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-600">{template.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{template.preview}</div>
                    </div>
                    {selectedTemplate === template.id && (
                      <Check className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Custom Message (Optional)</Label>
                <Textarea
                  placeholder="Add a personalized message..."
                  value={certificateData.customMessage}
                  onChange={(e) => setCertificateData({...certificateData, customMessage: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input
                  value={certificateData.organizationName}
                  onChange={(e) => setCertificateData({...certificateData, organizationName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Official Signature</Label>
                <Input
                  value={certificateData.officialSignature}
                  onChange={(e) => setCertificateData({...certificateData, officialSignature: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Certificate Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certificate Preview
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button size="sm" onClick={handleDownloadPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 p-4 bg-gray-50">
                <div 
                  ref={certificateRef}
                  className="bg-white p-8 border-4 border-red-600 max-w-full mx-auto"
                  style={{ aspectRatio: '4/3', fontSize: '12px' }}
                >
                  {/* Certificate Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-red-600">BloodConnect</h1>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Certificate No: {certificateData.certificateNumber}
                    </div>
                  </div>

                  {/* Certificate Title */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">CERTIFICATE OF APPRECIATION</h2>
                    <div className="text-gray-600">For Life-Saving Blood Donation</div>
                  </div>

                  {/* Certificate Content */}
                  <div className="text-center space-y-4 mb-6">
                    <div>This is to certify that</div>
                    <div className="text-2xl font-bold text-red-600 border-b border-gray-300 pb-1">
                      {certificateData.donorName}
                    </div>
                    <div className="text-sm leading-relaxed px-4">
                      has generously donated blood on <strong>{new Date(certificateData.donationDate).toLocaleDateString()}</strong> at <strong>{certificateData.donationLocation}</strong>. This noble act of donating <strong>{certificateData.bloodType}</strong> blood demonstrates exceptional commitment to saving lives and serving the community.
                      {certificateData.donationCount > 1 && (
                        <> This marks their <strong>{certificateData.donationCount}{getOrdinalSuffix(certificateData.donationCount)}</strong> donation with our organization.</>
                      )}
                    </div>
                    {certificateData.customMessage && (
                      <div className="text-sm italic bg-gray-50 p-3 border-l-4 border-red-600">
                        {certificateData.customMessage}
                      </div>
                    )}
                  </div>

                  {/* Certificate Footer */}
                  <div className="flex justify-between items-end">
                    <div className="text-center">
                      <div className="w-32 h-px bg-gray-400 mb-2"></div>
                      <div className="text-sm font-semibold">{certificateData.officialSignature}</div>
                      <div className="text-xs text-gray-600">Medical Director</div>
                    </div>
                    <div className="text-right text-sm">
                      <div>Date: {new Date().toLocaleDateString()}</div>
                      <div className="font-semibold text-red-600">{certificateData.organizationName}</div>
                    </div>
                  </div>

                  {/* Official Seal */}
                  <div className="absolute bottom-4 right-4">
                    <div className="w-12 h-12 border-2 border-red-600 rounded-full flex items-center justify-center bg-red-50">
                      <div className="text-xs text-red-600 text-center font-bold">
                        <div>OFFICIAL</div>
                        <div>SEAL</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" size="sm" className="flex-col h-auto py-3">
                  <Mail className="w-5 h-5 mb-1" />
                  Email Certificate
                </Button>
                <Button variant="outline" size="sm" className="flex-col h-auto py-3">
                  <Share2 className="w-5 h-5 mb-1" />
                  Share Certificate
                </Button>
                <Button variant="outline" size="sm" className="flex-col h-auto py-3">
                  <Building2 className="w-5 h-5 mb-1" />
                  Save Template
                </Button>
                <Button variant="outline" size="sm" className="flex-col h-auto py-3">
                  <Star className="w-5 h-5 mb-1" />
                  Add to Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}