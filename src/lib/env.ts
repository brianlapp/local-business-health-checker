
/**
 * Environment configuration for the application
 * This centralizes access to environment variables and provides defaults
 */
export const env = {
  // Mapbox configuration
  mapbox: {
    token: import.meta.env.VITE_MAPBOX_TOKEN || '',
    styles: {
      // Mapbox style URLs
      street: 'mapbox://styles/mapbox/streets-v12',
      light: 'mapbox://styles/mapbox/light-v11',
      dark: 'mapbox://styles/mapbox/dark-v11',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
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
