// Notification service for handling blood donation alerts

import { toast } from "sonner@2.0.3";
import { projectId } from './supabase/info';
import { getNotifications } from './supabase/client';

export interface NotificationData {
  id: string;
  userId: string;
  type: "blood_request" | "request_accepted" | "appointment" | "urgent" | "system" | "emergency_broadcast" | "emergency_escalation";
  title: string;
  message: string;
  bloodRequestId?: string;
  donorId?: string;
  donorName?: string;
  donorContact?: string;
  donorEmail?: string;
  donorMessage?: string;
  distance?: number;
  createdAt: string;
  read: boolean;
  urgency: "Critical" | "High" | "Medium" | "Low";
  emergencyLevel?: 0 | 1 | 2 | 3;
  hospitalName?: string;
  unitsNeeded?: number;
  bloodType?: string;
}

export interface BloodRequestNotification {
  bloodType: string;
  hospital: string;
  distance: number;
  urgency: "Critical" | "High" | "Medium" | "Low";
  units: number;
  location: string;
}

class NotificationService {
  private baseUrl: string;
  private isEnabled: boolean = true;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-206208a7`;
    this.setupAudioContext();
  }

  private setupAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  // Enable/disable notifications
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('notifications_enabled', enabled.toString());
  }

  // Check if notifications are enabled
  isNotificationEnabled(): boolean {
    const stored = localStorage.getItem('notifications_enabled');
    return stored === null ? true : stored === 'true';
  }

  // Play notification sound
  private playNotificationSound(urgency: string) {
    if (!this.audioContext || !this.isNotificationEnabled()) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Different frequencies for different urgencies
      const frequencies = {
        Critical: [800, 1000, 800],
        High: [600, 800],
        Medium: [500],
        Low: [400]
      };

      const freqs = frequencies[urgency as keyof typeof frequencies] || [400];

      oscillator.frequency.setValueAtTime(freqs[0], this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);

      // Play additional beeps for critical/high priority
      if (urgency === 'Critical' || urgency === 'High') {
        setTimeout(() => {
          if (this.audioContext) {
            const osc2 = this.audioContext.createOscillator();
            const gain2 = this.audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(this.audioContext.destination);
            osc2.frequency.value = freqs[1] || freqs[0];
            gain2.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            osc2.start();
            osc2.stop(this.audioContext.currentTime + 0.3);
          }
        }, 600);
      }
    } catch (e) {
      console.warn('Error playing notification sound:', e);
    }
  }

  // Show browser notification for blood request
  async showBloodRequestNotification(data: BloodRequestNotification) {
    if (!this.isEnabled || !this.isNotificationEnabled()) return;

    const permissionGranted = await this.requestPermission();
    if (!permissionGranted) return;

    const title = `🩸 ${data.urgency} Blood Request`;
    const body = `${data.bloodType} blood needed at ${data.hospital} (${data.distance}km away) - ${data.units} unit${data.units > 1 ? 's' : ''}`;

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico', // You can add a blood drop icon here
      badge: '/favicon.ico',
      tag: `blood-request-${data.hospital}`, // Prevent duplicate notifications
      requireInteraction: data.urgency === 'Critical',
      silent: false,
    });

    // Play sound
    this.playNotificationSound(data.urgency);

    // Show toast notification as backup
    const toastMessage = `${data.bloodType} blood needed at ${data.hospital} (${data.distance}km away)`;

    if (data.urgency === 'Critical') {
      toast.error(toastMessage, {
        duration: 10000,
        position: 'top-right'
      });
    } else if (data.urgency === 'High') {
      toast.warning(toastMessage, {
        duration: 7000,
        position: 'top-right'
      });
    } else {
      toast.info(toastMessage, {
        duration: 5000,
        position: 'top-right'
      });
    }

    // Auto-close notification after some time (except for critical)
    if (data.urgency !== 'Critical') {
      setTimeout(() => {
        notification.close();
      }, 8000);
    }

    return notification;
  }

  // Show browser notification for blood request acceptance
  async showRequestAcceptedNotification(data: {
    donorName: string;
    bloodType: string;
    hospital: string;
    donorContact?: string;
    donorMessage?: string;
  }) {
    if (!this.isEnabled || !this.isNotificationEnabled()) return;

    const permissionGranted = await this.requestPermission();
    if (!permissionGranted) return;

    const title = `✅ Blood Request Accepted!`;
    const body = `${data.donorName} will donate ${data.bloodType} blood for your request at ${data.hospital}`;

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `request-accepted-${data.donorName}`,
      requireInteraction: true, // Keep notification until user interacts
      silent: false,
    });

    // Play celebratory sound for acceptance
    this.playNotificationSound('High');

    // Show success toast
    toast.success(`${data.donorName} accepted your blood request!`, {
      duration: 8000,
      position: 'top-right'
    });

    return notification;
  }

  // Show emergency broadcast notification
  async showEmergencyBroadcastNotification(data: {
    bloodType: string;
    hospitalName: string;
    unitsNeeded: number;
    location: string;
    urgencyLevel: 'critical' | 'urgent' | 'high';
    escalationLevel?: number;
  }) {
    if (!this.isEnabled || !this.isNotificationEnabled()) return;

    const permissionGranted = await this.requestPermission();
    if (!permissionGranted) return;

    const isEscalated = (data.escalationLevel ?? 0) > 0;
    const title = isEscalated
      ? `🚨 ESCALATED EMERGENCY - ${data.bloodType} Blood Needed`
      : `🚨 EMERGENCY BROADCAST - ${data.bloodType} Blood Needed`;

    const body = `${data.hospitalName} urgently needs ${data.unitsNeeded} unit${data.unitsNeeded > 1 ? 's' : ''} of ${data.bloodType} blood in ${data.location}`;

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `emergency-${data.hospitalName}-${data.bloodType}`,
      requireInteraction: true, // Always require interaction for emergencies
      silent: false,
      renotify: true, // Allow duplicate notifications for escalations
    });

    // Play urgent emergency sound
    this.playNotificationSound('Critical');

    // Show emergency toast with high visibility
    toast.error(body, {
      duration: 15000, // Longer duration for emergencies
      position: 'top-center',
      className: 'emergency-toast'
    });

    // Auto-close after 2 minutes (but keep toast longer)
    setTimeout(() => {
      notification.close();
    }, 120000);

    return notification;
  }

  // Broadcast emergency to all relevant users
  async broadcastEmergencyAlert(emergencyData: {
    id: string;
    bloodType: string;
    hospitalName: string;
    unitsNeeded: number;
    location: string;
    urgencyLevel: 'critical' | 'urgent' | 'high';
    escalationLevel?: number;
  }) {
    console.log(`🚨 Broadcasting emergency alert: ${emergencyData.bloodType} needed at ${emergencyData.hospitalName}`);

    // Show immediate notification to current user
    await this.showEmergencyBroadcastNotification(emergencyData);

    // In a real app, this would send notifications to all relevant users via the backend
    // For demo purposes, we'll simulate the broadcast
    const broadcastMessage = `Emergency broadcast sent to all ${emergencyData.bloodType} donors and hospital partners in ${emergencyData.location}`;

    toast.success(broadcastMessage, {
      duration: 5000,
      position: 'bottom-right'
    });

    return true;
  }

  // Fetch notifications from server
  async fetchNotifications(userId: string): Promise<NotificationData[]> {
    try {
      // Skip if userId is not provided
      if (!userId) {
        console.warn('No userId provided for notifications');
        return [];
      }

      // Fetch from Supabase directly
      const { data, error } = await getNotifications(userId);

      if (error) {
        console.warn('Failed to fetch notifications:', error);
        return [];
      }

      if (data && data.length > 0) {
        return data.map((n: any) => ({
          id: n.id,
          userId: n.user_id,
          type: n.type,
          title: n.title,
          message: n.message,
          bloodRequestId: n.blood_request_id,
          distance: n.distance,
          createdAt: n.created_at,
          read: n.read,
          urgency: n.urgency
        }));
      }

      return [];

    } catch (error) {
      console.warn('Backend unavailable, using demo data:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('Mark as read timeout')), 2000)
      );

      const markReadPromise = (async () => {
        // Use dynamic import to avoid circular dependencies
        const { apiCall } = await import('./supabase/client');

        try {
          await apiCall(`/notifications/${notificationId}/read`, {
            method: 'PUT'
          });
          return true;
        } catch (error: any) {
          // For demo mode, always return true
          const isDemoMode = localStorage.getItem('demo_session') !== null;
          if (isDemoMode) {
            return true;
          }

          console.debug('Mark as read API call failed:', error);
          return false;
        }
      })();

      try {
        return await Promise.race([markReadPromise, timeoutPromise]);
      } catch (apiError) {
        console.debug('Failed to mark notification as read:', apiError);

        // For demo mode, always return true
        const isDemoMode = localStorage.getItem('demo_session') !== null;
        if (isDemoMode) {
          return true;
        }

        return false;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Start polling for new notifications (works for both donors and patients)
  startPolling(userId: string, userRole: string = 'donor', intervalMs: number = 30000) {
    // Skip if userId is not provided or user is not logged in
    if (!userId) {
      console.warn('Cannot start notification polling: no userId provided');
      return null;
    }

    let lastFetchTime = Date.now() - 60000; // Look back 1 minute to catch any recent notifications

    const poll = async () => {
      try {
        const notifications = await this.fetchNotifications(userId);

        // Check for new notifications since last fetch
        const newNotifications = notifications.filter(n =>
          !n.read &&
          new Date(n.createdAt).getTime() > lastFetchTime
        );

        console.log(`🔔 Found ${newNotifications.length} new notifications for ${userRole}`);

        for (const notification of newNotifications) {
          if (notification.type === 'blood_request' && userRole === 'donor') {
            // Blood request notifications for donors
            const bloodTypeMatch = notification.message.match(/(O\+|O-|A\+|A-|B\+|B-|AB\+|AB-)/);
            const bloodType = bloodTypeMatch ? bloodTypeMatch[1] : 'Unknown';

            let hospital = notification.title.replace('🩸 Critical Blood Request Near You', '').replace('New Blood Request Near You', '').replace(/^[\s\-]+/, '');
            if (notification.message.includes(' at ')) {
              const hospitalMatch = notification.message.split(' at ')[1]?.split(' -')[0];
              if (hospitalMatch) {
                hospital = hospitalMatch;
              }
            }

            await this.showBloodRequestNotification({
              bloodType: bloodType,
              hospital: hospital || 'Local Hospital',
              distance: notification.distance || 0,
              urgency: notification.urgency,
              units: 1,
              location: 'Unknown'
            });

            console.log(`📱 Showed blood request notification for donor: ${bloodType} at ${hospital}`);
          }
          else if (notification.type === 'request_accepted' && (userRole === 'patient' || userRole === 'clinic')) {
            // Request acceptance notifications for patients/organizations
            await this.showRequestAcceptedNotification({
              donorName: notification.donorName || 'A donor',
              bloodType: notification.message.match(/(O\+|O-|A\+|A-|B\+|B-|AB\+|AB-)/)?.[1] || 'Unknown',
              hospital: notification.message.split(' at ')[1]?.split('.')[0] || 'the hospital',
              donorContact: notification.donorContact,
              donorMessage: notification.donorMessage
            });

            console.log(`🎉 Showed request accepted notification for ${userRole}: ${notification.donorName} accepted request`);
          }
          else if ((notification.type === 'emergency_broadcast' || notification.type === 'emergency_escalation')) {
            // Emergency notifications for all user types
            await this.showEmergencyBroadcastNotification({
              bloodType: notification.bloodType || 'Unknown',
              hospitalName: notification.hospitalName || 'Emergency Hospital',
              unitsNeeded: notification.unitsNeeded || 1,
              location: notification.message.split(' in ')[1]?.split(' ')[0] || 'Unknown Location',
              urgencyLevel: notification.urgency === 'Critical' ? 'critical' : 'urgent',
              escalationLevel: notification.emergencyLevel
            });

            console.log(`🚨 Showed emergency notification for ${userRole}: ${notification.bloodType} at ${notification.hospitalName}`);
          }
        }

        lastFetchTime = Date.now();
      } catch (error) {
        // Silently handle polling errors to avoid console spam
        console.debug('Notification polling error (will retry):', error);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    return setInterval(poll, intervalMs);
  }

  // Stop polling
  stopPolling(intervalId: number) {
    clearInterval(intervalId);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();