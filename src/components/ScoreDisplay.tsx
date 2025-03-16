
import React from 'react';
import { cn } from '@/lib/utils';
import { Business } from '@/types/business';
import { scanWithGTmetrix, scanWithLighthouse, scanWithBuiltWith } from '@/services/businessScanService';
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
      if (usage) {
        setGtmetrixUsage({
          used: usage.scans_used,
          limit: usage.scan_limit
        });
      }
    };
    
    fetchGTmetrixUsage();
  }, []);

  // Color scheme - lower scores (better) get green, higher scores (worse) get red
  const getScoreColor = (score: number) => {
    if (score <= 20) return 'text-green-500 bg-green-50';
    if (score <= 40) return 'text-yellow-500 bg-yellow-50';
    if (score <= 60) return 'text-orange-500 bg-orange-50';
    return 'text-red-500 bg-red-50';
  };

  // Text descriptions
  const getScoreText = (score: number) => {
    if (score <= 20) return 'Excellent';
    if (score <= 40) return 'Good';
    if (score <= 60) return 'Fair';
    return 'Poor';
  };

  const handleLighthouseScan = async () => {
    try {
      setIsScanning(true);
      await scanWithLighthouse(business.id);
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
      await scanWithGTmetrix(business.id);
      
      const usage = await getGTmetrixUsage();
      if (usage) {
        setGtmetrixUsage({
          used: usage.scans_used,
          limit: usage.scan_limit
        });
      }
      
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
            {score <= 20 ? "This site is excellent!" : 
             score <= 40 ? "This site looks good!" : 
             score <= 60 ? "This site has some issues." : 
             "This site needs serious improvement."}
          </p>
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

// Helper function to get GTmetrix usage
async function getGTmetrixUsage() {
  try {
    const response = await fetch('/api/gtmetrix-usage');
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching GTmetrix usage:', error);
    return null;
  }
}
