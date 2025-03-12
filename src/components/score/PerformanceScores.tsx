
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ActivityIcon, 
  ZapIcon, 
  Loader2Icon, 
  ExternalLinkIcon,
  LightbulbIcon,
  GaugeIcon,
  AlertCircleIcon 
} from 'lucide-react';
import CMSDetection from './CMSDetection';
import { Business } from '@/types/business';
import { Badge } from '@/components/ui/badge';

interface PerformanceScoresProps {
  business: Business;
  isScanning: boolean;
  gtmetrixUsage: { used: number; limit: number } | null;
  onLighthouseScan: () => void;
  onGTmetrixScan: () => void;
  onScanComplete?: () => void;
}

const PerformanceScores: React.FC<PerformanceScoresProps> = ({
  business,
  isScanning,
  gtmetrixUsage,
  onLighthouseScan,
  onGTmetrixScan,
  onScanComplete
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGTmetrixUsageText = () => {
    if (!gtmetrixUsage) return '';
    return `(${gtmetrixUsage.used} of ${gtmetrixUsage.limit} scans used)`;
  };
  
  // Check if the lighthouse score is estimated
  const isEstimatedScore = business.has_real_score === false;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
      
      {/* Lighthouse Score */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">Lighthouse Score</h4>
              {isEstimatedScore && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-300">
                  Estimated
                </Badge>
              )}
            </div>
            {business.lighthouseScore || business.lighthouse_score ? (
              <p className={`text-xl font-bold ${getScoreColor(business.lighthouseScore || business.lighthouse_score || 0)}`}>
                {business.lighthouseScore || business.lighthouse_score}/100
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Not scanned yet</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button 
              size="sm" 
              variant={isEstimatedScore ? "default" : "outline"}
              disabled={isScanning}
              onClick={onLighthouseScan}
            >
              {isScanning ? (
                <>
                  <Loader2Icon className="h-3 w-3 mr-1 animate-spin" />
                  Scanning
                </>
              ) : isEstimatedScore ? (
                <>
                  <AlertCircleIcon className="h-3 w-3 mr-1" />
                  Get Real Score
                </>
              ) : (
                <>
                  <LightbulbIcon className="h-3 w-3 mr-1" />
                  Scan
                </>
              )}
            </Button>
            
            {(business.lighthouseReportUrl || business.lighthouse_report_url) && (
              <Button 
                size="sm" 
                variant="link" 
                className="h-6 px-0"
                onClick={() => window.open(business.lighthouseReportUrl || business.lighthouse_report_url, '_blank')}
              >
                <ExternalLinkIcon className="h-3 w-3 mr-1" />
                View Report
              </Button>
            )}
          </div>
        </div>
        {business.lastLighthouseScan && (
          <p className="text-xs text-muted-foreground mt-2">
            Last scan: {new Date(business.lastLighthouseScan).toLocaleDateString()}
            {isEstimatedScore && " (estimated)"}
          </p>
        )}
      </div>
      
      {/* GTmetrix Score */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-medium">GTmetrix Score {getGTmetrixUsageText()}</h4>
            {business.gtmetrixScore || business.gtmetrix_score ? (
              <p className={`text-xl font-bold ${getScoreColor(business.gtmetrixScore || business.gtmetrix_score || 0)}`}>
                {business.gtmetrixScore || business.gtmetrix_score}/100
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Not scanned yet</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button 
              size="sm" 
              variant="outline"
              disabled={isScanning || (gtmetrixUsage && gtmetrixUsage.used >= gtmetrixUsage.limit)}
              onClick={onGTmetrixScan}
            >
              {isScanning ? (
                <>
                  <Loader2Icon className="h-3 w-3 mr-1 animate-spin" />
                  Scanning
                </>
              ) : (
                <>
                  <GaugeIcon className="h-3 w-3 mr-1" />
                  Scan
                </>
              )}
            </Button>
            
            {(business.gtmetrixReportUrl || business.gtmetrix_report_url) && (
              <Button 
                size="sm" 
                variant="link" 
                className="h-6 px-0"
                onClick={() => window.open(business.gtmetrixReportUrl || business.gtmetrix_report_url, '_blank')}
              >
                <ExternalLinkIcon className="h-3 w-3 mr-1" />
                View Report
              </Button>
            )}
          </div>
        </div>
        {business.lastGtmetrixScan && (
          <p className="text-xs text-muted-foreground mt-2">
            Last scan: {new Date(business.lastGtmetrixScan).toLocaleDateString()}
          </p>
        )}
      </div>
      
      {/* CMS Detection */}
      <CMSDetection 
        business={business} 
        isScanning={isScanning} 
        onScanComplete={onScanComplete} 
      />
    </div>
  );
};

export default PerformanceScores;
