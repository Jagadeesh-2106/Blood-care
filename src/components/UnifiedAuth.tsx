import { useState, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, User, Phone, Settings } from "lucide-react";
import { PasswordReset } from "./PasswordReset";
import { ConnectivityDiagnostic } from "./ConnectivityDiagnostic";
import { auth } from "../utils/supabase/client";
import { toast } from "sonner";

interface UnifiedAuthProps {
  onNavigateToHome: () => void;
  onAuthSuccess: () => void;
}

type AuthStep = 'main' | 'password-reset' | 'connectivity-diagnostic';

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
];

export function UnifiedAuth({ onNavigateToHome, onAuthSuccess }: UnifiedAuthProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>('main');
  const [activeTab, setActiveTab] = useState("signin");
  // Removed pendingRegistrationData as email verification is no longer needed
  
  // Sign In Form
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
    stayLoggedIn: false
  });
  
  // Registration Form
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
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

  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoSuggestion, setShowDemoSuggestion] = useState(false);

  const handleSignInInputChange = (field: string, value: any) => {
    setSignInForm(prev => ({ ...prev, [field]: value }));
  };

  const formatIndianPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 91, format it properly
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    
    // If it's a 10-digit number, add +91
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    
    // If it starts with +91, format it properly
    if (phone.startsWith('+91')) {
      const digits = cleaned.slice(2); // Remove 91 prefix
      if (digits.length === 10) {
        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
      }
    }
    
    return phone; // Return as-is if doesn't match expected formats
  };

  const validateIndianPhoneNumber = (phone: string): boolean => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid 10-digit Indian mobile number
    if (cleaned.length === 10) {
      // Indian mobile numbers start with 6, 7, 8, or 9
      return /^[6-9]\d{9}$/.test(cleaned);
    }
    
    // Check if it's +91 followed by valid 10-digit number
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      const mobile = cleaned.slice(2);
      return /^[6-9]\d{9}$/.test(mobile);
    }
    
    return false;
  };

  const validateAge = (dateOfBirth: string): { isValid: boolean; age: number; message?: string } => {
    if (!dateOfBirth) return { isValid: false, age: 0, message: "Date of birth is required" };
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) 
      ? age - 1 
      : age;
    
    if (actualAge < 18) {
      return { isValid: false, age: actualAge, message: "You must be at least 18 years old to register" };
    }
    
    if (actualAge > 65) {
      return { isValid: true, age: actualAge, message: "Please consult with a doctor before donating blood (age 65+)" };
    }
    
    return { isValid: true, age: actualAge };
  };

  const handleRegisterInputChange = (field: string, value: any) => {
    let formattedValue = value;
    
    // Format phone number for Indian standards
    if (field === 'phone') {
      formattedValue = formatIndianPhoneNumber(value);
    }
    
    setRegisterForm(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear any existing error when user starts typing
    if (error && (field === 'email' || field === 'phone')) {
      setError(null);
    }
  };

  const validatePasswordStrength = (password: string): boolean => {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*(),.?\":{}|<>]/.test(password);
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

  const validateRegisterForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check required fields
    const required = ['fullName', 'email', 'phone', 'dateOfBirth', 'bloodType', 'city', 'state', 'password', 'confirmPassword'];
    const missingFields = required.filter(field => !registerForm[field as keyof typeof registerForm]);
    
    if (missingFields.length > 0) {
      errors.push(`Please fill in all required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (registerForm.email && !emailRegex.test(registerForm.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Check for demo emails
    if (['donor@demo.com', 'patient@demo.com', 'hospital@demo.com'].includes(registerForm.email)) {
      errors.push('This email is reserved for demo accounts');
    }
    
    // Validate phone number
    if (registerForm.phone && !validateIndianPhoneNumber(registerForm.phone)) {
      errors.push('Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)');
    }
    
    // Validate age
    if (registerForm.dateOfBirth) {
      const ageValidation = validateAge(registerForm.dateOfBirth);
      if (!ageValidation.isValid) {
        errors.push(ageValidation.message || 'Invalid age');
      }
    }
    
    // Validate passwords
    if (registerForm.password !== registerForm.confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    if (registerForm.password && !validatePasswordStrength(registerForm.password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }
    
    // Check agreements
    if (!registerForm.agreedToTerms) {
      errors.push('Please agree to the Terms of Service');
    }
    
    if (!registerForm.agreedToPrivacy) {
      errors.push('Please agree to the Privacy Policy');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleForgotPassword = () => {
    setCurrentStep('password-reset');
  };

  const handleDemoAccountSelect = (email: string, userType: string) => {
    setError(null); // Clear any existing errors
    setShowDemoSuggestion(false); // Clear demo suggestion
    handleSignInInputChange('email', email);
    handleSignInInputChange('password', 'Demo123!');
    setActiveTab('signin');
    toast.success(`${userType} demo account loaded! Click Sign In to continue offline.`, { 
      duration: 3000 
    });
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Sign in with auth service (handles demo mode automatically)
      const result = await auth.signIn(signInForm.email, signInForm.password);
      
      // Check if the result suggests demo mode instead of throwing an error
      if (result && typeof result === 'object' && 'requiresDemoMode' in result) {
        console.log('🔧 Server unavailable, showing demo mode suggestion');
        setError(null); // Clear error state
        setShowDemoSuggestion(true);
        
        toast.info(result.message, {
          duration: 6000,
          action: {
            label: 'Try Demo',
            onClick: () => {
              handleDemoAccountSelect('donor@demo.com', 'Blood Donor');
              setShowDemoSuggestion(false);
            }
          }
        });
        
        setIsSubmitting(false);
        return;
      }
      
      const { session } = result;
      
      if (!session) {
        throw new Error('Failed to create session');
      }

      // Handle stay logged in option (only for real accounts, not demo)
      const isDemoAccount = signInForm.email.includes('@demo.com');
      if (signInForm.stayLoggedIn && !isDemoAccount) {
        localStorage.setItem('bloodconnect_stay_logged_in', 'true');
        localStorage.setItem('bloodconnect_session_token', session.access_token);
      } else {
        localStorage.removeItem('bloodconnect_stay_logged_in');
        localStorage.removeItem('bloodconnect_session_token');
      }

      console.log('Sign-in successful');
      
      if (isDemoAccount) {
        toast.success('Welcome to BloodConnect Demo!');
      } else {
        toast.success('Welcome back to BloodConnect!');
      }
      
      onAuthSuccess();
    } catch (error: any) {
      console.error('Sign-in error:', error);
      
      // Only show actual credential errors, not connectivity errors
      if (error.message?.includes('Invalid email or password') ||
          error.message?.includes('Incorrect password for demo') ||
          error.message?.includes('Email not verified')) {
        setError(error.message);
        
        if (error.message?.includes('Incorrect password for demo')) {
          toast.error('Demo account password is: Demo123!', {
            duration: 4000
          });
        } else {
          toast.error(error.message);
        }
      } else {
        // For any other errors, suggest demo mode gracefully
        console.log('🔧 Connectivity error, suggesting demo mode');
        toast.info('Servers are currently unavailable. Would you like to try our demo accounts?', {
          duration: 6000,
          action: {
            label: 'Try Demo',
            onClick: () => {
              handleDemoAccountSelect('donor@demo.com', 'Blood Donor');
            }
          }
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Validate form before submission
    const validation = validateRegisterForm();
    if (!validation.isValid) {
      setError(validation.errors.join('\n'));
      setIsSubmitting(false);
      toast.error('Please fix the errors and try again');
      return;
    }
    
    try {
      // Clean phone number for storage
      const cleanPhone = registerForm.phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;
      
      // Calculate age for additional validation
      const ageValidation = validateAge(registerForm.dateOfBirth);
      
      // Prepare user data - no role assignment during registration
      const userData = {
        email: registerForm.email.toLowerCase().trim(),
        password: registerForm.password,
        fullName: registerForm.fullName.trim(),
        role: 'user', // Generic role - user can choose later
        phoneNumber: formattedPhone,
        location: `${registerForm.city.trim()}, ${registerForm.state}`,
        bloodType: registerForm.bloodType,
        dateOfBirth: registerForm.dateOfBirth,
        age: ageValidation.age,
        city: registerForm.city.trim(),
        state: registerForm.state,
        country: 'India'
      };

      // Skip email verification - directly register the user
      console.log('Creating account with Indian standards validation');
      
      // Call our custom signup endpoint directly
      const result = await auth.signUp(
        userData.email, 
        userData.password, 
        userData
      );
      
      console.log('Registration successful:', result);
      
      // Show age-specific success message
      if (ageValidation.age >= 65) {
        toast.success('Registration successful! Please consult with a doctor before donating blood.', {
          duration: 6000
        });
      } else {
        toast.success('Registration successful! Welcome to BloodConnect.');
      }
      
      setSubmitSuccess(true);
      
      // Auto-redirect after success message
      setTimeout(() => {
        onAuthSuccess();
      }, 2000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message?.includes('User already registered') || 
          error.message?.includes('already been registered') ||
          error.message?.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please use the Sign In tab instead.';
        setActiveTab('signin'); // Automatically switch to sign in tab
      } else if (error.message?.includes('reserved for demo')) {
        errorMessage = error.message; // Use the specific demo account error message
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special characters.';
      } else if (error.message?.includes('Network connection failed') ||
                 error.message?.includes('Network') ||
                 error.message?.includes('timeout') ||
                 error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message; // Use the specific error message from auth service
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // handleEmailVerificationSuccess removed as email verification is no longer needed

  const handlePasswordResetComplete = () => {
    setCurrentStep('main');
    setActiveTab('signin');
    toast.success('You can now sign in with your new password!');
  };

  const isValidSignIn = signInForm.email && signInForm.password;

  // Email verification step - removed as per request

  // Password reset step
  if (currentStep === 'password-reset') {
    return (
      <PasswordReset
        onNavigateBack={() => setCurrentStep('main')}
        onResetComplete={handlePasswordResetComplete}
      />
    );
  }

  // Connectivity diagnostic step
  if (currentStep === 'connectivity-diagnostic') {
    return (
      <section className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep('main')}
              className="text-gray-600 hover:text-gray-900 p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Authentication
            </Button>
          </div>
          <ConnectivityDiagnostic onClose={() => setCurrentStep('main')} />
        </div>
      </section>
    );
  }

  if (submitSuccess) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BloodConnect!</h2>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. You can now start saving lives by donating blood or requesting blood for those in need.
            </p>
            <Button 
              onClick={onAuthSuccess}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
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

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Join BloodConnect</CardTitle>
            <CardDescription>
              One platform to donate blood and help save lives in your community
            </CardDescription>
            
            {/* Demo Account Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-sm text-blue-700 font-medium">
                  🚀 Try Demo Accounts (No Internet Required)
                </p>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleDemoAccountSelect('donor@demo.com', 'Blood Donor')}
                  className="w-full text-left p-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-xs text-blue-700">
                    <strong>🩸 Blood Donor:</strong> donor@demo.com
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoAccountSelect('patient@demo.com', 'Blood Recipient')}
                  className="w-full text-left p-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-xs text-blue-700">
                    <strong>🏥 Blood Recipient:</strong> patient@demo.com
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoAccountSelect('hospital@demo.com', 'Healthcare Provider')}
                  className="w-full text-left p-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-xs text-blue-700">
                    <strong>🩺 Healthcare Provider:</strong> hospital@demo.com
                  </div>
                </button>
                <div className="text-center mt-2">
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Password: Demo123!
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="flex items-center justify-center gap-2 py-3">
                  <User className="w-4 h-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center justify-center gap-2 py-3">
                  <Heart className="w-4 h-4" />
                  Register
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-sm text-red-600 whitespace-pre-line leading-relaxed">{error}</div>
                      {(error.includes('Invalid email or password') || error.includes('Incorrect password for demo')) && (
                        <p className="text-xs text-red-500 mt-3 pt-2 border-t border-red-200">
                          Don't have an account yet?{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('register')}
                            className="underline hover:no-underline font-medium"
                          >
                            Create one here
                          </button>
                        </p>
                      )}
                      {(error.includes('Cannot connect') || 
                        error.includes('Connection issue') ||
                        error.includes('Unable to connect') ||
                        error.includes('offline') ||
                        error.includes('Network unavailable')) && (
                        <div className="mt-3 pt-2 border-t border-red-200 space-y-2">
                          <p className="text-xs text-blue-600 mb-1">
                            💡 <strong>Try Demo Accounts:</strong> Click any demo account above to sign in offline
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentStep('connectivity-diagnostic')}
                            className="w-full text-xs"
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Run Connection Diagnostic
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        value={signInForm.email}
                        onChange={(e) => handleSignInInputChange('email', e.target.value)}
                        placeholder="        your.email@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="signin-password"
                        type={showSignInPassword ? "text" : "password"}
                        value={signInForm.password}
                        onChange={(e) => handleSignInInputChange('password', e.target.value)}
                        placeholder="        Enter your password"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Stay Logged In & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="stayLoggedIn"
                        checked={signInForm.stayLoggedIn}
                        onCheckedChange={(checked) => handleSignInInputChange('stayLoggedIn', checked)}
                      />
                      <Label htmlFor="stayLoggedIn" className="text-sm">
                        Stay logged in
                      </Label>
                    </div>
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-red-600 hover:text-red-700 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <Button 
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                    disabled={!isValidSignIn || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Quick Registration</h3>
                      <p className="text-sm text-blue-700">
                        Create your account instantly and start saving lives by donating or requesting blood in your community.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
                      {(error.includes('already exists') || error.includes('already registered')) && (
                        <div className="mt-3 pt-2 border-t border-red-200">
                          <p className="text-xs text-blue-600">
                            💡 <strong>Already have an account?</strong> Use the Sign In tab above to access your existing account.
                          </p>
                        </div>
                      )}
                      {error.includes('reserved for demo') && (
                        <div className="mt-3 pt-2 border-t border-red-200">
                          <p className="text-xs text-blue-600">
                            💡 <strong>Demo Account:</strong> Use the Sign In tab and enter the password "Demo123!" to access the demo account.
                          </p>
                        </div>
                      )}
                      {(error.includes('Network connection failed') || 
                        error.includes('check your internet connection') ||
                        error.includes('Unable to connect')) && (
                        <div className="mt-3 pt-2 border-t border-red-200">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentStep('connectivity-diagnostic')}
                            className="w-full text-xs"
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Diagnose Connection Issues
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                    
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={registerForm.fullName}
                        onChange={(e) => handleRegisterInputChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="register-email">Email Address *</Label>
                        <Input
                          id="register-email"
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                          required
                        />
                        {['donor@demo.com', 'patient@demo.com', 'hospital@demo.com'].includes(registerForm.email) && (
                          <div className="mt-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                            ⚠️ This is a demo account. Use Sign In tab with password "Demo123!" instead.
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Mobile Number *</Label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            value={registerForm.phone}
                            onChange={(e) => handleRegisterInputChange('phone', e.target.value)}
                            placeholder="+91 98765 43210"
                            className="pl-10"
                            required
                          />
                        </div>
                        {registerForm.phone && !validateIndianPhoneNumber(registerForm.phone) && (
                          <div className="mt-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                            Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)
                          </div>
                        )}
                        {registerForm.phone && validateIndianPhoneNumber(registerForm.phone) && (
                          <div className="mt-1 text-xs text-green-600 bg-green-50 border border-green-200 rounded px-2 py-1">
                            ✓ Valid Indian mobile number
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={registerForm.dateOfBirth}
                          onChange={(e) => handleRegisterInputChange('dateOfBirth', e.target.value)}
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                          min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                          required
                        />
                        {registerForm.dateOfBirth && (() => {
                          const ageValidation = validateAge(registerForm.dateOfBirth);
                          if (!ageValidation.isValid) {
                            return (
                              <div className="mt-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                                {ageValidation.message}
                              </div>
                            );
                          }
                          if (ageValidation.age >= 65) {
                            return (
                              <div className="mt-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                                Age {ageValidation.age}: Please consult with a doctor before donating blood
                              </div>
                            );
                          }
                          return (
                            <div className="mt-1 text-xs text-green-600 bg-green-50 border border-green-200 rounded px-2 py-1">
                              ✓ Age {ageValidation.age}: Eligible for blood donation
                            </div>
                          );
                        })()}
                      </div>
                      <div>
                        <Label htmlFor="bloodType">Blood Type *</Label>
                        <Select value={registerForm.bloodType} onValueChange={(value) => handleRegisterInputChange('bloodType', value)}>
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

                  {/* Location Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={registerForm.city}
                          onChange={(e) => handleRegisterInputChange('city', e.target.value)}
                          placeholder="Mumbai"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Select value={registerForm.state} onValueChange={(value) => handleRegisterInputChange('state', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianStates.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Security</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            id="password"
                            type={showRegisterPassword ? "text" : "password"}
                            value={registerForm.password}
                            onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                            placeholder="Create a strong password"
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {registerForm.password && (
                          <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-600">Password strength</span>
                              <span className={`text-xs ${
                                getPasswordStrengthColor(registerForm.password) === 'bg-green-400' 
                                  ? 'text-green-600' 
                                  : getPasswordStrengthColor(registerForm.password) === 'bg-yellow-400'
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}>
                                {getPasswordStrengthText(registerForm.password)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(registerForm.password)}`}
                                style={{ 
                                  width: registerForm.password.length === 0 
                                    ? '0%' 
                                    : registerForm.password.length < 8 
                                    ? '25%'
                                    : !validatePasswordStrength(registerForm.password)
                                    ? '75%'
                                    : '100%'
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            type={showRegisterConfirmPassword ? "text" : "password"}
                            value={registerForm.confirmPassword}
                            onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                            placeholder="Confirm your password"
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {registerForm.confirmPassword && (
                          <div className="mt-1">
                            {registerForm.password === registerForm.confirmPassword ? (
                              <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-2 py-1">
                                ✓ Passwords match
                              </div>
                            ) : (
                              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                                Passwords do not match
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms and Privacy */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreedToTerms"
                        checked={registerForm.agreedToTerms}
                        onCheckedChange={(checked) => handleRegisterInputChange('agreedToTerms', checked)}
                        className="mt-1"
                      />
                      <Label htmlFor="agreedToTerms" className="text-sm leading-relaxed">
                        I agree to the <button type="button" className="text-red-600 hover:underline">Terms of Service</button> and understand the responsibilities of blood donation/request.
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreedToPrivacy"
                        checked={registerForm.agreedToPrivacy}
                        onCheckedChange={(checked) => handleRegisterInputChange('agreedToPrivacy', checked)}
                        className="mt-1"
                      />
                      <Label htmlFor="agreedToPrivacy" className="text-sm leading-relaxed">
                        I agree to the <button type="button" className="text-red-600 hover:underline">Privacy Policy</button> and consent to my medical information being used for blood matching purposes.
                      </Label>
                    </div>
                  </div>

                  {/* Register Button */}
                  <Button 
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                    disabled={!validateRegisterForm().isValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}