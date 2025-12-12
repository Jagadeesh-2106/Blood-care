import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { auth, profile } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";

interface SignInProps {
  onNavigateToHome: () => void;
  onNavigateToRegister: () => void;
  onSignInSuccess: (role: 'donor' | 'patient' | 'clinic') => void;
}

export function SignIn({ onNavigateToHome, onNavigateToRegister, onSignInSuccess }: SignInProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
    stayLoggedIn: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Sign in with Supabase auth
      const { session } = await auth.signIn(formData.email, formData.password);
      
      if (!session) {
        throw new Error('Failed to create session');
      }

      // Handle stay logged in option
      if (formData.stayLoggedIn) {
        localStorage.setItem('bloodconnect_stay_logged_in', 'true');
        localStorage.setItem('bloodconnect_session_token', session.access_token);
      } else {
        localStorage.removeItem('bloodconnect_stay_logged_in');
        localStorage.removeItem('bloodconnect_session_token');
      }

      // Get user profile to determine role
      const { profile: userProfile } = await profile.get();
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      console.log('Sign-in successful:', userProfile);
      toast.success('Welcome back to BloodConnect!');
      
      onSignInSuccess(userProfile.role);
    } catch (error: any) {
      console.error('Sign-in error:', error);
      
      let errorMessage = 'Sign-in failed. Please try again.';
      
      if (error.message?.includes('Invalid login credentials') || error.message?.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials or create an account if you haven\'t registered yet.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many sign-in attempts. Please wait a moment before trying again.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidForm = formData.email && formData.password;

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
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your BloodConnect account to continue saving lives
            </CardDescription>
            
            {/* Demo Account Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-blue-700 text-center font-medium mb-2">
                📱 Try Demo Accounts:
              </p>
              <div className="text-xs text-blue-600 space-y-1">
                <div>👤 <strong>Donor:</strong> donor@demo.com / Demo123!</div>
                <div>🏥 <strong>Patient:</strong> patient@demo.com / Demo123!</div>
                <div>🩺 <strong>Hospital:</strong> hospital@demo.com / Demo123!</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm text-red-600 whitespace-pre-line">{error}</div>
                  {(error.includes('Invalid email or password') || error.includes('Invalid demo credentials')) && (
                    <p className="text-xs text-red-500 mt-2">
                      Don't have an account yet?{' '}
                      <button
                        type="button"
                        onClick={onNavigateToRegister}
                        className="underline hover:no-underline font-medium"
                      >
                        Create one here
                      </button>
                    </p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Stay Logged In & Remember Me Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stayLoggedIn"
                    checked={formData.stayLoggedIn}
                    onCheckedChange={(checked) => handleInputChange('stayLoggedIn', checked)}
                  />
                  <Label htmlFor="stayLoggedIn" className="text-sm">
                    Stay logged in (recommended for personal devices)
                  </Label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange('rememberMe', checked)}
                    />
                    <Label htmlFor="rememberMe" className="text-sm">
                      Remember email
                    </Label>
                  </div>
                  <a 
                    href="#" 
                    className="text-sm text-red-600 hover:text-red-700 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Sign In Button */}
              <Button 
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                disabled={!isValidForm || isSubmitting}
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

            <Separator />

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={onNavigateToRegister}
                  className="text-red-600 hover:text-red-700 hover:underline"
                >
                  Create an account
                </button>
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700 text-center">
                <Lock className="w-3 h-3 inline mr-1" />
                Your data is protected with HIPAA-compliant security measures
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}