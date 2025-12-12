import { useState, useEffect, lazy, Suspense } from "react";
import { Heart, Loader2 } from "lucide-react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PerformanceOptimizer } from "./components/PerformanceOptimizer";
import { Toaster } from "./components/ui/sonner";

// Core components (loaded immediately)
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Footer } from "./components/Footer";

// Lazy load heavy components to reduce initial bundle size
const Features = lazy(() => import("./components/Features").then(m => ({ default: m.Features })));
const HowItWorks = lazy(() => import("./components/HowItWorks").then(m => ({ default: m.HowItWorks })));
const Statistics = lazy(() => import("./components/Statistics").then(m => ({ default: m.Statistics })));
const CallToAction = lazy(() => import("./components/CallToAction").then(m => ({ default: m.CallToAction })));
const UnifiedAuth = lazy(() => import("./components/UnifiedAuth").then(m => ({ default: m.UnifiedAuth })));
const UnifiedDashboard = lazy(() => import("./components/UnifiedDashboard").then(m => ({ default: m.UnifiedDashboard })));
const Dashboard = lazy(() => import("./components/Dashboard").then(m => ({ default: m.Dashboard })));
// BloodBanks component removed from landing page
const HowItWorksPage = lazy(() => import("./components/HowItWorksPage").then(m => ({ default: m.HowItWorksPage })));
const FindDonorsPage = lazy(() => import("./components/FindDonorsPage").then(m => ({ default: m.FindDonorsPage })));
const AboutPage = lazy(() => import("./components/AboutPage").then(m => ({ default: m.AboutPage })));
const ProfileCompletionWizard = lazy(() => import("./components/ProfileCompletionWizard").then(m => ({ default: m.ProfileCompletionWizard })));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <Heart className="w-8 h-8 text-red-600" />
      </div>
      <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
      <h2 className="text-lg font-semibold text-gray-900">BloodConnect</h2>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'auth' | 'dashboard' | 'donor-dashboard' | 'patient-dashboard' | 'how-it-works' | 'find-donors' | 'about' | 'profile-wizard'>('home');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [pendingUserEmail, setPendingUserEmail] = useState<string>(''); // For profile completion
  const [currentUserId, setCurrentUserId] = useState<string>(''); // For notifications

  // Emergency timeout to prevent infinite loading
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      console.debug('✅ App initialization timeout reached - ensuring app loads');
      setIsCheckingSession(false);
    }, 5000); // 5 second emergency fallback

    return () => clearTimeout(emergencyTimeout);
  }, []);

  const handleNavigateToAuth = () => {
    setCurrentPage('auth');
  };

  const handleNavigateToHome = () => {
    setCurrentPage('home');
  };

  // Setup demo data and check for stored session on app load
  useEffect(() => {
    const checkStoredSession = async () => {
      try {
        // Check demo session first (no network required)
        const demoSession = localStorage.getItem('demo_session');
        const demoProfile = localStorage.getItem('demo_profile');
        
        if (demoSession && demoProfile) {
          console.log('🎯 Found demo session, restoring...');
          setCurrentPage('dashboard');
          setIsCheckingSession(false);
          return;
        }
        
        // If we have a demo session but no profile, try to restore it
        if (demoSession && !demoProfile) {
          console.log('🔧 Demo session found but no profile, attempting restoration...');
          try {
            const session = JSON.parse(demoSession);
            const email = session.user?.email;
            
            // Import demo users data
            const { DEMO_USERS } = await import('./utils/supabase/client');
            
            if (email && email in DEMO_USERS) {
              const profile = DEMO_USERS[email as keyof typeof DEMO_USERS].profile;
              localStorage.setItem('demo_profile', JSON.stringify(profile));
              console.log('✅ Demo profile restored, proceeding to dashboard');
              setCurrentPage('dashboard');
              setIsCheckingSession(false);
              return;
            }
          } catch (error) {
            console.warn('Failed to restore demo profile:', error);
            // Clean up corrupted demo session
            localStorage.removeItem('demo_session');
          }
        }

        // Check regular session only if stay logged in is enabled
        const stayLoggedIn = localStorage.getItem('bloodconnect_stay_logged_in');
        
        if (stayLoggedIn === 'true') {
          try {
            // Reduced timeout to prevent hanging
            const sessionCheckPromise = (async () => {
              const { auth, profile } = await import('./utils/supabase/client');
              const session = await auth.getSession();
              
              if (session?.access_token) {
                const { profile: userProfile } = await profile.get();
                if (userProfile?.role) {
                  return { success: true, profile: userProfile };
                }
              }
              return { success: false };
            })();

            // Reduced timeout to 2 seconds
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Session check timeout')), 2000)
            );

            const result = await Promise.race([sessionCheckPromise, timeoutPromise]);
            
            if (result && typeof result === 'object' && 'success' in result && result.success) {
              setCurrentPage('dashboard');
              console.log('Auto-login successful');
            }
          } catch (error) {
            // Network error or session expired - clear regular session data
            localStorage.removeItem('bloodconnect_stay_logged_in');
            localStorage.removeItem('bloodconnect_session_token');
            console.debug('Session check failed:', error);
          }
        }
      } catch (error) {
        console.debug('Error checking stored session:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    // Reduced fallback timeout to 3 seconds maximum
    const fallbackTimeout = setTimeout(() => {
      console.debug('Session check fallback timeout reached');
      setIsCheckingSession(false);
    }, 3000);

    checkStoredSession().finally(() => {
      clearTimeout(fallbackTimeout);
    });

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, []);



  // handleNavigateToBloodBanks removed as blood banks navigation is no longer needed



  const handleNavigateToHowItWorks = () => {
    setCurrentPage('how-it-works');
  };

  const handleNavigateToFindDonors = () => {
    setCurrentPage('find-donors');
  };

  const handleNavigateToAbout = () => {
    setCurrentPage('about');
  };

  const handleAuthSuccess = () => {
    // Check if user needs to complete profile (for demo, we'll assume new users do)
    const demoProfile = localStorage.getItem('demo_profile');
    if (demoProfile) {
      const profile = JSON.parse(demoProfile);
      setPendingUserEmail(profile.email);
      setCurrentUserId(profile.id || profile.userId); // Set userId for notifications
      
      // Check if profile is complete (demo logic)
      const isProfileComplete = localStorage.getItem(`profile_complete_${profile.email}`);
      if (!isProfileComplete) {
        setCurrentPage('profile-wizard');
        return;
      }
    }
    
    setCurrentPage('dashboard');
    setNavigationHistory(['dashboard']);
  };

  const handleNavigateToDonorDashboard = () => {
    setNavigationHistory(prev => [...prev, 'donor-dashboard']);
    setCurrentPage('donor-dashboard');
  };

  const handleNavigateToPatientDashboard = () => {
    setNavigationHistory(prev => [...prev, 'patient-dashboard']);
    setCurrentPage('patient-dashboard');
  };

  const handleNavigateBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentPage(previousPage as any);
    } else {
      // Default back to dashboard if no history
      setCurrentPage('dashboard');
      setNavigationHistory(['dashboard']);
    }
  };

  const handleProfileComplete = (profileData: any) => {
    console.log('Profile completed:', profileData);
    
    // Mark profile as complete for this user
    localStorage.setItem(`profile_complete_${profileData.email}`, 'true');
    localStorage.setItem(`profile_data_${profileData.email}`, JSON.stringify(profileData));
    
    setCurrentPage('dashboard');
    setNavigationHistory(['dashboard']);
  };

  const handleProfileSkip = () => {
    // Allow skipping profile completion but mark as skipped
    localStorage.setItem(`profile_skipped_${pendingUserEmail}`, 'true');
    setCurrentPage('dashboard');
    setNavigationHistory(['dashboard']);
  };

  const handleSignOut = async () => {
    // Clear session data immediately to prevent UI delays
    localStorage.removeItem('bloodconnect_stay_logged_in');
    localStorage.removeItem('bloodconnect_session_token');
    localStorage.removeItem('demo_session');
    localStorage.removeItem('demo_profile');
    setPendingUserEmail('');
    setCurrentPage('home');

    // Try to sign out from Supabase in background with shorter timeout
    try {
      const signOutPromise = (async () => {
        const { auth } = await import('./utils/supabase/client');
        await auth.signOut();
      })();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SignOut timeout')), 1000)
      );

      await Promise.race([signOutPromise, timeoutPromise]);
    } catch (error) {
      console.debug('SignOut error (continuing anyway):', error);
    }
  };

  // Show loading screen while checking for stored session
  if (isCheckingSession) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <PerformanceOptimizer />
      <div className="min-h-screen bg-white">
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingSpinner />}>
          {currentPage === 'profile-wizard' ? (
            <ProfileCompletionWizard
              onComplete={handleProfileComplete}
              onSkip={handleProfileSkip}
              userEmail={pendingUserEmail}
            />
          ) : currentPage === 'dashboard' ? (
            <UnifiedDashboard 
              onSignOut={handleSignOut} 
              onNavigateToHome={handleNavigateToHome}
              onNavigateToDonorDashboard={handleNavigateToDonorDashboard}
              onNavigateToPatientDashboard={handleNavigateToPatientDashboard}
            />
          ) : currentPage === 'donor-dashboard' ? (
            <Dashboard 
              userRole="donor"
              onSignOut={handleSignOut} 
              onNavigateToHome={handleNavigateBack}
            />
          ) : currentPage === 'patient-dashboard' ? (
            <Dashboard 
              userRole="patient"
              onSignOut={handleSignOut} 
              onNavigateToHome={handleNavigateBack}
            />
          ) : currentPage === 'auth' ? (
            <UnifiedAuth 
              onNavigateToHome={handleNavigateToHome} 
              onAuthSuccess={handleAuthSuccess}
            />
          ) : (currentPage === 'how-it-works' || currentPage === 'find-donors' || currentPage === 'about') ? (
            <>
              <Header 
                onNavigateToRegister={handleNavigateToAuth} 
                onNavigateToHome={handleNavigateToHome}
                onNavigateToSignIn={handleNavigateToAuth}
                onNavigateToHowItWorks={handleNavigateToHowItWorks}
                onNavigateToFindDonors={handleNavigateToFindDonors}
                onNavigateToAbout={handleNavigateToAbout}
                userId={currentUserId}
              />
              {currentPage === 'how-it-works' && <HowItWorksPage />}
              {currentPage === 'find-donors' && <FindDonorsPage />}
              {currentPage === 'about' && <AboutPage />}
              <Footer />
            </>
          ) : (
            <>
              <Header 
                onNavigateToRegister={handleNavigateToAuth} 
                onNavigateToHome={handleNavigateToHome}
                onNavigateToSignIn={handleNavigateToAuth}
                onNavigateToHowItWorks={handleNavigateToHowItWorks}
                onNavigateToFindDonors={handleNavigateToFindDonors}
                onNavigateToAbout={handleNavigateToAbout}
                userId={currentUserId}
              />
              <main>
                <Hero 
                  onNavigateToRegister={handleNavigateToAuth} 
                  onNavigateToSignIn={handleNavigateToAuth}
                />
                <Features />
                <HowItWorks />
                <Statistics />
                <CallToAction onNavigateToRegister={handleNavigateToAuth} />
              </main>
              <Footer />
            </>
          )}
        </Suspense>
        <Toaster />
        </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}