
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  ListIcon, 
  RefreshCw,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistance } from 'date-fns';
import { 
  ScanQueueItem, 
  getScanQueueItems,
  retryScan,
  cancelScan
} from '@/services/scheduling/scanQueueService';
import { toast } from 'sonner';

const ScanQueueManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [queueItems, setQueueItems] = useState<ScanQueueItem[]>([]);

  useEffect(() => {
    loadQueueItems();
    
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      loadQueueItems(true);
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const loadQueueItems = async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);
    
    try {
      const items = await getScanQueueItems({ limit: 50 });
      setQueueItems(items);
    } catch (error) {
      console.error('Error loading scan queue items:', error);
      if (!silent) {
        toast.error('Failed to load scan queue');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadQueueItems();
  };

  const handleRetry = async (id: string) => {
    try {
      const success = await retryScan(id);
      if (success) {
        await loadQueueItems();
      }
    } catch (error) {
      console.error('Error retrying scan:', error);
      toast.error('Failed to retry scan');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const success = await cancelScan(id);
      if (success) {
        await loadQueueItems();
      }
    } catch (error) {
      console.error('Error canceling scan:', error);
      toast.error('Failed to cancel scan');
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-blue-500 text-blue-500"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="border-amber-500 text-amber-500"><RefreshCw className="mr-1 h-3 w-3 animate-spin" /> Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-500"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="border-red-500 text-red-500"><AlertTriangle className="mr-1 h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'MMM d, h:mm a');
  };
  
  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { addSuffix: true });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <ListIcon className="mr-2 h-5 w-5" />
              Scan Queue
            </CardTitle>
            <CardDescription>
              Manage and monitor current scan jobs
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : queueItems.length === 0 ? (
          <div className="text-center py-8">
            <ListIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
            <p className="mt-2 text-muted-foreground">No scan jobs in queue</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queueItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium capitalize">
                      {item.scan_type}
                      {item.url && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {item.url}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(item.status)}
                      {item.error && (
                        <div className="text-xs text-red-500 mt-1">
                          {item.error.substring(0, 50)}
                          {item.error.length > 50 && '...'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{renderPriorityBadge(item.priority)}</TableCell>
                    <TableCell>
                      <div>{formatDate(item.created_at)}</div>
                      <div className="text-xs text-muted-foreground">
                        {getRelativeTime(item.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.started_at && item.completed_at ? (
                        <div>
                          {Math.round((new Date(item.completed_at).getTime() - 
                                      new Date(item.started_at).getTime()) / 1000)}s
                        </div>
                      ) : item.started_at ? (
                        <div>
                          {Math.round((new Date().getTime() - 
                                      new Date(item.started_at).getTime()) / 1000)}s+
                        </div>
                      ) : (
                        <div>-</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.status === 'failed' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRetry(item.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Retry
                        </Button>
                      )}
                      {item.status === 'pending' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCancel(item.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScanQueueManager;
