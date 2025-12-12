import { useState } from 'react';
import { Bell, X, Check, CheckCircle } from 'lucide-react';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface NotificationsProps {
  userId: string;
}

export function Notifications({ userId }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications(userId);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatNotificationMessage = (notification: any) => {
    if (notification.hospitalName && notification.bloodType && notification.unitsNeeded) {
      return `${notification.hospitalName} needs ${notification.unitsNeeded} units of ${notification.bloodType} blood`;
    }
    return notification.message;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden z-50 shadow-lg">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getUrgencyColor(notification.urgency)}`}>
                          {notification.urgency}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                      <p className="text-xs text-gray-600">{formatNotificationMessage(notification)}</p>
                      {notification.donorName && (
                        <p className="text-xs text-gray-500 mt-1">Donor: {notification.donorName}</p>
                      )}
                      {notification.distance && (
                        <p className="text-xs text-gray-500">Distance: {notification.distance} km</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Check className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
