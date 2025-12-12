import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Heart, 
  MapPin, 
  Calendar, 
  User, 
  Building2, 
  AlertCircle,
  Phone,
  Mail,
  Clock,
  Droplets,
  Plus,
  Loader2,
  Map
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { BloodType, UrgencyLevel } from "../types/bloodRequest";
import { getCoordinatesForLocation } from "../utils/locationHelpers";
import { getAllStateNames, getStateByName, getStatesWithCities } from '../utils/indianStatesData';


interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  organizationName?: string;
  organizationType?: string;
  role: string;
}

interface BloodRequestFormProps {
  userProfile?: UserProfile;
}

interface BloodRequestFormData {
  bloodType: BloodType | "";
  units: number;
  urgency: UrgencyLevel | "";
  hospital: string;
  hospitalType: string;
  state: string;
  city: string;
  address: string;
  patientAge: number;
  patientGender: string;
  reason: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  requiredBy: string;
  description: string;
}

export function BloodRequestForm({ userProfile }: BloodRequestFormProps) {
  const [formData, setFormData] = useState<BloodRequestFormData>({
    bloodType: "",
    units: 1,
    urgency: "",
    hospital: userProfile?.organizationName || "",
    hospitalType: userProfile?.organizationType === "hospital" ? "Government" : "Private",
    state: "",
    city: "",
    address: userProfile?.location || "", 
    patientAge: 0,
    patientGender: "",
    reason: "",
    contactPerson: userProfile?.fullName || "",
    contactPhone: userProfile?.phoneNumber || "",
    contactEmail: userProfile?.email || "",
    requiredBy: "",
    description: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);



  // Handle input changes
  const handleInputChange = (field: keyof BloodRequestFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // When state changes, update available cities
    if (field === 'state') {
      const selectedState = getStateByName(value);
      if (selectedState) {
        const cities = [...selectedState.majorCities, ...selectedState.districts].sort();
        setAvailableCities(cities);
        // Clear city selection when state changes
        setFormData(prev => ({
          ...prev,
          city: ""
        }));
      } else {
        setAvailableCities([]);
      }
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const requiredFields = [
      'bloodType', 'urgency', 'hospital', 'hospitalType', 'state', 'city', 'address',
      'patientAge', 'patientGender', 'reason', 'contactPerson',
      'contactPhone', 'contactEmail', 'requiredBy'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof BloodRequestFormData] || 
          (field === 'patientAge' && formData.patientAge <= 0)) {
        return false;
      }
    }

    // Check if required by date is in the future
    const requiredDate = new Date(formData.requiredBy);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requiredDate <= today) {
      toast.error("Required by date must be in the future");
      return false;
    }

    return true;
  };

  // Submit blood request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get coordinates for the address
      const coordinates = getCoordinatesForLocation(formData.address);
      
      const requestPayload = {
        ...formData,
        requestedDate: new Date().toISOString(),
        status: "Active",
        matchPercentage: 100,
        coordinates: coordinates || { lat: 0, lng: 0 },
        bloodBankDetails: {
          registrationNumber: `REG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          bloodAvailability: {},
          operatingHours: "24/7",
          emergencyContact: formData.contactPhone,
          facilities: ["Emergency Services", "Blood Banking", "Laboratory"]
        },
        location: {
          state: formData.state,
          district: formData.city,
          city: formData.city,
          pincode: "00000"
        },
        state: formData.state
      };

      // Use the API helper for better authentication handling
      const { apiCall } = await import('../utils/supabase/client');
      const result = await apiCall('/blood-requests', {
        method: 'POST',
        body: JSON.stringify(requestPayload)
      });
      
      toast.success(
        `Blood request submitted successfully! ${result.notifiedDonors || 0} nearby donors have been notified.`,
        { duration: 5000 }
      );

      // Reset form
      setFormData({
        bloodType: "",
        units: 1,
        urgency: "",
        hospital: userProfile?.organizationName || "",
        hospitalType: userProfile?.organizationType === "hospital" ? "Government" : "Private",
        state: "",
        city: "",
        address: userProfile?.location || "",
        patientAge: 0,
        patientGender: "",
        reason: "",
        contactPerson: userProfile?.fullName || "",
        contactPhone: userProfile?.phoneNumber || "",
        contactEmail: userProfile?.email || "",
        requiredBy: "",
        description: ""
      });
      setAvailableCities([]);

    } catch (error) {
      console.debug('Error submitting blood request:', error);
      
      // Provide a user-friendly error message
      let errorMessage = 'Failed to submit blood request. ';
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          errorMessage += 'The service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Please check your connection and try again.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please try again later.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get urgency badge styling
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            Submit Blood Request
          </CardTitle>
          <CardDescription>
            Create a new blood request to notify nearby donors in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Type and Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="font-medium text-gray-900">Blood Type *</label>
                <Select 
                  value={formData.bloodType} 
                  onValueChange={(value) => handleInputChange('bloodType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium text-gray-900">Units Required *</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.units}
                  onChange={(e) => handleInputChange('units', parseInt(e.target.value) || 1)}
                  placeholder="Number of units"
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium text-gray-900">Urgency Level *</label>
                <Select 
                  value={formData.urgency} 
                  onValueChange={(value) => handleInputChange('urgency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hospital Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                <Building2 className="w-4 h-4" />
                Hospital Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Hospital/Organization Name *</label>
                  <Input
                    value={formData.hospital}
                    onChange={(e) => handleInputChange('hospital', e.target.value)}
                    placeholder="Enter hospital name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Hospital Type *</label>
                  <Select 
                    value={formData.hospitalType} 
                    onValueChange={(value) => handleInputChange('hospitalType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Blood Bank">Blood Bank</SelectItem>
                      <SelectItem value="Medical College">Medical College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Selection */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-medium text-gray-900">
                  <Map className="w-4 h-4" />
                  Location Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-medium text-gray-900">State *</label>
                    <Select 
                      value={formData.state} 
                      onValueChange={(value) => handleInputChange('state', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {getAllStateNames().map((stateName) => (
                          <SelectItem key={stateName} value={stateName}>
                            {stateName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-gray-900">City/District *</label>
                    <Select 
                      value={formData.city} 
                      onValueChange={(value) => handleInputChange('city', value)}
                      disabled={!formData.state}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.state ? "Select city/district" : "Select state first"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-medium text-gray-900">Complete Address *</label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete address with area, landmark, pin code..."
                  rows={3}
                />
              </div>
            </div>

            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                <User className="w-4 h-4" />
                Patient Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Patient Age *</label>
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.patientAge || ""}
                    onChange={(e) => handleInputChange('patientAge', parseInt(e.target.value) || 0)}
                    placeholder="Enter patient age"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Patient Gender *</label>
                  <Select 
                    value={formData.patientGender} 
                    onValueChange={(value) => handleInputChange('patientGender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-medium text-gray-900">Reason for Blood Request *</label>
                <Select 
                  value={formData.reason} 
                  onValueChange={(value) => handleInputChange('reason', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                    <SelectItem value="Trauma/Accident">Trauma/Accident</SelectItem>
                    <SelectItem value="Cancer Treatment">Cancer Treatment</SelectItem>
                    <SelectItem value="Anemia">Anemia</SelectItem>
                    <SelectItem value="Blood Disorder">Blood Disorder</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium text-gray-900">Required By Date *</label>
                <Input
                  type="date"
                  value={formData.requiredBy}
                  onChange={(e) => handleInputChange('requiredBy', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                <Phone className="w-4 h-4" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Contact Person *</label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="Enter contact person name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Phone Number *</label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Email Address *</label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <label className="font-medium text-gray-900">Additional Notes</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Any additional information that might be helpful..."
                rows={3}
              />
            </div>

            {/* Preview Section */}
            {formData.bloodType && formData.urgency && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-3">Request Preview</h4>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-red-50 text-red-700 border-red-200">
                    {formData.bloodType}
                  </Badge>
                  <Badge className={getUrgencyColor(formData.urgency)}>
                    {formData.urgency} Priority
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {formData.units} unit{formData.units > 1 ? 's' : ''} needed
                  </span>
                  {formData.hospital && (
                    <span className="text-sm text-gray-600">
                      at {formData.hospital}
                    </span>
                  )}
                  {formData.state && formData.city && (
                    <span className="text-sm text-gray-600">
                      in {formData.city}, {formData.state}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                Reset Form
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Submit Blood Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}