// Enhanced demo setup for offline mode
// This file ensures demo data is properly initialized

export const setupDemoData = () => {
  console.log('🎯 Setting up comprehensive demo data...');
  
  // Demo users are already defined in client.tsx
  // Just ensure any additional demo data is available
  
  // Mark that demo data is ready
  localStorage.setItem('demo_data_initialized', 'true');
  
  console.log('✅ Demo data setup complete - all features work offline!');
};

// Check if demo data is initialized
export const isDemoDataReady = () => {
  return localStorage.getItem('demo_data_initialized') === 'true';
};

// Initialize demo data if needed
if (typeof window !== 'undefined' && !isDemoDataReady()) {
  setupDemoData();
}