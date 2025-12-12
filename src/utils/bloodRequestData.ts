import { BloodRequest, LocationData } from "../types/bloodRequest";

// Mock API endpoint for simulating data fetch
export const MOCK_API_ENDPOINT = "https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/stockAvailability.cnt";

// Indian states, districts, and cities data
export const locationHierarchy = {
  "Andhra Pradesh": {
    "Visakhapatnam": ["Gajuwaka", "Madhurawada", "Dwaraka Nagar", "MVP Colony"],
    "Vijayawada": ["Benz Circle", "Labbipet", "Patamata", "Auto Nagar"],
    "Guntur": ["Kothapeta", "Naaz", "Brindavan Gardens", "Chandramouli Nagar"],
    "Tirupati": ["Balaji Nagar", "Leela Mahal Road", "AIR Bypass Road", "Tirumala"]
  },
  "Arunachal Pradesh": {
    "Itanagar": ["Naharlagun", "Nirjuli", "Banderdewa", "Chimpu"],
    "Tawang": ["Tawang Town", "Jang", "Lumla", "Mukto"]
  },
  "Assam": {
    "Guwahati": ["Fancy Bazaar", "Paltan Bazaar", "Ulubari", "Zoo Narengi Road"],
    "Dibrugarh": ["Graham Bazaar", "Mancotta Road", "New Market", "Chowkidingee"],
    "Jorhat": ["AT Road", "Pulibor", "Civil Hospital Road", "Cinnamara"]
  },
  "Bihar": {
    "Patna": ["Boring Road", "Fraser Road", "Kankarbagh", "Rajendra Nagar"],
    "Gaya": ["Station Road", "Civil Lines", "Ramna", "Collectorate"],
    "Bhagalpur": ["Nathnagar", "Sabour", "Kahalgaon", "Sultanganj"],
    "Muzaffarpur": ["Brahmpura", "Jubba Sahni", "Saraiyaganj", "Mithanpura"]
  },
  "Chhattisgarh": {
    "Raipur": ["Shankar Nagar", "Devendra Nagar", "Pandri", "Civil Lines"],
    "Bilaspur": ["Link Road", "Vyapar Vihar", "Torwa", "Sakri"],
    "Korba": ["Power House", "Transport Nagar", "Dipika", "Balco Nagar"]
  },
  "Delhi": {
    "Central Delhi": ["Connaught Place", "Karol Bagh", "Paharganj", "Civil Lines"],
    "New Delhi": ["Chanakyapuri", "Khan Market", "Lajpat Nagar", "Saket"],
    "North Delhi": ["Model Town", "Civil Lines", "Kamla Nagar", "Mall Road"],
    "South Delhi": ["Hauz Khas", "Vasant Kunj", "Greater Kailash", "Saket"],
    "East Delhi": ["Laxmi Nagar", "Preet Vihar", "Krishna Nagar", "Nirman Vihar"],
    "West Delhi": ["Rajouri Garden", "Janakpuri", "Dwarka", "Tilak Nagar"]
  },
  "Goa": {
    "North Goa": ["Panaji", "Mapusa", "Calangute", "Anjuna"],
    "South Goa": ["Margao", "Vasco da Gama", "Ponda", "Canacona"]
  },
  "Gujarat": {
    "Ahmedabad": ["Vastrapur", "Satellite", "Maninagar", "Naranpura"],
    "Surat": ["Adajan", "Rander", "Katargam", "Varachha"],
    "Vadodara": ["Alkapuri", "Sayajigunj", "Fatehgunj", "Karelibaug"],
    "Rajkot": ["Race Course", "University Road", "Kalavad Road", "Gondal Road"]
  },
  "Haryana": {
    "Gurgaon": ["Sector 14", "DLF Phase 1", "Sector 56", "Golf Course Road"],
    "Faridabad": ["Sector 16", "Old Faridabad", "NIT", "Sector 21"],
    "Panipat": ["Model Town", "Devi Lal Colony", "GT Road", "Samalkha"],
    "Ambala": ["Ambala Cantonment", "Ambala City", "Model Town", "Mahesh Nagar"]
  },
  "Himachal Pradesh": {
    "Shimla": ["The Mall", "Christ Church", "Jakhu", "Sanjauli"],
    "Manali": ["Old Manali", "Vashisht", "Solang Valley", "Hadimba"],
    "Dharamshala": ["McLeod Ganj", "Kotwali Bazaar", "Dharamkot", "Bhagsu"]
  },
  "Jharkhand": {
    "Ranchi": ["Main Road", "Kanke", "Doranda", "Harmu"],
    "Jamshedpur": ["Bistupur", "Kadma", "Golmuri", "Sakchi"],
    "Dhanbad": ["Hirapur", "Bank More", "Saraidhela", "Jharia"],
    "Bokaro": ["Sector 4", "City Centre", "Chas", "Thermal"]
  },
  "Maharashtra": {
    "Mumbai": ["Andheri", "Bandra", "Borivali", "Thane", "Navi Mumbai"],
    "Pune": ["Kothrud", "Hinjewadi", "Baner", "Warje", "Aundh"],
    "Nashik": ["Nashik Road", "College Road", "Gangapur Road", "Panchavati"],
    "Aurangabad": ["CIDCO", "Jalna Road", "Station Road", "Kranti Chowk"],
    "Nagpur": ["Sadar", "Dharampeth", "Sitabuldi", "Hingna"],
    "Solapur": ["North Solapur", "South Solapur", "Central Solapur", "Akkalkot Road"]
  },
  "Karnataka": {
    "Bangalore Urban": ["Whitefield", "Electronic City", "HSR Layout", "Koramangala", "Indiranagar"],
    "Mysore": ["Mysore City", "Chamundi Hills", "Hebbal", "Vijayanagar"],
    "Mangalore": ["Mangalore City", "Ullal", "Surathkal", "Kankanady"],
    "Hubli": ["Hubli City", "Dharwad", "Unkal", "Vidyanagar"],
    "Belgaum": ["Belgaum City", "Angol", "Hindalga", "Tilakwadi"]
  },
  "Tamil Nadu": {
    "Chennai": ["T Nagar", "Anna Nagar", "Velachery", "Adyar", "Tambaram"],
    "Coimbatore": ["RS Puram", "Peelamedu", "Singanallur", "Saravanampatti"],
    "Madurai": ["Anna Nagar", "K K Nagar", "Sellur", "Vilangudi"],
    "Salem": ["Salem Junction", "New Salem", "Ammapet", "Suramangalam"],
    "Tiruchirappalli": ["Srirangam", "Cantonment", "Ariyamangalam", "Thillai Nagar"]
  },
  "West Bengal": {
    "Kolkata": ["Salt Lake", "New Town", "Park Street", "Howrah", "Ballygunge"],
    "Darjeeling": ["Darjeeling", "Kalimpong", "Kurseong", "Mirik"],
    "Hooghly": ["Chandannagar", "Serampore", "Chinsurah", "Bhadreswar"],
    "Durgapur": ["Durgapur Steel City", "Bidhannagar", "City Centre", "Benachity"],
    "Siliguri": ["Pradhan Nagar", "Matigara", "Salugara", "Bhaktinagar"]
  },
  "Uttar Pradesh": {
    "Lucknow": ["Hazratganj", "Gomti Nagar", "Alambagh", "Chinhat"],
    "Kanpur Nagar": ["Civil Lines", "Kalyanpur", "Swaroop Nagar", "Kakadeo"],
    "Ghaziabad": ["Vaishali", "Indirapuram", "Raj Nagar", "Crossings Republik"],
    "Noida": ["Sector 62", "Sector 18", "Sector 137", "Greater Noida"],
    "Agra": ["Sikandra", "Kamla Nagar", "Dayalbagh", "Sadar"],
    "Meerut": ["Sadar", "Cantonment", "Brahmapuri", "Shastri Nagar"]
  },
  "Gujarat": {
    "Ahmedabad": ["Vastrapur", "Satellite", "Maninagar", "Naranpura"],
    "Surat": ["Adajan", "Rander", "Katargam", "Varachha"],
    "Vadodara": ["Alkapuri", "Sayajigunj", "Fatehgunj", "Karelibaug"],
    "Rajkot": ["Race Course", "University Road", "Kalavad Road", "Gondal Road"]
  },
  "Rajasthan": {
    "Jaipur": ["C Scheme", "Malviya Nagar", "Vaishali Nagar", "Mansarovar"],
    "Jodhpur": ["Ratanada", "Shastri Nagar", "Paota", "Sardarpura"],
    "Udaipur": ["City Palace", "Fateh Sagar", "Sukhadia Circle", "Sector 14"],
    "Kota": ["Vallabh Nagar", "Dadabari", "Talwandi", "Gumanpura"]
  },
  "Haryana": {
    "Gurgaon": ["Sector 14", "DLF Phase 1", "Sector 56", "Golf Course Road"],
    "Faridabad": ["Sector 16", "Old Faridabad", "NIT", "Sector 21"],
    "Panipat": ["Model Town", "Devi Lal Colony", "GT Road", "Samalkha"],
    "Ambala": ["Ambala Cantonment", "Ambala City", "Model Town", "Mahesh Nagar"]
  },
  "Punjab": {
    "Ludhiana": ["Civil Lines", "Sarabha Nagar", "Model Town", "Dugri"],
    "Amritsar": ["Golden Temple Area", "Ranjit Avenue", "Lawrence Road", "Chheharta"],
    "Jalandhar": ["Model Town", "Civil Lines", "Rama Mandi", "Kapurthala Road"],
    "Patiala": ["Leela Bhawan", "Bahadurgarh", "Rajpura Road", "Tripuri"]
  },
  "Madhya Pradesh": {
    "Bhopal": ["New Market", "Arera Colony", "MP Nagar", "Kolar"],
    "Indore": ["Vijay Nagar", "Palasia", "AB Road", "Rau"],
    "Gwalior": ["Lashkar", "Morar", "City Centre", "Thatipur"],
    "Jabalpur": ["Civil Lines", "Napier Town", "Wright Town", "Sadar"]
  },
  "Bihar": {
    "Patna": ["Boring Road", "Fraser Road", "Kankarbagh", "Rajendra Nagar"],
    "Gaya": ["Station Road", "Civil Lines", "Ramna", "Collectorate"],
    "Bhagalpur": ["Nathnagar", "Sabour", "Kahalgaon", "Sultanganj"],
    "Muzaffarpur": ["Brahmpura", "Jubba Sahni", "Saraiyaganj", "Mithanpura"]
  },
  "Jharkhand": {
    "Ranchi": ["Main Road", "Kanke", "Doranda", "Harmu"],
    "Jamshedpur": ["Bistupur", "Kadma", "Golmuri", "Sakchi"],
    "Dhanbad": ["Hirapur", "Bank More", "Saraidhela", "Jharia"],
    "Bokaro": ["Sector 4", "City Centre", "Chas", "Thermal"]
  },
  "Jammu and Kashmir": {
    "Srinagar": ["Dal Lake", "Lal Chowk", "Rajbagh", "Jawahar Nagar"],
    "Jammu": ["Gandhi Nagar", "Residency Road", "Jewel Chowk", "Talab Tillo"],
    "Anantnag": ["Anantnag Town", "Mattan", "Pahalgam", "Kokernag"]
  },
  "Karnataka": {
    "Bangalore Urban": ["Whitefield", "Electronic City", "HSR Layout", "Koramangala", "Indiranagar"],
    "Mysore": ["Mysore City", "Chamundi Hills", "Hebbal", "Vijayanagar"],
    "Mangalore": ["Mangalore City", "Ullal", "Surathkal", "Kankanady"],
    "Hubli": ["Hubli City", "Dharwad", "Unkal", "Vidyanagar"],
    "Belgaum": ["Belgaum City", "Angol", "Hindalga", "Tilakwadi"]
  },
  "Kerala": {
    "Thiruvananthapuram": ["Pattom", "Kowdiar", "Vellayambalam", "Sasthamangalam"],
    "Kochi": ["Marine Drive", "Fort Kochi", "Kakkanad", "Palarivattom"],
    "Kozhikode": ["Mavoor Road", "SM Street", "West Hill", "Nadakkavu"],
    "Thrissur": ["Swaraj Round", "Chembotti Lane", "Palace Road", "East Fort"]
  },
  "Madhya Pradesh": {
    "Bhopal": ["New Market", "Arera Colony", "MP Nagar", "Kolar"],
    "Indore": ["Vijay Nagar", "Palasia", "AB Road", "Rau"],
    "Gwalior": ["Lashkar", "Morar", "City Centre", "Thatipur"],
    "Jabalpur": ["Civil Lines", "Napier Town", "Wright Town", "Sadar"]
  },
  "Manipur": {
    "Imphal West": ["Imphal", "Lamphelpat", "Canchipur", "Langol"],
    "Imphal East": ["Porompat", "Jiribam", "Sekmai", "Heingang"]
  },
  "Meghalaya": {
    "East Khasi Hills": ["Shillong", "Cherrapunji", "Mawkyrwat", "Nongpoh"],
    "West Garo Hills": ["Tura", "Dadenggre", "Ampati", "Baghmara"]
  },
  "Mizoram": {
    "Aizawl": ["Aizawl City", "Durtlang", "Republic Veng", "Thuampui"],
    "Lunglei": ["Lunglei Town", "Hnahthial", "Tlabung", "Bunghmun"]
  },
  "Nagaland": {
    "Kohima": ["Kohima Town", "Jotsoma", "Jakhama", "Khuzama"],
    "Dimapur": ["Hong Kong Market", "Duncan Basti", "Circular Road", "Nagarjan"]
  },
  "Odisha": {
    "Bhubaneswar": ["Unit 1", "Patia", "Chandrasekharpur", "Nayapalli"],
    "Cuttack": ["Link Road", "Buxi Bazaar", "Bidanasi", "Choudwar"],
    "Rourkela": ["Civil Township", "Plant Site", "Sector 19", "Fertilizer Township"],
    "Berhampur": ["Ganjam", "Brahmapur", "Silk City", "Gandhi Nagar"]
  },
  "Puducherry": {
    "Puducherry": ["White Town", "Lawspet", "Mudaliarpet", "Villianur"],
    "Karaikal": ["Karaikal Town", "Thirunallar", "Neravy", "Kottucherry"]
  },
  "Sikkim": {
    "East Sikkim": ["Gangtok", "Ranipool", "Singtam", "Pakyong"],
    "West Sikkim": ["Geyzing", "Pelling", "Jorethang", "Nayabazar"]
  },
  "Telangana": {
    "Hyderabad": ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Kondapur"],
    "Warangal": ["Hanamkonda", "Kazipet", "Subedari", "Warangal City"],
    "Nizamabad": ["Clock Tower", "Armoor", "Bodhan", "Kamareddy"]
  },
  "Tripura": {
    "West Tripura": ["Agartala", "Udaipur", "Sonamura", "Jirania"],
    "South Tripura": ["Belonia", "Santirbazar", "Sabroom", "Rajnagar"]
  },
  "Uttarakhand": {
    "Dehradun": ["Clock Tower", "Rajpur Road", "Saharanpur Road", "Clement Town"],
    "Haridwar": ["Har Ki Pauri", "BHEL", "Jwalapur", "Roorkee Road"],
    "Nainital": ["Mallital", "Tallital", "Bhowali", "Haldwani"]
  }
};

// Hospital data for mock generation
const hospitals = [
  {
    name: "All India Institute of Medical Sciences (AIIMS)",
    type: "Government" as const,
    regNumber: "DEL/BB/001",
    lat: 28.5665,
    lng: 77.2066,
    location: { state: "Delhi", district: "New Delhi", city: "Ansari Nagar", pincode: "110029" }
  },
  {
    name: "Apollo Hospitals",
    type: "Private" as const,
    regNumber: "DEL/BB/002",
    lat: 28.5355,
    lng: 77.2850,
    location: { state: "Delhi", district: "South Delhi", city: "Saket", pincode: "110076" }
  },
  {
    name: "KEM Hospital",
    type: "Government" as const,
    regNumber: "MH/BB/001",
    lat: 19.0176,
    lng: 72.8562,
    location: { state: "Maharashtra", district: "Mumbai", city: "Bandra", pincode: "400012" }
  },
  {
    name: "Fortis Healthcare",
    type: "Private" as const,
    regNumber: "KA/BB/001",
    lat: 12.9716,
    lng: 77.5946,
    location: { state: "Karnataka", district: "Bangalore Urban", city: "Electronic City", pincode: "560100" }
  },
  {
    name: "Red Cross Society Blood Bank",
    type: "Blood Bank" as const,
    regNumber: "DEL/BB/005",
    lat: 28.6448,
    lng: 77.2177,
    location: { state: "Delhi", district: "Central Delhi", city: "Connaught Place", pincode: "110001" }
  },
  {
    name: "Max Super Speciality Hospital",
    type: "Private" as const,
    regNumber: "DEL/BB/006",
    lat: 28.5268,
    lng: 77.2167,
    location: { state: "Delhi", district: "South Delhi", city: "Saket", pincode: "110017" }
  },
  {
    name: "Christian Medical College",
    type: "Medical College" as const,
    regNumber: "TN/BB/001",
    lat: 12.9165,
    lng: 79.1325,
    location: { state: "Tamil Nadu", district: "Chennai", city: "Velachery", pincode: "600042" }
  },
  {
    name: "Ruby General Hospital",
    type: "Private" as const,
    regNumber: "WB/BB/001",
    lat: 22.5726,
    lng: 88.3639,
    location: { state: "West Bengal", district: "Kolkata", city: "Salt Lake", pincode: "700091" }
  },
  {
    name: "Sanjay Gandhi PGIMS",
    type: "Government" as const,
    regNumber: "UP/BB/001",
    lat: 26.8467,
    lng: 80.9462,
    location: { state: "Uttar Pradesh", district: "Lucknow", city: "Gomti Nagar", pincode: "226014" }
  },
  {
    name: "Sassoon General Hospital",
    type: "Government" as const,
    regNumber: "MH/BB/002",
    lat: 18.5204,
    lng: 73.8567,
    location: { state: "Maharashtra", district: "Pune", city: "Kothrud", pincode: "411038" }
  },
  {
    name: "AIIMS Rishikesh",
    type: "Government" as const,
    regNumber: "UP/BB/003",
    lat: 26.8467,
    lng: 80.9462,
    location: { state: "Uttar Pradesh", district: "Agra", city: "Sikandra", pincode: "282007" }
  },
  {
    name: "Sterling Hospital",
    type: "Private" as const,
    regNumber: "GJ/BB/001",
    lat: 23.0225,
    lng: 72.5714,
    location: { state: "Gujarat", district: "Ahmedabad", city: "Satellite", pincode: "380015" }
  },
  {
    name: "SMS Hospital",
    type: "Government" as const,
    regNumber: "RJ/BB/001",
    lat: 26.9124,
    lng: 75.7873,
    location: { state: "Rajasthan", district: "Jaipur", city: "C Scheme", pincode: "302001" }
  },
  {
    name: "Medanta Hospital",
    type: "Private" as const,
    regNumber: "HR/BB/001",
    lat: 28.4595,
    lng: 77.0266,
    location: { state: "Haryana", district: "Gurgaon", city: "Sector 38", pincode: "122001" }
  },
  {
    name: "Hero DMC Heart Institute",
    type: "Private" as const,
    regNumber: "PB/BB/001",
    lat: 30.9010,
    lng: 75.8573,
    location: { state: "Punjab", district: "Ludhiana", city: "Civil Lines", pincode: "141001" }
  },
  {
    name: "AIIMS Bhopal",
    type: "Government" as const,
    regNumber: "MP/BB/001",
    lat: 23.2599,
    lng: 77.4126,
    location: { state: "Madhya Pradesh", district: "Bhopal", city: "Saket Nagar", pincode: "462020" }
  },
  {
    name: "AIIMS Patna",
    type: "Government" as const,
    regNumber: "BR/BB/001",
    lat: 25.5941,
    lng: 85.1376,
    location: { state: "Bihar", district: "Patna", city: "Phulwari Sharif", pincode: "801507" }
  },
  {
    name: "Tata Main Hospital",
    type: "Private" as const,
    regNumber: "JH/BB/001",
    lat: 22.8046,
    lng: 86.2029,
    location: { state: "Jharkhand", district: "Jamshedpur", city: "Bistupur", pincode: "831001" }
  },
  {
    name: "AIIMS Bhubaneswar",
    type: "Government" as const,
    regNumber: "OD/BB/001",
    lat: 20.2961,
    lng: 85.8245,
    location: { state: "Odisha", district: "Bhubaneswar", city: "Sijua", pincode: "751019" }
  }
];

// Enhanced mock data generator with real-time hospital data simulation
export const generateEnhancedBloodRequests = (): BloodRequest[] => {
  const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const urgencyLevels: Array<"Critical" | "High" | "Medium" | "Low"> = ["Critical", "High", "Medium", "Low"];
  const reasons = [
    "Emergency Surgery", "Trauma Treatment", "Cancer Treatment", "Scheduled Surgery",
    "Blood Disorder Treatment", "Organ Transplant", "Cardiac Surgery", "Maternity Care"
  ];

  return Array.from({ length: 25 }, (_, index) => {
    const hospital = hospitals[index % hospitals.length];
    const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
    const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    
    // Enhanced real-time blood availability with fluctuations
    const bloodAvailability: Record<string, number> = {};
    bloodTypes.forEach(type => {
      const baseStock = Math.floor(Math.random() * 50) + 10;
      const realtimeFluctuation = Math.floor(Math.random() * 10) - 5;
      bloodAvailability[type] = Math.max(0, baseStock + realtimeFluctuation);
    });

    // Dynamic operational status
    const operationalStatus = getHospitalOperationalStatus();
    const donorQueue = getDonorQueueStatus();

    const fullAddress = `${hospital.location.city}, ${hospital.location.district}, ${hospital.location.state} - ${hospital.location.pincode}`;

    // Enhanced facilities with specialized equipment
    const allFacilities = [
      "Blood Collection", "Blood Storage", "Cross Matching", "Component Separation",
      "Quality Testing", "Emergency Services", "Platelet Apheresis", "Blood Typing",
      "Plasma Freezing", "Cryopreservation", "HLA Typing", "Viral Marker Testing",
      "RFID Tracking", "Temperature Monitoring", "24/7 Lab Services", "Mobile Collection Unit",
      "Apheresis Unit", "Cord Blood Banking", "Autologous Collection", "Directed Donation"
    ];

    // Certifications and accreditations
    const certifications = [
      "NABH Accredited", "ISO 9001:2015", "CAP Accredited", "AABB Standards",
      "NBTC Certified", "WHO-GMP Compliant", "NABL Accredited", "DGHS Licensed"
    ];

    return {
      id: `BR-2024-${String(index + 1).padStart(3, "0")}`,
      bloodType,
      units: Math.floor(Math.random() * 5) + 1,
      urgency,
      hospital: hospital.name,
      hospitalType: hospital.type,
      address: fullAddress,
      distance: `${(Math.random() * 25 + 0.5).toFixed(1)} km`,
      requestedDate: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString().split('T')[0],
      patientAge: Math.floor(Math.random() * 70) + 18,
      patientGender: Math.random() > 0.5 ? "Male" : "Female",
      reason,
      contactPerson: `Dr. ${["Sharma", "Patel", "Singh", "Kumar", "Gupta", "Agarwal", "Verma", "Mishra", "Reddy", "Rao"][Math.floor(Math.random() * 10)]}`,
      contactPhone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      contactEmail: `contact${index + 1}@${hospital.name.toLowerCase().replace(/\s+/g, '')}.in`,
      requiredBy: new Date(Date.now() + Math.random() * 86400000 * 2).toLocaleString(),
      description: `${reason} requiring ${bloodType} blood transfusion. ${urgency === "Critical" ? "Immediate" : "Scheduled"} medical intervention needed.`,
      status: Math.random() > 0.1 ? "Active" : "Fulfilled",
      matchPercentage: Math.floor(Math.random() * 30) + 70,
      lastUpdated: new Date().toISOString(),
      bloodBankDetails: {
        registrationNumber: hospital.regNumber,
        bloodAvailability,
        operatingHours: index % 3 === 0 ? "24/7" : index % 4 === 0 ? "24/7 Emergency" : "8:00 AM - 8:00 PM",
        website: `https://www.${hospital.name.toLowerCase().replace(/\s+/g, '')}.in`,
        emergencyContact: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        facilities: allFacilities.slice(0, Math.floor(Math.random() * 8) + 6),
        // Enhanced details from eraktkosh-style data
        certifications: certifications.slice(0, Math.floor(Math.random() * 4) + 2),
        operationalStatus: operationalStatus.status,
        currentCapacity: operationalStatus.capacity,
        emergencyReady: operationalStatus.emergencyReady,
        lastInspection: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        donorQueue: donorQueue,
        bloodComponents: {
          wholeBlood: Math.floor(Math.random() * 100) + 20,
          redBloodCells: Math.floor(Math.random() * 80) + 15,
          plasma: Math.floor(Math.random() * 60) + 25,
          platelets: Math.floor(Math.random() * 40) + 10,
          cryoprecipitate: Math.floor(Math.random() * 20) + 5
        },
        equipmentStatus: {
          refrigerators: Math.random() > 0.1 ? "Operational" : "Maintenance",
          freezers: Math.random() > 0.05 ? "Operational" : "Maintenance",
          centrifuges: Math.random() > 0.08 ? "Operational" : "Maintenance",
          bloodBankSoftware: "Online",
          backupPower: Math.random() > 0.02 ? "Available" : "Testing"
        },
        realtimeUpdates: {
          lastSync: new Date().toLocaleTimeString(),
          dataSource: "eraktkosh.mohfw.gov.in",
          connectionStatus: "Active",
          nextUpdate: new Date(Date.now() + 60000).toLocaleTimeString()
        }
      },
      coordinates: {
        lat: hospital.lat + (Math.random() - 0.5) * 0.01,
        lng: hospital.lng + (Math.random() - 0.5) * 0.01
      },
      location: hospital.location
    };
  });
};

// Helper functions for enhanced data generation
const getHospitalOperationalStatus = () => {
  const statuses = [
    { status: "Fully Operational", capacity: 100, emergencyReady: true },
    { status: "High Capacity", capacity: 85, emergencyReady: true },
    { status: "Moderate Capacity", capacity: 60, emergencyReady: true },
    { status: "Limited Capacity", capacity: 35, emergencyReady: false },
    { status: "Emergency Only", capacity: 20, emergencyReady: true },
  ];
  
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getDonorQueueStatus = () => {
  return {
    currentDonors: Math.floor(Math.random() * 8) + 2,
    estimatedWaitTime: Math.floor(Math.random() * 30) + 15,
    availableSlots: Math.floor(Math.random() * 5) + 1,
    nextAvailableSlot: new Date(Date.now() + (Math.random() * 4 + 1) * 60 * 60 * 1000).toLocaleTimeString(),
    totalDonationsToday: Math.floor(Math.random() * 50) + 10
  };
};

// Legacy function for backward compatibility
export const generateMockBloodRequests = generateEnhancedBloodRequests;