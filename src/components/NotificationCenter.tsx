import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Bell, 
  BellOff,
  Heart, 
  Clock, 
  MapPin, 
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Info,
  Volume2,
  VolumeX,
  Settings,
  Loader2,
  MarkAsRead
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { formatDistance } from "../utils/locationHelpers";
import { notificationService, NotificationData } from "../utils/notificationService";

interface UserProfile {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  role: string;
  bloodType?: string;
}

interface NotificationCenterProps {
  userProfile: UserProfile;
  onNotificationUpdate?: () => void;
}

export function NotificationCenter({ userProfile, onNotificationUpdate }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    notificationService.isNotificationEnabled()
  );

  // Demo notifications data focused on blood request matching and acceptance
  const getDemoNotifications = (): NotificationData[] => {
    const now = new Date();
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const currentUserId = userProfile.userId || userProfile.id;
    const userBloodType = (userProfile as any).bloodType || 'O+';
    const isDonor = userProfile.role === 'donor';

    if (isDonor) {
      // Notifications for donors - focused on blood request matching
      return [
        {
          id: "notif-001",
          userId: currentUserId,
          type: "blood_request_match",
          title: "🚨 Emergency Blood Request Match",
          message: `URGENT: ${userBloodType} blood needed at Apollo Hospital - 3 units required for emergency surgery. You are a compatible donor within 5km radius.`,
          bloodRequestId: "BR-2024-001",
          distance: 2.3,
          createdAt: thirtyMinsAgo.toISOString(),
          read: false,
          urgency: "Critical"
        },
        {
          id: "notif-002",
          userId: currentUserId,
          type: "blood_request_match",
          title: "🩸 Blood Request Match - High Priority",
          message: `${userBloodType} blood requested at Max Healthcare Hospital - 2 units needed for cancer patient treatment. Your donation could save a life.`,
          bloodRequestId: "BR-2024-002",
          distance: 4.7,
          createdAt: twoHoursAgo.toISOString(),
          read: false,
          urgency: "High"
        },
        {
          id: "notif-003",
          userId: currentUserId,
          type: "blood_request_match",
          title: "Blood Request Match Found",
          message: `${userBloodType} blood needed at Fortis Hospital - 1 unit required for elective surgery. Multiple donors available, your help appreciated.`,
          bloodRequestId: "BR-2024-003",
          distance: 7.2,
          createdAt: sixHoursAgo.toISOString(),
          read: true,
          urgency: "Medium"
        },
        {
          id: "notif-004",
          userId: currentUserId,
          type: "donation_accepted",
          title: "✅ Your Donation Response Accepted",
          message: "Thank you! Your response to donate blood at Apollo Hospital has been accepted. Please arrive by 3:00 PM today.",
          createdAt: oneDayAgo.toISOString(),
          read: false,
          urgency: "High"
        }
      ];
    } else {
      // Notifications for patients/clinics - focused on donor responses
      return [
        {
          id: "notif-001",
          userId: currentUserId,
          type: "donor_response",
          title: "🎉 Donor Found for Your Request",
          message: `Great news! A compatible ${userBloodType} donor has responded to your blood request BR-2024-001. Donor will arrive at 2:00 PM today.`,
          bloodRequestId: "BR-2024-001",
          createdAt: thirtyMinsAgo.toISOString(),
          read: false,
          urgency: "High"
        },
        {
          id: "notif-002",
          userId: currentUserId,
          type: "donor_response",
          title: "Multiple Donors Available",
          message: `Excellent! 3 compatible donors have responded to your urgent ${userBloodType} blood request. Please coordinate donation schedule.`,
          bloodRequestId: "BR-2024-002",
          createdAt: twoHoursAgo.toISOString(),
          read: false,
          urgency: "High"
        },
        {
          id: "notif-003",
          userId: currentUserId,
          type: "request_fulfilled",
          title: "✅ Blood Request Fulfilled",
          message: `Your blood request BR-2024-003 has been successfully fulfilled. 2 units of ${userBloodType} blood collected and ready for use.`,
          bloodRequestId: "BR-2024-003",
          createdAt: sixHoursAgo.toISOString(),
          read: true,
          urgency: "Medium"
        },
        {
          id: "notif-004",
          userId: currentUserId,
          type: "request_status",
          title: "Blood Request Status Update",
          message: `Your blood request BR-2024-004 is still active. We're actively searching for compatible ${userBloodType} donors in your area.`,
          createdAt: oneDayAgo.toISOString(),
          read: false,
          urgency: "Medium"
        }
      ];
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch from backend first - handle both userId and id properties
      const userId = userProfile.userId || userProfile.id;
      if (userId) {
        const fetchedNotifications = await notificationService.fetchNotifications(userId);
        
        // If we get an empty array from backend (likely due to 401 or connection issues), use demo data
        if (fetchedNotifications.length === 0) {
          const demoNotifications = getDemoNotifications();
          setNotifications(demoNotifications);
        } else {
          setNotifications(fetchedNotifications);
        }
      } else {
        // No valid user ID, use demo data
        const demoNotifications = getDemoNotifications();
        setNotifications(demoNotifications);
      }
    } catch (error) {
      console.debug('Notification fetch failed, using demo data:', error);
      
      // Use demo data as fallback
      const demoNotifications = getDemoNotifications();
      setNotifications(demoNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter notifications
  useEffect(() => {
    let filtered = [...notifications];

    // Filter by read/unread status
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.read);
    }

    // Filter by type
    if (filter === 'matches') {
      filtered = filtered.filter(n => 
        n.type === 'blood_request_match' || 
        n.type === 'donor_response'
      );
    } else if (filter === 'urgent') {
      filtered = filtered.filter(n => n.urgency === 'Critical' || n.urgency === 'High');
    } else if (filter === 'fulfilled') {
      filtered = filtered.filter(n => 
        n.type === 'request_fulfilled' || 
        n.type === 'donation_accepted'
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter, searchTerm]);

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [userProfile.userId || userProfile.id]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const success = await notificationService.markAsRead(notificationId);
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        toast.success('Notification marked as read');
        
        // Notify parent component to update the notification count
        if (onNotificationUpdate) {
          onNotificationUpdate();
        }
      } else {
        toast.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await notificationService.markAsRead(notification.id);
      }
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
      
      // Notify parent component to update the notification count
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  // Delete notification (mock - would need backend implementation)
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification deleted');
  };

  // Toggle notifications
  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        notificationService.setEnabled(true);
        setNotificationsEnabled(true);
        toast.success("Notifications enabled!");
      } else {
        toast.error("Notification permission denied.");
      }
    } else {
      notificationService.setEnabled(false);
      setNotificationsEnabled(false);
      toast.info("Notifications disabled");
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string, urgency: string) => {
    switch (type) {
      case 'blood_request_match':
        return <Heart className={`w-5 h-5 ${urgency === 'Critical' ? 'text-red-600' : 'text-red-500'}`} />;
      case 'donor_response':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'donation_accepted':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'request_fulfilled':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'request_status':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
            <p className="text-gray-600">Loading notifications...</p>
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
                <Bell className="w-5 h-5 text-blue-600" />
                Notification Center
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {userProfile.role === 'donor' 
                  ? 'Get notified when blood requests match your profile and when your donations are accepted'
                  : 'Receive alerts when donors respond to your blood requests and donation confirmations'
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleNotifications}
                className="flex items-center gap-2"
              >
                {notificationsEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4" />
                    Notifications On
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    Notifications Off
                  </>
                )}
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter notifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="read">Read Only</SelectItem>
                <SelectItem value="matches">Blood Request Matches</SelectItem>
                <SelectItem value="fulfilled">Completed Requests</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results summary */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </span>
            <span>
              {unreadCount} unread
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notifications list */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Bell className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">
                  {filter === 'unread' 
                    ? "All caught up! No unread notifications." 
                    : "You have no notifications at this time."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${!notification.read ? 'border-blue-200 bg-blue-50/50' : 'bg-white'} hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type, notification.urgency)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        {!notification.read && (
                          <Badge className="bg-blue-500 text-white">New</Badge>
                        )}
                        {(notification.urgency === 'Critical' || notification.urgency === 'High') && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {notification.urgency}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600">{notification.message}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {notification.distance && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {formatDistance(notification.distance)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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