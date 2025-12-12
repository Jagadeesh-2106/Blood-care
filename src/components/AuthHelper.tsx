import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Info, User, Mail, Key } from 'lucide-react';
import { apiCall } from '../utils/supabase/client';

interface AuthHelperProps {
  onGetStarted?: () => void;
}

export function AuthHelper({ onGetStarted }: AuthHelperProps) {
  const [isCreatingDemoUsers, setIsCreatingDemoUsers] = useState(false);
  const [demoUsersCreated, setDemoUsersCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoCredentials = [
    {
      role: 'Blood Donor',
      email: 'donor@demo.com',
      password: 'Demo123!',
      description: 'Access donor dashboard and availability management'
    },
    {
      role: 'Patient',
      email: 'patient@demo.com', 
      password: 'Demo123!',
      description: 'Create blood requests and find donors'
    },
    {
      role: 'Hospital/Clinic',
      email: 'hospital@demo.com',
      password: 'Demo123!',
      description: 'Manage blood requests and donor coordination'
    }
  ];

  const createDemoUsers = async () => {
    setIsCreatingDemoUsers(true);
    setError(null);
    
    try {
      const result = await apiCall('/create-demo-users', {
        method: 'POST'
      });
      
      console.log('Demo users created:', result);
      setDemoUsersCreated(true);
    } catch (error: any) {
      console.error('Failed to create demo users:', error);
      setError('Failed to create demo users. You can still register manually.');
    } finally {
      setIsCreatingDemoUsers(false);
    }
  };

  useEffect(() => {
    // Auto-create demo users on component mount
    createDemoUsers();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>Welcome to BloodConnect</CardTitle>
          <CardDescription>
            Your smart blood donation platform for real-time matching
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {demoUsersCreated && (
            <Alert className="border-green-200 bg-green-50">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Demo users have been created successfully! You can now sign in with the credentials below.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Demo Accounts (Ready to Sign In)
            </h3>
            
            <div className="space-y-3">
              {demoCredentials.map((demo, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{demo.role}</h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Demo Account</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{demo.description}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <code className="bg-white px-2 py-1 rounded text-xs font-mono">{demo.email}</code>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Key className="w-3 h-3 text-gray-400" />
                      <code className="bg-white px-2 py-1 rounded text-xs font-mono">{demo.password}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center space-y-4">
            <Button 
              onClick={onGetStarted}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isCreatingDemoUsers}
            >
              {isCreatingDemoUsers ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Setting up demo accounts...
                </>
              ) : (
                'Get Started - Sign In or Register'
              )}
            </Button>
            
            <p className="text-xs text-gray-500">
              You can use any of the demo accounts above, or create your own account by registering.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}