
import React from 'react';
import ScanningAutomation from '@/components/scanning/ScanningAutomation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoIcon } from 'lucide-react';

const ScanManager: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scan Management</h1>
        <p className="text-muted-foreground">
          Configure and monitor automated scanning of business websites
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ScanningAutomation />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <InfoIcon className="h-5 w-5 mr-2" />
                About Automated Scanning
              </CardTitle>
              <CardDescription>How scanning works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Automated scanning checks businesses that haven't been scanned 
                in the last 30 days or that have never been scanned.
              </p>
              <p>
                The system processes businesses in batches to prevent 
                overwhelming external services and applies rate limiting 
                automatically.
              </p>
              <p>
                Scheduled scans run daily at 3:00 AM by default to minimize impact
                on your usage quotas for external services.
              </p>
              <p>
                Manual scans can be triggered at any time, but keep in mind that
                some scanning services like GTmetrix have daily usage limits.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScanManager;
