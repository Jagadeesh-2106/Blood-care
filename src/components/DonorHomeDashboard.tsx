import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, User, Heart, Plus, Repeat, TrendingUp, Award } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'donor' | 'patient' | 'clinic';
  bloodType?: string;
  location: string;
  phoneNumber: string;
  createdAt: string;
  isAvailable?: boolean;
  organizationType?: string;
  organizationName?: string;
}

interface DonorHomeDashboardProps {
  userProfile: UserProfile;
  setActiveTab?: (tab: string) => void;
}

export function DonorHomeDashboard({ userProfile, setActiveTab }: DonorHomeDashboardProps) {
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [upcomingAvailability, setUpcomingAvailability] = useState<any[]>([]);
  const [recurringPreferences, setRecurringPreferences] = useState<any[]>([]);

  useEffect(() => {
    // Load appointments from localStorage
    const savedAppointments = localStorage.getItem(`appointments_${userProfile.id}`);
    if (savedAppointments) {
      const appointments = JSON.parse(savedAppointments);
      const upcoming = appointments
        .filter((app: any) => {
          const appointmentDate = new Date(`${app.date}T${app.time}`);
          return appointmentDate > new Date() && app.status !== "cancelled";
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 3); // Show only next 3 appointments
      setUpcomingAppointments(upcoming);
    }

    // Load availability from localStorage
    const savedAvailability = localStorage.getItem('donor_availability_slots');
    if (savedAvailability) {
      const availability = JSON.parse(savedAvailability);
      const upcoming = availability
        .filter((slot: any) => {
          const slotDate = new Date(slot.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return slotDate >= today && slot.status === 'available';
        })
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3); // Show only next 3 availability slots
      setUpcomingAvailability(upcoming);
    }

    // Load recurring preferences from localStorage
    const savedPreferences = localStorage.getItem('donor_recurring_preferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      setRecurringPreferences(preferences.filter((pref: any) => pref.isActive));
    }
  }, [userProfile.id]);

  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Quick Stats */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Welcome back, {userProfile.fullName.split(' ')[0]}
          </CardTitle>
          <CardDescription>
            Your blood donations help save lives in {userProfile.location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-500">Total Donations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userProfile.bloodType}</div>
              <div className="text-sm text-gray-500">Blood Type</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userProfile.isAvailable ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-500">Available Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {new Date(userProfile.createdAt).getFullYear()}
              </div>
              <div className="text-sm text-gray-500">Member Since</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access to New Features */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Access your donation impact and certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setActiveTab?.("impact")}
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm">Donation Impact</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setActiveTab?.("certificates")}
            >
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-sm">Certificates</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setActiveTab?.("availability")}
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm">Set Availability</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setActiveTab?.("requests")}
            >
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-sm">Blood Requests</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No upcoming appointments</p>
              <p className="text-xs text-gray-400 mt-1">
                Schedule your next donation appointment
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment, index) => (
                <div key={appointment.id || index} className="p-3 bg-blue-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </p>
                      <p className="text-xs text-gray-500">{appointment.hospitalName}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {appointment.status || 'Scheduled'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button className="w-full" variant="outline" onClick={() => setActiveTab?.("profile")}>
            <Plus className="w-4 h-4 mr-2" />
            Manage Appointments
          </Button>
        </CardContent>
      </Card>

      {/* Availability Calendar Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Your Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingAvailability.length === 0 && recurringPreferences.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No availability set</p>
              <p className="text-xs text-gray-400 mt-1">
                Set up your donation availability
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Show upcoming availability slots */}
              {upcomingAvailability.map((slot) => (
                <div key={slot.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(slot.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{slot.timeSlot.label}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Available
                    </Badge>
                  </div>
                </div>
              ))}
              
              {/* Show recurring preferences */}
              {recurringPreferences.slice(0, 2).map((preference) => (
                <div key={preference.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Repeat className="w-4 h-4" />
                        {DAYS_OF_WEEK[preference.dayOfWeek]}s
                      </p>
                      <p className="text-sm text-gray-600">
                        {preference.timeSlots.length} time slot{preference.timeSlots.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                      {preference.pattern}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button className="w-full" variant="outline" onClick={() => setActiveTab?.("availability")}>
            <Calendar className="w-4 h-4 mr-2" />
            Manage Availability
          </Button>
        </CardContent>
      </Card>

      {/* Matched Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Blood Requests Matched
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-500 py-8">
            <Heart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No current matches</p>
            <p className="text-xs text-gray-400 mt-1">
              Check the Blood Requests tab to see available requests
            </p>
          </div>
          <Button className="w-full" variant="outline" onClick={() => setActiveTab?.("requests")}>
            <Heart className="w-4 h-4 mr-2" />
            View Blood Requests
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}