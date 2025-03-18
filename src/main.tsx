
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Import our custom Mapbox CSS file instead of directly from node_modules
import './styles/mapbox.css'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);
