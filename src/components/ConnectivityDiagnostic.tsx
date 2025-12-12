import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Wifi, WifiOff, Server, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { API_BASE_URL, publicAnonKey, supabase, getDetailedConnectivityStatus } from "../utils/supabase/client";

interface ConnectivityDiagnosticProps {
  onClose: () => void;
}

export function ConnectivityDiagnostic({ onClose }: ConnectivityDiagnosticProps) {
  const [tests, setTests] = useState({
    internet: { status: 'testing', message: 'Checking internet connection...' },
    supabase: { status: 'testing', message: 'Testing Supabase connection...' },
    backend: { status: 'testing', message: 'Testing backend server...' },
    auth: { status: 'testing', message: 'Testing authentication service...' }
  });

  const [isRetesting, setIsRetesting] = useState(false);

  const runDiagnostics = async () => {
    setIsRetesting(true);
    
    try {
      const status = await getDetailedConnectivityStatus();
      
      // Update all tests based on detailed status
      setTests({
        internet: {
          status: status.internet ? 'success' : 'error',
          message: status.internet ? 'Internet connection is working' : `No internet connection: ${status.details.internetError}`
        },
        supabase: {
          status: status.supabase ? 'success' : 'error',
          message: status.supabase ? 'Supabase connection is working' : `Supabase error: ${status.details.supabaseError}`
        },
        backend: {
          status: status.backend ? 'success' : 'error',
          message: status.backend ? 'Backend server is responding' : `Backend server error: ${status.details.backendError}`
        },
        auth: {
          status: status.auth ? 'success' : 'error',
          message: status.auth ? 'Authentication service is working' : `Auth service error: ${status.details.authError}`
        }
      });
    } catch (error: any) {
      console.error('Diagnostic error:', error);
      // Fallback to individual tests if the detailed check fails
      setTests({
        internet: { status: 'error', message: 'Could not perform connectivity tests' },
        supabase: { status: 'error', message: 'Could not perform connectivity tests' },
        backend: { status: 'error', message: 'Could not perform connectivity tests' },
        auth: { status: 'error', message: 'Could not perform connectivity tests' }
      });
    }

    setIsRetesting(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'testing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="text-green-600 border-green-600">Connected</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-600">Failed</Badge>;
      case 'testing':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Testing...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const hasErrors = Object.values(tests).some(test => test.status === 'error');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Server className="w-6 h-6 text-blue-600" />
          <div>
            <CardTitle>Connectivity Diagnostic</CardTitle>
            <CardDescription>
              Checking connection to BloodConnect services
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Test Results */}
        <div className="space-y-3">
          {Object.entries(tests).map(([key, test]) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <div className="font-medium capitalize">
                    {key === 'backend' ? 'Backend Server' : 
                     key === 'supabase' ? 'Supabase Database' :
                     key === 'auth' ? 'Authentication' : 'Internet'}
                  </div>
                  <div className="text-sm text-gray-600">{test.message}</div>
                </div>
              </div>
              {getStatusBadge(test.status)}
            </div>
          ))}
        </div>

        {/* Summary and Recommendations */}
        {hasErrors && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Connection Issues Detected</h4>
                <div className="text-sm text-yellow-700 mt-1 space-y-1">
                  {tests.backend.status === 'error' && (
                    <p>• Backend server is not responding. This is likely because the Supabase Edge Function is not deployed.</p>
                  )}
                  {tests.internet.status === 'error' && (
                    <p>• No internet connection. Please check your network connection.</p>
                  )}
                  {tests.supabase.status === 'error' && (
                    <p>• Supabase database connection failed. Please check your Supabase configuration.</p>
                  )}
                  {tests.auth.status === 'error' && (
                    <>
                      <p>• Authentication service issues detected.</p>
                      {tests.auth.message?.includes('Email logins are disabled') && (
                        <p className="ml-4 text-sm">→ Email authentication is disabled in Supabase settings. Enable it in Authentication → Settings → Auth Providers.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Mode Notice */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Wifi className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Demo Mode Available</h4>
              <p className="text-sm text-blue-700 mt-1">
                If you're experiencing connectivity issues, you can still use BloodConnect with demo accounts. 
                These work completely offline and showcase all features.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRetesting}
            variant="outline"
          >
            {isRetesting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Retesting...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retest Connection
              </>
            )}
          </Button>
          <Button onClick={onClose}>
            Close Diagnostic
          </Button>
        </div>

        {/* Technical Details */}
        <details className="mt-4">
          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
            Technical Details
          </summary>
          <div className="mt-2 text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded">
            <p><strong>API Endpoint:</strong> {API_BASE_URL}</p>
            <p><strong>Health Check:</strong> {API_BASE_URL}/health</p>
            <p><strong>Authentication:</strong> Bearer {publicAnonKey.substring(0, 20)}...</p>
            <p><strong>Demo Mode:</strong> {localStorage.getItem('demo_session') ? 'Enabled' : 'Disabled'}</p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}