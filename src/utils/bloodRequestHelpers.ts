import { BloodRequest } from "../types/bloodRequest";

// Helper functions for styling and UI
export const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-green-100 text-green-800 border-green-200';
  }
};

export const getHospitalTypeColor = (type: string) => {
  switch (type) {
    case 'Government': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Private': return 'bg-green-100 text-green-800 border-green-200';
    case 'Blood Bank': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Medical College': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Filtering function
export const filterBloodRequests = (
  requests: BloodRequest[],
  searchTerm: string,
  selectedBloodType: string,
  selectedUrgency: string,
  selectedHospitalType: string,
  selectedState: string,
  selectedDistrict: string,
  selectedCity: string,
  selectedDistance: string
) => {
  return requests.filter(request => {
    const matchesSearch = request.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.location.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBloodType = selectedBloodType === "all" || request.bloodType === selectedBloodType;
    const matchesUrgency = selectedUrgency === "all" || request.urgency === selectedUrgency;
    const matchesHospitalType = selectedHospitalType === "all" || request.hospitalType === selectedHospitalType;
    
    const matchesState = selectedState === "all" || request.location.state === selectedState;
    const matchesDistrict = selectedDistrict === "all" || request.location.district === selectedDistrict;
    const matchesCity = selectedCity === "all" || request.location.city === selectedCity;
    
    const matchesDistance = selectedDistance === "all" || 
                           (selectedDistance === "5" && parseFloat(request.distance) <= 5) ||
                           (selectedDistance === "10" && parseFloat(request.distance) <= 10) ||
                           (selectedDistance === "20" && parseFloat(request.distance) <= 20) ||
                           (selectedDistance === "50" && parseFloat(request.distance) <= 50);
    
    return matchesSearch && matchesBloodType && matchesUrgency && matchesHospitalType && 
           matchesState && matchesDistrict && matchesCity && matchesDistance;
  });
};

// Sorting function
export const sortBloodRequests = (requests: BloodRequest[], sortBy: string) => {
  return [...requests].sort((a, b) => {
    switch (sortBy) {
      case "urgency":
        const urgencyOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      case "distance":
        return parseFloat(a.distance) - parseFloat(b.distance);
      case "compatibility":
        return b.matchPercentage - a.matchPercentage;
      case "recent":
        return new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime();
      default:
        return 0;
    }
  });
};

// CSV export function
export const exportRequestsToCSV = (requests: BloodRequest[]) => {
  const headers = [
    "ID", "Hospital", "Blood Type", "Units", "Urgency", "Required By",
    "Contact Person", "Phone", "Address", "Distance", "Status"
  ];
  
  const csvData = [
    headers.join(","),
    ...requests.map(request => [
      request.id,
      `"${request.hospital}"`,
      request.bloodType,
      request.units,
      request.urgency,
      `"${request.requiredBy}"`,
      `"${request.contactPerson}"`,
      request.contactPhone,
      `"${request.address}"`,
      request.distance,
      request.status
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvData], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `blood-requests-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Enhanced real-time API simulation with multiple data sources
export const simulateAPICall = async (showLoading = true): Promise<BloodRequest[]> => {
  // Simulate API call delay with status updates
  if (showLoading) {
    console.log("🔄 Fetching data from eraktkosh.mohfw.gov.in...");
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log("🔄 Connecting to National Blood Bank Network...");
    await new Promise(resolve => setTimeout(resolve, 600));
    
    console.log("🔄 Retrieving real-time hospital data...");
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log("🔄 Synchronizing blood stock levels...");
    await new Promise(resolve => setTimeout(resolve, 300));
  } else {
    // Quick refresh simulation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  }

  // Simulate rare API failures (5% chance)
  if (Math.random() < 0.05) {
    throw new Error("Network timeout: Unable to reach eraktkosh.mohfw.gov.in blood bank API. Retrying with local cache...");
  }

  // Import here to avoid circular dependencies
  const { generateEnhancedBloodRequests } = await import("./bloodRequestData");
  const data = generateEnhancedBloodRequests();
  
  console.log(`✅ Successfully fetched ${data.length} real-time blood requests from multiple sources`);
  return data;
};

// Simulate real-time blood stock level updates
export const getRealtimeBloodStock = () => {
  const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const stock: Record<string, number> = {};
  
  bloodTypes.forEach(type => {
    // Simulate fluctuating stock levels
    const baseStock = Math.floor(Math.random() * 40) + 10;
    const fluctuation = Math.floor(Math.random() * 10) - 5;
    stock[type] = Math.max(0, baseStock + fluctuation);
  });
  
  return stock;
};

// Simulate hospital operational status
export const getHospitalOperationalStatus = () => {
  const statuses = [
    { status: "Fully Operational", capacity: 100, emergencyReady: true },
    { status: "High Capacity", capacity: 85, emergencyReady: true },
    { status: "Moderate Capacity", capacity: 60, emergencyReady: true },
    { status: "Limited Capacity", capacity: 35, emergencyReady: false },
  ];
  
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Simulate real-time donor queue status
export const getDonorQueueStatus = () => {
  return {
    currentDonors: Math.floor(Math.random() * 8) + 2,
    estimatedWaitTime: Math.floor(Math.random() * 30) + 15,
    availableSlots: Math.floor(Math.random() * 5) + 1,
    nextAvailableSlot: new Date(Date.now() + (Math.random() * 4 + 1) * 60 * 60 * 1000).toLocaleTimeString()
  };
};