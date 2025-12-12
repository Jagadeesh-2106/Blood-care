import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase clients
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);

// Helper function to get authenticated user
async function getAuthenticatedUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  
  // Check if it's the anon key (allow public access for some endpoints)
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (accessToken === anonKey) {
    return { id: 'anon_user', email: 'anonymous', isAnonymous: true };
  }
  
  // Check if it's a demo token
  if (accessToken.startsWith('demo_token_')) {
    return { id: 'demo_user', email: 'demo@demo.com', isDemo: true };
  }
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      console.log('Authentication error:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.log('Auth verification error:', error);
    return null;
  }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

// Helper function to check blood type compatibility
function isBloodTypeCompatible(donorType: string, requestedType: string): boolean {
  // Universal donor compatibility
  if (donorType === 'O-') return true; // O- can donate to anyone
  if (requestedType === 'AB+') return true; // AB+ can receive from anyone
  
  // Exact match
  if (donorType === requestedType) return true;
  
  // ABO compatibility rules
  const donorABO = donorType.charAt(0);
  const donorRh = donorType.charAt(1);
  const requestedABO = requestedType.charAt(0);
  const requestedRh = requestedType.charAt(1);
  
  // Rh factor: negative can donate to positive, but not vice versa
  if (donorRh === '+' && requestedRh === '-') return false;
  
  // ABO compatibility
  if (donorABO === 'O') return true; // O can donate to anyone (ABO wise)
  if (donorABO === 'A' && (requestedABO === 'A' || requestedABO === 'AB')) return true;
  if (donorABO === 'B' && (requestedABO === 'B' || requestedABO === 'AB')) return true;
  if (donorABO === 'AB' && requestedABO === 'AB') return true;
  
  return false;
}

// Helper function to find donors within radius
async function findNearbyDonors(requestLat: number, requestLng: number, bloodType: string, radiusKm: number = 15) {
  try {
    // Get all user profiles that are donors
    const allProfiles = await kv.getByPrefix('user_profile:');
    const nearbyDonors = [];

    for (const profileKey in allProfiles) {
      const donor = allProfiles[profileKey];
      if (donor && 
          donor.role === 'donor' && 
          donor.isAvailable && 
          donor.bloodType &&
          isBloodTypeCompatible(donor.bloodType, bloodType)) {
        
        // Use a default location if coordinates don't exist (for demo purposes)
        let distance = 0;
        if (donor.coordinates?.lat && donor.coordinates?.lng) {
          distance = calculateDistance(
            requestLat,
            requestLng,
            donor.coordinates.lat,
            donor.coordinates.lng
          );
        } else {
          // Assign a random distance between 1-10 km for demo purposes
          distance = Math.random() * 10 + 1;
        }

        if (distance <= radiusKm) {
          nearbyDonors.push({
            ...donor,
            distance: Math.round(distance * 10) / 10,
            notificationSent: false
          });
        }
      }
    }

    return nearbyDonors.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error finding nearby donors:', error);
    return [];
  }
}

// Health check endpoint
app.get("/make-server-206208a7/health", (c) => {
  return c.json({ status: "ok" });
});

// Submit new blood request endpoint
app.post("/make-server-206208a7/blood-requests", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // For demo/anon users, simulate successful submission
    if (user.isDemo || user.isAnonymous) {
      return c.json({ 
        success: true, 
        requestId: `demo_request_${Date.now()}`, 
        notifiedDonors: 3
      });
    }

    const requestData = await c.req.json();
    
    // Generate unique request ID
    const requestId = `blood_request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create blood request with timestamp
    const bloodRequest = {
      ...requestData,
      id: requestId,
      userId: user.id,
      status: "Active",
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Store the blood request
    await kv.set(requestId, bloodRequest);

    // Find and notify nearby donors if coordinates provided
    if (requestData.coordinates?.lat && requestData.coordinates?.lng) {
      const nearbyDonors = await findNearbyDonors(
        requestData.coordinates.lat,
        requestData.coordinates.lng,
        requestData.bloodType,
        15 // 15km radius
      );

      // Store notifications for nearby donors
      let notificationCount = 0;
      for (const donor of nearbyDonors) {
        const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create more detailed notification message
        const unitsText = requestData.units > 1 ? `${requestData.units} units` : '1 unit';
        const distanceText = donor.distance < 1 ? 'Very close' : `${donor.distance}km away`;
        
        const notification = {
          id: notificationId,
          userId: donor.id, // Use donor.id instead of donor.userId
          type: "blood_request",
          title: `🩸 ${requestData.urgency} Blood Request Near You`,
          message: `${requestData.bloodType} blood needed at ${requestData.hospital} - ${unitsText} required (${distanceText})`,
          bloodRequestId: requestId,
          distance: donor.distance,
          createdAt: new Date().toISOString(),
          read: false,
          urgency: requestData.urgency
        };
        
        await kv.set(notificationId, notification);
        notificationCount++;
        
        console.log(`📧 Created notification for donor ${donor.fullName} (${donor.bloodType}) - Distance: ${donor.distance}km`);
      }

      console.log(`🩸 Blood request created and ${notificationCount} compatible donors notified`);
      console.log(`📊 Found ${nearbyDonors.length} total nearby donors, ${notificationCount} received notifications`);
    }

    return c.json({ 
      success: true, 
      requestId, 
      notifiedDonors: requestData.coordinates ? await findNearbyDonors(
        requestData.coordinates.lat,
        requestData.coordinates.lng,
        requestData.bloodType,
        15
      ).then(donors => donors.length) : 0
    });

  } catch (error) {
    console.error('Error creating blood request:', error);
    return c.json({ error: "Failed to create blood request" }, 500);
  }
});

// Get nearby blood requests for donors
app.get("/make-server-206208a7/nearby-requests/:userId", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param('userId');
    
    // For demo/anon users, return demo data
    if (user.isDemo || user.isAnonymous) {
      return c.json({ 
        requests: [
          {
            id: "BR-2024-001",
            bloodType: "O+",
            units: 2,
            urgency: "Critical", 
            hospital: "Mount Sinai Hospital",
            hospitalType: "Emergency Hospital",
            address: "1468 Madison Ave, New York, NY 10029",
            contactEmail: "emergency@mountsinai.org",
            contactPhone: "(212) 241-6500",
            reason: "Emergency surgery - motor vehicle accident",
            patientAge: "34",
            patientGender: "Male",
            requestedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            requiredBy: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
            status: "Active",
            distance: 2.3
          }
        ]
      });
    }
    
    // Get donor profile to get location and blood type
    const donorProfile = await kv.get(`donor_profile_${userId}`);
    if (!donorProfile) {
      return c.json({ error: "Donor profile not found" }, 404);
    }

    // Get all active blood requests
    const allRequests = await kv.getByPrefix('blood_request_');
    const nearbyRequests = [];

    for (const requestKey in allRequests) {
      const request = allRequests[requestKey];
      if (request && request.status === 'Active' && request.bloodType === donorProfile.bloodType) {
        // Calculate distance if both have coordinates
        if (request.coordinates?.lat && request.coordinates?.lng && 
            donorProfile.coordinates?.lat && donorProfile.coordinates?.lng) {
          
          const distance = calculateDistance(
            donorProfile.coordinates.lat,
            donorProfile.coordinates.lng,
            request.coordinates.lat,
            request.coordinates.lng
          );

          if (distance <= 15) { // 15km radius
            nearbyRequests.push({
              ...request,
              distance: distance
            });
          }
        }
      }
    }

    // Sort by distance, then by urgency
    nearbyRequests.sort((a, b) => {
      const urgencyOrder = { "Critical": 0, "High": 1, "Medium": 2, "Low": 3 };
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      return urgencyDiff !== 0 ? urgencyDiff : a.distance - b.distance;
    });

    return c.json({ requests: nearbyRequests });

  } catch (error) {
    console.error('Error fetching nearby requests:', error);
    return c.json({ error: "Failed to fetch nearby requests" }, 500);
  }
});

// Get notifications for user
app.get("/make-server-206208a7/notifications/:userId", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param('userId');
    
    // For demo/anon users, return demo notifications
    if (user.isDemo || user.isAnonymous) {
      return c.json({ 
        notifications: [
          {
            id: "notification_1",
            userId: userId,
            type: "blood_request",
            title: "New Blood Request Near You",
            message: "O+ blood needed at Mount Sinai Hospital",
            bloodRequestId: "BR-2024-001",
            distance: 2.3,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
            urgency: "Critical"
          }
        ]
      });
    }
    
    const allNotifications = await kv.getByPrefix('notification_');
    const userNotifications = [];

    for (const notificationKey in allNotifications) {
      const notification = allNotifications[notificationKey];
      if (notification && notification.userId === userId) {
        userNotifications.push(notification);
      }
    }

    // Sort by creation date (newest first)
    userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ notifications: userNotifications });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: "Failed to fetch notifications" }, 500);
  }
});

// Mark notification as read
app.put("/make-server-206208a7/notifications/:notificationId/read", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const notificationId = c.req.param('notificationId');
    const notification = await kv.get(notificationId);
    
    if (!notification) {
      return c.json({ error: "Notification not found" }, 404);
    }

    notification.read = true;
    await kv.set(notificationId, notification);

    return c.json({ success: true });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({ error: "Failed to update notification" }, 500);
  }
});

// Demo users creation endpoint (for testing)
app.post("/make-server-206208a7/create-demo-users", async (c) => {
  try {
    console.log('Creating demo users...');

    const demoUsers = [
      {
        email: 'donor@demo.com',
        password: 'Demo123!',
        fullName: 'John Donor',
        role: 'donor',
        bloodType: 'O+',
        phoneNumber: '(555) 123-4567',
        location: 'New York, NY',
        dateOfBirth: '1990-01-01'
      },
      {
        email: 'patient@demo.com',
        password: 'Demo123!',
        fullName: 'Jane Patient',
        role: 'patient',
        phoneNumber: '(555) 987-6543',
        location: 'Los Angeles, CA',
        organizationType: 'individual',
        organizationName: 'Individual Patient'
      },
      {
        email: 'hospital@demo.com',
        password: 'Demo123!',
        fullName: 'Dr. Smith',
        role: 'clinic',
        phoneNumber: '(555) 456-7890',
        location: 'Chicago, IL',
        organizationType: 'hospital',
        organizationName: 'City General Hospital'
      }
    ];

    const results = [];
    
    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingProfile = await kv.getByPrefix(`user_profile:`);
        const userExists = existingProfile.some(profile => profile.email === userData.email);
        
        if (userExists) {
          results.push({ email: userData.email, status: 'already exists' });
          continue;
        }

        // Create user with Supabase Auth
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          user_metadata: { 
            full_name: userData.fullName,
            role: userData.role 
          },
          email_confirm: true
        });

        if (error) {
          console.log(`Demo user creation error for ${userData.email}:`, error);
          results.push({ email: userData.email, status: 'error', error: error.message });
          continue;
        }

        if (!data.user) {
          results.push({ email: userData.email, status: 'error', error: 'No user data returned' });
          continue;
        }

        // Store additional user profile data in KV store
        const userProfile = {
          id: data.user.id,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
          bloodType: userData.bloodType,
          location: userData.location,
          phoneNumber: userData.phoneNumber,
          createdAt: new Date().toISOString(),
          isAvailable: userData.role === 'donor' ? true : undefined,
          ...(userData.dateOfBirth && { dateOfBirth: userData.dateOfBirth }),
          ...(userData.organizationType && { organizationType: userData.organizationType }),
          ...(userData.organizationName && { organizationName: userData.organizationName })
        };

        await kv.set(`user_profile:${data.user.id}`, userProfile);
        
        results.push({ email: userData.email, status: 'created', id: data.user.id });
        console.log(`Demo user created: ${userData.email}`);
      } catch (userError: any) {
        console.log(`Error creating user ${userData.email}:`, userError);
        results.push({ email: userData.email, status: 'error', error: userError.message });
      }
    }

    return c.json({ 
      message: 'Demo users creation completed',
      results,
      summary: {
        total: demoUsers.length,
        created: results.filter(r => r.status === 'created').length,
        existing: results.filter(r => r.status === 'already exists').length,
        errors: results.filter(r => r.status === 'error').length
      }
    });
  } catch (error: any) {
    console.log('Demo users creation error:', error);
    return c.json({ error: 'Failed to create demo users' }, 500);
  }
});

// User signup endpoint
app.post("/make-server-206208a7/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName, role, bloodType, location, phoneNumber } = body;

    console.log('Signup attempt for:', email);

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        full_name: fullName,
        role: role 
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: `Failed to create user: ${error.message}` }, 400);
    }

    if (!data.user) {
      return c.json({ error: 'Failed to create user - no user data returned' }, 400);
    }

    // Store additional user profile data in KV store
    const userProfile = {
      id: data.user.id,
      email,
      fullName,
      role,
      bloodType,
      location,
      phoneNumber,
      createdAt: new Date().toISOString(),
      isAvailable: role === 'donor' ? true : undefined
    };

    await kv.set(`user_profile:${data.user.id}`, userProfile);
    
    console.log('User created successfully:', data.user.id);
    return c.json({ 
      message: 'User created successfully', 
      user: {
        id: data.user.id,
        email: data.user.email,
        role: role
      }
    });
  } catch (error) {
    console.log('Signup server error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get user profile endpoint
app.get("/make-server-206208a7/profile", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // For demo/anon users, return demo profile
    if (user.isDemo || user.isAnonymous) {
      return c.json({ 
        profile: {
          id: 'demo-user-1',
          email: 'donor@demo.com',
          fullName: 'John Smith',
          role: 'donor',
          bloodType: 'O+',
          location: 'New York, NY',
          phoneNumber: '(555) 123-4567',
          createdAt: '2024-01-01T00:00:00Z',
          isAvailable: true
        }
      });
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile endpoint
app.put("/make-server-206208a7/profile", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const existingProfile = await kv.get(`user_profile:${user.id}`);
    
    if (!existingProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const updatedProfile = {
      ...existingProfile,
      ...body,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user_profile:${user.id}`, updatedProfile);
    
    return c.json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Get donors (for matching)
app.get("/make-server-206208a7/donors", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bloodType = c.req.query('bloodType');
    const location = c.req.query('location');

    // Get all user profiles with donor role
    const allProfiles = await kv.getByPrefix('user_profile:');
    const donors = allProfiles
      .filter(profile => profile.role === 'donor' && profile.isAvailable)
      .filter(profile => !bloodType || profile.bloodType === bloodType)
      .filter(profile => !location || profile.location.toLowerCase().includes(location.toLowerCase()));

    return c.json({ donors });
  } catch (error) {
    console.log('Donors fetch error:', error);
    return c.json({ error: 'Failed to fetch donors' }, 500);
  }
});

// Create blood request
app.post("/make-server-206208a7/blood-request", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { bloodType, units, urgency, hospitalName, hospitalLocation, notes } = body;

    const requestId = `blood_request:${user.id}:${Date.now()}`;
    const bloodRequest = {
      id: requestId,
      userId: user.id,
      bloodType,
      units,
      urgency,
      hospitalName,
      hospitalLocation,
      notes,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    await kv.set(requestId, bloodRequest);
    
    return c.json({ message: 'Blood request created successfully', request: bloodRequest });
  } catch (error) {
    console.log('Blood request creation error:', error);
    return c.json({ error: 'Failed to create blood request' }, 500);
  }
});

// Get blood requests
app.get("/make-server-206208a7/blood-requests", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user_profile:${user.id}`);
    if (!userProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    let requests;
    
    if (userProfile.role === 'donor') {
      // Donors see all active requests
      const allRequests = await kv.getByPrefix('blood_request:');
      requests = allRequests.filter(req => req.status === 'active');
    } else {
      // Patients/clinics see their own requests
      const allRequests = await kv.getByPrefix(`blood_request:${user.id}:`);
      requests = allRequests;
    }

    return c.json({ requests });
  } catch (error) {
    console.log('Blood requests fetch error:', error);
    return c.json({ error: 'Failed to fetch blood requests' }, 500);
  }
});

// Accept blood request (donors responding to patient requests)
app.post("/make-server-206208a7/accept-blood-request", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // For demo/anon users, simulate successful acceptance
    if (user.isDemo || user.isAnonymous) {
      return c.json({ 
        success: true, 
        message: 'Blood request acceptance simulated successfully'
      });
    }

    const body = await c.req.json();
    const { bloodRequestId, donorMessage } = body;

    // Get donor profile
    const donorProfile = await kv.get(`user_profile:${user.id}`);
    if (!donorProfile || donorProfile.role !== 'donor') {
      return c.json({ error: 'Only donors can accept blood requests' }, 400);
    }

    // Get the blood request
    const bloodRequest = await kv.get(bloodRequestId);
    if (!bloodRequest) {
      return c.json({ error: 'Blood request not found' }, 404);
    }

    if (bloodRequest.status !== 'Active') {
      return c.json({ error: 'Blood request is no longer active' }, 400);
    }

    // Update blood request status
    const updatedRequest = {
      ...bloodRequest,
      status: 'Accepted',
      acceptedBy: user.id,
      acceptedByName: donorProfile.fullName,
      acceptedByContact: donorProfile.phoneNumber,
      acceptedByEmail: donorProfile.email,
      acceptedAt: new Date().toISOString(),
      donorMessage: donorMessage || '',
      lastUpdated: new Date().toISOString()
    };

    await kv.set(bloodRequestId, updatedRequest);

    // Get the patient/organization profile who made the request
    const requesterProfile = await kv.get(`user_profile:${bloodRequest.userId}`);
    
    if (requesterProfile) {
      // Create notification for patient/organization
      const acceptanceNotificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const acceptanceNotification = {
        id: acceptanceNotificationId,
        userId: bloodRequest.userId,
        type: "request_accepted",
        title: `✅ Your Blood Request Has Been Accepted!`,
        message: `${donorProfile.fullName} has accepted your ${bloodRequest.bloodType} blood request at ${bloodRequest.hospital}. They will contact you shortly.`,
        bloodRequestId: bloodRequestId,
        donorId: user.id,
        donorName: donorProfile.fullName,
        donorContact: donorProfile.phoneNumber,
        donorEmail: donorProfile.email,
        donorMessage: donorMessage || '',
        distance: 0, // Could calculate if needed
        createdAt: new Date().toISOString(),
        read: false,
        urgency: "High" // Acceptance notifications are important
      };
      
      await kv.set(acceptanceNotificationId, acceptanceNotification);
      
      console.log(`🎉 Created acceptance notification for ${requesterProfile.fullName} - Request ${bloodRequestId} accepted by ${donorProfile.fullName}`);
    }

    return c.json({ 
      success: true, 
      message: 'Blood request accepted successfully',
      requestId: bloodRequestId,
      donorInfo: {
        name: donorProfile.fullName,
        contact: donorProfile.phoneNumber,
        email: donorProfile.email
      }
    });

  } catch (error) {
    console.error('Error accepting blood request:', error);
    return c.json({ error: 'Failed to accept blood request' }, 500);
  }
});

// Update donor availability
app.put("/make-server-206208a7/availability", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { isAvailable } = body;

    const existingProfile = await kv.get(`user_profile:${user.id}`);
    if (!existingProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    if (existingProfile.role !== 'donor') {
      return c.json({ error: 'Only donors can update availability' }, 400);
    }

    const updatedProfile = {
      ...existingProfile,
      isAvailable,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user_profile:${user.id}`, updatedProfile);
    
    return c.json({ message: 'Availability updated successfully', profile: updatedProfile });
  } catch (error) {
    console.log('Availability update error:', error);
    return c.json({ error: 'Failed to update availability' }, 500);
  }
});

Deno.serve(app.fetch);