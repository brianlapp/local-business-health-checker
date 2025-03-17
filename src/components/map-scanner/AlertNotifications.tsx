
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, ExternalLink } from 'lucide-react';

interface AlertNotificationsProps {
  error: string | null;
  apiTip: string | null;
  apiTroubleshooting: string | null;
  source: string;
  usingMockData: boolean;
  scanComplete: boolean;
  scannedBusinesses: any[];
}

const AlertNotifications: React.FC<AlertNotificationsProps> = ({
  error,
  apiTip,
  apiTroubleshooting,
  source,
  usingMockData,
  scanComplete,
  scannedBusinesses
}) => {
  return (
    <>
      {error && source === 'google' && scannedBusinesses.length === 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Google Maps API Error</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            {apiTip && <p className="mt-1">{apiTip}</p>}
            {apiTroubleshooting && (
              <div className="mt-2 p-2 bg-destructive/10 rounded-md text-sm">
                <p className="font-medium">Troubleshooting:</p>
                <p>{apiTroubleshooting}</p>
                <a 
                  href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center mt-2 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Google Cloud Console - Enable Places API
                </a>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {usingMockData && !error && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-md mb-4 flex items-start dark:bg-amber-900/20 dark:text-amber-400">
          <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Demo Mode Active</p>
            <p className="text-sm">
              You're viewing sample business data. In a production environment, you'd connect to a business data API.
              {apiTip && <span className="block mt-1">{apiTip}</span>}
            </p>
          </div>
        </div>
      )}
      
      {error && source !== 'google' && scannedBusinesses.length === 0 && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error}</p>
            {apiTip && (
              <div className="mt-2 text-sm whitespace-pre-line">
                <p>{apiTip}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {apiTip && !error && !usingMockData && !scanComplete && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-md mb-4 flex items-start dark:bg-blue-900/20 dark:text-blue-400">
          <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm whitespace-pre-line">{apiTip}</p>
        </div>
      )}
    </>
  );
};

export default AlertNotifications;
