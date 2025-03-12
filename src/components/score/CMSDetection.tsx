
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon, DatabaseIcon, SmartphoneIcon, AlertTriangleIcon } from 'lucide-react';
import { scanWithBuiltWith } from '@/services/businessService';
import { Business } from '@/types/business';
import { toast } from 'sonner';

interface CMSDetectionProps {
  business: Business;
  isScanning: boolean;
  onScanComplete?: () => void;
}

const CMSDetection: React.FC<CMSDetectionProps> = ({ 
  business, 
  isScanning, 
  onScanComplete 
}) => {
  const [scanning, setScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const handleCMSScan = async () => {
    try {
      setScanning(true);
      setError(null);
      
      console.log(`Starting BuiltWith scan for: ${business.website}`);
      const result = await scanWithBuiltWith(business.id, business.website);
      
      if (result.success) {
        console.log('CMS detection completed successfully', result);
        toast.success(`CMS detected: ${result.cms || 'Unknown'}`);
        
        if (result.isMobileFriendly !== undefined) {
          toast.success(result.isMobileFriendly ? 
            'Website is mobile-friendly' : 
            'Website is not mobile-friendly'
          );
        }
      } else {
        console.error('Failed to detect CMS', result);
        setError('Technology detection failed. Please try again later.');
        toast.error('Technology detection failed.');
      }
      
      if (onScanComplete) {
        onScanComplete();
      }
    } catch (error) {
      console.error('CMS detection error:', error);
      setError('Technology detection failed. Please try again later.');
      toast.error('CMS detection failed. Please try again later.');
    } finally {
      setScanning(false);
    }
  };
  
  const getMobileFriendlyStatus = () => {
    // Check if we have explicit mobile-friendly status from database
    if (typeof business.is_mobile_friendly === 'boolean') {
      return business.is_mobile_friendly;
    }
    
    // Check issues object as fallback
    if (business.issues && business.issues.notMobileFriendly === false) {
      return true;
    }
    
    // Default to unknown if not specified
    return null;
  };
  
  const mobileFriendlyStatus = getMobileFriendlyStatus();
  
  return (
    <div className="mt-4 border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-medium">CMS & Technology</h4>
          <p className="text-xs text-muted-foreground">
            {business.cms ? business.cms : 'Not detected yet'}
          </p>
          {mobileFriendlyStatus !== null && (
            <div className="flex items-center mt-1">
              <SmartphoneIcon className={`h-3 w-3 mr-1 ${mobileFriendlyStatus ? 'text-green-500' : 'text-red-500'}`} />
              <p className="text-xs text-muted-foreground">
                {mobileFriendlyStatus ? 'Mobile Friendly' : 'Not Mobile Friendly'}
              </p>
            </div>
          )}
        </div>
        <Button 
          size="sm" 
          variant="outline"
          disabled={scanning || isScanning}
          onClick={handleCMSScan}
        >
          {scanning ? (
            <>
              <Loader2Icon className="h-3 w-3 mr-1 animate-spin" />
              Detecting
            </>
          ) : (
            <>
              <DatabaseIcon className="h-3 w-3 mr-1" />
              Detect CMS
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md text-xs flex items-center">
          <AlertTriangleIcon className="h-3 w-3 mr-1" />
          {error}
        </div>
      )}
      
      {business.lastChecked && (
        <p className="text-xs text-muted-foreground mt-2">
          Last checked: {new Date(business.lastChecked).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default CMSDetection;
