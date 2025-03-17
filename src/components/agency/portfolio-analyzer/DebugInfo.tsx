
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code } from '@/components/ui/code';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info, Code as CodeIcon } from 'lucide-react';
import { Business } from '@/types/business';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Client Data</TabsTrigger>
          <TabsTrigger value="request">Request Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Info className="mr-2 h-4 w-4" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Clients Found:</span>
                  <Badge variant={clients.length > 0 ? "default" : "outline"}>
                    {clients.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Analysis Status:</span>
                  <Badge variant={error ? "destructive" : "success"}>
                    {error ? "Failed" : "Completed"}
                  </Badge>
                </div>
                {requestUrl && (
                  <div className="pt-2">
                    <h4 className="text-xs font-medium mb-1 text-muted-foreground">Analyzed URL</h4>
                    <Code className="text-xs p-2 break-all">{requestUrl}</Code>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CodeIcon className="mr-2 h-4 w-4" />
                Client Data ({clients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Code className="text-xs p-2">
                  {JSON.stringify(clients, null, 2)}
                </Code>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="request" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CodeIcon className="mr-2 h-4 w-4" />
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requestUrl ? (
                <div className="space-y-2">
                  <div>
                    <h4 className="text-xs font-medium mb-1 text-muted-foreground">Request URL</h4>
                    <Code className="text-xs p-2 break-all">{requestUrl}</Code>
                  </div>
                  <div className="pt-2">
                    <h4 className="text-xs font-medium mb-1 text-muted-foreground">Request Method</h4>
                    <Code className="text-xs p-2">GET</Code>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No request information available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebugInfo;
