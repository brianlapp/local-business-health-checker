
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon, DatabaseIcon, SmartphoneIcon } from 'lucide-react';
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
  
  const handleCMSScan = async () => {
    try {
      setScanning(true);
      
      console.log(`Starting BuiltWith scan for: ${business.website}`);
      const result = await scanWithBuiltWith(business.id, business.website);
      
      if (result.success) {
        console.log('CMS detection completed successfully');
      } else {
        console.error('Failed to detect CMS');
      }
      
      if (onScanComplete) {
        onScanComplete();
      }
    } catch (error) {
      console.error('CMS detection error:', error);
      toast.error('CMS detection failed. Please try again later.');
    } finally {
      setScanning(false);
    }
  };
  
  const getMobileFriendlyStatus = () => {
    // Check issues object first
    if (business.issues && business.issues.notMobileFriendly === false) {
      return true;
    }
    
    // Then check is_mobile_friendly from database
    if (business.is_mobile_friendly) {
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
      {business.lastChecked && (
        <p className="text-xs text-muted-foreground mt-2">
          Last checked: {new Date(business.lastChecked).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default CMSDetection;
