
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock, Zap, Smartphone, Lock, Type, ExternalLink } from 'lucide-react';
import { Business } from '@/types/business';
import { Button } from '@/components/ui/button';
import { scanWithGTmetrix, scanWithLighthouse, getGTmetrixUsage } from '@/services/businessService';

interface ScoreDisplayProps {
  score: number;
  business: Business;
  className?: string;
  onScanComplete?: () => void;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, business, className, onScanComplete }) => {
  const [isScanning, setIsScanning] = React.useState(false);
  const [gtmetrixUsage, setGtmetrixUsage] = React.useState<{ used: number, limit: number } | null>(null);

  React.useEffect(() => {
    const fetchGTmetrixUsage = async () => {
      const usage = await getGTmetrixUsage();
      setGtmetrixUsage(usage);
    };
    
    fetchGTmetrixUsage();
  }, []);

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500 bg-red-50';
    if (score >= 60) return 'text-orange-500 bg-orange-50';
    if (score >= 40) return 'text-yellow-500 bg-yellow-50';
    return 'text-green-500 bg-green-50';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'Poor';
    if (score >= 40) return 'Fair';
    return 'Good';
  };

  const handleLighthouseScan = async () => {
    try {
      setIsScanning(true);
      await scanWithLighthouse(business.id, business.website);
      if (onScanComplete) {
        onScanComplete();
      }
    } catch (error) {
      console.error('Lighthouse scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGTmetrixScan = async () => {
    try {
      setIsScanning(true);
      await scanWithGTmetrix(business.id, business.website);
      
      // Refresh GTmetrix usage after a scan
      const usage = await getGTmetrixUsage();
      setGtmetrixUsage(usage);
      
      if (onScanComplete) {
        onScanComplete();
      }
    } catch (error) {
      console.error('GTmetrix scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const scoreColor = getScoreColor(score);
  const scoreText = getScoreText(score);
  
  const { issues } = business;
  
  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center mb-4">
        <div className={cn('text-3xl font-bold w-20 h-20 flex items-center justify-center rounded-xl', scoreColor)}>
          {score}
        </div>
        <div className="ml-4">
          <p className="text-sm text-muted-foreground">Shit Score™</p>
          <h3 className="text-xl font-semibold">{scoreText}</h3>
          <p className="text-sm text-muted-foreground">Last checked: {business.lastChecked ? new Date(business.lastChecked).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
      
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
              onClick={handleLighthouseScan}
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
              onClick={handleGTmetrixScan}
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {issues && (
          <>
            <IssueItem 
              icon={Zap} 
              title="Speed Issues" 
              active={issues.speedIssues} 
              info={`Page Speed: ${business.lighthouseScore || business.speedScore || 'N/A'}/100`}
            />
            <IssueItem 
              icon={Clock} 
              title="Outdated CMS" 
              active={issues.outdatedCMS} 
              info={business.cms || 'Unknown CMS'}
            />
            <IssueItem 
              icon={Lock} 
              title="No SSL" 
              active={issues.noSSL} 
            />
            <IssueItem 
              icon={Smartphone} 
              title="Not Mobile Friendly" 
              active={issues.notMobileFriendly} 
            />
            <IssueItem 
              icon={Type} 
              title="Bad Fonts" 
              active={issues.badFonts} 
            />
          </>
        )}
      </div>
    </div>
  );
};

interface IssueItemProps {
  icon: React.FC<any>;
  title: string;
  active: boolean;
  info?: string;
}

const IssueItem: React.FC<IssueItemProps> = ({ icon: Icon, title, active, info }) => {
  return (
    <div className={cn(
      'p-3 rounded-lg border transition-all duration-300 flex items-center',
      active ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
    )}>
      {active ? (
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
      ) : (
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
      )}
      <div className="flex-1">
        <p className={cn('text-sm font-medium', active ? 'text-red-700' : 'text-green-700')}>
          {title}
        </p>
        {info && <p className="text-xs text-muted-foreground">{info}</p>}
      </div>
    </div>
  );
};

export default ScoreDisplay;
