
import React from 'react';
import { ScanDebugInfo } from '@/types/business';
import { StatusBadge } from '@/components/ui/status-badge';
import { Bug } from 'lucide-react';

interface DebugInfoDisplayProps {
  debugInfo: ScanDebugInfo | null;
}

const DebugInfoDisplay: React.FC<DebugInfoDisplayProps> = ({ debugInfo }) => {
  if (!debugInfo || !debugInfo.logs || debugInfo.logs.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 text-gray-800 p-4 rounded-md mb-4 dark:bg-gray-900/20 dark:text-gray-400 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium flex items-center">
          <Bug className="h-4 w-4 mr-2" />
          Debug Information
        </h3>
        <StatusBadge
          status="info"
          text={`${debugInfo.logs.length} log entries`}
          className="text-xs"
        />
      </div>
      <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded max-h-60 overflow-y-auto">
        {debugInfo.logs.map((log, i) => (
          <div key={i} className="py-1">
            {log}
          </div>
        ))}
      </div>
      
      {debugInfo.htmlSamples && debugInfo.htmlSamples.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">HTML Samples ({debugInfo.htmlSamples.length})</h4>
          <div className="space-y-2">
            {debugInfo.htmlSamples.map((sample, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">{sample.url}</span>
                  <span>{sample.length} bytes</span>
                </div>
                <pre className="whitespace-pre-wrap overflow-x-auto max-h-20">
                  {sample.sample}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugInfoDisplay;
