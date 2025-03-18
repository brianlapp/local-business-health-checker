
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

console.log('Application starting...');

// Check if the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded, mounting React app');
  const rootElement = document.getElementById("root");
  
  if (rootElement) {
    console.log('Root element found, creating React root');
    createRoot(rootElement).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } else {
    console.error('Root element not found in the DOM');
  }
});

// Also try immediate rendering in case DOMContentLoaded already fired
const rootElement = document.getElementById("root");
if (rootElement) {
  console.log('Root element found, creating React root (immediate)');
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} else {
  console.log('Root element not found yet, will try on DOMContentLoaded');
}
