
import React from 'react';
import { cn } from '@/lib/utils';
import { Business } from '@/types/business';
import { scanWithGTmetrix, scanWithLighthouse, scanWithBuiltWith, getGTmetrixUsage } from '@/services/businessService';
import PerformanceScores from './score/PerformanceScores';
import IssuesList from './score/IssuesList';

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

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center mb-4">
        <div className={cn('text-3xl font-bold w-20 h-20 flex items-center justify-center rounded-xl', scoreColor)}>
          {score}
        </div>
        <div className="ml-4">
          <p className="text-sm text-muted-foreground">Shit Score™</p>
          <h3 className="text-xl font-semibold">{scoreText}</h3>
          <p className="text-sm text-muted-foreground">
            Last checked: {business.lastChecked ? new Date(business.lastChecked).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
      
      <PerformanceScores
        business={business}
        isScanning={isScanning}
        gtmetrixUsage={gtmetrixUsage}
        onLighthouseScan={handleLighthouseScan}
        onGTmetrixScan={handleGTmetrixScan}
        onScanComplete={onScanComplete}
      />
      
      <IssuesList business={business} />
    </div>
  );
};

export default ScoreDisplay;
