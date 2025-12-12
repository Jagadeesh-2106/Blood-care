// Location hierarchy data structure
export interface LocationData {
  state: string;
  district: string;
  city: string;
  pincode: string;
}

// Enhanced hospital and blood bank data structure
export interface BloodRequest {
  id: string;
  bloodType: string;
  units: number;
  urgency: "Critical" | "High" | "Medium" | "Low";
  hospital: string;
  hospitalType: "Government" | "Private" | "Blood Bank" | "Medical College";
  address: string;
  distance: string;
  requestedDate: string;
  patientAge: number;
  patientGender: "Male" | "Female";
  reason: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  requiredBy: string;
  description: string;
  status: "Active" | "Fulfilled" | "Expired" | "Cancelled";
  matchPercentage: number;
  lastUpdated: string;
  bloodBankDetails: {
    registrationNumber: string;
    bloodAvailability: Record<string, number>;
    operatingHours: string;
    website?: string;
    emergencyContact: string;
    facilities: string[];
    // Enhanced real-time details from eraktkosh.mohfw.gov.in style data
    certifications?: string[];
    operationalStatus?: string;
    currentCapacity?: number;
    emergencyReady?: boolean;
    lastInspection?: string;
    donorQueue?: {
      currentDonors: number;
      estimatedWaitTime: number;
      availableSlots: number;
      nextAvailableSlot: string;
      totalDonationsToday?: number;
    };
    bloodComponents?: {
      wholeBlood: number;
      redBloodCells: number;
      plasma: number;
      platelets: number;
      cryoprecipitate: number;
    };
    equipmentStatus?: {
      refrigerators: string;
      freezers: string;
      centrifuges: string;
      bloodBankSoftware: string;
      backupPower: string;
    };
    realtimeUpdates?: {
      lastSync: string;
      dataSource: string;
      connectionStatus: string;
      nextUpdate: string;
    };
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  location: LocationData;
}

export type BloodType = "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
export type UrgencyLevel = "Critical" | "High" | "Medium" | "Low";
export type HospitalType = "Government" | "Private" | "Blood Bank" | "Medical College";