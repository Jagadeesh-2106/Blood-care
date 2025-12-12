// Utility to ensure demo profiles are properly initialized
import { DEMO_USERS } from './supabase/client';

export function ensureDemoProfile() {
  const demoSession = localStorage.getItem('demo_session');
  const demoProfile = localStorage.getItem('demo_profile');
  
  // If we have a session but no profile, restore it
  if (demoSession && !demoProfile) {
    try {
      const session = JSON.parse(demoSession);
      const email = session.user?.email;
      
      if (email && email in DEMO_USERS) {
        const profile = DEMO_USERS[email as keyof typeof DEMO_USERS].profile;
        localStorage.setItem('demo_profile', JSON.stringify(profile));
        console.log('✅ Demo profile restored for:', email);
        return profile;
      }
    } catch (error) {
      console.warn('Failed to restore demo profile:', error);
      // Clean up corrupted session
      localStorage.removeItem('demo_session');
    }
  }
  
  return demoProfile ? JSON.parse(demoProfile) : null;
}

export function initializeDemoProfile(email: string): boolean {
  if (email in DEMO_USERS) {
    const user = DEMO_USERS[email as keyof typeof DEMO_USERS];
    const session = {
      access_token: `demo_token_${Date.now()}`,
      refresh_token: `demo_refresh_${Date.now()}`,
      user: { id: user.profile.id, email: user.profile.email }
    };
    
    localStorage.setItem('demo_session', JSON.stringify(session));
    localStorage.setItem('demo_profile', JSON.stringify(user.profile));
    console.log('✅ Demo profile initialized for:', email);
    return true;
  }
  
  return false;
}