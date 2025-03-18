
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

console.log('[MAIN] Application starting...');

// Check if the DOM is ready and the root element exists
const rootElement = document.getElementById("root");
console.log('[MAIN] Root element exists?', !!rootElement);

// Try immediate rendering first
if (rootElement) {
  console.log('[MAIN] Attempting immediate render');
  try {
    const root = createRoot(rootElement);
    console.log('[MAIN] Created React root successfully');
    
    root.render(
      <ErrorBoundary fallback={<div className="p-4">Error rendering application</div>}>
        <App />
      </ErrorBoundary>
    );
    console.log('[MAIN] Render called successfully');
  } catch (error) {
    console.error('[MAIN] Failed to render React app:', error);
  }
} else {
  console.log('[MAIN] Root element not found yet, will try on DOMContentLoaded');
  
  // Fallback to DOMContentLoaded event
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[MAIN] DOM content loaded event fired');
    const rootElementRetry = document.getElementById("root");
    console.log('[MAIN] Root element exists on DOMContentLoaded?', !!rootElementRetry);
    
    if (rootElementRetry) {
      try {
        console.log('[MAIN] Creating React root on DOMContentLoaded');
        const root = createRoot(rootElementRetry);
        
        root.render(
          <ErrorBoundary fallback={<div className="p-4">Error rendering application</div>}>
            <App />
          </ErrorBoundary>
        );
        console.log('[MAIN] Render called successfully on DOMContentLoaded');
      } catch (error) {
        console.error('[MAIN] Failed to render React app on DOMContentLoaded:', error);
      }
    } else {
      console.error('[MAIN] Root element still not found after DOMContentLoaded');
    }
  });
}
