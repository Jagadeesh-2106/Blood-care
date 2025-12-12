import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { EmailVerification } from './EmailVerification';
import { 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  CheckCircle,
  KeyRound
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PasswordResetProps {
  onNavigateBack: () => void;
  onResetComplete: () => void;
}

type ResetStep = 'email' | 'verification' | 'new-password' | 'success';

export function PasswordReset({ onNavigateBack, onResetComplete }: PasswordResetProps) {
  const [currentStep, setCurrentStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation functions
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

  // Step 1: Email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate checking if email exists
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, check if email exists in your system
      // const emailExists = await auth.checkEmailExists(email);
      
      console.log(`🔍 Password reset requested for: ${email}`);
      setCurrentStep('verification');
      
    } catch (error: any) {
      console.error('Email check error:', error);
      setError('Unable to process your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Email verification success
  const handleVerificationSuccess = () => {
    console.log('✅ Email verification successful, proceeding to password reset');
    setCurrentStep('new-password');
  };

  // Step 3: New password submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!validatePasswordStrength(newPassword)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, number, and special character.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate password reset API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, update password in your backend
      // await auth.updatePassword(email, newPassword, resetToken);
      
      console.log('🔒 Password updated successfully');
      toast.success('Password updated successfully!');
      setCurrentStep('success');
      
    } catch (error: any) {
      console.error('Password update error:', error);
      setError('Failed to update password. Please try again.');
      toast.error('Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email input step
  if (currentStep === 'email') {
    return (
      <section className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={onNavigateBack}
              className="text-gray-600 hover:text-gray-900 p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </div>

          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Reset Your Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a verification code to reset your password.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    We'll send a verification code to this email address.
                  </p>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                  disabled={!email || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 text-center">
                  💡 <strong>Demo Mode:</strong> Any valid email format will work for testing
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Email verification step
  if (currentStep === 'verification') {
    return (
      <EmailVerification
        email={email}
        onVerificationSuccess={handleVerificationSuccess}
        onNavigateBack={() => setCurrentStep('email')}
        userType="forgot-password"
        title="Verify Your Email"
        description="Please enter the verification code we sent to your email to proceed with password reset."
      />
    );
  }

  // New password step
  if (currentStep === 'new-password') {
    return (
      <section className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Create New Password</CardTitle>
              <CardDescription>
                Choose a strong password for your BloodConnect account.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor(newPassword)}`}
                            style={{ width: newPassword.length >= 8 ? (validatePasswordStrength(newPassword) ? '100%' : '75%') : '25%' }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{getPasswordStrengthText(newPassword)}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Must include: 8+ characters, uppercase, lowercase, number, and symbol
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <div className="mt-2">
                      {newPassword === confirmPassword ? (
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

                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                  disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || !validatePasswordStrength(newPassword) || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Success step
  if (currentStep === 'success') {
    return (
      <section className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Password Updated!</CardTitle>
              <CardDescription>
                Your password has been successfully updated. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Security Update Complete</h3>
                    <p className="text-sm text-green-700">
                      Your account is now secured with your new password.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={onResetComplete}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                <Heart className="w-4 h-4 mr-2" />
                Continue to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return null;
}