
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code } from '@/components/ui/code';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Business } from '@/types/business';

interface DebugInfoProps {
  requestUrl?: string;
  error?: string;
  clients: Business[];
}

const DebugInfo: React.FC<DebugInfoProps> = ({ requestUrl, error, clients }) => {
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {requestUrl && (
        <div>
          <h4 className="font-medium text-sm mb-1">Request URL</h4>
          <Code className="text-xs p-2 break-all">{requestUrl}</Code>
        </div>
      )}
      
      <div>
        <h4 className="font-medium text-sm mb-1">Found Clients ({clients.length})</h4>
        <ScrollArea className="h-[300px]">
          <Code className="text-xs p-2">
            {JSON.stringify(clients, null, 2)}
          </Code>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DebugInfo;
