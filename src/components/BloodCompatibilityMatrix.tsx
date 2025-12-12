import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Heart, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Info,
  Crown,
  Shield
} from 'lucide-react';

interface BloodType {
  type: string;
  antigenA: boolean;
  antigenB: boolean;
  rhFactor: boolean;
}

interface CompatibilityResult {
  canDonate: boolean;
  canReceive: boolean;
  reason: string;
}

const bloodTypes: BloodType[] = [
  { type: 'A+', antigenA: true, antigenB: false, rhFactor: true },
  { type: 'A-', antigenA: true, antigenB: false, rhFactor: false },
  { type: 'B+', antigenA: false, antigenB: true, rhFactor: true },
  { type: 'B-', antigenA: false, antigenB: true, rhFactor: false },
  { type: 'AB+', antigenA: true, antigenB: true, rhFactor: true },
  { type: 'AB-', antigenA: true, antigenB: true, rhFactor: false },
  { type: 'O+', antigenA: false, antigenB: false, rhFactor: true },
  { type: 'O-', antigenA: false, antigenB: false, rhFactor: false },
];

export function BloodCompatibilityMatrix() {
  const [selectedDonor, setSelectedDonor] = useState<string>('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [viewMode, setViewMode] = useState<'matrix' | 'checker' | 'universal'>('matrix');

  // Blood compatibility logic
  const checkCompatibility = (donorType: string, recipientType: string): CompatibilityResult => {
    const donor = bloodTypes.find(bt => bt.type === donorType);
    const recipient = bloodTypes.find(bt => bt.type === recipientType);
    
    if (!donor || !recipient) {
      return { canDonate: false, canReceive: false, reason: 'Invalid blood type' };
    }

    // Check ABO compatibility
    let aboCompatible = false;
    let reason = '';

    // Type O can donate to all (universal donor for ABO)
    if (!donor.antigenA && !donor.antigenB) {
      aboCompatible = true;
      reason = 'Type O is universal donor for ABO system';
    }
    // Type AB can receive from all (universal recipient for ABO)
    else if (recipient.antigenA && recipient.antigenB) {
      aboCompatible = true;
      reason = 'Type AB is universal recipient for ABO system';
    }
    // Same ABO type
    else if (donor.antigenA === recipient.antigenA && donor.antigenB === recipient.antigenB) {
      aboCompatible = true;
      reason = 'Same ABO blood group';
    }
    // Type A can donate to AB
    else if (donor.antigenA && !donor.antigenB && recipient.antigenA && recipient.antigenB) {
      aboCompatible = true;
      reason = 'Type A can donate to Type AB';
    }
    // Type B can donate to AB
    else if (!donor.antigenA && donor.antigenB && recipient.antigenA && recipient.antigenB) {
      aboCompatible = true;
      reason = 'Type B can donate to Type AB';
    }

    // Check Rh compatibility
    let rhCompatible = false;
    if (!donor.rhFactor || recipient.rhFactor) {
      rhCompatible = true;
    }

    const compatible = aboCompatible && rhCompatible;
    
    if (!compatible) {
      if (!aboCompatible) {
        reason = 'ABO blood group incompatibility';
      } else if (!rhCompatible) {
        reason = 'Rh factor incompatibility (Rh+ cannot donate to Rh-)';
      }
    }

    return {
      canDonate: compatible,
      canReceive: compatible,
      reason
    };
  };

  // Get all compatible donors for a recipient
  const getCompatibleDonors = (recipientType: string): string[] => {
    return bloodTypes
      .filter(donor => checkCompatibility(donor.type, recipientType).canDonate)
      .map(donor => donor.type);
  };

  // Get all compatible recipients for a donor
  const getCompatibleRecipients = (donorType: string): string[] => {
    return bloodTypes
      .filter(recipient => checkCompatibility(donorType, recipient.type).canDonate)
      .map(recipient => recipient.type);
  };

  // Matrix view
  const renderMatrix = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Blood Type Compatibility Matrix</h3>
        <p className="text-gray-600">Green indicates compatible donation, Red indicates incompatible</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-3 text-left">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Donor → Recipient</span>
                </div>
              </th>
              {bloodTypes.map(recipient => (
                <th key={recipient.type} className="border border-gray-300 p-3 text-center min-w-16">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold">{recipient.type}</span>
                    <span className="text-xs text-gray-500">Recipient</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloodTypes.map(donor => (
              <tr key={donor.type} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3 font-semibold bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span>{donor.type}</span>
                    <span className="text-xs text-gray-500">Donor</span>
                    {donor.type === 'O-' && <Crown className="w-4 h-4 text-yellow-500" title="Universal Donor" />}
                  </div>
                </td>
                {bloodTypes.map(recipient => {
                  const compatibility = checkCompatibility(donor.type, recipient.type);
                  return (
                    <td 
                      key={recipient.type} 
                      className={`border border-gray-300 p-3 text-center ${
                        compatibility.canDonate 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {compatibility.canDonate ? (
                        <CheckCircle className="w-5 h-5 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Alert className="border-yellow-200 bg-yellow-50">
          <Crown className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>O- (Universal Donor):</strong> Can donate to all blood types
          </AlertDescription>
        </Alert>
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>AB+ (Universal Recipient):</strong> Can receive from all blood types
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  // Compatibility checker
  const renderChecker = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Blood Type Compatibility Checker</h3>
        <p className="text-gray-600">Check if a donor can safely donate to a recipient</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Donor Blood Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedDonor} onValueChange={setSelectedDonor}>
              <SelectTrigger>
                <SelectValue placeholder="Select donor blood type" />
              </SelectTrigger>
              <SelectContent>
                {bloodTypes.map(bt => (
                  <SelectItem key={bt.type} value={bt.type}>
                    <div className="flex items-center gap-2">
                      <span>{bt.type}</span>
                      {bt.type === 'O-' && <Crown className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Recipient Blood Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient blood type" />
              </SelectTrigger>
              <SelectContent>
                {bloodTypes.map(bt => (
                  <SelectItem key={bt.type} value={bt.type}>
                    <div className="flex items-center gap-2">
                      <span>{bt.type}</span>
                      {bt.type === 'AB+' && <Shield className="w-4 h-4 text-blue-500" />}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedDonor && selectedRecipient && (
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {selectedDonor}
              </Badge>
              <ArrowRight className="w-6 h-6 text-gray-400" />
              <Badge variant="outline" className="text-lg px-4 py-2">
                {selectedRecipient}
              </Badge>
            </div>

            {(() => {
              const compatibility = checkCompatibility(selectedDonor, selectedRecipient);
              return (
                <div className="text-center space-y-4">
                  <div className={`flex items-center justify-center gap-2 text-lg font-semibold ${
                    compatibility.canDonate ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {compatibility.canDonate ? (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        Compatible Donation
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6" />
                        Incompatible Donation
                      </>
                    )}
                  </div>
                  
                  <Alert className={compatibility.canDonate ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <Info className={`w-4 h-4 ${compatibility.canDonate ? 'text-green-600' : 'text-red-600'}`} />
                    <AlertDescription className={compatibility.canDonate ? 'text-green-800' : 'text-red-800'}>
                      <strong>Reason:</strong> {compatibility.reason}
                    </AlertDescription>
                  </Alert>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Universal donors and recipients view
  const renderUniversal = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Universal Donors & Recipients</h3>
        <p className="text-gray-600">Special blood types with unique donation properties</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Universal Donor */}
        <Card className="border-yellow-200">
          <CardHeader className="bg-yellow-50">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Crown className="w-6 h-6" />
              Universal Donor: O-
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Can donate to all blood types in emergency situations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Can donate to:</h4>
              <div className="flex flex-wrap gap-2">
                {getCompatibleRecipients('O-').map(type => (
                  <Badge key={type} variant="secondary">{type}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Can receive from:</h4>
              <div className="flex flex-wrap gap-2">
                {getCompatibleDonors('O-').map(type => (
                  <Badge key={type} variant="outline">{type}</Badge>
                ))}
              </div>
            </div>

            <Alert className="border-yellow-200 bg-yellow-50">
              <Info className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                O- blood is critical for emergency transfusions when patient's blood type is unknown
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Universal Recipient */}
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Shield className="w-6 h-6" />
              Universal Recipient: AB+
            </CardTitle>
            <CardDescription className="text-blue-700">
              Can receive from all blood types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Can receive from:</h4>
              <div className="flex flex-wrap gap-2">
                {getCompatibleDonors('AB+').map(type => (
                  <Badge key={type} variant="secondary">{type}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Can donate to:</h4>
              <div className="flex flex-wrap gap-2">
                {getCompatibleRecipients('AB+').map(type => (
                  <Badge key={type} variant="outline">{type}</Badge>
                ))}
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                AB+ individuals have the most donation options but can only donate to other AB+ recipients
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Other notable compatibilities */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Type Compatibility Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">High-Demand Types (Universal/Near-Universal):</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="font-medium">O-</span>
                  <span className="text-sm text-gray-600">Donates to 8 types</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="font-medium">O+</span>
                  <span className="text-sm text-gray-600">Donates to 4 types</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="font-medium">A-</span>
                  <span className="text-sm text-gray-600">Donates to 4 types</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="font-medium">B-</span>
                  <span className="text-sm text-gray-600">Donates to 4 types</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Rare Types (Limited Compatibility):</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="font-medium">AB-</span>
                  <span className="text-sm text-gray-600">Donates to 2 types</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="font-medium">AB+</span>
                  <span className="text-sm text-gray-600">Donates to 1 type</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="font-medium">A+</span>
                  <span className="text-sm text-gray-600">Donates to 2 types</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="font-medium">B+</span>
                  <span className="text-sm text-gray-600">Donates to 2 types</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-600" />
            Blood Type Compatibility System
          </CardTitle>
          <CardDescription>
            Understand blood type compatibility for safe transfusions and donation matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={viewMode === 'matrix' ? 'default' : 'outline'}
              onClick={() => setViewMode('matrix')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Compatibility Matrix
            </Button>
            <Button
              variant={viewMode === 'checker' ? 'default' : 'outline'}
              onClick={() => setViewMode('checker')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Compatibility Checker
            </Button>
            <Button
              variant={viewMode === 'universal' ? 'default' : 'outline'}
              onClick={() => setViewMode('universal')}
              className="flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Universal Types
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content based on view mode */}
      {viewMode === 'matrix' && renderMatrix()}
      {viewMode === 'checker' && renderChecker()}
      {viewMode === 'universal' && renderUniversal()}

      {/* Important Notice */}
      <Alert className="border-red-200 bg-red-50">
        <Info className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Medical Disclaimer:</strong> This tool is for educational purposes only. 
          Always follow medical protocols and perform proper cross-matching before any blood transfusion.
        </AlertDescription>
      </Alert>
    </div>
  );
}