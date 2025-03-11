
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon, DatabaseIcon } from 'lucide-react';
import { scanWithBuiltWith } from '@/services/businessService';
import { Business } from '@/types/business';

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
      await scanWithBuiltWith(business.id, business.website);
      
      if (onScanComplete) {
        onScanComplete();
      }
    } catch (error) {
      console.error('CMS detection error:', error);
    } finally {
      setScanning(false);
    }
  };
  
  return (
    <div className="mt-4 border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-medium">CMS & Technology</h4>
          <p className="text-xs text-muted-foreground">
            {business.cms ? business.cms : 'Not detected yet'}
          </p>
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
