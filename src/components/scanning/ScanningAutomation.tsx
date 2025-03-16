
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlayIcon, PauseIcon, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  triggerManualScan, 
  toggleAutomatedScanning, 
  getAutomationStatus,
  getScanQueueStatus
} from '@/services/scheduling/scanSchedulingService';
import { toast } from 'sonner';

const ScanningAutomation: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [nextRunTime, setNextRunTime] = useState<string | null>(null);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);
  const [scanStats, setScanStats] = useState({
    pendingScans: 0,
    inProgressScans: 0,
    completedToday: 0,
    failedToday: 0
  });

  const fetchStatus = async () => {
    setLoading(true);
    try {
      // Get automation status
      const automationStatus = await getAutomationStatus();
      setAutomationEnabled(automationStatus.enabled);
      setNextRunTime(automationStatus.nextRun);
      setLastRunTime(automationStatus.lastRun);
      
      // Get queue status
      const queueStatus = await getScanQueueStatus();
      setScanStats(queueStatus);
    } catch (error) {
      console.error('Error fetching automation status:', error);
      toast.error('Failed to fetch scanning status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Set up regular refresh
    const intervalId = setInterval(() => {
      fetchStatus();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, []);

  const handleManualScan = async () => {
    setScanning(true);
    try {
      await triggerManualScan();
      // Wait a moment then refetch status after scan is triggered
      setTimeout(async () => {
        await fetchStatus();
        setScanning(false);
      }, 2000);
    } catch (error) {
      console.error('Error triggering scan:', error);
      setScanning(false);
    }
  };

  const handleToggleAutomation = async () => {
    try {
      const newStatus = !automationEnabled;
      const success = await toggleAutomatedScanning(newStatus);
      if (success) {
        setAutomationEnabled(newStatus);
        // Refetch to get updated next run time
        await fetchStatus();
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return format(parseISO(dateString), 'PPpp');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Automated Scanning</CardTitle>
        <CardDescription>
          Configure business website scanning automation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-[250px]" />
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-5 w-[300px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-scan" className="flex flex-col space-y-1">
                  <span>Scheduled Scanning</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Runs daily at 3:00 AM
                  </span>
                </Label>
                <Switch
                  id="auto-scan"
                  checked={automationEnabled}
                  onCheckedChange={handleToggleAutomation}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Next Scheduled Run</p>
                  <p className="text-sm text-muted-foreground">
                    {automationEnabled 
                      ? (nextRunTime ? formatDateTime(nextRunTime) : 'Calculating...') 
                      : 'Not scheduled'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Run</p>
                  <p className="text-sm text-muted-foreground">
                    {lastRunTime ? formatDateTime(lastRunTime) : 'Never'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="bg-muted rounded-md p-2 text-center">
                  <p className="text-xl font-bold">{scanStats.pendingScans}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="bg-muted rounded-md p-2 text-center">
                  <p className="text-xl font-bold">{scanStats.inProgressScans}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div className="bg-muted rounded-md p-2 text-center">
                  <p className="text-xl font-bold">{scanStats.completedToday}</p>
                  <p className="text-xs text-muted-foreground">Completed Today</p>
                </div>
                <div className="bg-muted rounded-md p-2 text-center">
                  <p className="text-xl font-bold">{scanStats.failedToday}</p>
                  <p className="text-xs text-muted-foreground">Failed Today</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleManualScan} 
          disabled={scanning}
          className="w-full"
        >
          {scanning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              {automationEnabled ? (
                <PauseIcon className="mr-2 h-4 w-4" />
              ) : (
                <PlayIcon className="mr-2 h-4 w-4" />
              )}
              Run Manual Scan
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScanningAutomation;
