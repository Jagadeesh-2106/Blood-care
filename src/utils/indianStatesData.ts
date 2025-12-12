export interface IndianState {
  code: string;
  name: string;
  districts: string[];
  majorCities: string[];
}

export const INDIAN_STATES: IndianState[] = [
  {
    code: "AP",
    name: "Andhra Pradesh",
    districts: ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
    majorCities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Kadapa", "Kakinada", "Anantapur", "Tirupati"]
  },
  {
    code: "AR",
    name: "Arunachal Pradesh", 
    districts: ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
    majorCities: ["Itanagar", "Naharlagun", "Pasighat", "Aalo", "Bomdila", "Tezpur", "Ziro"]
  },
  {
    code: "AS",
    name: "Assam",
    districts: ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup (Rural)", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Dima Hasao", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
    majorCities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Sivasagar"]
  },
  {
    code: "BR",
    name: "Bihar",
    districts: ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
    majorCities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger"]
  },
  {
    code: "CT",
    name: "Chhattisgarh",
    districts: ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Korea", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
    majorCities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Mahasamund"]
  },
  {
    code: "DL",
    name: "Delhi",
    districts: ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
    majorCities: ["New Delhi", "Delhi", "Gurgaon", "Noida", "Faridabad", "Ghaziabad"]
  },
  {
    code: "GA",
    name: "Goa",
    districts: ["North Goa", "South Goa"],
    majorCities: ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda"]
  },
  {
    code: "GJ",
    name: "Gujarat",
    districts: ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kachchh", "Kheda", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
    majorCities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Bharuch"]
  },
  {
    code: "HR",
    name: "Haryana",
    districts: ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
    majorCities: ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"]
  },
  {
    code: "HP",
    name: "Himachal Pradesh",
    districts: ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
    majorCities: ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Hamirpur", "Una", "Bilaspur", "Chamba", "Palampur"]
  },
  {
    code: "JH",
    name: "Jharkhand",
    districts: ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
    majorCities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar", "Chirkunda"]
  },
  {
    code: "KA",
    name: "Karnataka",
    districts: ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
    majorCities: ["Bengaluru", "Mysuru", "Hubli-Dharwad", "Mangaluru", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga"]
  },
  {
    code: "KL",
    name: "Kerala",
    districts: ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
    majorCities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur", "Kottayam", "Malappuram"]
  },
  {
    code: "MP",
    name: "Madhya Pradesh",
    districts: ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
    majorCities: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"]
  },
  {
    code: "MH",
    name: "Maharashtra",
    districts: ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
    majorCities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Thane", "Kolhapur", "Sangli", "Amravati"]
  },
  {
    code: "MN",
    name: "Manipur",
    districts: ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
    majorCities: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Senapati"]
  },
  {
    code: "ML",
    name: "Meghalaya",
    districts: ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
    majorCities: ["Shillong", "Tura", "Jowai", "Nongpoh", "Baghmara"]
  },
  {
    code: "MZ",
    name: "Mizoram",
    districts: ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
    majorCities: ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"]
  },
  {
    code: "NL",
    name: "Nagaland",
    districts: ["Chumukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Noklak", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
    majorCities: ["Dimapur", "Kohima", "Mokokchung", "Wokha", "Tuensang"]
  },
  {
    code: "OR",
    name: "Odisha",
    districts: ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
    majorCities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"]
  },
  {
    code: "PB",
    name: "Punjab",
    districts: ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Malerkotla", "Mansa", "Moga", "Mohali", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Shaheed Bhagat Singh Nagar", "Tarn Taran"],
    majorCities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur", "Hoshiarpur", "Batala", "Pathankot"]
  },
  {
    code: "RJ",
    name: "Rajasthan",
    districts: ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
    majorCities: ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bharatpur", "Alwar", "Sikar", "Bhilwara"]
  },
  {
    code: "SK",
    name: "Sikkim",
    districts: ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
    majorCities: ["Gangtok", "Namchi", "Gyalshing", "Mangan"]
  },
  {
    code: "TN",
    name: "Tamil Nadu",
    districts: ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
    majorCities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi"]
  },
  {
    code: "TG",
    name: "Telangana",
    districts: ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
    majorCities: ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahabubnagar", "Nalgonda", "Adilabad", "Suryapet"]
  },
  {
    code: "TR",
    name: "Tripura",
    districts: ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
    majorCities: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia"]
  },
  {
    code: "UP",
    name: "Uttar Pradesh",
    districts: ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shrawasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
    majorCities: ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad"]
  },
  {
    code: "UT",
    name: "Uttarakhand",
    districts: ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
    majorCities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani-Kathgodam", "Rudrapur", "Kashipur", "Rishikesh", "Kotdwar", "Ramnagar", "Pithoragarh"]
  },
  {
    code: "WB",
    name: "West Bengal",
    districts: ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
    majorCities: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur"]
  },
  // Union Territories
  {
    code: "AN",
    name: "Andaman and Nicobar Islands",
    districts: ["Nicobar", "North and Middle Andaman", "South Andaman"],
    majorCities: ["Port Blair", "Diglipur", "Rangat", "Mayabunder", "Car Nicobar"]
  },
  {
    code: "CH",
    name: "Chandigarh",
    districts: ["Chandigarh"],
    majorCities: ["Chandigarh"]
  },
  {
    code: "DN",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    districts: ["Dadra and Nagar Haveli", "Daman", "Diu"],
    majorCities: ["Silvassa", "Daman", "Diu"]
  },
  {
    code: "JK",
    name: "Jammu and Kashmir",
    districts: ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
    majorCities: ["Srinagar", "Jammu", "Baramulla", "Anantnag", "Sopore", "Kathua", "Udhampur", "Punch", "Rajouri", "Kupwara"]
  },
  {
    code: "LA",
    name: "Ladakh",
    districts: ["Kargil", "Leh"],
    majorCities: ["Leh", "Kargil", "Nubra", "Zanskar"]
  },
  {
    code: "LD",
    name: "Lakshadweep",
    districts: ["Lakshadweep"],
    majorCities: ["Kavaratti", "Agatti", "Minicoy"]
  },
  {
    code: "PY",
    name: "Puducherry",
    districts: ["Karaikal", "Mahe", "Puducherry", "Yanam"],
    majorCities: ["Puducherry", "Karaikal", "Mahe", "Yanam"]
  }
];

// Helper functions
export const getStateByCode = (code: string): IndianState | undefined => {
  return INDIAN_STATES.find(state => state.code === code);
};

export const getStateByName = (name: string): IndianState | undefined => {
  return INDIAN_STATES.find(state => 
    state.name.toLowerCase() === name.toLowerCase()
  );
};

export const getAllStateNames = (): string[] => {
  return INDIAN_STATES.map(state => state.name).sort();
};

export const getStatesWithCities = () => {
  return INDIAN_STATES.map(state => ({
    code: state.code,
    name: state.name,
    cities: [...state.majorCities, ...state.districts].sort()
  }));
};

export const searchStatesByCity = (cityName: string): IndianState[] => {
  const searchTerm = cityName.toLowerCase();
  return INDIAN_STATES.filter(state => 
    state.majorCities.some(city => city.toLowerCase().includes(searchTerm)) ||
    state.districts.some(district => district.toLowerCase().includes(searchTerm))
  );
};

export const isValidStateCity = (stateName: string, cityName: string): boolean => {
  const state = getStateByName(stateName);
  if (!state) return false;
  
  const searchTerm = cityName.toLowerCase();
  return state.majorCities.some(city => city.toLowerCase() === searchTerm) ||
         state.districts.some(district => district.toLowerCase() === searchTerm);
};