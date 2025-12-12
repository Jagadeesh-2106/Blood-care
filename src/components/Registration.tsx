import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Heart, Building2, CheckCircle, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { auth } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";

interface RegistrationProps {
  onNavigateToHome?: () => void;
  onSignUpSuccess?: (role: 'donor' | 'patient' | 'clinic') => void;
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function Registration({ onNavigateToHome, onSignUpSuccess }: RegistrationProps) {
  const [activeTab, setActiveTab] = useState("donor");
  const [donorForm, setDonorForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    bloodType: "",
    city: "",
    state: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
    agreedToPrivacy: false
  });

  const [patientForm, setPatientForm] = useState({
    organizationType: "",
    organizationName: "",
    contactPersonName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
    agreedToPrivacy: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDonorPassword, setShowDonorPassword] = useState(false);
  const [showDonorConfirmPassword, setShowDonorConfirmPassword] = useState(false);
  const [showPatientPassword, setShowPatientPassword] = useState(false);
  const [showPatientConfirmPassword, setShowPatientConfirmPassword] = useState(false);

  const handleDonorInputChange = (field: string, value: any) => {
    setDonorForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientInputChange = (field: string, value: any) => {
    setPatientForm(prev => ({ ...prev, [field]: value }));
  };

  const validateDonorForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'bloodType', 'city', 'state', 'password', 'confirmPassword'];
    const hasAllFields = required.every(field => donorForm[field as keyof typeof donorForm]);
    const passwordsMatch = donorForm.password === donorForm.confirmPassword;
    const passwordStrong = validatePasswordStrength(donorForm.password);
    return hasAllFields && passwordsMatch && passwordStrong && donorForm.agreedToTerms && donorForm.agreedToPrivacy;
  };

  const validatePatientForm = () => {
    const required = ['organizationType', 'organizationName', 'contactPersonName', 'email', 'phone', 'city', 'state', 'password', 'confirmPassword'];
    const hasAllFields = required.every(field => patientForm[field as keyof typeof patientForm]);
    const passwordsMatch = patientForm.password === patientForm.confirmPassword;
    const passwordStrong = validatePasswordStrength(patientForm.password);
    return hasAllFields && passwordsMatch && passwordStrong && patientForm.agreedToTerms && patientForm.agreedToPrivacy;
  };

  const validatePasswordStrength = (password: string): boolean => {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
  };

  const getPasswordStrengthColor = (password: string): string => {
    if (!password) return 'bg-gray-200';
    if (password.length < 8) return 'bg-red-400';
    if (!validatePasswordStrength(password)) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getPasswordStrengthText = (password: string): string => {
    if (!password) return 'Password required';
    if (password.length < 8) return 'Too short (minimum 8 characters)';
    if (!validatePasswordStrength(password)) return 'Good (add symbols for strong)';
    return 'Strong password';
  };

  const handleSubmit = async (formType: 'donor' | 'patient') => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const currentForm = formType === 'donor' ? donorForm : patientForm;
      
      // Prepare user data based on form type
      const userData = {
        email: currentForm.email,
        password: currentForm.password,
        fullName: formType === 'donor' 
          ? `${donorForm.firstName} ${donorForm.lastName}`
          : patientForm.contactPersonName,
        role: formType === 'donor' ? 'donor' : (patientForm.organizationType === 'individual' ? 'patient' : 'clinic'),
        phoneNumber: currentForm.phone,
        location: `${currentForm.city}, ${currentForm.state}`,
        ...(formType === 'donor' ? {
          bloodType: donorForm.bloodType,
          dateOfBirth: donorForm.dateOfBirth
        } : {
          organizationType: patientForm.organizationType,
          organizationName: patientForm.organizationName
        })
      };

      // Call our custom signup endpoint
      const result = await auth.signUp(userData.email, userData.password, userData);
      
      console.log('Registration successful:', result);
      toast.success('Registration successful! Welcome to BloodConnect.');
      
      setSubmitSuccess(true);
      
      // Auto-redirect after success message
      setTimeout(() => {
        if (onSignUpSuccess) {
          onSignUpSuccess(userData.role as 'donor' | 'patient' | 'clinic');
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message?.includes('User already registered') || error.message?.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please try signing in instead.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special characters.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for joining BloodConnect. We'll review your application and contact you within 24 hours to complete your profile.
              </p>
              <Button 
                onClick={onNavigateToHome}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-pink-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-2xl mx-auto">
          {/* Back to Home Button */}
          {onNavigateToHome && (
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={onNavigateToHome}
                className="text-gray-600 hover:text-gray-900 p-0 h-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          )}

          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Join BloodConnect</h1>
            <p className="text-xl text-gray-600">
              Create your account and start saving lives in your community
            </p>
          </div>

          <Card className="shadow-2xl border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-2xl">Quick Registration</CardTitle>
              <CardDescription className="text-center">
                Get started with just the essential information - complete your profile later
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="donor" className="flex items-center gap-2 py-3">
                    <Heart className="w-4 h-4" />
                    Blood Donor
                  </TabsTrigger>
                  <TabsTrigger value="patient" className="flex items-center gap-2 py-3">
                    <Building2 className="w-4 h-4" />
                    Patient/Clinic
                  </TabsTrigger>
                </TabsList>

                {/* Donor Registration Form */}
                <TabsContent value="donor" className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Donor Registration</h3>
                        <p className="text-sm text-blue-700">
                          Quick registration to join our donor network. Additional medical information will be collected during your first donation appointment.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form className="space-y-6">
                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={donorForm.firstName}
                            onChange={(e) => handleDonorInputChange('firstName', e.target.value)}
                            placeholder="Enter your first name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={donorForm.lastName}
                            onChange={(e) => handleDonorInputChange('lastName', e.target.value)}
                            placeholder="Enter your last name"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={donorForm.email}
                            onChange={(e) => handleDonorInputChange('email', e.target.value)}
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={donorForm.phone}
                            onChange={(e) => handleDonorInputChange('phone', e.target.value)}
                            placeholder="(555) 123-4567"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={donorForm.dateOfBirth}
                            onChange={(e) => handleDonorInputChange('dateOfBirth', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="bloodType">Blood Type *</Label>
                          <Select value={donorForm.bloodType} onValueChange={(value) => handleDonorInputChange('bloodType', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood type" />
                            </SelectTrigger>
                            <SelectContent>
                              {bloodTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Account Security */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Security</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">Password *</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showDonorPassword ? "text" : "password"}
                              value={donorForm.password}
                              onChange={(e) => handleDonorInputChange('password', e.target.value)}
                              placeholder="Create a strong password"
                              className="pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowDonorPassword(!showDonorPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showDonorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {donorForm.password && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor(donorForm.password)}`}
                                    style={{ width: donorForm.password.length >= 8 ? (validatePasswordStrength(donorForm.password) ? '100%' : '75%') : '25%' }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600">{getPasswordStrengthText(donorForm.password)}</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Must include: 8+ characters, uppercase, lowercase, number, and symbol
                              </p>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirm Password *</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showDonorConfirmPassword ? "text" : "password"}
                              value={donorForm.confirmPassword}
                              onChange={(e) => handleDonorInputChange('confirmPassword', e.target.value)}
                              placeholder="Confirm your password"
                              className="pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowDonorConfirmPassword(!showDonorConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showDonorConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {donorForm.confirmPassword && (
                            <div className="mt-2">
                              {donorForm.password === donorForm.confirmPassword ? (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Passwords match
                                </p>
                              ) : (
                                <p className="text-xs text-red-600">
                                  Passwords do not match
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={donorForm.city}
                            onChange={(e) => handleDonorInputChange('city', e.target.value)}
                            placeholder="New York"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={donorForm.state}
                            onChange={(e) => handleDonorInputChange('state', e.target.value)}
                            placeholder="NY"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-4 border-t pt-6">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="agreedToTerms"
                          checked={donorForm.agreedToTerms}
                          onCheckedChange={(checked) => handleDonorInputChange('agreedToTerms', checked)}
                        />
                        <Label htmlFor="agreedToTerms" className="text-sm leading-relaxed">
                          I agree to the <a href="#" className="text-red-600 hover:underline">Terms of Service</a> and understand the blood donation process. *
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="agreedToPrivacy"
                          checked={donorForm.agreedToPrivacy}
                          onCheckedChange={(checked) => handleDonorInputChange('agreedToPrivacy', checked)}
                        />
                        <Label htmlFor="agreedToPrivacy" className="text-sm leading-relaxed">
                          I agree to the <a href="#" className="text-red-600 hover:underline">Privacy Policy</a> and consent to HIPAA-compliant data processing. *
                        </Label>
                      </div>
                    </div>

                    <Button 
                      type="button"
                      onClick={() => handleSubmit('donor')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
                      disabled={!validateDonorForm() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5 mr-2" />
                          Register as Donor
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Patient/Clinic Registration Form */}
                <TabsContent value="patient" className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Patient/Clinic Registration</h3>
                        <p className="text-sm text-blue-700">
                          Quick registration to access our blood donation network. Complete organizational details and verification will follow.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form className="space-y-6">
                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    {/* Organization Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Organization Information</h3>
                      
                      <div>
                        <Label htmlFor="organizationType">Organization Type *</Label>
                        <Select 
                          value={patientForm.organizationType} 
                          onValueChange={(value) => handlePatientInputChange('organizationType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hospital">Hospital</SelectItem>
                            <SelectItem value="clinic">Medical Clinic</SelectItem>
                            <SelectItem value="blood-bank">Blood Bank</SelectItem>
                            <SelectItem value="research">Research Institution</SelectItem>
                            <SelectItem value="emergency">Emergency Services</SelectItem>
                            <SelectItem value="individual">Individual Patient</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="organizationName">Organization Name *</Label>
                        <Input
                          id="organizationName"
                          value={patientForm.organizationName}
                          onChange={(e) => handlePatientInputChange('organizationName', e.target.value)}
                          placeholder="City General Hospital"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="contactPersonName">Contact Person *</Label>
                        <Input
                          id="contactPersonName"
                          value={patientForm.contactPersonName}
                          onChange={(e) => handlePatientInputChange('contactPersonName', e.target.value)}
                          placeholder="Dr. Jane Smith"
                          required
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="orgEmail">Email Address *</Label>
                          <Input
                            id="orgEmail"
                            type="email"
                            value={patientForm.email}
                            onChange={(e) => handlePatientInputChange('email', e.target.value)}
                            placeholder="contact@hospital.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="orgPhone">Phone Number *</Label>
                          <Input
                            id="orgPhone"
                            type="tel"
                            value={patientForm.phone}
                            onChange={(e) => handlePatientInputChange('phone', e.target.value)}
                            placeholder="(555) 123-4567"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Account Security */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Security</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="patientPassword">Password *</Label>
                          <div className="relative">
                            <Input
                              id="patientPassword"
                              type={showPatientPassword ? "text" : "password"}
                              value={patientForm.password}
                              onChange={(e) => handlePatientInputChange('password', e.target.value)}
                              placeholder="Create a strong password"
                              className="pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPatientPassword(!showPatientPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPatientPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {patientForm.password && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor(patientForm.password)}`}
                                    style={{ width: patientForm.password.length >= 8 ? (validatePasswordStrength(patientForm.password) ? '100%' : '75%') : '25%' }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600">{getPasswordStrengthText(patientForm.password)}</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Must include: 8+ characters, uppercase, lowercase, number, and symbol
                              </p>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="patientConfirmPassword">Confirm Password *</Label>
                          <div className="relative">
                            <Input
                              id="patientConfirmPassword"
                              type={showPatientConfirmPassword ? "text" : "password"}
                              value={patientForm.confirmPassword}
                              onChange={(e) => handlePatientInputChange('confirmPassword', e.target.value)}
                              placeholder="Confirm your password"
                              className="pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPatientConfirmPassword(!showPatientConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPatientConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {patientForm.confirmPassword && (
                            <div className="mt-2">
                              {patientForm.password === patientForm.confirmPassword ? (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Passwords match
                                </p>
                              ) : (
                                <p className="text-xs text-red-600">
                                  Passwords do not match
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="orgCity">City *</Label>
                          <Input
                            id="orgCity"
                            value={patientForm.city}
                            onChange={(e) => handlePatientInputChange('city', e.target.value)}
                            placeholder="New York"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="orgState">State *</Label>
                          <Input
                            id="orgState"
                            value={patientForm.state}
                            onChange={(e) => handlePatientInputChange('state', e.target.value)}
                            placeholder="NY"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-4 border-t pt-6">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="orgAgreedToTerms"
                          checked={patientForm.agreedToTerms}
                          onCheckedChange={(checked) => handlePatientInputChange('agreedToTerms', checked)}
                        />
                        <Label htmlFor="orgAgreedToTerms" className="text-sm leading-relaxed">
                          I agree to the <a href="#" className="text-red-600 hover:underline">Terms of Service</a> and represent that I have authority to register this organization. *
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="orgAgreedToPrivacy"
                          checked={patientForm.agreedToPrivacy}
                          onCheckedChange={(checked) => handlePatientInputChange('agreedToPrivacy', checked)}
                        />
                        <Label htmlFor="orgAgreedToPrivacy" className="text-sm leading-relaxed">
                          I agree to the <a href="#" className="text-red-600 hover:underline">Privacy Policy</a> and consent to HIPAA-compliant data processing. *
                        </Label>
                      </div>
                    </div>

                    <Button 
                      type="button"
                      onClick={() => handleSubmit('patient')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
                      disabled={!validatePatientForm() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <Building2 className="w-5 h-5 mr-2" />
                          Register Organization
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}