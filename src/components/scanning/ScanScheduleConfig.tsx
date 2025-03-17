
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ClockIcon, SaveIcon } from 'lucide-react';
import { 
  getScheduleSettings, 
  updateScheduleSettings, 
  ScheduleSettings 
} from '@/services/scheduling/scanSchedulingService';

const ScanScheduleConfig: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ScheduleSettings>({
    scanning_enabled: false,
    scan_hour: 3,
    scan_frequency: 'daily',
    batch_size: 5,
    retry_failed: true,
    max_retries: 3
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getScheduleSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading schedule settings:', error);
      toast.error('Failed to load schedule settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateScheduleSettings(settings);
      toast.success('Schedule settings saved successfully');
    } catch (error) {
      console.error('Error saving schedule settings:', error);
      toast.error('Failed to save schedule settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, scanning_enabled: enabled }));
  };

  const handleToggleRetryFailed = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, retry_failed: enabled }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClockIcon className="mr-2 h-5 w-5" />
          Scan Schedule Configuration
        </CardTitle>
        <CardDescription>
          Configure when and how automated scanning should run
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="scanning-enabled" className="flex flex-col space-y-1">
                <span>Automated Scanning</span>
                <span className="font-normal text-sm text-muted-foreground">
                  Enable or disable all automated scanning
                </span>
              </Label>
              <Switch
                id="scanning-enabled"
                checked={settings.scanning_enabled}
                onCheckedChange={handleToggleEnabled}
              />
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scan-hour">Scan Time (Hour)</Label>
                <Select 
                  value={settings.scan_hour.toString()} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, scan_hour: parseInt(value) }))}
                >
                  <SelectTrigger id="scan-hour">
                    <SelectValue placeholder="Select hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i === 0 ? '12 AM (Midnight)' : 
                         i < 12 ? `${i} AM` : 
                         i === 12 ? '12 PM (Noon)' : 
                         `${i - 12} PM`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose a time when your application has low usage
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scan-frequency">Scan Frequency</Label>
                <Select 
                  value={settings.scan_frequency} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, scan_frequency: value as any }))}
                >
                  <SelectTrigger id="scan-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly (Monday)</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly (1st day)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How often automatic scans should run
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input
                  id="batch-size"
                  type="number"
                  min={1}
                  max={50}
                  value={settings.batch_size}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    batch_size: Math.max(1, Math.min(50, parseInt(e.target.value) || 5)) 
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  Number of businesses to scan in each batch (1-50)
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="retry-failed" className="flex flex-col space-y-1">
                    <span>Retry Failed Scans</span>
                    <span className="font-normal text-xs text-muted-foreground">
                      Automatically retry failed scans
                    </span>
                  </Label>
                  <Switch
                    id="retry-failed"
                    checked={settings.retry_failed}
                    onCheckedChange={handleToggleRetryFailed}
                  />
                </div>
                
                {settings.retry_failed && (
                  <div className="space-y-2">
                    <Label htmlFor="max-retries">Maximum Retries</Label>
                    <Input
                      id="max-retries"
                      type="number"
                      min={1}
                      max={10}
                      value={settings.max_retries}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        max_retries: Math.max(1, Math.min(10, parseInt(e.target.value) || 3)) 
                      }))}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSaveSettings} 
          disabled={saving || loading}
        >
          {saving ? (
            <>
              <SaveIcon className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="mr-2 h-4 w-4" />
              Save Schedule Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScanScheduleConfig;
