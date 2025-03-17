
/**
 * Environment configuration for the application
 * This centralizes access to environment variables and provides defaults
 */
export const env = {
  // Mapbox configuration
  mapbox: {
    // No token stored here - will be fetched securely via Edge Function
    styles: {
      // These are just references, actual URLs will come from the Edge Function
      street: 'street',
      light: 'light-v11',
      dark: 'dark-v11',
      satellite: 'satellite-streets-v12',
    }
  },
  
  // API configuration
  api: {
    // Add API endpoints, keys, etc.
  },
  
  // Feature flags
  features: {
    enableDebugMode: import.meta.env.DEV || false,
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  }
};
