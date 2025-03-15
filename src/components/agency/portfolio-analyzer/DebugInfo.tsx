
import React from 'react';
import { Alert, AlertDescription, AlertTitle, Info } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Business } from '@/types/business';

interface DebugInfoProps {
  requestUrl?: string;
  error?: string;
  clients: Business[];
}

const DebugInfo: React.FC<DebugInfoProps> = ({ requestUrl, error, clients }) => {
  return (
    <div>
      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>Analysis Information</AlertTitle>
        <AlertDescription>
          Details about the agency portfolio analysis process.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Request URL</h3>
          <p className="text-sm text-muted-foreground">
            {requestUrl || 'No request URL available'}
          </p>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-2">Status</h3>
          <p className="text-sm text-muted-foreground">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <span className="text-green-500">Analysis successful</span>
            )}
          </p>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-2">Client Sources</h3>
          {clients.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(clients.map(c => c.source))).map((source, i) => (
                <Badge key={i} variant="outline">
                  {source}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No clients found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;
