import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { OTPInput } from './OTPInput';
import { 
  Heart, 
  Mail, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  ArrowLeft,
  Shield
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onNavigateBack: () => void;
  userType: 'new-user' | 'forgot-password';
  title?: string;
  description?: string;
}

export function EmailVerification({ 
  email, 
  onVerificationSuccess, 
  onNavigateBack,
  userType,
  title,
  description
}: EmailVerificationProps) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [editableEmail, setEditableEmail] = useState(email);
  const [maxAttempts] = useState(5);

  // Default titles and descriptions
  const defaultTitle = userType === 'new-user' 
    ? 'Verify Your Email Address' 
    : 'Email Verification Required';
    
  const defaultDescription = userType === 'new-user'
    ? 'We\'ve sent a 6-digit verification code to confirm your email address and secure your account.'
    : 'Please verify your email address to proceed with password reset.';

  // Resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Auto-send initial OTP when component mounts
  useEffect(() => {
    sendOTP(email);
  }, []);

  // Simulate sending OTP
  const sendOTP = async (emailAddress: string) => {
    try {
      setIsResending(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would call your backend API here
      // await emailService.sendOTP(emailAddress, userType);
      
      console.log(`📧 OTP sent to: ${emailAddress} (Type: ${userType})`);
      
      // For demo purposes, show the "sent" OTP in console
      const demoOTP = '123456'; // In real app, this would be generated server-side
      console.log(`🔢 Demo OTP: ${demoOTP}`);
      
      toast.success(`Verification code sent to ${emailAddress}`);
      setResendCountdown(60); // 60 second cooldown
      
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setError('Failed to send verification code. Please try again.');
      toast.error('Failed to send verification code');
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPComplete = async (otpValue: string) => {
    await verifyOTP(otpValue);
  };

  const verifyOTP = async (otpValue: string) => {
    if (attempts >= maxAttempts) {
      setError('Maximum verification attempts exceeded. Please request a new code.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would verify with your backend
      // const result = await emailService.verifyOTP(editableEmail, otpValue, userType);
      
      // For demo purposes, accept '123456' or '000000'
      const validOTPs = ['123456', '000000'];
      
      if (validOTPs.includes(otpValue)) {
        console.log('✅ OTP verification successful');
        toast.success('Email verified successfully!');
        onVerificationSuccess();
      } else {
        throw new Error('Invalid verification code');
      }
      
    } catch (error: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      let errorMessage = 'Invalid verification code. Please try again.';
      
      if (newAttempts >= maxAttempts) {
        errorMessage = 'Maximum attempts exceeded. Please request a new verification code.';
        setOtp('');
      } else {
        errorMessage += ` (${maxAttempts - newAttempts} attempts remaining)`;
      }
      
      setError(errorMessage);
      toast.error('Invalid verification code');
      
      // Clear OTP on error
      if (newAttempts < maxAttempts) {
        setOtp('');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    
    setAttempts(0); // Reset attempts on resend
    setOtp('');
    await sendOTP(editableEmail);
  };

  const handleEmailChange = async () => {
    if (!editableEmail || editableEmail === email) {
      setIsEmailEditable(false);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editableEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setIsEmailEditable(false);
    setAttempts(0);
    setOtp('');
    await sendOTP(editableEmail);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onNavigateBack}
            className="text-gray-600 hover:text-gray-900 p-0 h-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">{title || defaultTitle}</CardTitle>
            <CardDescription className="text-center">
              {description || defaultDescription}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email Display/Edit */}
            <div className="space-y-2">
              <Label>Email Address</Label>
              {isEmailEditable ? (
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={editableEmail}
                    onChange={(e) => setEditableEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleEmailChange}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Update'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">{editableEmail}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEmailEditable(true)}
                    className="text-blue-600 hover:text-blue-700 p-1 h-auto"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* OTP Input */}
            <div className="space-y-4">
              <Label className="text-center block">Enter Verification Code</Label>
              <OTPInput
                length={6}
                value={otp}
                onChange={setOtp}
                onComplete={handleOTPComplete}
                disabled={isVerifying || attempts >= maxAttempts}
                autoFocus={true}
              />
              
              {/* Demo Helper */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-700 text-center">
                  💡 <strong>Demo Mode:</strong> Use code <code className="bg-yellow-100 px-1 rounded">123456</code> or <code className="bg-yellow-100 px-1 rounded">000000</code>
                </p>
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={() => verifyOTP(otp)}
              disabled={otp.length !== 6 || isVerifying || attempts >= maxAttempts}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Email
                </>
              )}
            </Button>

            {/* Resend Section */}
            <div className="text-center space-y-3 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              
              {resendCountdown > 0 ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Resend available in {formatTime(resendCountdown)}</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Code
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>Check your spam folder if you don't see the email.</p>
              <p>The verification code will expire in 10 minutes.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}