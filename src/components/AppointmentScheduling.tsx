import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Heart,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Navigation,
  Loader2,
  RefreshCw,
  Filter,
  Search
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";

interface Appointment {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorBloodType: string;
  centerId: string;
  centerName: string;
  centerAddress: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number; // minutes
  status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  purpose: 'Blood Donation' | 'Platelet Donation' | 'Plasma Donation' | 'Double Red Cell';
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
  lastUpdated: string;
}

interface DonationCenter {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  email: string;
  operatingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  services: string[];
  capacity: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

interface UserProfile {
  id: string;
  role: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  bloodType?: string;
}

interface AppointmentSchedulingProps {
  userProfile: UserProfile;
}

export function AppointmentScheduling({ userProfile }: AppointmentSchedulingProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [centers, setCenters] = useState<DonationCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedPurpose, setSelectedPurpose] = useState<string>("Blood Donation");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Demo donation centers
  const getDemoCenters = (): DonationCenter[] => [
    {
      id: "center-001",
      name: "NYC Blood Center - Manhattan",
      address: "310 E 67th St, New York, NY 10065",
      coordinates: { lat: 40.7614, lng: -73.9566 },
      phone: "(212) 570-3000",
      email: "manhattan@nybloodcenter.org",
      operatingHours: {
        Monday: { open: "08:00", close: "19:00" },
        Tuesday: { open: "08:00", close: "19:00" },
        Wednesday: { open: "08:00", close: "19:00" },
        Thursday: { open: "08:00", close: "19:00" },
        Friday: { open: "08:00", close: "17:00" },
        Saturday: { open: "09:00", close: "15:00" },
        Sunday: { closed: true }
      },
      services: ["Blood Donation", "Platelet Donation", "Plasma Donation", "Double Red Cell"],
      capacity: 50
    },
    {
      id: "center-002",
      name: "Brooklyn Blood Donation Center",
      address: "450 Clarkson Ave, Brooklyn, NY 11203",
      coordinates: { lat: 40.6501, lng: -73.9496 },
      phone: "(718) 270-2100",
      email: "brooklyn@nybloodcenter.org",
      operatingHours: {
        Monday: { open: "09:00", close: "18:00" },
        Tuesday: { open: "09:00", close: "18:00" },
        Wednesday: { open: "09:00", close: "18:00" },
        Thursday: { open: "09:00", close: "18:00" },
        Friday: { open: "09:00", close: "16:00" },
        Saturday: { open: "10:00", close: "14:00" },
        Sunday: { closed: true }
      },
      services: ["Blood Donation", "Platelet Donation", "Plasma Donation"],
      capacity: 35
    },
    {
      id: "center-003",
      name: "Queens Medical Center Blood Bank",
      address: "82-68 164th St, Jamaica, NY 11432",
      coordinates: { lat: 40.7058, lng: -73.7947 },
      phone: "(718) 883-3000",
      email: "queens@qmc.org",
      operatingHours: {
        Monday: { open: "07:00", close: "20:00" },
        Tuesday: { open: "07:00", close: "20:00" },
        Wednesday: { open: "07:00", close: "20:00" },
        Thursday: { open: "07:00", close: "20:00" },
        Friday: { open: "07:00", close: "18:00" },
        Saturday: { open: "08:00", close: "16:00" },
        Sunday: { open: "10:00", close: "16:00" }
      },
      services: ["Blood Donation", "Platelet Donation", "Plasma Donation", "Double Red Cell"],
      capacity: 40
    }
  ];

  // Demo appointments
  const getDemoAppointments = (): Appointment[] => {
    const now = new Date();
    const appointments: Appointment[] = [];
    
    // Generate appointments for the current user
    for (let i = 0; i < 8; i++) {
      const appointmentDate = new Date(now.getTime() + (Math.random() - 0.5) * 30 * 24 * 60 * 60 * 1000);
      const center = getDemoCenters()[Math.floor(Math.random() * 3)];
      const statuses: Appointment['status'][] = ['Scheduled', 'Confirmed', 'Completed', 'Scheduled'];
      const purposes: Appointment['purpose'][] = ['Blood Donation', 'Platelet Donation', 'Plasma Donation'];
      
      appointments.push({
        id: `APT-${String(i + 1).padStart(4, '0')}`,
        donorId: userProfile.id,
        donorName: userProfile.fullName,
        donorEmail: userProfile.email,
        donorPhone: userProfile.phoneNumber || '(555) 123-4567',
        donorBloodType: userProfile.bloodType || 'O+',
        centerId: center.id,
        centerName: center.name,
        centerAddress: center.address,
        appointmentDate: appointmentDate.toISOString().split('T')[0],
        appointmentTime: `${String(Math.floor(Math.random() * 8) + 9).padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`,
        duration: 60,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        purpose: purposes[Math.floor(Math.random() * purposes.length)],
        notes: Math.random() > 0.7 ? "First time donor - please allow extra time for orientation" : "",
        reminderSent: Math.random() > 0.5,
        createdAt: new Date(appointmentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
    
    return appointments.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  };

  // Generate available time slots for a date and center
  const generateTimeSlots = (date: Date, centerId: string): TimeSlot[] => {
    const center = centers.find(c => c.id === centerId);
    if (!center) return [];

    const dayName = format(date, 'EEEE');
    const hours = center.operatingHours[dayName];
    
    if (hours?.closed) return [];

    const slots: TimeSlot[] = [];
    const openTime = parseInt(hours.open.split(':')[0]);
    const closeTime = parseInt(hours.close.split(':')[0]);
    
    for (let hour = openTime; hour < closeTime; hour++) {
      for (const minute of ['00', '30']) {
        const timeString = `${String(hour).padStart(2, '0')}:${minute}`;
        const isBooked = appointments.some(apt => 
          apt.centerId === centerId && 
          apt.appointmentDate === format(date, 'yyyy-MM-dd') && 
          apt.appointmentTime === timeString &&
          apt.status !== 'Cancelled'
        );
        
        slots.push({
          time: timeString,
          available: !isBooked,
          appointmentId: isBooked ? appointments.find(apt => 
            apt.centerId === centerId && 
            apt.appointmentDate === format(date, 'yyyy-MM-dd') && 
            apt.appointmentTime === timeString
          )?.id : undefined
        });
      }
    }
    
    return slots;
  };

  // Load data
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const demoAppointments = getDemoAppointments();
      const demoCenters = getDemoCenters();
      
      setAppointments(demoAppointments);
      setCenters(demoCenters);
      
      toast.success(`Loaded ${demoAppointments.length} appointments and ${demoCenters.length} centers`);
    } catch (error) {
      console.error('Error loading appointment data:', error);
      toast.error('Failed to load appointment data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter appointments
  useEffect(() => {
    let filtered = [...appointments];

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  // Update available slots when date or center changes
  useEffect(() => {
    if (selectedDate && selectedCenter) {
      const slots = generateTimeSlots(selectedDate, selectedCenter);
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedCenter, appointments]);

  useEffect(() => {
    loadData();
  }, []);

  // Book appointment
  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedCenter || !selectedTime) {
      toast.error('Please select date, center, and time');
      return;
    }

    try {
      setBookingInProgress(true);
      
      const center = centers.find(c => c.id === selectedCenter);
      if (!center) {
        toast.error('Selected center not found');
        return;
      }

      const newAppointment: Appointment = {
        id: `APT-${Date.now().toString().slice(-8)}`,
        donorId: userProfile.id,
        donorName: userProfile.fullName,
        donorEmail: userProfile.email,
        donorPhone: userProfile.phoneNumber || '',
        donorBloodType: userProfile.bloodType || '',
        centerId: selectedCenter,
        centerName: center.name,
        centerAddress: center.address,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        appointmentTime: selectedTime,
        duration: 60,
        status: 'Scheduled',
        purpose: selectedPurpose as Appointment['purpose'],
        notes: notes,
        reminderSent: false,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      setAppointments(prev => [...prev, newAppointment]);
      setShowBookingForm(false);
      resetBookingForm();
      
      toast.success('Appointment booked successfully! You will receive a confirmation email shortly.');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setBookingInProgress(false);
    }
  };

  const resetBookingForm = () => {
    setSelectedDate(undefined);
    setSelectedCenter("");
    setSelectedTime("");
    setSelectedPurpose("Blood Donation");
    setNotes("");
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const statusStyles = {
      'Scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'Confirmed': 'bg-green-100 text-green-800 border-green-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
      'No Show': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge className={`${statusStyles[status]} border font-medium`}>
        {status}
      </Badge>
    );
  };

  const formatAppointmentDate = (date: string, time: string) => {
    const appointmentDate = new Date(`${date}T${time}`);
    return format(appointmentDate, 'PPP p');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
            <p className="text-gray-600">Loading appointment data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Appointment Scheduling
              </CardTitle>
              <CardDescription>
                Schedule and manage your blood donation appointments
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700" 
                size="sm"
                onClick={() => setShowBookingForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search appointments by center, ID, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="No Show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results summary */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>
              Showing {filteredAppointments.length} of {appointments.length} appointments
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Booking form modal */}
      {showBookingForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Book New Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Center
                </label>
                <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose donation center" />
                  </SelectTrigger>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date > new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      size="sm"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <Select value={selectedPurpose} onValueChange={setSelectedPurpose}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blood Donation">Blood Donation</SelectItem>
                  <SelectItem value="Platelet Donation">Platelet Donation</SelectItem>
                  <SelectItem value="Plasma Donation">Plasma Donation</SelectItem>
                  <SelectItem value="Double Red Cell">Double Red Cell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <Textarea
                placeholder="Any special requirements or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowBookingForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleBookAppointment}
                disabled={bookingInProgress || !selectedDate || !selectedCenter || !selectedTime}
                className="bg-red-600 hover:bg-red-700"
              >
                {bookingInProgress ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Book Appointment'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointments list */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500">
                  {appointments.length === 0 
                    ? "You don't have any appointments scheduled yet."
                    : "No appointments match your current filters."
                  }
                </p>
              </div>
              {appointments.length === 0 && (
                <Button 
                  onClick={() => setShowBookingForm(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Book Your First Appointment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.purpose}
                      </h3>
                      {getStatusBadge(appointment.status)}
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {appointment.id}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatAppointmentDate(appointment.appointmentDate, appointment.appointmentTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{appointment.centerName}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{appointment.centerAddress}</span>
                        </div>
                        {appointment.notes && (
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{appointment.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Navigation className="w-4 h-4 mr-2" />
                      Directions
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Reschedule
                    </Button>
                    {appointment.status === 'Scheduled' && (
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}