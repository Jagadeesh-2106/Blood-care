import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Building2, 
  Phone,
  Mail,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  bloodType: string;
  role: string;
}

interface Appointment {
  id: string;
  userId: string;
  type: "donation" | "request_meeting" | "consultation";
  title: string;
  date: string;
  time: string;
  location: string;
  hospitalName: string;
  contactPerson: string;
  contactPhone: string;
  notes: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  bloodType?: string;
  estimatedDuration: number; // in minutes
}

interface AppointmentSystemProps {
  userProfile: UserProfile;
}

export function AppointmentSystem({ userProfile }: AppointmentSystemProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [formData, setFormData] = useState({
    type: "donation" as const,
    title: "",
    date: "",
    time: "",
    location: userProfile.location || "",
    hospitalName: "",
    contactPerson: "",
    contactPhone: "",
    notes: "",
    estimatedDuration: 60,
    bloodType: userProfile.bloodType || ""
  });

  // Load appointments from localStorage (in real app, would fetch from backend)
  useEffect(() => {
    const savedAppointments = localStorage.getItem(`appointments_${userProfile.userId}`);
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
  }, [userProfile.userId]);

  // Save appointments to localStorage
  const saveAppointments = (appointmentsList: Appointment[]) => {
    localStorage.setItem(`appointments_${userProfile.userId}`, JSON.stringify(appointmentsList));
    setAppointments(appointmentsList);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const requiredFields = ['title', 'date', 'time', 'location', 'hospitalName', 'contactPerson'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Check if date is in the future
    const appointmentDate = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();
    
    if (appointmentDate <= now) {
      toast.error("Appointment date and time must be in the future");
      return false;
    }

    return true;
  };

  // Create new appointment
  const handleCreateAppointment = () => {
    if (!validateForm()) return;

    const newAppointment: Appointment = {
      id: `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userProfile.userId,
      ...formData,
      status: "scheduled",
      createdAt: new Date().toISOString(),
      bloodType: formData.bloodType || userProfile.bloodType
    };

    const updatedAppointments = [...appointments, newAppointment];
    saveAppointments(updatedAppointments);
    
    // Reset form
    setFormData({
      type: "donation",
      title: "",
      date: "",
      time: "",
      location: userProfile.location || "",
      hospitalName: "",
      contactPerson: "",
      contactPhone: "",
      notes: "",
      estimatedDuration: 60,
      bloodType: userProfile.bloodType || ""
    });
    
    setShowCreateForm(false);
    toast.success("Appointment scheduled successfully!");
  };

  // Update appointment
  const handleUpdateAppointment = () => {
    if (!editingAppointment || !validateForm()) return;

    const updatedAppointments = appointments.map(app => 
      app.id === editingAppointment.id 
        ? { ...app, ...formData }
        : app
    );
    
    saveAppointments(updatedAppointments);
    setEditingAppointment(null);
    setShowCreateForm(false);
    toast.success("Appointment updated successfully!");
  };

  // Cancel appointment
  const handleCancelAppointment = (appointmentId: string) => {
    const updatedAppointments = appointments.map(app => 
      app.id === appointmentId 
        ? { ...app, status: "cancelled" as const }
        : app
    );
    
    saveAppointments(updatedAppointments);
    toast.success("Appointment cancelled");
  };

  // Mark appointment as completed
  const handleCompleteAppointment = (appointmentId: string) => {
    const updatedAppointments = appointments.map(app => 
      app.id === appointmentId 
        ? { ...app, status: "completed" as const }
        : app
    );
    
    saveAppointments(updatedAppointments);
    toast.success("Appointment marked as completed");
  };

  // Edit appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setFormData({
      type: appointment.type,
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      location: appointment.location,
      hospitalName: appointment.hospitalName,
      contactPerson: appointment.contactPerson,
      contactPhone: appointment.contactPhone,
      notes: appointment.notes,
      estimatedDuration: appointment.estimatedDuration,
      bloodType: appointment.bloodType || userProfile.bloodType
    });
    setEditingAppointment(appointment);
    setShowCreateForm(true);
  };

  // Get upcoming appointments
  const upcomingAppointments = appointments
    .filter(app => {
      const appointmentDate = new Date(`${app.date}T${app.time}`);
      return appointmentDate > new Date() && app.status !== "cancelled";
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Appointment Management
              </CardTitle>
              <CardDescription>
                Schedule and manage your blood donation appointments
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setShowCreateForm(true);
                setEditingAppointment(null);
                setFormData({
                  type: "donation",
                  title: "",
                  date: "",
                  time: "",
                  location: userProfile.location || "",
                  hospitalName: "",
                  contactPerson: "",
                  contactPhone: "",
                  notes: "",
                  estimatedDuration: 60,
                  bloodType: userProfile.bloodType || ""
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
            </CardTitle>
            <CardDescription>
              Fill in the details for your {userProfile.role === 'donor' ? 'donation' : 'meeting'} appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Type and Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Appointment Type</label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donation">Blood Donation</SelectItem>
                      <SelectItem value="request_meeting">Request Meeting</SelectItem>
                      <SelectItem value="consultation">Medical Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Appointment Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Regular blood donation"
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Time</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Duration (minutes)</label>
                  <Select 
                    value={formData.estimatedDuration.toString()} 
                    onValueChange={(value) => handleInputChange('estimatedDuration', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Hospital/Clinic Name</label>
                  <Input
                    value={formData.hospitalName}
                    onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                    placeholder="Enter hospital or clinic name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Contact Person</label>
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="Enter contact person name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-900">Contact Phone</label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="font-medium text-gray-900">Additional Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special instructions or notes..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingAppointment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={editingAppointment ? handleUpdateAppointment : handleCreateAppointment}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Upcoming Appointments ({upcomingAppointments.length})
          </CardTitle>
          <CardDescription>
            Your scheduled appointments for blood donation and meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">No upcoming appointments</h3>
              <p className="text-gray-500 mb-4">Schedule your next appointment to help save lives.</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                          <Badge variant="outline">{appointment.type.replace('_', ' ')}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(appointment.date)} at {formatTime(appointment.time)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              <span>{appointment.hospitalName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{appointment.location}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{appointment.contactPerson}</span>
                            </div>
                            {appointment.contactPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{appointment.contactPhone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.estimatedDuration} minutes</span>
                            </div>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompleteAppointment(appointment.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            All Appointments ({appointments.length})
          </CardTitle>
          <CardDescription>
            Complete history of your appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">No appointments yet</h3>
              <p className="text-gray-500">Your appointment history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments
                .sort((a, b) => {
                  const dateA = new Date(`${a.date}T${a.time}`);
                  const dateB = new Date(`${b.date}T${b.time}`);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{appointment.title}</div>
                        <div className="text-gray-600">
                          {formatDate(appointment.date)} at {formatTime(appointment.time)} • {appointment.hospitalName}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}