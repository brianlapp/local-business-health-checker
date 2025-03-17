
import React from 'react';
import ScanningAutomation from '@/components/scanning/ScanningAutomation';
import ScanScheduleConfig from '@/components/scanning/ScanScheduleConfig';
import BatchOpportunityScoring from '@/components/scanning/BatchOpportunityScoring';
import ScanAnalyticsDashboard from '@/components/scanning/ScanAnalyticsDashboard';
import ScanQueueManager from '@/components/scanning/ScanQueueManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoIcon, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ScanManager: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scan Management</h1>
        <p className="text-muted-foreground">
          Configure and monitor automated scanning and opportunity scoring
        </p>
      </div>
      
      <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Scan Manager</AlertTitle>
        <AlertDescription>
          This centralized scanning control center helps prevent API rate limiting by properly
          scheduling and queuing scans. All automated scanning is now managed from this page instead
          of running automatically on dashboard load.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="scanning" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="scanning">Website Scanning</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="queue">Queue Management</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Config</TabsTrigger>
          <TabsTrigger value="scoring">Opportunity Scoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scanning">
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
                    some scanning services like Lighthouse have API rate limits that 
                    will be respected by the system.
                  </p>
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    Important: Scanning has been moved from the dashboard to this dedicated
                    page to prevent rate limiting issues.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <ScanAnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="queue">
          <ScanQueueManager />
        </TabsContent>
        
        <TabsContent value="schedule">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ScanScheduleConfig />
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <InfoIcon className="h-5 w-5 mr-2" />
                    About Scheduling
                  </CardTitle>
                  <CardDescription>How scheduling works</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p>
                    The schedule configuration allows you to control when and how 
                    automated scans run, helping you optimize API usage.
                  </p>
                  <p>
                    <strong>Scan Time:</strong> Choose an hour when your application 
                    usage is low, typically overnight.
                  </p>
                  <p>
                    <strong>Scan Frequency:</strong> Set how often scans should run, 
                    from daily to monthly depending on your needs.
                  </p>
                  <p>
                    <strong>Batch Size:</strong> Control how many businesses are 
                    processed in each batch. Smaller batches are slower but 
                    safer for API limits.
                  </p>
                  <p>
                    <strong>Retry Failed:</strong> Enable automatic retries for 
                    failed scans with a configurable maximum retry count.
                  </p>
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    Remember to save your settings after making changes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="scoring">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BatchOpportunityScoring />
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <InfoIcon className="h-5 w-5 mr-2" />
                    About Opportunity Scoring
                  </CardTitle>
                  <CardDescription>How scoring works</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p>
                    Opportunity scoring analyzes website quality metrics to determine
                    how likely a business is to need your services.
                  </p>
                  <p>
                    Higher scores (60-100) indicate businesses with significant website
                    issues that could benefit from your expertise.
                  </p>
                  <p>
                    Scores are calculated based on factors like:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Performance metrics (Lighthouse score)</li>
                    <li>Page speed (GTmetrix results)</li>
                    <li>Mobile-friendliness</li>
                    <li>CMS platform and version</li>
                    <li>SEO issues</li>
                  </ul>
                  <p>
                    Businesses must have been scanned with at least one tool
                    before opportunity scoring can be calculated.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScanManager;
