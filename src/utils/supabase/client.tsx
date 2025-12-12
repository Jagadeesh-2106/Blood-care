import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Export keys for use in other components
export { projectId, publicAnonKey };

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// API base URL for our server functions
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-206208a7`;

// Helper function to make authenticated API calls
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    // Check if we're in demo mode first
    const demoSession = localStorage.getItem('demo_session');

    if (demoSession) {
      // In demo mode, return demo data for certain endpoints
      return handleDemoApiCall(endpoint, options);
    }

    // Try to get real session
    let authToken;
    try {
      const { data: { session } } = await withTimeout(supabase.auth.getSession(), 1000);
      authToken = session?.access_token || publicAnonKey;
    } catch (error) {
      // If session check fails, use anon key
      authToken = publicAnonKey;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...options.headers,
    };

    // Add timeout to fetch request - reduced for faster response
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.debug(`API call failed: ${endpoint} - Status: ${response.status}`);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.debug(`Backend unavailable for ${endpoint}:`, error);
    throw error;
  }
}

// Handle demo API calls with mock data
function handleDemoApiCall(endpoint: string, options: RequestInit = {}) {
  return new Promise((resolve, reject) => {
    // Reduced simulated delay for faster response
    setTimeout(() => {
      try {
        // Handle different endpoints
        if (endpoint.includes('/nearby-requests/')) {
          const userId = endpoint.split('/nearby-requests/')[1];
          const demoProfile = localStorage.getItem('demo_profile');

          if (demoProfile) {
            const profile = JSON.parse(demoProfile);
            // Return demo blood requests matching the user's blood type
            resolve({
              requests: generateDemoBloodRequests(profile.bloodType || 'O+')
            });
          } else {
            resolve({ requests: [] });
          }
        } else if (endpoint.includes('/notifications/')) {
          const userId = endpoint.split('/notifications/')[1];

          // Handle read notification requests
          if (endpoint.includes('/read') && options.method === 'PUT') {
            resolve({ success: true });
          } else {
            resolve({
              notifications: generateDemoNotifications(userId)
            });
          }
        } else if (endpoint === '/profile') {
          const demoProfile = localStorage.getItem('demo_profile');
          if (demoProfile) {
            resolve({ profile: JSON.parse(demoProfile) });
          } else {
            reject(new Error('Demo profile not found'));
          }
        } else if (endpoint === '/accept-blood-request') {
          // Simulate successful blood request acceptance
          resolve({
            success: true,
            message: 'Blood request accepted successfully'
          });
        } else {
          // Default response for unknown endpoints
          resolve({ success: true, data: [] });
        }
      } catch (error) {
        reject(error);
      }
    }, 200 + Math.random() * 300); // 200-500ms delay (reduced from 500-1500ms)
  });
}

// Generate demo blood requests with Indian hospitals
function generateDemoBloodRequests(userBloodType: string) {
  const now = new Date();
  return [
    {
      id: "BR-2024-001",
      bloodType: userBloodType,
      units: 2,
      urgency: "Critical",
      hospital: "AIIMS Delhi",
      hospitalType: "Government Hospital",
      address: "Ansari Nagar, New Delhi, Delhi 110029",
      contactEmail: "emergency@aiims.edu",
      contactPhone: "+91 11 2658 8500",
      reason: "Emergency surgery - motor vehicle accident",
      patientAge: "34",
      patientGender: "Male",
      requestedDate: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      requiredBy: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      status: "Active",
      coordinates: { lat: 28.5672, lng: 77.2100 },
      distance: 2.3,
      state: "Delhi"
    },
    {
      id: "BR-2024-002",
      bloodType: userBloodType,
      units: 1,
      urgency: "High",
      hospital: "Apollo Hospital Delhi",
      hospitalType: "Private Hospital",
      address: "Sarita Vihar, New Delhi, Delhi 110076",
      contactEmail: "bloodbank@apollodelhi.com",
      contactPhone: "+91 11 2692 5858",
      reason: "Scheduled surgery - cardiac procedure",
      patientAge: "67",
      patientGender: "Female",
      requestedDate: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      requiredBy: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
      coordinates: { lat: 28.5355, lng: 77.2636 },
      distance: 4.7,
      state: "Delhi"
    },
    {
      id: "BR-2024-003",
      bloodType: userBloodType,
      units: 3,
      urgency: "Medium",
      hospital: "Fortis Hospital Gurgaon",
      hospitalType: "Private Hospital",
      address: "Sector 44, Gurugram, Haryana 122002",
      contactEmail: "bloodbank@fortis.in",
      contactPhone: "+91 124 496 2200",
      reason: "Blood transfusion for anemia treatment",
      patientAge: "28",
      patientGender: "Female",
      requestedDate: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      requiredBy: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      status: "Active",
      coordinates: { lat: 28.4595, lng: 77.0266 },
      distance: 8.1,
      state: "Haryana"
    }
  ];
}

// Generate demo notifications with Indian context
function generateDemoNotifications(userId: string) {
  const now = new Date();
  return [
    {
      id: `notif-${userId}-001`,
      userId: userId,
      type: "blood_request",
      title: "🩸 Critical Blood Request Near You",
      message: "O+ blood urgently needed at AIIMS Delhi - 2 units required for emergency surgery",
      bloodRequestId: "BR-2024-001",
      distance: 2.3,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      urgency: "Critical"
    },
    {
      id: `notif-${userId}-002`,
      userId: userId,
      type: "system",
      title: "Blood Donation Eligibility Reminder",
      message: "You're eligible to donate blood again! Your last donation was over 8 weeks ago. Help save lives in your community.",
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      urgency: "Low"
    },
    {
      id: `notif-${userId}-003`,
      userId: userId,
      type: "blood_request",
      title: "🏥 New Blood Request at Apollo Hospital",
      message: "A+ blood needed for cardiac surgery - 1 unit required within 24 hours",
      bloodRequestId: "BR-2024-002",
      distance: 4.7,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      urgency: "High"
    }
  ];
}

// Helper function for timeout wrapper
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

// Fallback demo data for offline mode - updated for Indian standards
export const DEMO_USERS = {
  'donor@demo.com': {
    password: 'Demo123!',
    profile: {
      id: '7f4c7fad-549f-4efa-8ad2-d716f0c5a155',
      userId: '7f4c7fad-549f-4efa-8ad2-d716f0c5a155',
      email: 'donor@demo.com',
      fullName: 'Arjun Sharma',
      role: 'user' as const,
      bloodType: 'O+',
      location: 'Mumbai, Maharashtra',
      phoneNumber: '+91 98765 43210',
      dateOfBirth: '1990-05-15',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      age: 34,
      createdAt: '2024-01-01T00:00:00Z',
      isAvailable: true,
      coordinates: { lat: 19.0760, lng: 72.8777 }
    }
  },
  'patient@demo.com': {
    password: 'Demo123!',
    profile: {
      id: 'b8e9c2f1-456a-4b7c-9d8e-f1a2b3c4d5e6',
      userId: 'b8e9c2f1-456a-4b7c-9d8e-f1a2b3c4d5e6',
      email: 'patient@demo.com',
      fullName: 'Priya Patel',
      role: 'user' as const,
      bloodType: 'A+',
      location: 'Delhi, Delhi',
      phoneNumber: '+91 87654 32109',
      dateOfBirth: '1985-08-22',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      age: 39,
      createdAt: '2024-01-01T00:00:00Z',
      coordinates: { lat: 28.6139, lng: 77.2090 }
    }
  },
  'hospital@demo.com': {
    password: 'Demo123!',
    profile: {
      id: 'c9f0d3e2-567b-5c8d-ae9f-02b3c4d5e6f7',
      userId: 'c9f0d3e2-567b-5c8d-ae9f-02b3c4d5e6f7',
      email: 'hospital@demo.com',
      fullName: 'Dr. Rajesh Kumar',
      role: 'user' as const,
      bloodType: 'B+',
      location: 'Bangalore, Karnataka',
      phoneNumber: '+91 76543 21098',
      dateOfBirth: '1980-12-10',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      age: 44,
      createdAt: '2024-01-01T00:00:00Z',
      coordinates: { lat: 12.9716, lng: 77.5946 }
    }
  }
};

// Global flag to check if we're in demo mode
let isDemoMode = false;

// Check if we're currently in demo mode
function checkDemoMode(): boolean {
  return isDemoMode || localStorage.getItem('demo_session') !== null;
}

// Set demo mode
function setDemoMode(enabled: boolean) {
  isDemoMode = enabled;
  if (enabled) {
    console.log('🔧 Demo mode enabled - using offline functionality');
  }
}

// Fallback authentication for demo mode
function demoAuth(email: string, password: string) {
  const user = DEMO_USERS[email as keyof typeof DEMO_USERS];
  if (user && user.password === password) {
    const session = {
      access_token: `demo_token_${Date.now()}`,
      refresh_token: `demo_refresh_${Date.now()}`,
      user: { id: user.profile.id, email: user.profile.email }
    };

    // Clear any existing demo data first
    localStorage.removeItem('demo_session');
    localStorage.removeItem('demo_profile');

    // Set new demo data
    localStorage.setItem('demo_session', JSON.stringify(session));
    localStorage.setItem('demo_profile', JSON.stringify(user.profile));
    setDemoMode(true);

    console.log('✅ Demo authentication successful for:', email);
    console.log('✅ Demo profile stored:', user.profile.fullName);

    return { session, user: session.user };
  }
  throw new Error('Invalid demo credentials');
}

// Quick network connectivity check with enhanced error handling
async function quickConnectivityCheck(): Promise<boolean> {
  try {
    // Very quick timeout check (500ms)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 500);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('🌐 Backend server is online and responding');
      return true;
    } else {
      console.log('🔧 Backend server responded with error:', response.status);
      return false;
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('🔧 Backend server timeout - likely not deployed');
    } else if (error.message?.includes('Failed to fetch')) {
      console.log('🔧 Network error or backend server unreachable');
    } else {
      console.log('🔧 Backend connectivity failed:', error.message);
    }
    return false;
  }
}

// Enhanced connectivity check that provides detailed status
export async function getDetailedConnectivityStatus() {
  const status = {
    internet: false,
    backend: false,
    supabase: false,
    auth: false,
    details: {
      internetError: '',
      backendError: '',
      supabaseError: '',
      authError: ''
    }
  };

  // Test internet connectivity
  try {
    await fetch('https://www.google.com', {
      mode: 'no-cors',
      signal: AbortSignal.timeout(2000)
    });
    status.internet = true;
  } catch (error: any) {
    status.details.internetError = error.message;
  }

  // Test backend server
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      signal: AbortSignal.timeout(3000)
    });
    status.backend = response.ok;
    if (!response.ok) {
      status.details.backendError = `HTTP ${response.status}`;
    }
  } catch (error: any) {
    status.details.backendError = error.name === 'AbortError' ? 'Timeout - likely not deployed' : error.message;
  }

  // Test Supabase connection
  try {
    const { error } = await supabase.from('test').select('*').limit(1);
    status.supabase = !error;
    if (error) {
      status.details.supabaseError = error.message;
    }
  } catch (error: any) {
    status.details.supabaseError = error.message;
  }

  // Test auth service
  try {
    const { error } = await supabase.auth.getSession();
    status.auth = !error;
    if (error) {
      status.details.authError = error.message;
    }
  } catch (error: any) {
    status.details.authError = error.message;
  }

  return status;
}

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, userData: any) => {
    try {
      // Check if this is a demo email - don't allow registration for demo emails
      if (email in DEMO_USERS) {
        throw new Error('This email is reserved for demo accounts. Please use the Sign In tab with password: Demo123!');
      }

      console.log('🔍 Checking server connectivity for registration...');

      // Check connectivity first
      const isConnected = await quickConnectivityCheck();

      if (!isConnected) {
        throw new Error('Unable to connect to registration servers. Please check your internet connection and try again, or use demo accounts for offline access.');
      }

      console.log('✅ Server connected, attempting registration...');

      // Use our custom signup endpoint that stores additional profile data
      const result = await withTimeout(
        apiCall('/signup', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            ...userData
          }),
        }),
        10000 // 10 second timeout for signup
      );

      console.log('✅ Registration successful');
      return result;

    } catch (error: any) {
      console.error('SignUp error:', error);

      // Enhanced error handling for registration
      if (error.message?.includes('User already registered') ||
        error.message?.includes('already been registered') ||
        error.message?.includes('already exists')) {
        throw new Error('An account with this email already exists. Please use the Sign In tab or try a different email address.');
      }

      if (error.message?.includes('reserved for demo')) {
        throw error; // Re-throw demo account error as-is
      }

      if (error.message?.includes('Email logins are disabled') ||
        error.message?.includes('logins are disabled') ||
        error.message?.includes('signup is disabled') ||
        error.message?.includes('registration is disabled')) {
        throw new Error('Account registration is currently unavailable. Please use demo accounts for offline access.');
      }

      if (error.message?.includes('timeout') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('Network') ||
        error.message?.includes('aborted') ||
        error.message?.includes('Unable to connect') ||
        error.name === 'AbortError') {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }

      if (error.message?.includes('Invalid email')) {
        throw new Error('Please enter a valid email address.');
      }

      if (error.message?.includes('Password')) {
        throw new Error('Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.');
      }

      if (error.message?.includes('Failed to create user')) {
        throw new Error('Registration failed. This email might already be in use or there was a server error.');
      }

      // Generic fallback with helpful message
      throw new Error(error.message || 'Registration failed. Please check your internet connection and try again.');
    }
  },

  signIn: async (email: string, password: string) => {
    // First, try demo authentication for known demo accounts
    if (email in DEMO_USERS) {
      console.log('🎯 Demo account detected, using offline mode');
      try {
        return demoAuth(email, password);
      } catch (demoError: any) {
        throw new Error('Incorrect password for demo account. Please use: Demo123!');
      }
    }

    // For non-demo accounts, try authentication with aggressive fallback to demo mode
    try {
      console.log('🔍 Attempting authentication for real account...');

      // Quick connectivity check with very short timeout
      const isConnected = await quickConnectivityCheck();

      if (!isConnected) {
        console.log('⚠️ Servers not reachable - automatically suggesting demo mode');
        // Instead of throwing an error, return a special response that suggests demo mode
        return {
          requiresDemoMode: true,
          message: 'Servers are currently unavailable. Would you like to try our demo accounts instead?',
          demoSuggestion: true
        };
      }

      console.log('✅ Server connected, attempting authentication...');

      // Try normal Supabase authentication with very short timeout
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        2000 // Very short 2 second timeout
      );

      if (error) {
        console.error('Authentication error:', error);

        if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials.');
        }

        if (error.message?.includes('Email not confirmed')) {
          throw new Error('Email not verified. Please check your email for verification link.');
        }

        if (error.message?.includes('Email logins are disabled') ||
          error.message?.includes('logins are disabled')) {
          console.log('⚠️ Email authentication is disabled - suggesting demo mode');
          return {
            requiresDemoMode: true,
            message: 'Email authentication is currently disabled. Please try our demo accounts.',
            demoSuggestion: true
          };
        }

        // For any authentication service errors, suggest demo mode instead of throwing
        return {
          requiresDemoMode: true,
          message: 'Authentication service is temporarily unavailable. Would you like to try demo accounts?',
          demoSuggestion: true
        };
      }

      if (!data.session) {
        return {
          requiresDemoMode: true,
          message: 'Authentication failed. Would you like to try demo accounts instead?',
          demoSuggestion: true
        };
      }

      console.log('✅ Real account authentication successful');
      return data;

    } catch (error: any) {
      console.error('SignIn error:', error);

      // For credential errors, still throw them normally
      if (error.message?.includes('Invalid login credentials') ||
        error.message?.includes('Invalid email or password') ||
        error.message?.includes('Email not verified')) {
        throw error;
      }

      // For all network/connectivity errors, suggest demo mode instead of throwing
      console.log('🔧 Network error detected, suggesting demo mode gracefully');
      return {
        requiresDemoMode: true,
        message: 'Cannot connect to servers right now. Would you like to explore with demo accounts?',
        demoSuggestion: true
      };
    }
  },

  signOut: async () => {
    try {
      const { error } = await withTimeout(supabase.auth.signOut(), 5000);
      if (error) throw error;
    } catch (error: any) {
      console.error('SignOut error:', error);
      // Don't throw on signout errors, just log them
    } finally {
      // Always clear demo data on signout
      localStorage.removeItem('demo_session');
      localStorage.removeItem('demo_profile');
    }
  },

  getSession: async () => {
    // Check demo mode first
    const demoSession = localStorage.getItem('demo_session');
    if (demoSession) {
      console.log('🎯 Using demo session');
      setDemoMode(true);
      return JSON.parse(demoSession);
    }

    // If we're in demo mode but no session, return null
    if (checkDemoMode()) {
      return null;
    }

    try {
      const { data: { session }, error } = await withTimeout(
        supabase.auth.getSession(),
        1000 // Very short timeout for session check
      );
      if (error) throw error;
      return session;
    } catch (error: any) {
      console.error('GetSession error:', error);
      // Don't throw on session errors, just return null
      return null;
    }
  },

  getUser: async () => {
    try {
      const { data: { user }, error } = await withTimeout(
        supabase.auth.getUser(),
        5000
      );
      if (error) throw error;
      return user;
    } catch (error: any) {
      console.error('GetUser error:', error);
      throw error;
    }
  }
};

// Profile helper functions
export const profile = {
  get: async () => {
    // Check demo mode first
    const demoProfile = localStorage.getItem('demo_profile');
    if (demoProfile) {
      console.log('🎯 Using demo profile');
      setDemoMode(true);
      return { profile: JSON.parse(demoProfile) };
    }

    // If we're in demo mode but no profile, try to restore from demo session
    const demoSession = localStorage.getItem('demo_session');
    if (demoSession || checkDemoMode()) {
      console.log('🔧 Demo mode detected, attempting to restore profile');

      // Try to restore demo profile from session
      if (demoSession) {
        try {
          const session = JSON.parse(demoSession);
          const email = session.user?.email;

          if (email && email in DEMO_USERS) {
            const restoredProfile = DEMO_USERS[email as keyof typeof DEMO_USERS].profile;
            localStorage.setItem('demo_profile', JSON.stringify(restoredProfile));
            console.log('✅ Demo profile restored from session for:', email);
            setDemoMode(true);
            return { profile: restoredProfile };
          }
        } catch (error) {
          console.warn('Failed to restore demo profile from session:', error);
          // Clean up corrupted session
          localStorage.removeItem('demo_session');
        }
      }

      // If still no profile, use a default demo profile (donor as fallback)
      console.log('⚠️ Using fallback demo profile');
      const fallbackProfile = {
        ...DEMO_USERS['donor@demo.com'].profile,
        id: `fallback_${Date.now()}`,
        fullName: 'Demo User',
        email: 'demo@fallback.com'
      };
      localStorage.setItem('demo_profile', JSON.stringify(fallbackProfile));
      setDemoMode(true);
      return { profile: fallbackProfile };
    }

    try {
      // Get current user session first
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.id) {
        // Fetch from Supabase 'users' table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data) {
          // Map snake_case DB columns to camelCase profile object
          const userProfile = {
            id: data.id,
            userId: data.id,
            email: data.email,
            fullName: data.full_name,
            role: data.role,
            bloodType: data.blood_type,
            location: data.location,
            phoneNumber: data.phone_number,
            createdAt: data.created_at,
            // These fields might be missing in DB, keep defaults or parse from location if possible
            city: data.location?.split(',')[0]?.trim() || 'Unknown',
            state: data.location?.split(',')[1]?.trim() || 'Unknown',
            country: 'India',
            isAvailable: true
          };
          return { profile: userProfile };
        }
      }

      // Fallback to API if DB fetch fails or no session (though session is needed)
      return await withTimeout(apiCall('/profile'), 5000);
    } catch (error: any) {
      console.error('Profile get error:', error);

      if (error.message?.includes('timeout') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('Network') ||
        error.message?.includes('aborted')) {
        throw new Error('Network error while fetching profile. Please sign in again or use demo accounts.');
      }
      throw error;
    }
  },

  update: async (profileData: any) => {
    // Handle demo mode profile updates
    const demoProfile = localStorage.getItem('demo_profile');
    if (demoProfile || checkDemoMode()) {
      console.log('🎯 Updating demo profile');
      try {
        const currentProfile = demoProfile ? JSON.parse(demoProfile) : null;
        if (currentProfile) {
          const updatedProfile = { ...currentProfile, ...profileData };
          localStorage.setItem('demo_profile', JSON.stringify(updatedProfile));
          console.log('✅ Demo profile updated successfully');
          return { profile: updatedProfile, success: true };
        }
      } catch (error) {
        console.warn('Demo profile update failed:', error);
      }
    }

    try {
      return await withTimeout(
        apiCall('/profile', {
          method: 'PUT',
          body: JSON.stringify(profileData),
        }),
        10000
      );
    } catch (error: any) {
      console.error('Profile update error:', error);
      if (error.message?.includes('timeout')) {
        throw new Error('Profile update timeout. Please try again.');
      }
      throw error;
    }
  }
};

// Donor helper functions
export const donors = {
  search: async (bloodType?: string, location?: string) => {
    const params = new URLSearchParams();
    if (bloodType) params.set('bloodType', bloodType);
    if (location) params.set('location', location);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/donors${query}`);
  },

  updateAvailability: async (isAvailable: boolean) => {
    return apiCall('/availability', {
      method: 'PUT',
      body: JSON.stringify({ isAvailable }),
    });
  }
};

// Blood request helper functions
export const bloodRequests = {
  create: async (requestData: any) => {
    return apiCall('/blood-request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  getAll: async () => {
    return apiCall('/blood-requests');
  }
};

// Email verification helper functions
export const emailVerification = {
  sendOTP: async (email: string, purpose: 'registration' | 'password-reset' = 'registration') => {
    try {
      // Simulate sending OTP via email service
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In production, this would call your email service API
      console.log(`📧 OTP sent to ${email} for ${purpose}`);

      // For demo purposes, always return success
      return {
        success: true,
        message: 'Verification code sent successfully',
        expiresIn: 600 // 10 minutes
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send verification code');
    }
  },

  verifyOTP: async (email: string, otp: string, purpose: 'registration' | 'password-reset' = 'registration') => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, accept specific codes
      const validOTPs = ['123456', '000000'];

      if (validOTPs.includes(otp)) {
        console.log(`✅ OTP verification successful for ${email}`);
        return {
          success: true,
          message: 'Email verified successfully',
          verificationToken: `verify_${Date.now()}_${email}` // Demo token
        };
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  resendOTP: async (email: string, purpose: 'registration' | 'password-reset' = 'registration') => {
    return emailVerification.sendOTP(email, purpose);
  }
};

// Helper function to ensure demo profile integrity
export const ensureDemoProfile = () => {
  const demoSession = localStorage.getItem('demo_session');
  const demoProfile = localStorage.getItem('demo_profile');

  if (demoSession && !demoProfile) {
    try {
      const session = JSON.parse(demoSession);
      const email = session.user?.email;

      if (email && email in DEMO_USERS) {
        const profile = DEMO_USERS[email as keyof typeof DEMO_USERS].profile;
        localStorage.setItem('demo_profile', JSON.stringify(profile));
        console.log('🔧 Demo profile integrity restored for:', email);
        return profile;
      }
    } catch (error) {
      console.warn('Demo profile integrity check failed:', error);
      // Clean up corrupted data
      localStorage.removeItem('demo_session');
    }
  }

  return demoProfile ? JSON.parse(demoProfile) : null;
};

// Password reset helper functions
export const passwordReset = {
  requestReset: async (email: string) => {
    try {
      // Check if email exists (demo mode)
      const demoEmails = Object.keys(DEMO_USERS);
      const emailExists = demoEmails.includes(email) || email.includes('@'); // Basic check for demo

      if (!emailExists) {
        throw new Error('Email address not found');
      }

      // Send OTP for password reset
      return await emailVerification.sendOTP(email, 'password-reset');
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  verifyResetOTP: async (email: string, otp: string) => {
    return await emailVerification.verifyOTP(email, otp, 'password-reset');
  },

  updatePassword: async (email: string, newPassword: string, verificationToken?: string) => {
    try {
      // Simulate password update
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log(`🔒 Password updated for ${email}`);

      // In production, this would update the password in your database
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Failed to update password');
    }
  }
};

// Database fetching functions
export async function getHospitals() {
  try {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*');

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching hospitals:', error);
    return { data: null, error };
  }
}

export async function getNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return { data: null, error };
  }
}
;