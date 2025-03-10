
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Business } from '@/types/business';

interface PerformanceScoresProps {
  business: Business;
  isScanning: boolean;
  gtmetrixUsage: { used: number; limit: number; } | null;
  onLighthouseScan: () => void;
  onGTmetrixScan: () => void;
}

const PerformanceScores: React.FC<PerformanceScoresProps> = ({
  business,
  isScanning,
  gtmetrixUsage,
  onLighthouseScan,
  onGTmetrixScan,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-medium mb-2">Performance Scores</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg border bg-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold">Lighthouse</p>
              <p className="text-2xl font-bold">{business.lighthouseScore || 'N/A'}</p>
            </div>
            {business.lighthouseReportUrl && (
              <a 
                href={business.lighthouseReportUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Last scan: {formatDate(business.lastLighthouseScan)}
          </p>
          <Button 
            size="sm" 
            className="mt-2 w-full" 
            onClick={onLighthouseScan}
            disabled={isScanning}
          >
            {isScanning ? 'Scanning...' : 'Run Lighthouse Scan'}
          </Button>
        </div>
        
        <div className="p-3 rounded-lg border bg-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold">GTmetrix</p>
              <p className="text-2xl font-bold">{business.gtmetrixScore || 'N/A'}</p>
            </div>
            {business.gtmetrixReportUrl && (
              <a 
                href={business.gtmetrixReportUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Last scan: {formatDate(business.lastGtmetrixScan)}
          </p>
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-2 w-full" 
            onClick={onGTmetrixScan}
            disabled={isScanning || (gtmetrixUsage && gtmetrixUsage.used >= gtmetrixUsage.limit)}
          >
            {isScanning ? 'Scanning...' : 'Run GTmetrix Scan'}
          </Button>
          {gtmetrixUsage && (
            <p className="text-xs text-center mt-1">
              {gtmetrixUsage.used}/{gtmetrixUsage.limit} scans used this month
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceScores;
