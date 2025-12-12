// Location and distance calculation utilities

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  state: string;
  district: string;
  city: string;
  pincode: string;
  coordinates?: Coordinates;
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Get user's current location
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

// Mock coordinates for demo cities (in a real app, you'd use a geocoding service)
export const DEMO_COORDINATES: Record<string, Coordinates> = {
  "New York, NY": { lat: 40.7128, lng: -74.0060 },
  "Los Angeles, CA": { lat: 34.0522, lng: -118.2437 },
  "Chicago, IL": { lat: 41.8781, lng: -87.6298 },
  "Houston, TX": { lat: 29.7604, lng: -95.3698 },
  "Phoenix, AZ": { lat: 33.4484, lng: -112.0740 },
  "Philadelphia, PA": { lat: 39.9526, lng: -75.1652 },
  "San Antonio, TX": { lat: 29.4241, lng: -98.4936 },
  "San Diego, CA": { lat: 32.7157, lng: -117.1611 },
  "Dallas, TX": { lat: 32.7767, lng: -96.7970 },
  "San Jose, CA": { lat: 37.3382, lng: -121.8863 },
  "Mumbai, Maharashtra": { lat: 19.0760, lng: 72.8777 },
  "Delhi, Delhi": { lat: 28.7041, lng: 77.1025 },
  "Bangalore, Karnataka": { lat: 12.9716, lng: 77.5946 },
  "Hyderabad, Telangana": { lat: 17.3850, lng: 78.4867 },
  "Chennai, Tamil Nadu": { lat: 13.0827, lng: 80.2707 },
  "Kolkata, West Bengal": { lat: 22.5726, lng: 88.3639 },
  "Pune, Maharashtra": { lat: 18.5204, lng: 73.8567 },
  "Ahmedabad, Gujarat": { lat: 23.0225, lng: 72.5714 },
  "Jaipur, Rajasthan": { lat: 26.9124, lng: 75.7873 },
  "Surat, Gujarat": { lat: 21.1702, lng: 72.8311 }
};

// Get coordinates for a location string
export function getCoordinatesForLocation(location: string): Coordinates | null {
  // Try exact match first
  if (DEMO_COORDINATES[location]) {
    return DEMO_COORDINATES[location];
  }

  // Try partial matching
  const locationLower = location.toLowerCase();
  for (const [key, coords] of Object.entries(DEMO_COORDINATES)) {
    if (key.toLowerCase().includes(locationLower) || locationLower.includes(key.toLowerCase())) {
      return coords;
    }
  }

  return null;
}

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
}

// Get urgency color based on distance and urgency level
export function getRequestUrgencyColor(urgency: string, distance: number): string {
  const baseColors = {
    Critical: 'bg-red-100 text-red-800 border-red-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  // Increase urgency for very close requests
  if (distance <= 2) {
    return urgency === 'Critical' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 border-red-200';
  }

  return baseColors[urgency as keyof typeof baseColors] || baseColors.Low;
}

// Check if location is within notification radius
export function isWithinNotificationRadius(
  userCoords: Coordinates,
  requestCoords: Coordinates,
  radiusKm: number = 15
): boolean {
  const distance = calculateDistance(
    userCoords.lat,
    userCoords.lng,
    requestCoords.lat,
    requestCoords.lng
  );
  return distance <= radiusKm;
}