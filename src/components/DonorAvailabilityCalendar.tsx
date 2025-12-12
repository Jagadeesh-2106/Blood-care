import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Save, Repeat, X, Edit2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
}

interface AvailabilitySlot {
  id: string;
  date: string;
  timeSlot: TimeSlot;
  isRecurring: boolean;
  recurringPattern?: 'weekly' | 'bi-weekly' | 'monthly';
  recurringEndDate?: string;
  status: 'available' | 'booked' | 'unavailable';
  notes?: string;
}

interface RecurringPreference {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  timeSlots: TimeSlot[];
  pattern: 'weekly' | 'bi-weekly' | 'monthly';
  isActive: boolean;
  startDate: string;
  endDate?: string;
  notes?: string;
}

const TIME_SLOTS: TimeSlot[] = [
  { id: 'morning-early', startTime: '08:00', endTime: '10:00', label: 'Early Morning (8:00 AM - 10:00 AM)' },
  { id: 'morning-late', startTime: '10:00', endTime: '12:00', label: 'Late Morning (10:00 AM - 12:00 PM)' },
  { id: 'afternoon-early', startTime: '12:00', endTime: '14:00', label: 'Early Afternoon (12:00 PM - 2:00 PM)' },
  { id: 'afternoon-late', startTime: '14:00', endTime: '17:00', label: 'Late Afternoon (2:00 PM - 5:00 PM)' },
  { id: 'evening', startTime: '17:00', endTime: '19:00', label: 'Evening (5:00 PM - 7:00 PM)' },
];

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function DonorAvailabilityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [recurringPreferences, setRecurringPreferences] = useState<RecurringPreference[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [recurringPattern, setRecurringPattern] = useState<'weekly' | 'bi-weekly' | 'monthly'>('weekly');
  const [recurringEndDate, setRecurringEndDate] = useState<string>('');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1);
  const [editingPreference, setEditingPreference] = useState<RecurringPreference | null>(null);
  const [activeTab, setActiveTab] = useState('calendar');

  // Load saved data on component mount
  useEffect(() => {
    const savedSlots = localStorage.getItem('donor_availability_slots');
    const savedPreferences = localStorage.getItem('donor_recurring_preferences');
    
    if (savedSlots) {
      setAvailabilitySlots(JSON.parse(savedSlots));
    }
    
    if (savedPreferences) {
      setRecurringPreferences(JSON.parse(savedPreferences));
    }
    
    // Generate availability from recurring preferences
    generateRecurringAvailability();
  }, []);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDateObj = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDateObj));
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  };

  const generateRecurringAvailability = () => {
    // This would generate availability slots based on recurring preferences
    // For demo purposes, we'll keep it simple
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getAvailabilityForDate = (date: string): AvailabilitySlot[] => {
    return availabilitySlots.filter(slot => slot.date === date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;
    
    setSelectedDate(formatDate(date));
    setShowAddDialog(true);
  };

  const handleAddAvailability = () => {
    if (!selectedDate || selectedTimeSlots.length === 0) {
      toast.error('Please select a date and at least one time slot');
      return;
    }

    const newSlots: AvailabilitySlot[] = selectedTimeSlots.map(timeSlotId => {
      const timeSlot = TIME_SLOTS.find(ts => ts.id === timeSlotId);
      if (!timeSlot) return null;

      return {
        id: `${selectedDate}-${timeSlotId}-${Date.now()}`,
        date: selectedDate,
        timeSlot,
        isRecurring: false,
        status: 'available' as const,
      };
    }).filter(Boolean) as AvailabilitySlot[];

    const updatedSlots = [...availabilitySlots, ...newSlots];
    setAvailabilitySlots(updatedSlots);
    localStorage.setItem('donor_availability_slots', JSON.stringify(updatedSlots));

    setShowAddDialog(false);
    setSelectedTimeSlots([]);
    setSelectedDate('');
    
    toast.success(`Added ${newSlots.length} availability slot(s)`);
  };

  const handleAddRecurringPreference = () => {
    if (selectedTimeSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    const timeSlots = selectedTimeSlots.map(id => TIME_SLOTS.find(ts => ts.id === id)).filter(Boolean) as TimeSlot[];
    
    const newPreference: RecurringPreference = {
      id: editingPreference?.id || `recurring-${Date.now()}`,
      dayOfWeek: selectedDayOfWeek,
      timeSlots,
      pattern: recurringPattern,
      isActive: true,
      startDate: formatDate(new Date()),
      endDate: recurringEndDate || undefined,
    };

    let updatedPreferences;
    if (editingPreference) {
      updatedPreferences = recurringPreferences.map(pref => 
        pref.id === editingPreference.id ? newPreference : pref
      );
    } else {
      updatedPreferences = [...recurringPreferences, newPreference];
    }
    
    setRecurringPreferences(updatedPreferences);
    localStorage.setItem('donor_recurring_preferences', JSON.stringify(updatedPreferences));

    setShowRecurringDialog(false);
    setSelectedTimeSlots([]);
    setRecurringPattern('weekly');
    setRecurringEndDate('');
    setSelectedDayOfWeek(1);
    setEditingPreference(null);
    
    toast.success(editingPreference ? 'Updated recurring preference' : 'Added recurring preference');
  };

  const handleTogglePreference = (id: string) => {
    const updatedPreferences = recurringPreferences.map(pref =>
      pref.id === id ? { ...pref, isActive: !pref.isActive } : pref
    );
    
    setRecurringPreferences(updatedPreferences);
    localStorage.setItem('donor_recurring_preferences', JSON.stringify(updatedPreferences));
    
    toast.success('Preference updated');
  };

  const handleDeletePreference = (id: string) => {
    const updatedPreferences = recurringPreferences.filter(pref => pref.id !== id);
    setRecurringPreferences(updatedPreferences);
    localStorage.setItem('donor_recurring_preferences', JSON.stringify(updatedPreferences));
    
    toast.success('Preference deleted');
  };

  const handleEditPreference = (preference: RecurringPreference) => {
    setEditingPreference(preference);
    setSelectedDayOfWeek(preference.dayOfWeek);
    setSelectedTimeSlots(preference.timeSlots.map(ts => ts.id));
    setRecurringPattern(preference.pattern);
    setRecurringEndDate(preference.endDate || '');
    setShowRecurringDialog(true);
  };

  const removeAvailabilitySlot = (slotId: string) => {
    const updatedSlots = availabilitySlots.filter(slot => slot.id !== slotId);
    setAvailabilitySlots(updatedSlots);
    localStorage.setItem('donor_availability_slots', JSON.stringify(updatedSlots));
    toast.success('Availability slot removed');
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Availability Calendar</h2>
          <p className="text-muted-foreground mt-1">
            Manage your donation availability and set recurring preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowRecurringDialog(true)}
            className="gap-2"
          >
            <Repeat className="w-4 h-4" />
            Add Recurring
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <CardDescription>
                  Click on dates to add availability slots
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                >
                  Next
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const dateStr = formatDate(date);
                  const availability = getAvailabilityForDate(dateStr);
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isPast = isPastDate(date);
                  const todayDate = isToday(date);

                  return (
                    <div
                      key={index}
                      className={`
                        aspect-square p-2 border rounded-lg cursor-pointer transition-colors
                        ${isCurrentMonth ? 'bg-background' : 'bg-muted/30 text-muted-foreground'}
                        ${todayDate ? 'ring-2 ring-primary' : ''}
                        ${isPast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}
                        ${availability.length > 0 ? 'border-green-500 bg-green-50' : ''}
                      `}
                      onClick={() => handleDateClick(date)}
                    >
                      <div className="text-sm">{date.getDate()}</div>
                      {availability.length > 0 && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {availability.length} slot{availability.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Available Slots List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Upcoming Availability</CardTitle>
              <CardDescription>
                Manage your scheduled availability slots
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availabilitySlots.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No availability slots scheduled. Click on calendar dates to add availability.
                </p>
              ) : (
                <div className="space-y-3">
                  {availabilitySlots
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {new Date(slot.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {slot.timeSlot.label}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={slot.status === 'available' ? 'default' : 'secondary'}>
                            {slot.status}
                          </Badge>
                          {slot.isRecurring && (
                            <Badge variant="outline" className="gap-1">
                              <Repeat className="w-3 h-3" />
                              Recurring
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAvailabilitySlot(slot.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Availability Preferences</CardTitle>
              <CardDescription>
                Set up recurring patterns for your availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recurringPreferences.length === 0 ? (
                <div className="text-center py-8">
                  <Repeat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No recurring preferences set up yet.
                  </p>
                  <Button onClick={() => setShowRecurringDialog(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Recurring Preference
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recurringPreferences.map((preference) => (
                    <div key={preference.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">
                              {DAYS_OF_WEEK[preference.dayOfWeek]}s
                            </h3>
                            <Badge variant="outline">
                              {preference.pattern}
                            </Badge>
                            <Switch
                              checked={preference.isActive}
                              onCheckedChange={() => handleTogglePreference(preference.id)}
                            />
                          </div>
                          <div className="space-y-1">
                            {preference.timeSlots.map((timeSlot) => (
                              <p key={timeSlot.id} className="text-sm text-muted-foreground">
                                {timeSlot.label}
                              </p>
                            ))}
                          </div>
                          {preference.endDate && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Until: {new Date(preference.endDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPreference(preference)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePreference(preference.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Availability Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability</DialogTitle>
            <DialogDescription>
              Select time slots for {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Available Time Slots</Label>
              <div className="space-y-2 mt-2">
                {TIME_SLOTS.map((timeSlot) => (
                  <div key={timeSlot.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={timeSlot.id}
                      checked={selectedTimeSlots.includes(timeSlot.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTimeSlots([...selectedTimeSlots, timeSlot.id]);
                        } else {
                          setSelectedTimeSlots(selectedTimeSlots.filter(id => id !== timeSlot.id));
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={timeSlot.id} className="text-sm">
                      {timeSlot.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddAvailability} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Availability
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Recurring Preference Dialog */}
      <Dialog open={showRecurringDialog} onOpenChange={setShowRecurringDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPreference ? 'Edit' : 'Add'} Recurring Preference
            </DialogTitle>
            <DialogDescription>
              Set up a recurring availability pattern
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Day of Week</Label>
              <Select value={selectedDayOfWeek.toString()} onValueChange={(value) => setSelectedDayOfWeek(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Recurring Pattern</Label>
              <Select value={recurringPattern} onValueChange={(value: any) => setRecurringPattern(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Time Slots</Label>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {TIME_SLOTS.map((timeSlot) => (
                  <div key={timeSlot.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`recurring-${timeSlot.id}`}
                      checked={selectedTimeSlots.includes(timeSlot.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTimeSlots([...selectedTimeSlots, timeSlot.id]);
                        } else {
                          setSelectedTimeSlots(selectedTimeSlots.filter(id => id !== timeSlot.id));
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={`recurring-${timeSlot.id}`} className="text-sm">
                      {timeSlot.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>End Date (Optional)</Label>
              <input
                type="date"
                value={recurringEndDate}
                onChange={(e) => setRecurringEndDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                min={formatDate(new Date())}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddRecurringPreference} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {editingPreference ? 'Update' : 'Save'} Preference
              </Button>
              <Button variant="outline" onClick={() => {
                setShowRecurringDialog(false);
                setEditingPreference(null);
                setSelectedTimeSlots([]);
                setRecurringEndDate('');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}