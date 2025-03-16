
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { scanWithBuiltWith } from '@/services/businessScanService';
import { Business } from '@/types/business';

interface CMSDetectionProps {
  business: Business;
  onScanComplete?: () => void;
}

const CMSDetection: React.FC<CMSDetectionProps> = ({ business, onScanComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Get CMS name from the business object
  const cmsName = business.cms || 'Unknown';
  
  // Get mobile friendly status
  const isMobileFriendly = business.is_mobile_friendly;
  
  const handleDetectTech = async () => {
    if (!business.id) return;
    
    setIsLoading(true);
    try {
      await scanWithBuiltWith(business.id);
      
      if (onScanComplete) {
        onScanComplete();
      }
    } catch (error) {
      console.error('Error detecting technology:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Technology</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDetectTech}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Detecting...
            </>
          ) : (
            'Detect Tech'
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="p-2 bg-muted rounded">
          <span className="text-muted-foreground">CMS:</span> {cmsName}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 bg-muted rounded">
                <span className="text-muted-foreground">Mobile:</span>{' '}
                {isMobileFriendly !== undefined ? (
                  isMobileFriendly ? (
                    <span className="text-green-600">✓ Friendly</span>
                  ) : (
                    <span className="text-red-600">✗ Not Friendly</span>
                  )
                ) : (
                  'Unknown'
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mobile-friendly assessment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CMSDetection;
