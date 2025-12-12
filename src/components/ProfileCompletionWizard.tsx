import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Heart, 
  User, 
  MapPin, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Activity,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProfileCompletionWizardProps {
  onComplete: (profileData: any) => void;
  onSkip?: () => void;
  userEmail: string;
  existingData?: any;
}

type WizardStep = 'personal' | 'medical' | 'preferences' | 'eligibility' | 'complete';

interface MedicalEligibilityQuestion {
  id: string;
  question: string;
  type: 'boolean' | 'select' | 'number';
  options?: string[];
  disqualifying?: boolean;
  category: 'basic' | 'medical' | 'lifestyle' | 'travel';
}

const eligibilityQuestions: MedicalEligibilityQuestion[] = [
  // Basic Health Questions
  {
    id: 'age',
    question: 'What is your current age?',
    type: 'number',
    disqualifying: false,
    category: 'basic'
  },
  {
    id: 'weight',
    question: 'What is your current weight (in kg)?',
    type: 'number',
    disqualifying: false,
    category: 'basic'
  },
  {
    id: 'feelingWell',
    question: 'Are you feeling well and in good health today?',
    type: 'boolean',
    disqualifying: true,
    category: 'basic'
  },
  
  // Medical History
  {
    id: 'chronicConditions',
    question: 'Do you have any chronic medical conditions?',
    type: 'select',
    options: ['None', 'Diabetes', 'Heart Disease', 'High Blood Pressure', 'Other'],
    disqualifying: false,
    category: 'medical'
  },
  {
    id: 'currentMedications',
    question: 'Are you currently taking any medications?',
    type: 'boolean',
    disqualifying: false,
    category: 'medical'
  },
  {
    id: 'bloodTransfusion',
    question: 'Have you received a blood transfusion in the last 12 months?',
    type: 'boolean',
    disqualifying: true,
    category: 'medical'
  },
  {
    id: 'surgery',
    question: 'Have you had any surgery in the last 6 months?',
    type: 'boolean',
    disqualifying: true,
    category: 'medical'
  },
  {
    id: 'pregnancy',
    question: 'Are you currently pregnant or have given birth in the last 6 months?',
    type: 'boolean',
    disqualifying: true,
    category: 'medical'
  },
  
  // Lifestyle
  {
    id: 'alcohol',
    question: 'Have you consumed alcohol in the last 24 hours?',
    type: 'boolean',
    disqualifying: true,
    category: 'lifestyle'
  },
  {
    id: 'smoking',
    question: 'Do you smoke tobacco?',
    type: 'select',
    options: ['Never', 'Former smoker', 'Current smoker'],
    disqualifying: false,
    category: 'lifestyle'
  },
  {
    id: 'lastDonation',
    question: 'When did you last donate blood?',
    type: 'select',
    options: ['Never donated', 'More than 3 months ago', '1-3 months ago', 'Less than 1 month ago'],
    disqualifying: false,
    category: 'lifestyle'
  },
  
  // Travel History
  {
    id: 'recentTravel',
    question: 'Have you traveled outside India in the last 6 months?',
    type: 'boolean',
    disqualifying: false,
    category: 'travel'
  }
];

export function ProfileCompletionWizard({ 
  onComplete, 
  onSkip, 
  userEmail, 
  existingData 
}: ProfileCompletionWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [personalInfo, setPersonalInfo] = useState({
    emergencyContact: existingData?.emergencyContact || '',
    emergencyPhone: existingData?.emergencyPhone || '',
    occupation: existingData?.occupation || '',
    address: existingData?.address || '',
    pincode: existingData?.pincode || '',
    ...existingData?.personalInfo
  });

  const [medicalInfo, setMedicalInfo] = useState({
    allergies: existingData?.allergies || '',
    medicalConditions: existingData?.medicalConditions || '',
    currentMedications: existingData?.currentMedications || '',
    lastCheckup: existingData?.lastCheckup || '',
    ...existingData?.medicalInfo
  });

  const [preferences, setPreferences] = useState({
    donorType: existingData?.donorType || '',
    availabilityDays: existingData?.availabilityDays || [],
    preferredTime: existingData?.preferredTime || '',
    maxTravelDistance: existingData?.maxTravelDistance || '10',
    notificationPreferences: existingData?.notificationPreferences || {
      email: true,
      sms: true,
      push: true
    },
    ...existingData?.preferences
  });

  const [eligibilityAnswers, setEligibilityAnswers] = useState<Record<string, any>>(
    existingData?.eligibilityAnswers || {}
  );

  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean;
    warnings: string[];
    disqualifications: string[];
  } | null>(null);

  // Calculate progress
  const getProgress = () => {
    const steps = ['personal', 'medical', 'preferences', 'eligibility', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // Navigation handlers
  const handleNext = () => {
    const steps: WizardStep[] = ['personal', 'medical', 'preferences', 'eligibility', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: WizardStep[] = ['personal', 'medical', 'preferences', 'eligibility', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Eligibility checker
  const checkEligibility = () => {
    const warnings: string[] = [];
    const disqualifications: string[] = [];
    let eligible = true;

    // Age check
    const age = parseInt(eligibilityAnswers.age) || 0;
    if (age < 18) {
      disqualifications.push('Must be at least 18 years old to donate blood');
      eligible = false;
    } else if (age > 65) {
      disqualifications.push('Blood donation not recommended for individuals over 65');
      eligible = false;
    }

    // Weight check
    const weight = parseInt(eligibilityAnswers.weight) || 0;
    if (weight < 50) {
      disqualifications.push('Minimum weight requirement is 50kg for blood donation');
      eligible = false;
    }

    // Health status
    if (eligibilityAnswers.feelingWell === false) {
      disqualifications.push('Must be in good health to donate blood');
      eligible = false;
    }

    // Recent transfusion
    if (eligibilityAnswers.bloodTransfusion === true) {
      disqualifications.push('Cannot donate within 12 months of receiving blood transfusion');
      eligible = false;
    }

    // Recent surgery
    if (eligibilityAnswers.surgery === true) {
      disqualifications.push('Cannot donate within 6 months of major surgery');
      eligible = false;
    }

    // Pregnancy
    if (eligibilityAnswers.pregnancy === true) {
      disqualifications.push('Cannot donate during pregnancy or within 6 months of childbirth');
      eligible = false;
    }

    // Alcohol consumption
    if (eligibilityAnswers.alcohol === true) {
      disqualifications.push('Cannot donate within 24 hours of alcohol consumption');
      eligible = false;
    }

    // Recent donation
    if (eligibilityAnswers.lastDonation === 'Less than 1 month ago') {
      disqualifications.push('Must wait at least 3 months between donations');
      eligible = false;
    } else if (eligibilityAnswers.lastDonation === '1-3 months ago') {
      warnings.push('Ensure at least 3 months have passed since your last donation');
    }

    // Medical conditions - warnings
    if (eligibilityAnswers.chronicConditions && eligibilityAnswers.chronicConditions !== 'None') {
      warnings.push('Please consult with medical staff about your chronic condition before donating');
    }

    // Smoking
    if (eligibilityAnswers.smoking === 'Current smoker') {
      warnings.push('Consider avoiding smoking for at least 2 hours before donation');
    }

    // Travel
    if (eligibilityAnswers.recentTravel === true) {
      warnings.push('Recent international travel may affect eligibility - please inform medical staff');
    }

    const result = { eligible, warnings, disqualifications };
    setEligibilityResult(result);
    return result;
  };

  // Complete profile
  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      const profileData = {
        personalInfo,
        medicalInfo,
        preferences,
        eligibilityAnswers,
        eligibilityResult,
        completedAt: new Date().toISOString(),
        email: userEmail
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Profile completion data:', profileData);
      toast.success('Profile completed successfully!');
      
      onComplete(profileData);
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
              <p className="text-gray-600">Help us keep your information up to date and secure</p>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={personalInfo.emergencyContact}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="Full name of emergency contact"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={personalInfo.emergencyPhone}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={personalInfo.occupation}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, occupation: e.target.value }))}
                  placeholder="Your current occupation"
                />
              </div>

              <div>
                <Label htmlFor="address">Complete Address</Label>
                <Input
                  id="address"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address, area, city"
                />
              </div>

              <div>
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  value={personalInfo.pincode}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, pincode: e.target.value }))}
                  placeholder="6-digit PIN code"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        );

      case 'medical':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Activity className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Medical Information</h3>
              <p className="text-gray-600">This information helps ensure safe blood donation</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="allergies">Known Allergies</Label>
                <Input
                  id="allergies"
                  value={medicalInfo.allergies}
                  onChange={(e) => setMedicalInfo(prev => ({ ...prev, allergies: e.target.value }))}
                  placeholder="List any known allergies (or 'None')"
                />
              </div>

              <div>
                <Label htmlFor="medicalConditions">Current Medical Conditions</Label>
                <Input
                  id="medicalConditions"
                  value={medicalInfo.medicalConditions}
                  onChange={(e) => setMedicalInfo(prev => ({ ...prev, medicalConditions: e.target.value }))}
                  placeholder="Any ongoing medical conditions (or 'None')"
                />
              </div>

              <div>
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Input
                  id="currentMedications"
                  value={medicalInfo.currentMedications}
                  onChange={(e) => setMedicalInfo(prev => ({ ...prev, currentMedications: e.target.value }))}
                  placeholder="List current medications (or 'None')"
                />
              </div>

              <div>
                <Label htmlFor="lastCheckup">Last Medical Checkup</Label>
                <Input
                  id="lastCheckup"
                  type="date"
                  value={medicalInfo.lastCheckup}
                  onChange={(e) => setMedicalInfo(prev => ({ ...prev, lastCheckup: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Donation Preferences</h3>
              <p className="text-gray-600">Set your availability and preferences for blood donation</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>What type of donor would you like to be?</Label>
                <RadioGroup 
                  value={preferences.donorType} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, donorType: value }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="regular" />
                    <Label htmlFor="regular">Regular Donor - Available for routine donations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="emergency" id="emergency" />
                    <Label htmlFor="emergency">Emergency Donor - Available for urgent requests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Both - Available for regular and emergency donations</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Preferred donation time</Label>
                <Select value={preferences.preferredTime} onValueChange={(value) => setPreferences(prev => ({ ...prev, preferredTime: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select preferred time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                    <SelectItem value="evening">Evening (4 PM - 7 PM)</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Maximum travel distance (km)</Label>
                <Select value={preferences.maxTravelDistance} onValueChange={(value) => setPreferences(prev => ({ ...prev, maxTravelDistance: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Within 5 km</SelectItem>
                    <SelectItem value="10">Within 10 km</SelectItem>
                    <SelectItem value="20">Within 20 km</SelectItem>
                    <SelectItem value="50">Within 50 km</SelectItem>
                    <SelectItem value="any">Any distance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold">Notification Preferences</Label>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailNotif"
                      checked={preferences.notificationPreferences.email}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({
                          ...prev,
                          notificationPreferences: { ...prev.notificationPreferences, email: !!checked }
                        }))
                      }
                    />
                    <Label htmlFor="emailNotif" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email notifications
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smsNotif"
                      checked={preferences.notificationPreferences.sms}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({
                          ...prev,
                          notificationPreferences: { ...prev.notificationPreferences, sms: !!checked }
                        }))
                      }
                    />
                    <Label htmlFor="smsNotif" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      SMS notifications
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'eligibility':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Medical Eligibility Assessment</h3>
              <p className="text-gray-600">Please answer these questions honestly to ensure safe donation</p>
            </div>

            <div className="space-y-6">
              {eligibilityQuestions.map((question, index) => (
                <div key={question.id} className="p-4 border rounded-lg">
                  <Label className="text-sm font-medium text-gray-900 mb-3 block">
                    {index + 1}. {question.question}
                  </Label>
                  
                  {question.type === 'boolean' && (
                    <RadioGroup 
                      value={eligibilityAnswers[question.id]?.toString()} 
                      onValueChange={(value) => 
                        setEligibilityAnswers(prev => ({ ...prev, [question.id]: value === 'true' }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`${question.id}-yes`} />
                        <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`${question.id}-no`} />
                        <Label htmlFor={`${question.id}-no`}>No</Label>
                      </div>
                    </RadioGroup>
                  )}
                  
                  {question.type === 'select' && question.options && (
                    <Select 
                      value={eligibilityAnswers[question.id]} 
                      onValueChange={(value) => 
                        setEligibilityAnswers(prev => ({ ...prev, [question.id]: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {question.type === 'number' && (
                    <Input
                      type="number"
                      value={eligibilityAnswers[question.id] || ''}
                      onChange={(e) => 
                        setEligibilityAnswers(prev => ({ ...prev, [question.id]: e.target.value }))
                      }
                      placeholder="Enter a number"
                    />
                  )}
                </div>
              ))}
              
              <Button 
                onClick={checkEligibility}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                Check Eligibility
              </Button>

              {eligibilityResult && (
                <div className="space-y-4">
                  {eligibilityResult.eligible ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Congratulations!</strong> You appear to be eligible for blood donation.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        <strong>Not eligible at this time.</strong> Please address the issues below before donating.
                      </AlertDescription>
                    </Alert>
                  )}

                  {eligibilityResult.disqualifications.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Disqualifying Factors:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                        {eligibilityResult.disqualifications.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {eligibilityResult.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                        {eligibilityResult.warnings.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Profile Complete!</h3>
              <p className="text-gray-600">
                Thank you for completing your profile. You're now ready to start saving lives through blood donation.
              </p>
            </div>

            {eligibilityResult && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Your Eligibility Status:</h4>
                {eligibilityResult.eligible ? (
                  <div className="text-green-600">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Eligible for Blood Donation</p>
                    <p className="text-sm text-gray-600 mt-2">
                      You can now respond to blood requests and schedule donations.
                    </p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Not Currently Eligible</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Please address the eligibility requirements and update your profile when ready.
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={handleComplete}
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Completing Profile...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Complete Profile & Start Saving Lives
                </>
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Help us create the best blood donation experience for you
            </CardDescription>
            
            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(getProgress())}% complete</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {renderStepContent()}
            
            {/* Navigation buttons */}
            <div className="flex justify-between pt-6 border-t">
              <div>
                {currentStep !== 'personal' && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex gap-3">
                {onSkip && currentStep !== 'complete' && (
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="text-gray-600"
                  >
                    Skip for now
                  </Button>
                )}
                
                {currentStep !== 'complete' && (
                  <Button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    disabled={currentStep === 'eligibility' && !eligibilityResult}
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}