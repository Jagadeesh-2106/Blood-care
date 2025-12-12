import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

interface Notification {
  id: string;
  userId: string;
  type: 'blood_request' | 'system' | 'donation_reminder';
  title: string;
  message: string;
  read: boolean;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: string;
  bloodRequestId?: string;
  donorId?: string;
  donorName?: string;
  donorContact?: string;
  donorEmail?: string;
  donorMessage?: string;
  distance?: number;
  emergencyLevel?: number;
  hospitalName?: string;
  unitsNeeded?: number;
  bloodType?: string;
}

export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `userId=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico'
            });
          }
        }
      )
      .subscribe();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Update in database
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    
    // Update in database
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('userId', userId);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}
